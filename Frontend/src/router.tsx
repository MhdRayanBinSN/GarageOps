import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { EmployeesPage } from '@/pages/employees/EmployeesPage'
import { ServicesPage } from '@/pages/services/ServicesPage'
import { PartsPage } from '@/pages/parts/PartsPage'
import { JobCardsPage } from '@/pages/jobs/JobCardsPage'
import { JobCardDetailPage } from '@/pages/jobs/JobCardDetailPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { InvoiceDetailPage } from '@/pages/invoices/InvoiceDetailPage'

export const router = createBrowserRouter([
  // Public auth routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Authenticated workspace routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'jobs',
            element: <JobCardsPage />,
          },
          {
            path: 'jobs/:id',
            element: <JobCardDetailPage />,
          },
          {
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'parts',
            element: <PartsPage />,
          },
          {
            path: 'services',
            element: <ServicesPage />,
          },
          {
            path: 'invoices',
            element: <InvoicesPage />,
          },
          {
            path: 'invoices/:id',
            element: <InvoiceDetailPage />,
          },
          // Role-guarded team management
          {
            path: 'employees',
            element: <ProtectedRoute allowedRoles={['Owner', 'Manager']} />,
            children: [
              {
                index: true,
                element: <EmployeesPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
