import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
// import './addpage.css'

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  showBackButton?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBackButton = true
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
  {showBackButton && (
    <Button
      variant="ghost"
      onClick={onBack}
      className="pl-0 self-start flex items-center"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Home
    </Button>
  )}

  <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-[-0.025em] leading-[1.2] m-0">
      {title}
    </h1>
    {subtitle && (
      <p className="text-base text-[hsl(var(--muted-foreground))] m-0">
        {subtitle}
      </p>
    )}
  </div>
</div>

  );
};