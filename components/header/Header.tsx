'use client'

import Link from 'next/link'
import React from 'react'
import NavBar from './NavBar'
import { usePathname } from 'next/navigation'
import MobileNavBar from './MobileNavBar'
import ThemeToggle from './ThemeToggle'


const Header = () => {
    const pathname = usePathname()
  return (
    <header className='px-5 py-3 font-extrabold'>
        <div>
            <div className="flex justify-between items-center py-3">
                <Link href="/">
                    <span className="text-2xl">CorderWeB</span>
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-lg">21533031</span>
                    <ThemeToggle/>
                    <div className="lg:hidden">
                        <MobileNavBar pathname={pathname} />
                    </div>
                </div>
            </div>
        </div>

        <NavBar pathname={pathname}/>

    </header>
  )
}

export default Header