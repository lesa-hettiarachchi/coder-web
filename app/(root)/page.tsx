'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TabsSection } from '@/components/home/TabSection';
import { ContentSection } from '@/components/home/ContentSection';
import { EmptyState } from '@/components/home/Empystate';
import { LoadingState } from '@/components/home/LoadingState';
import { useTabsManager } from '@/hooks/useTabManager';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Tab } from '@/types/tabs';
import { toast } from 'sonner'; // <-- Import toast

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

  // Wrap tab actions to show toast
  const handleAddTabWithToast = (data: any) => {
    addTab(data);
    toast.success(`Tab Created Successfully`);
  };
  const handleUpdateTabWithToast = (id: number, data: any) => {
    updateTab(id, data);
    toast.success(`Tab updated SuccssFully`);
  };
  const handleDeleteTabWithToast = (id: number) => {
    const tab = tabs.find(t => t.id === id);
    deleteTab(id);
    toast.error(`Tab Deleted Permenetly`);
  };

  useUrlParams(handleAddTabWithToast, handleUpdateTabWithToast, handleDeleteTabWithToast);

  const handleAddTab = (): void => {
    router.push('/add-tab');
  };

  const handleEditTab = (tab: Tab): void => {
    const params = new URLSearchParams({
      title: tab.title,
      instructions: tab.instructions,
      code: tab.code
    });
    router.push(`/edit-tab/${tab.id}?${params.toString()}`);
  };

  const handleCopyCode = async (): Promise<void> => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      await navigator.clipboard.writeText(activeTab.code);
      toast.success('Code copied!');
    } catch (err) {
      toast.error('Failed to copy code');
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
        />

        {activeTab && (
          <ContentSection
            activeTab={activeTab}
            onCopyCode={handleCopyCode}
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