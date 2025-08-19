import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className='px-5 py-3 font-extrabold'>
        <div>
            <div className="flex justify-between items-center py-3">
                <Link href="/">
                    <span className="text-2xl">CorderWeB</span>
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-lg">21533031</span>
                </div>
            </div>
        </div>

    </header>
  )
}

export default Header