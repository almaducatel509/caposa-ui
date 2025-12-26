"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardBody, Button, Chip, Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { TfiExport, TfiImport } from "react-icons/tfi";
import { FaBuildingWheat, FaRegTrashCan } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";

import {  PostData } from "./validations";
import { fetchPosts } from "@/app/lib/api/post";

import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import { PiBankLight } from "react-icons/pi";
import PageHeader from "../header";
import PostFilterBar from "./PostFilterBar";
import { BsBuilding } from "react-icons/bs";


export interface Post extends PostData {
  id: string;
  name: string;
}
interface PostTableProps {
  posts?: Post[];
}

const ROWS_PER_PAGE = 8;

const PostTable: React.FC<PostTableProps> =  ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(!initialPosts);

  // modals
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const loadPosts = async () => {
  //   const data = await fetchPosts();
  //   setPosts(data);
  // };
  const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        console.error("Erreur lors du chargement des post:", error);
        setError("Impossible de charger les post. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadPosts();
  }, [initialPosts]);

  // Filtered posts
 // Filtered posts
const filteredPosts = useMemo(() => {
  const term = filterValue.toLowerCase();
  return posts.filter((p) => {
    // Filtre par recherche textuelle
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term);
    
    // Filtre par permission (si ton model Post a un champ "permission")
    
    return matchesSearch ;
  });
}, [posts, filterValue,]); // 🆕 Ajouter selectedPermission
  const itemsToDisplay = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredPosts.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredPosts]);

  // Callbacks
  
  const handleCreate = () => setShowCreateModal(true);

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
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
    loadPosts();
  };
 

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || '');
  }, []);

  const onClear = useCallback(() => {
    setFilterValue('');
  }, []);

if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  function handleExport(): void {
    throw new Error("Function not implemented.");
  }

  return (
 <div className="flex flex-col gap-4 p-4 bg-linear-to-br from-green-50 to-emerald-50 min-h-screen">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadPosts} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}
 {/* Header */}
      <PageHeader 
        title="Gestion des Postes" 
        subtitle="Gérez tous les Postes et leurs informations"
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
      <div className="text-sm text-[#2c2e2f]/70">
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
            <div className="text-8xl mb-4">
              <FaBuildingWheat />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? "Aucune post trouvée" : "Aucune post"}
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre première post"
              }
            </p>
            {filterValue ? (
              <Button onClick={onClear} variant="light" className="text-[#34963d]">
                Effacer les filtres
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-[#34963d] text-white">
                Ajouter un post
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showCreateModal && 
        <CreatePostModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleSuccess} 
        />
      }
      {showEditModal && selectedPost &&
        <EditPostModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={handleSuccess} post={selectedPost} 
        />
      }

      {showDeleteModal && selectedPost && 
      <DeletePostModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onSuccess={handleSuccess} 
        post={selectedPost} 
        />
      }
    </div>
  );
};

export default PostTable;
