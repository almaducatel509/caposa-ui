"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaBuildingWheat } from "react-icons/fa6";
import { BsBuilding } from "react-icons/bs";

import { PostData } from "./validations";
import { fetchPosts } from "@/app/lib/api/post";

import PostCard from "./PostCard";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import PageHeader from "../header";
import PostFilterBar from "./PostFilterBar";

export interface Post extends PostData {
  id: string;
  name: string;
}

interface PostTableProps {
  posts?: Post[];
}

const ROWS_PER_PAGE = 8;

const PostGrid: React.FC<PostTableProps> = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des postes:", error);
      setError("Impossible de charger les postes. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPosts) {
      loadPosts();
    }
  }, [initialPosts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    const term = filterValue.toLowerCase();
    return posts.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });
  }, [posts, filterValue]);

  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredPosts.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredPosts]);

  // Callbacks
  const handleCreate = () => {
    setSelectedPost(null);
    setIsEditMode(false);
    setShowCreateModal(true);
    setShowEditModal(true);
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedPost(null);
    setIsEditMode(false);
    loadPosts();
  };

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const handleExport = () => {
    console.log("Export functionality to be implemented");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadPosts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Gestion des Postes"
        subtitle="Gérez tous les postes et leurs informations"
        icon={<BsBuilding className="text-4xl" />}
      />

      <PostFilterBar
        filterValue={filterValue}
        onSearchChange={onSearchChange}
        onClear={onClear}
        onAdd={handleCreate}
        onExport={handleExport}
        totalCount={filteredPosts.length}
      />

      <div className="text-sm text-gray-700">
        {filteredPosts.length} résultat(s) trouvé(s)
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4 flex justify-center text-gray-400">
              <FaBuildingWheat />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filterValue ? "Aucun poste trouvé" : "Aucun poste"}
            </h3>
            <p className="text-gray-600 mb-4">
              {filterValue
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier poste"}
            </p>
            {filterValue ? (
              <button
                onClick={onClear}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                Effacer les filtres
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Ajouter un poste
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setShowCreateModal(false);
            setSelectedPost(null);
            setIsEditMode(false);
          }}
          onSuccess={handleSuccess}
          post={selectedPost}
          isEditMode={isEditMode}
          mode={isEditMode ? "edit" : "create"}
        />
      )}

      {showDeleteModal && selectedPost && (
        <DeletePostModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPost(null);
          }}
          onSuccess={handleSuccess}
          post={selectedPost}
        />
      )}
    </div>
  );
};

export default PostGrid;