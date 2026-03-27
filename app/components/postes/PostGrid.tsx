"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BsBuilding } from "react-icons/bs";

import { PostData } from "./validations";
import { fetchPosts, archivePost } from "@/app/lib/api/post";

import PostTable, { Post } from "./PostTable";
import PostFilterBar from "./PostFilterBar";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import PageHeader from "../header";

interface PostGridProps {
  posts?: Post[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts: initialPosts }) => {
  /* ── Data ── */
  const [posts,     setPosts]     = useState<Post[]>(initialPosts || []);
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [error,     setError]     = useState<string | null>(null);

  /* ── Filtres ── */
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ── Modals ── */
  const [selectedPost,   setSelectedPost]   = useState<Post | null>(null);
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [showDeleteModal,setShowDeleteModal]= useState(false);
  const [isEditMode,     setIsEditMode]     = useState(false);

  /* ── Chargement ── */
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      setError("Impossible de charger les postes. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialPosts) loadPosts();
  }, [initialPosts, loadPosts]);

  /* ── Debounce ── */
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(t);
  }, [search]);

  /* ── Filtrage ── */
  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;
    return posts.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch) ||
      p.description.toLowerCase().includes(debouncedSearch)
    );
  }, [posts, debouncedSearch]);

  /* ── Export CSV ── */
  const handleExport = useCallback(() => {
    const rows = [
      "Nom,Description,Dépôt,Retrait,Transfert",
      ...filteredPosts.map((p) =>
        [`"${p.name}"`, `"${p.description}"`, p.deposit, p.withdrawal, p.transfert].join(",")
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([rows], { type: "text/csv;charset=utf-8;" }));
    link.download = `postes_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredPosts]);

  /* ── Handlers ── */
  const handleCreate = () => {
    setSelectedPost(null);
    setIsEditMode(false);
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
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedPost(null);
    setIsEditMode(false);
    loadPosts();
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">

      <PageHeader
        title="Gestion des postes"
        subtitle="Gérez tous les postes et leurs permissions"
        icon={<BsBuilding className="w-8 h-8 text-[#2E7D32]" />}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={loadPosts}
            className="text-sm font-medium text-red-600 hover:text-red-800 underline">
            Réessayer
          </button>
        </div>
      )}

      <PostFilterBar
        filterValue={search}
        totalCount={filteredPosts.length}
        onSearchChange={setSearch}
        onClear={() => setSearch("")}
        onAdd={handleCreate}
        onExport={handleExport}
      />

      <PostTable
        posts={filteredPosts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedPost(null); setIsEditMode(false); }}
          onSuccess={handleSuccess}
          post={selectedPost}
          isEditMode={isEditMode}
          mode={isEditMode ? "edit" : "create"}
        />
      )}

      {showDeleteModal && selectedPost && (
//         POST /api/posts/:id/archive
// body: { employeeId: "EMP-001" }

// → Vérifie que employees[employeeId].role === "directeur" || "maintenance"
// → Si oui : post.status = "inactive", post.archivedBy = employeeId
// → Si non : 403 Forbidden avec message d'erreur
        <DeletePostModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedPost(null); }}
          onSuccess={handleSuccess}
          post={selectedPost}
          onArchive={async (postId, employeeId) => {
            await archivePost(postId, employeeId);
          }}
        />
      )}
    </div>
  );
};

export default PostGrid;