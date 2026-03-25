"use client"
import React, { useState, useEffect } from 'react';
import { fetchBranches } from '@/app/lib/api/branche';
import BranchesGrid from '@/app/components/branches/branchesGrid';

const BranchDashboard = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBranches = async () => {
    try {
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  if (loading) {
    return <div>Loading branches...</div>;
  }
  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
        <BranchesGrid branches={branches} />
      </div>
    </main>
    )
  }
  export default BranchDashboard;
 