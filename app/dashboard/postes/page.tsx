"use client";

import React, { useState, useEffect } from "react";
import PostGrid from "@/app/components/postes/PostGrid";

const PostDashboard: React.FC = () => {

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
      <PostGrid   />
    </div>
    </main>
  );
};

export default PostDashboard;
