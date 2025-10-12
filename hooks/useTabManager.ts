import { useState, useEffect, useCallback } from 'react';
import { Tab } from '@/types/tabs';
import { tabsService } from '@/service/tabsService';
import Cookies from 'js-cookie';

export const useTabsManager = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTabs = await tabsService.getAllTabs();
        const storedActiveId = tabsService.getActiveTabId();
        
        setTabs(storedTabs);
        
        let cookieTabId: number | null = null;
        try {
          const cookieActiveTab = Cookies.get('activeTab');
          if (cookieActiveTab) {
            const parsed = parseInt(cookieActiveTab);
            if (!isNaN(parsed) && parsed > 0) {
              cookieTabId = parsed;
            }
          }
        } catch (cookieError) {
          console.warn('Failed to read activeTab cookie:', cookieError);
        }
        
        if (cookieTabId && storedTabs.some(tab => tab.id === cookieTabId)) {
          setActiveTabId(cookieTabId);
        } else if (storedActiveId && storedTabs.some(tab => tab.id === storedActiveId)) {
          setActiveTabId(storedActiveId);
        } else if (storedTabs.length > 0) {
          setActiveTabId(storedTabs[0].id);
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load tabs from storage:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded && activeTabId !== null) {
      tabsService.setActiveTabId(activeTabId);
    }
  }, [activeTabId, isLoaded]);

  const addTab = useCallback(async (newTabData: Omit<Tab, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTab = await tabsService.addTab(newTabData);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      return newTab;
    } catch (error) {
      console.error('Failed to add tab:', error);
      throw error;
    }
  }, []);

  const updateTab = useCallback(async (id: number, updates: Partial<Omit<Tab, 'id' | 'createdAt'>>) => {
    try {
      const updatedTab = await tabsService.updateTab(id, updates);
      if (updatedTab) {
        setTabs(prev => prev.map(tab => 
          tab.id === id ? updatedTab : tab
        ));
        return updatedTab;
      }
      return null;
    } catch (error) {
      console.error('Failed to update tab:', error);
      throw error;
    }
  }, []);

  const deleteTab = useCallback(async (id: number) => {
    try {
      const success = await tabsService.deleteTab(id);
      if (success) {
        setTabs(prev => prev.filter(tab => tab.id !== id));
        
        if (activeTabId === id) {
          const remainingTabs = tabs.filter(tab => tab.id !== id);
          setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to delete tab:', error);
      throw error;
    }
  }, [activeTabId, tabs]);

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  const clearAllTabs = useCallback(async () => {
    try {
      await tabsService.clearAllData();
      setTabs([]);
      setActiveTabId(null);
    } catch (error) {
      console.error('Failed to clear all tabs:', error);
      throw error;
    }
  }, []);

  const exportTabs = useCallback(async () => {
    try {
      return await tabsService.exportData();
    } catch (error) {
      console.error('Failed to export tabs:', error);
      throw error;
    }
  }, []);

  const importTabs = useCallback(async (jsonData: string) => {
    try {
      const success = await tabsService.importData(jsonData);
      if (success) {
        const storedTabs = await tabsService.getAllTabs();
        const storedActiveId = tabsService.getActiveTabId();
        
        setTabs(storedTabs);
        setActiveTabId(storedActiveId || (storedTabs.length > 0 ? storedTabs[0].id : null));
      }
      return success;
    } catch (error) {
      console.error('Failed to import tabs:', error);
      throw error;
    }
  }, []);

  return {
    tabs,
    activeTabId,
    isLoaded,
    setActiveTabId,
    addTab,
    updateTab,
    deleteTab,
    getActiveTab,
    clearAllTabs,
    exportTabs,
    importTabs
  };
};