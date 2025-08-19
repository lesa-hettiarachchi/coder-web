import Header from '@/components/header/Header'
import React from 'react'
import Footer from '@/components/footer/Footer'

function layout({children} : Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex flex-col min-h-screen">
        <Header/>

        <main className="flex-grow">
            
            {children}
        </main>

        <Footer/>
        
    </div>
  )
}

export default layout