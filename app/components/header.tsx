"use client";

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  actions,
  className = ""
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#2c2e2f]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;