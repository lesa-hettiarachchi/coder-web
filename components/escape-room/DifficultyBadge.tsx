import React from 'react';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ 
  difficulty, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const difficultyClasses = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        ${difficultyClasses[difficulty]} 
        rounded-full font-semibold uppercase tracking-wide
        ${className}
      `}
    >
      {difficulty}
    </span>
  );
};
