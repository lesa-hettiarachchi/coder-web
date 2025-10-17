import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tab } from '@/types/tabs';


interface ContentSectionProps {
  activeTab: Tab;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  activeTab
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Instructions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="whitespace-pre-wrap text-[hsl(var(--muted-foreground))] text-sm leading-6">
        {activeTab.instructions}
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Body</CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="bg-[hsl(var(--muted))] p-4 rounded-md overflow-x-auto text-sm border border-[hsl(var(--border))] font-mono">
        <code className="text-[hsl(var(--foreground))] m-0">{activeTab.body}</code>
      </pre>
    </CardContent>
  </Card>
</div>


  );
};