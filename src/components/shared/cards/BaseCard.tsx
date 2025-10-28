import React from 'react';
import { Button } from '@/components/shared';

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BaseCard = ({ children, className = '', onClick }: BaseCardProps) => {
  const cardClasses = `group bg-zinc-950 hover:shadow-2xl hover:shadow-red-500/30 border border-zinc-700 hover:border-red-500 rounded-lg overflow-hidden transition-all duration-300 ${className}`;

  if (onClick) {
    return (
      <Button
        onClick={onClick}
        variant="ghost"
        className={`${cardClasses} p-0 h-auto`}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};
