'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TabsSection } from '@/components/home/TabSection';
import { ContentSection } from '@/components/home/ContentSection';
import { EmptyState } from '@/components/home/Empystate';
import { LoadingState } from '@/components/home/LoadingState';
import { useTabsManager } from '@/hooks/useTabManager';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Tab, TabFormData } from '@/types/tabs';
import { toast } from 'sonner';
import { generateHTMLFromTab, generateHTMLFromTabs } from '@/utils/htmlGenerator';

function HomeContent() {
  const router = useRouter();
  const {
    tabs,
    activeTabId,
    isLoaded,
    setActiveTabId,
    addTab,
    updateTab,
    deleteTab,
    getActiveTab
  } = useTabsManager();

  const handleAddTabWithToast = (data: TabFormData) => {
    addTab(data);
    toast.success(`Tab Created Successfully`);
  };

  const handleUpdateTabWithToast = (id: number, data: TabFormData) => {
    updateTab(id, data);
    toast.success(`Tab updated Successfully`);
  };

  const handleDeleteTabWithToast = (id: number) => {
    deleteTab(id);
    toast.error(`Tab Deleted Permanently`);
  };

  useUrlParams(handleAddTabWithToast, handleUpdateTabWithToast, handleDeleteTabWithToast);

  const handleAddTab = (): void => {
    router.push('/add-tab');
  };

  const handleEditTab = (tab: Tab): void => {
    const params = new URLSearchParams({
      title: tab.title,
      instructions: tab.instructions,
      body: tab.body
    });
    router.push(`/edit-tab/${tab.id}?${params.toString()}`);
  };


  const handleCompileSelected = async (selectedTabs: Tab[]): Promise<void> => {
    if (selectedTabs.length === 0) return;

    try {
      let htmlCode: string;
      if (selectedTabs.length === 1) {
        htmlCode = generateHTMLFromTab(selectedTabs[0]);
      } else {
        htmlCode = generateHTMLFromTabs(selectedTabs);
      }
      
      // Try clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(htmlCode);
          toast.success(`${selectedTabs.length} tab(s) compiled and copied to clipboard!`);
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API failed, trying fallback method:', clipboardError);
        }
      }
      
      // Fallback: Create a downloadable file
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabs-${selectedTabs.length}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${selectedTabs.length} tab(s) compiled and downloaded!`);
    } catch (error) {
      console.error('Failed to compile selected tabs:', error);
      toast.error(`Failed to compile selected tabs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkExport = async (): Promise<void> => {
    if (tabs.length === 0) {
      toast.error('No tabs to export');
      return;
    }

    try {
      const htmlCode = generateHTMLFromTabs(tabs);
      
      // Try clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(htmlCode);
          toast.success(`All ${tabs.length} tabs compiled and copied to clipboard!`);
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API failed, trying fallback method:', clipboardError);
        }
      }
      
      // Fallback: Create a downloadable file
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-tabs-${tabs.length}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`All ${tabs.length} tabs compiled and downloaded!`);
    } catch (error) {
      console.error('Failed to export all tabs:', error);
      toast.error(`Failed to export all tabs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isLoaded) {
    return <LoadingState />;
  }

  const activeTab = getActiveTab();

  return (
    <div className="bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2 leading-[1.2] tracking-[-0.025em]">
            Welcome Home
          </h1>
          <p className="text-base text-[hsl(var(--muted-foreground))]">
            Manage your code snippets and instructions
          </p>
        </header>

        <TabsSection
          tabs={tabs}
          activeTabId={activeTabId ?? 0}
          onTabSelect={setActiveTabId}
          onAddTab={handleAddTab}
          onEditTab={handleEditTab}
          onBulkExport={handleBulkExport}
          onCompileSelected={handleCompileSelected}
        />

        {activeTab && (
          <ContentSection
            activeTab={activeTab}
          />
        )}

        {tabs.length === 0 && (
          <EmptyState onAddTab={handleAddTab} />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HomeContent />
    </Suspense>
  );
}