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
import { MyTasksPage } from '@/pages/jobs/MyTasksPage'
import { PartRequestsPage } from '@/pages/parts/PartRequestsPage'
import { WorkshopSettingsPage } from '@/pages/settings/WorkshopSettingsPage'
import { InventoryAvailabilityPage } from '@/pages/parts/InventoryAvailabilityPage'
import { CustomerPortalPage } from '@/pages/customers/CustomerPortalPage'
import { getHomePath } from '@/utils/permissions'
import { useAuthStore } from '@/store/authStore'

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
            element: <HomeRedirect />,
          },
          {
            path: 'dashboard',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><DashboardPage /></ProtectedRoute>,
          },
          {
            path: 'jobs',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><JobCardsPage /></ProtectedRoute>,
          },
          {
            path: 'jobs/:id',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><JobCardDetailPage /></ProtectedRoute>,
          },
          {
            path: 'customers',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><CustomersPage /></ProtectedRoute>,
          },
          {
            path: 'parts',
            element: <ProtectedRoute allowedRoles={['Admin', 'InventoryStaff']}><PartsPage /></ProtectedRoute>,
          },
          {
            path: 'services',
            element: <ProtectedRoute allowedRoles={['Admin']}><ServicesPage /></ProtectedRoute>,
          },
          {
            path: 'invoices',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><InvoicesPage /></ProtectedRoute>,
          },
          {
            path: 'invoices/:id',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}><InvoiceDetailPage /></ProtectedRoute>,
          },
          // Role-guarded team management
          {
            path: 'employees',
            element: <ProtectedRoute allowedRoles={['Admin']} />,
            children: [
              {
                index: true,
                element: <EmployeesPage />,
              },
            ],
          },
          {
            path: 'my-tasks',
            element: <ProtectedRoute allowedRoles={['Mechanic']}><MyTasksPage /></ProtectedRoute>,
          },
          {
            path: 'parts-requests',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk', 'InventoryStaff']}><PartRequestsPage /></ProtectedRoute>,
          },
          {
            path: 'inventory-availability',
            element: <ProtectedRoute allowedRoles={['Admin', 'FrontDesk', 'Mechanic', 'InventoryStaff']}><InventoryAvailabilityPage /></ProtectedRoute>,
          },
          {
            path: 'settings',
            element: <ProtectedRoute allowedRoles={['Admin']}><WorkshopSettingsPage /></ProtectedRoute>,
          },
          {
            path: 'my-account',
            element: <ProtectedRoute allowedRoles={['Customer']}><CustomerPortalPage /></ProtectedRoute>,
          },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <HomeRedirect />,
  },
])

function HomeRedirect() {
  const { userType, employeeRole } = useAuthStore()
  return <Navigate to={getHomePath(userType, employeeRole)} replace />
}
