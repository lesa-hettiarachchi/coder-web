import { Tab, TabFormData } from '@/types/tabs';

const TABS_STORAGE_KEY = 'code-tabs-app';
const API_BASE_URL = '/api/tabs';

export interface TabsStorage {
  tabs: Tab[];
  activeTabId: number | null;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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

  public async getAllTabs(): Promise<Tab[]> {
    try {
      const response = await this.apiRequest<Tab[]>('');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch tabs from API, falling back to localStorage:', error);
      return this.getStorageData().tabs;
    }
  }

  public async getTabById(id: number): Promise<Tab | undefined> {
    try {
      const response = await this.apiRequest<Tab>(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tab from API, falling back to localStorage:', error);
      return this.getStorageData().tabs.find(tab => tab.id === id);
    }
  }

  public async addTab(tab: TabFormData): Promise<Tab> {
    try {
      const response = await this.apiRequest<Tab>('', {
        method: 'POST',
        body: JSON.stringify(tab)
      });
      return response.data!;
    } catch (error) {
      console.error('Failed to create tab via API, falling back to localStorage:', error);
      // Fallback to localStorage
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
  }

  public async updateTab(id: number, updates: Partial<TabFormData>): Promise<Tab | null> {
    try {
      const response = await this.apiRequest<Tab>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return response.data!;
    } catch (error) {
      console.error('Failed to update tab via API, falling back to localStorage:', error);
      // Fallback to localStorage
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
  }

  public async deleteTab(id: number): Promise<boolean> {
    try {
      await this.apiRequest(`/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete tab via API, falling back to localStorage:', error);
      // Fallback to localStorage
      const storage = this.getStorageData();
      const initialLength = storage.tabs.length;
      storage.tabs = storage.tabs.filter(tab => tab.id !== id);
      
      if (storage.tabs.length < initialLength) {
        if (storage.activeTabId === id) {
          storage.activeTabId = storage.tabs.length > 0 ? storage.tabs[0].id : null;
        }
        this.saveStorageData(storage);
        return true;
      }
      return false;
    }
  }

  public getActiveTabId(): number | null {
    return this.getStorageData().activeTabId;
  }

  public setActiveTabId(id: number): void {
    const storage = this.getStorageData();
    storage.activeTabId = id;
    this.saveStorageData(storage);
  }

  public async clearAllData(): Promise<boolean> {
    try {
      await this.apiRequest('/bulk', {
        method: 'POST',
        body: JSON.stringify({ operation: 'clear' })
      });
      return true;
    } catch (error) {
      console.error('Failed to clear data via API, falling back to localStorage:', error);
      if (this.isClient()) {
        localStorage.removeItem(TABS_STORAGE_KEY);
      }
      return true;
    }
  }

  public async exportData(): Promise<string> {
    try {
      const response = await this.apiRequest<{ tabs: Tab[]; exportedAt: string }>('/bulk', {
        method: 'POST',
        body: JSON.stringify({ operation: 'export' })
      });
      
      const exportData = {
        tabs: response.data?.tabs || [],
        activeTabId: this.getActiveTabId(),
        lastUpdated: response.data?.exportedAt || new Date().toISOString()
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data via API, falling back to localStorage:', error);
      return JSON.stringify(this.getStorageData(), null, 2);
    }
  }

  public async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      await this.apiRequest('/bulk', {
        method: 'POST',
        body: JSON.stringify({ 
          operation: 'import', 
          data: data 
        })
      });
      return true;
    } catch (error) {
      console.error('Failed to import data via API, falling back to localStorage:', error);
      try {
        const data = JSON.parse(jsonData);
        this.saveStorageData(data);
        return true;
      } catch (parseError) {
        console.error('Failed to parse import data:', parseError);
        return false;
      }
    }
  }
}

export const tabsService = TabsService.getInstance();