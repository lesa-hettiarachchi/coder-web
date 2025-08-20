import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import './homecomponents.css';

interface EmptyStateProps {
  onAddTab: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddTab }) => {
  return (
    <Card>
      <CardContent className="empty-state">
        <div className="empty-state__icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <h3 className="empty-state__title">No tabs yet</h3>
        <p className="empty-state__description">
          Get started by creating your first tab
        </p>
        <Button onClick={onAddTab} className="empty-state__action">
          <Plus className="h-4 w-4 mr-2" />
          Create First Tab
        </Button>
      </CardContent>
    </Card>
  );
};