import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { Tab } from '@/types/tabs';


interface ContentSectionProps {
  activeTab: Tab;
  onCopyCode: () => Promise<void>;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  activeTab,
  onCopyCode
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
      <div className="flex items-center justify-between">
        <CardTitle>Code</CardTitle>
        <Button onClick={onCopyCode} variant="outline" size="sm" className="flex items-center">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <pre className="bg-[hsl(var(--muted))] p-4 rounded-md overflow-x-auto text-sm border border-[hsl(var(--border))] font-mono">
        <code className="text-[hsl(var(--foreground))] m-0">{activeTab.code}</code>
      </pre>
    </CardContent>
  </Card>
</div>


  );
};