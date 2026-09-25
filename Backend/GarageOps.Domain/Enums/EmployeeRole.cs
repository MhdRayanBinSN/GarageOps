namespace GarageOps.Domain.Enums;

public enum EmployeeRole
{
    Owner = 1, // Legacy owner marker; the account's high-level type is WorkshopAdmin.
    Manager = 2, // Legacy employee role; normalized to FrontDesk permissions.
    FrontDesk = 3,
    Mechanic = 4,
    Technician = 5, // Legacy employee role; normalized to Mechanic permissions.
    InventoryStaff = 6 // Legacy role retained for existing accounts only.
}
