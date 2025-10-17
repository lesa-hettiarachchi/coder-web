import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Download, Play } from 'lucide-react';
import { Tab } from '@/types/tabs';
import Cookies from 'js-cookie';


interface TabsSectionProps {
  tabs: Tab[];
  activeTabId: number;
  onTabSelect: (id: number) => void;
  onAddTab: () => void;
  onEditTab: (tab: Tab) => void;
  onBulkExport?: () => void;
  onCompileSelected?: (selectedTabs: Tab[]) => void;
}

export const TabsSection: React.FC<TabsSectionProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onAddTab,
  onEditTab,
  onBulkExport,
  onCompileSelected
}) => {
  const [selectedTabs, setSelectedTabs] = useState<Set<number>>(new Set());
  const handleTabSelect = (id: number) => {
    Cookies.set('activeTab', String(id), { expires: 7 });
    onTabSelect(id);
  };

  const handleCheckboxChange = (tabId: number, checked: boolean) => {
    setSelectedTabs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(tabId);
      } else {
        newSet.delete(tabId);
      }
      return newSet;
    });
  };

  const handleCompileSelected = () => {
    if (selectedTabs.size === 0) return;
    const selectedTabsList = tabs.filter(tab => selectedTabs.has(tab.id));
    onCompileSelected?.(selectedTabsList);
  };

  const handleSelectAll = () => {
    if (selectedTabs.size === tabs.length) {
      setSelectedTabs(new Set());
    } else {
      setSelectedTabs(new Set(tabs.map(tab => tab.id)));
    }
  };

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
        <div key={tab.id} className="relative group flex items-center gap-2">
          <Checkbox
            checked={selectedTabs.has(tab.id)}
            onCheckedChange={(checked) => handleCheckboxChange(tab.id, checked as boolean)}
            className="shrink-0"
          />
          <Button
            variant={activeTabId === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabSelect(tab.id)}
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

    <div className="flex items-center gap-2 flex-wrap">
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
      
      {tabs.length > 0 && (
        <Button
          onClick={handleSelectAll}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          {selectedTabs.size === tabs.length ? "Deselect All" : "Select All"}
        </Button>
      )}
      
      {onCompileSelected && selectedTabs.size > 0 && (
        <Button
          onClick={handleCompileSelected}
          variant="default"
          size="sm"
          className="flex items-center"
        >
          <Play className="h-4 w-4 mr-2" />
          Compile Selected ({selectedTabs.size})
        </Button>
      )}
      
      {onBulkExport && tabs.length > 0 && (
        <Button
          onClick={onBulkExport}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export All ({tabs.length})
        </Button>
      )}
    </div>
  </CardContent>
</Card>

  );
};