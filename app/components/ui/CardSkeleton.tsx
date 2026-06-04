import React from 'react';
import { Skeleton } from './skeleton';
import clsx from 'clsx';

interface CardSkeletonProps {
  className?: string;
  withIcon?: boolean;
}

export function CardSkeleton({ className, withIcon = true }: CardSkeletonProps) {
  return (
    <div className={clsx("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between", className)}>
      <div className="space-y-3 w-full">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {withIcon && (
        <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0 ml-4" />
      )}
    </div>
  );
}
