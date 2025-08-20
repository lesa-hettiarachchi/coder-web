'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import NavBar from './NavBar'
import { usePathname } from 'next/navigation'
import MobileNavBar from './MobileNavBar'
import ThemeToggle from './ThemeToggle'
import { useTheme } from 'next-themes'
import Image from 'next/image'


const Header = () => {
    const pathname = usePathname()
    const {theme} = useTheme()
    const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <header className='px-5 py-3 font-extrabold'>
        <div>
            <div className="flex justify-between items-center py-3 px-5">
                <Link href="/">
                    {!mounted ? (
                        <span className="text-2xl">CorderWeB</span>
                    ) : theme === 'dark' ? (
                    <Image src={'/assets/logo_dark_mode.png'} alt='logo' width={56} height={56}/>
                    ) : (
                    <Image src={'/assets/logo_light_mode.png'} alt='logo' width={56} height={56}/>
                    )}
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