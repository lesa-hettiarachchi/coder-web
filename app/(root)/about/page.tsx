import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Button
            variant="ghost"
            asChild
            className="pl-0 self-start flex items-center w-fit"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-[-0.025em] leading-[1.2] m-0">
              About
            </h1>

              <p className="text-base text-[hsl(var(--muted-foreground))] m-0">
                Who are We????
              </p>
            
          </div>
          
          </div>
      </div>
    </div>
  );
}