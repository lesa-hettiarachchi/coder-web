import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { Tab } from '@/types/tabs';
import './homecomponents.css';

interface ContentSectionProps {
  activeTab: Tab;
  onCopyCode: () => Promise<void>;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  activeTab,
  onCopyCode
}) => {
  return (
    <div className="content-section">
      {/* Instructions Card */}
      <Card className="instructions-card">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="instructions-content">
            {activeTab.instructions}
          </div>
        </CardContent>
      </Card>

      {/* Code Card */}
      <Card className="code-card">
        <CardHeader>
          <div className="code-header">
            <CardTitle>Code</CardTitle>
            <Button
              onClick={onCopyCode}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="code-block">
            <code className="code-text">{activeTab.code}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};