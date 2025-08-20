import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const LoadingState: React.FC = () => {
  return (
    <div className="home">
      <div className="home__container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          
          <Card>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};