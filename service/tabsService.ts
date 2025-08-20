import { Tab } from '@/types/tabs';

const TABS_STORAGE_KEY = 'code-tabs-app';

export interface TabsStorage {
  tabs: Tab[];
  activeTabId: number | null;
  lastUpdated: string;
}

export class TabsService {
  private static instance: TabsService;
  
  public static getInstance(): TabsService {
    if (!TabsService.instance) {
      TabsService.instance = new TabsService();
    }
    return TabsService.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public getStorageData(): TabsStorage {
    if (!this.isClient()) {
      return { tabs: [], activeTabId: null, lastUpdated: new Date().toISOString() };
    }

    try {
      const data = localStorage.getItem(TABS_STORAGE_KEY);
      if (!data) {
        return { tabs: [], activeTabId: null, lastUpdated: new Date().toISOString() };
      }


      const parsed: TabsStorage = JSON.parse(data);
      parsed.tabs = parsed.tabs.map(tab => ({
        ...tab,createdAt: tab.createdAt ? new Date(tab.createdAt) : undefined,
        updatedAt: tab.updatedAt ? new Date(tab.updatedAt) : undefined
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse tabs from localStorage:', error);
      return { tabs: [], activeTabId: null, lastUpdated: new Date().toISOString() };
    }
  }

  public saveStorageData(data: TabsStorage): void {
    if (!this.isClient()) return;

    try {
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save tabs to localStorage:', error);
    }
  }

  public getAllTabs(): Tab[] {
    return this.getStorageData().tabs;
  }

  public getTabById(id: number): Tab | undefined {
    return this.getAllTabs().find(tab => tab.id === id);
  }

  public addTab(tab: Omit<Tab, 'id' | 'createdAt' | 'updatedAt'>): Tab {
    const newTab: Tab = {
      ...tab,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const storage = this.getStorageData();
    storage.tabs.push(newTab);
    this.saveStorageData(storage);

    return newTab;
  }

  public updateTab(id: number, updates: Partial<Omit<Tab, 'id' | 'createdAt'>>): Tab | null {
    const storage = this.getStorageData();
    const tabIndex = storage.tabs.findIndex(tab => tab.id === id);
    
    if (tabIndex === -1) return null;

    storage.tabs[tabIndex] = {
      ...storage.tabs[tabIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.saveStorageData(storage);
    return storage.tabs[tabIndex];
  }

  public deleteTab(id: number): boolean {
    const storage = this.getStorageData();
    const initialLength = storage.tabs.length;
    storage.tabs = storage.tabs.filter(tab => tab.id !== id);
    
    if (storage.tabs.length < initialLength) {
      // If deleted tab was active, reset active tab
      if (storage.activeTabId === id) {
        storage.activeTabId = storage.tabs.length > 0 ? storage.tabs[0].id : null;
      }
      this.saveStorageData(storage);
      return true;
    }
    return false;
  }

  public getActiveTabId(): number | null {
    return this.getStorageData().activeTabId;
  }

  public setActiveTabId(id: number): void {
    const storage = this.getStorageData();
    storage.activeTabId = id;
    this.saveStorageData(storage);
  }

  public clearAllData(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(TABS_STORAGE_KEY);
  }

  public exportData(): string {
    return JSON.stringify(this.getStorageData(), null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveStorageData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tabsService = TabsService.getInstance();