'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const tabs = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Coding Races', href: '/coding-races' },
    { name: 'Escape Rooms', href: '/escape-rooms' },
    { name: 'Court Rooms', href: '/court-rooms' }
];

const MobileNavBar = ({ pathname, onPageVisit }: { pathname: string; onPageVisit: (href: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 flex items-center justify-center"
        >
          <Menu className="w-8 h-8" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-64 p-4">
        <SheetTitle className='text-3xl font-extrabold'>Menu</SheetTitle>
        <nav className="flex flex-col gap-4 text-xl mt-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => {
                  onPageVisit(tab.href);
                  setIsOpen(false);
                }}
                className={`transition-colors ${
                  isActive ? 'font-bold text-red-700' : 'hover:text-red-600'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavBar;
