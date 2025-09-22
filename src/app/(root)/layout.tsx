import Header from '@/src/components/Header'
import MobileNavigation from '@/src/components/MobileNavigation'
import Sidebar from '@/src/components/Sidebar'
import { getCurrentUser } from '@/src/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from "@/src/components/ui/toaster"

export const dynamic = "force-dynamic"


const layout = async ({children} : {children: React.ReactNode}) => {
    const currentUser = await getCurrentUser()
    if(!currentUser) return redirect("/sign-in")
  return (
    <main className='flex h-screen'>
        <Sidebar {...currentUser}/>
        <section className='flex h-full flex-1 flex-col'>
            <MobileNavigation {...currentUser}/> <Header userId = {currentUser.$id} accountId = {currentUser.accountId}/> 
            <div className="main-content">{children}</div>
        </section>
        <Toaster />
    </main>
    
  )
}

export default layout
