import Link from 'next/link'
import React from 'react'

const tabs = [
    { name: 'Home', href: '/' },
    { name: 'Coding Races', href: '/coding-races' },
    { name: 'Escape Rooms', href: '/escape-rooms' },
    { name: 'Court Rooms', href: '/court-rooms' },
    { name: 'About', href: '/about' }
];

const NavBar = ({ pathname }: { pathname: string }) => {
  return (
    <nav className="hidden lg:flex justify-center gap-8 py-3 text-lg">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="relative group px-1"
          >
            <span className={`relative z-10 ${isActive ? 'text-red-700' : ''}`}>
              {tab.name}
            </span>
            <span
              className={`absolute left-1/2 bottom-0 h-[2px] w-0 bg-red-700 transition-all duration-300 group-hover:left-0 group-hover:w-full`}
            ></span>
          </Link>
        );
      })}
    </nav>
  )
}

export default NavBar
