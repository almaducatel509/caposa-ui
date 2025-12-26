"use client";

import React, { useState, useEffect } from "react";
import PostTable from "@/app/components/postes/PostTable";

const PostDashboard: React.FC = () => {

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
      <PostTable   />
    </div>
    </main>
  );
};

export default PostDashboard;
