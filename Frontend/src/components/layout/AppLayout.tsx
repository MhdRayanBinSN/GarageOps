import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastContainer } from '../ui/Toast'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans antialiased selection:bg-brand-red selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen bg-white">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto max-w-6xl w-full mx-auto bg-white">
          <Outlet />
        </main>
      </div>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  )
}
