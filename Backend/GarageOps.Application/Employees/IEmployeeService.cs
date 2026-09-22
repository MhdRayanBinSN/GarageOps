namespace GarageOps.Application.Employees;

public interface IEmployeeService
{
    Task<EmployeeResponse> CreateAsync(
        Guid workshopId,
        CreateEmployeeRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<EmployeeResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<EmployeeResponse?> UpdateRoleAsync(
        Guid workshopId,
        Guid employeeId,
        UpdateEmployeeRoleRequest request,
        CancellationToken cancellationToken);

    Task<bool> SetActiveAsync(
        Guid workshopId,
        Guid employeeId,
        bool isActive,
        CancellationToken cancellationToken);
}
