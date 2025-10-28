'use client';

import React from 'react';

interface GamificationCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function GamificationCard({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  loading = false
}: GamificationCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200';
      case 'bordered':
        return 'bg-white border-2 border-gray-200 hover:border-blue-300';
      case 'elevated':
        return 'bg-white shadow-lg border border-gray-100 hover:shadow-xl';
      default:
        return 'bg-white border border-gray-200 hover:shadow-md';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3 rounded-md';
      case 'lg':
        return 'p-6 rounded-xl';
      default:
        return 'p-4 rounded-lg';
    }
  };

  if (loading) {
    return (
      <div className={`${getVariantClasses()} ${getSizeClasses()} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getVariantClasses()} ${getSizeClasses()} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}