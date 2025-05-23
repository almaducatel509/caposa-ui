"use client"
import React, { useState, useEffect } from 'react';
import Search from '@/app/components/search';
import BranchTable from '@/app/components/branches/branchesTable';
import { fetchBranches } from '@/app/lib/api/branche';

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
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className={` text-2xl`}>Branches</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* card */} 
      </div>
      <BranchTable branches={branches} />
    </div>
    )
  }
  export default BranchDashboard;
