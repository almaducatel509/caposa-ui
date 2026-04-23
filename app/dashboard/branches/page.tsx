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
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 print:bg-white print:p-0 print:m-0">
        <BranchesGrid branches={branches} />
    </div>
    )
  }
  export default BranchDashboard;
 