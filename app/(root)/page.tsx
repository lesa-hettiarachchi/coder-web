'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TabsSection } from '../../components/home/TabSection';
import { ContentSection } from '../../components/home/ContentSection';
import { EmptyState } from '@/components/home/Empystate';
import { useTabsManager } from '@/hooks/useTabManager';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Tab } from '@/types/tabs';
import './home.css';

export const Home: React.FC = () => {
  const router = useRouter();
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    updateTab,
    getActiveTab
  } = useTabsManager();

  useUrlParams(addTab, updateTab);

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
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const activeTab = getActiveTab();

  return (
    <div className="home">
      <div className="home__container">
        <header className="home__header">
          <h1 className="home__title">Welcome Home</h1>
          <p className="home__subtitle">
            Manage your code snippets and instructions
          </p>
        </header>

        <TabsSection
          tabs={tabs}
          activeTabId={activeTabId}
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
};

export default Home;