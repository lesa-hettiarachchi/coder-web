"use client";

import React from 'react';

interface EscapeRoomBackgroundProps {
  children: React.ReactNode;
  gameState: 'start' | 'playing' | 'won' | 'lost';
}

export const EscapeRoomBackground: React.FC<EscapeRoomBackgroundProps> = ({ 
  children, 
  gameState 
}) => {
  const getBackgroundClass = () => {
    switch (gameState) {
      case 'start':
        return "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900";
      case 'playing':
        return "bg-gradient-to-br from-red-900 via-orange-900 to-red-900";
      case 'won':
        return "bg-gradient-to-br from-green-900 via-emerald-900 to-green-900";
      case 'lost':
        return "bg-gradient-to-br from-gray-900 via-red-900 to-gray-900";
      default:
        return "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900";
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating code symbols */}
        <div className="absolute top-10 left-10 text-white/10 text-6xl font-mono animate-pulse">
          {'</>'}
        </div>
        <div className="absolute top-32 right-20 text-white/10 text-4xl font-mono animate-bounce">
          {'{}'}
        </div>
        <div className="absolute bottom-20 left-1/4 text-white/10 text-5xl font-mono animate-pulse">
          {'[]'}
        </div>
        <div className="absolute bottom-32 right-1/3 text-white/10 text-3xl font-mono animate-bounce">
          {'()'}
        </div>
        <div className="absolute top-1/2 left-10 text-white/10 text-4xl font-mono animate-pulse">
          {'=>'}
        </div>
        <div className="absolute top-1/3 right-10 text-white/10 text-5xl font-mono animate-bounce">
          {'==='}
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
