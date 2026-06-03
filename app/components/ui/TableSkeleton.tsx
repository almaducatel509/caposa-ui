import React from 'react';
import { Skeleton } from './skeleton';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Colonnes (bg-gradient) */}
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
        <div 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3/4 rounded-sm" />
          ))}
        </div>
      </div>

      {/* Lignes */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div 
            key={r} 
            className="grid gap-4 items-center px-5 py-3.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton 
                key={c} 
                className={c === 0 ? "h-4 w-5/6" : "h-4 w-1/2"} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
