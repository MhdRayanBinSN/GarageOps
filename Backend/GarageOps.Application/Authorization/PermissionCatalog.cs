using GarageOps.Domain.Enums;

namespace GarageOps.Application.Authorization;

/// <summary>Stable capability names shared by JWT issuance and API authorization policies.</summary>
public static class Permissions
{
    public const string DashboardView = "dashboard:view";
    public const string WorkshopManage = "workshop:manage";
    public const string EmployeesView = "employees:view";
    public const string EmployeesManage = "employees:manage";
    public const string CustomersManage = "customers:manage";
    public const string JobsViewAll = "jobs:view-all";
    public const string JobsManage = "jobs:manage";
    public const string TasksViewAll = "tasks:view-all";
    public const string TasksRead = "tasks:read";
    public const string TasksViewAssigned = "tasks:view-assigned";
    public const string TasksManage = "tasks:manage";
    public const string TasksAssign = "tasks:assign";
    public const string TasksUpdateAssigned = "tasks:update-assigned";
    public const string InventoryView = "inventory:view";
    public const string InventoryManage = "inventory:manage";
    public const string CatalogManage = "catalog:manage";
    public const string CatalogView = "catalog:view";
    public const string PartsRequest = "parts:request";
    public const string PartsWorkflowView = "parts:workflow-view";
    public const string PartsProcess = "parts:process";
    public const string BillingManage = "billing:manage";
    public const string CustomerProfileOwn = "customer:profile-own";
    public const string CustomerJobsOwn = "customer:jobs-own";
    public const string CustomerInvoicesOwn = "customer:invoices-own";
    public const string CustomerPaymentsOwn = "customer:payments-own";

    public static IReadOnlyList<string> All { get; } =
    [
        DashboardView, WorkshopManage, EmployeesView, EmployeesManage,
        CustomersManage, JobsViewAll, JobsManage, TasksViewAll, TasksRead,
        TasksViewAssigned, TasksManage, TasksAssign, TasksUpdateAssigned,
        InventoryView, InventoryManage, CatalogManage, CatalogView, PartsRequest, PartsWorkflowView,
        PartsProcess, BillingManage, CustomerProfileOwn, CustomerJobsOwn,
        CustomerInvoicesOwn, CustomerPaymentsOwn
    ];
}

/// <summary>Single backend role-to-capability matrix. Legacy database values are normalized here.</summary>
public static class RolePermissions
{
    private static readonly HashSet<string> Admin =
    [
        Permissions.DashboardView, Permissions.WorkshopManage,
        Permissions.EmployeesView, Permissions.EmployeesManage,
        Permissions.CustomersManage, Permissions.JobsViewAll, Permissions.JobsManage,
        Permissions.TasksViewAll, Permissions.TasksManage, Permissions.TasksAssign,
        Permissions.TasksRead, Permissions.TasksUpdateAssigned, Permissions.InventoryView, Permissions.InventoryManage,
        Permissions.CatalogManage, Permissions.CatalogView, Permissions.PartsRequest,
        Permissions.PartsWorkflowView, Permissions.PartsProcess, Permissions.BillingManage
    ];

    private static readonly HashSet<string> FrontDesk =
    [
        Permissions.DashboardView, Permissions.EmployeesView, Permissions.CustomersManage,
        Permissions.JobsViewAll, Permissions.JobsManage, Permissions.TasksViewAll,
        Permissions.TasksRead, Permissions.TasksManage, Permissions.TasksAssign,
        Permissions.TasksUpdateAssigned,
        Permissions.InventoryView, Permissions.CatalogView, Permissions.PartsWorkflowView,
        Permissions.PartsProcess, Permissions.BillingManage
    ];

    private static readonly HashSet<string> Mechanic =
    [
        Permissions.TasksViewAssigned, Permissions.TasksUpdateAssigned,
        Permissions.TasksRead, Permissions.InventoryView, Permissions.PartsRequest,
        Permissions.PartsWorkflowView
    ];

    public static IReadOnlyCollection<string> For(UserType userType, EmployeeRole? role)
    {
        if (userType == UserType.WorkshopAdmin) return Admin;
        if (userType == UserType.Customer)
        {
            return [Permissions.CustomerProfileOwn, Permissions.CustomerJobsOwn,
                Permissions.CustomerInvoicesOwn, Permissions.CustomerPaymentsOwn];
        }

        return role switch
        {
            EmployeeRole.Manager or EmployeeRole.FrontDesk => FrontDesk,
            EmployeeRole.Mechanic or EmployeeRole.Technician => Mechanic,
            // Retained only for existing accounts; this role is no longer assignable.
            EmployeeRole.InventoryStaff =>
            [Permissions.InventoryView, Permissions.InventoryManage, Permissions.PartsProcess],
            _ => Array.Empty<string>()
        };
    }

    public static string CanonicalRole(UserType userType, EmployeeRole? role) =>
        userType switch
        {
            UserType.WorkshopAdmin => "Admin",
            UserType.Customer => "Customer",
            _ => role switch
            {
                EmployeeRole.Manager or EmployeeRole.FrontDesk => "FrontDesk",
                EmployeeRole.Mechanic or EmployeeRole.Technician => "Mechanic",
                EmployeeRole.InventoryStaff => "InventoryStaff",
                _ => ""
            }
        };
}
