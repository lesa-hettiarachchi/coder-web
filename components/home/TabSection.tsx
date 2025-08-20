import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { Tab } from '@/types/tabs';


interface TabsSectionProps {
  tabs: Tab[];
  activeTabId: number;
  onTabSelect: (id: number) => void;
  onAddTab: () => void;
  onEditTab: (tab: Tab) => void;
}

export const TabsSection: React.FC<TabsSectionProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onAddTab,
  onEditTab
}) => {
  return (
    <Card className="w-full">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Tabs</CardTitle>
      <Badge variant="secondary">{tabs.length}/20 tabs</Badge>
    </div>
  </CardHeader>

  <CardContent>
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab) => (
        <div key={tab.id} className="relative group">
          <Button
            variant={activeTabId === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTabSelect(tab.id)}
            className="pr-8"
          >
            {tab.title}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditTab(tab)}
            className="absolute -top-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2">
      <Button
        onClick={onAddTab}
        disabled={tabs.length >= 20}
        variant={tabs.length >= 20 ? "secondary" : "default"}
        size="sm"
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        {tabs.length >= 20 ? "Max Tabs Reached" : "Add Tab"}
      </Button>
    </div>
  </CardContent>
</Card>

  );
};