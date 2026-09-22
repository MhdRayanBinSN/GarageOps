using GarageOps.Domain.Enums;

namespace GarageOps.Application.Employees;

public sealed record CreateEmployeeRequest(
    string Username,
    string Email,
    string Password,
    EmployeeRole EmployeeRole);

public sealed record UpdateEmployeeRoleRequest(EmployeeRole EmployeeRole);

public sealed record EmployeeResponse(
    Guid Id,
    Guid WorkshopId,
    string Username,
    string Email,
    EmployeeRole EmployeeRole,
    bool IsActive);
