import React from 'react'

function layout({children} : Readonly<{children: React.ReactNode}>) {
  return (
    <div>layout

        <main>
            {children}
        </main>
    </div>
  )
}

export default layout