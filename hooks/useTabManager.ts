import { useState, useCallback } from 'react';
import { Tab } from '@/types/tabs';

export const useTabsManager = (initialTabs: Tab[] = []) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<number>(1);

  const addTab = useCallback((newTab: Omit<Tab, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tab: Tab = {
      ...newTab,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const updateTab = useCallback((id: number, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === id 
        ? { ...tab, ...updates, updatedAt: new Date() }
        : tab
    ));
  }, []);

  const deleteTab = useCallback((id: number) => {
    setTabs(prev => prev.filter(tab => tab.id !== id));
    if (activeTabId === id && tabs.length > 1) {
      setActiveTabId(tabs[0].id);
    }
  }, [activeTabId, tabs]);

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    updateTab,
    deleteTab,
    getActiveTab
  };
};