"use client"
import React, { useState, useEffect } from 'react';
import Search from '@/app/components/search';
import PostTable from '@/app/components/postes/PostTable';
import { fetchPosts } from '@/app/lib/api/post';

const PostDashboard = () => {
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPostes(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Postes</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* card */} 
      </div>
      <PostTable postes={postes} onRefresh={loadPosts} />
    </div>
  )
}

export default PostDashboard;