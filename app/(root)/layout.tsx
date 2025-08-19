import Header from '@/components/Header/Header'
import React from 'react'

function layout({children} : Readonly<{children: React.ReactNode}>) {
  return (
    <div>

        <div>
          <Header/>
        </div>
        <main>
            {children}
        </main>
    </div>
  )
}

export default layout