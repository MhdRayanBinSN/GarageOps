import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastContainer } from '../ui/Toast'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-brand-red selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen bg-slate-50">
        <Topbar />
        <main className="flex-1 p-5 lg:p-6 overflow-y-auto w-full bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  )
}
