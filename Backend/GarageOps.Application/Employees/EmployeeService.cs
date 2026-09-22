using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Application.Authentication;
using GarageOps.Domain.Entities;
using GarageOps.Domain.Enums;

namespace GarageOps.Application.Employees;

public sealed class EmployeeService : IEmployeeService
{
    private readonly IUserRepository userRepository;
    private readonly IWorkshopMembershipRepository membershipRepository;
    private readonly IUnitOfWork unitOfWork;
    private readonly IPasswordHasher passwordHasher;

    public EmployeeService(
        IUserRepository userRepository,
        IWorkshopMembershipRepository membershipRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher)
    {
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.unitOfWork = unitOfWork;
        this.passwordHasher = passwordHasher;
    }

    public async Task<EmployeeResponse> CreateAsync(
        Guid workshopId,
        CreateEmployeeRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EmployeeRole == EmployeeRole.Owner)
        {
            throw new ArgumentException(
                "The workshop owner is created during workshop registration.",
                nameof(request));
        }

        var employee = new User(
            workshopId,
            request.Username,
            request.Email,
            passwordHasher.Hash(request.Password),
            UserType.WorkshopEmployee,
            request.EmployeeRole);

        var membership = new WorkshopMembership(
            workshopId,
            employee.Id,
            request.EmployeeRole);

        await userRepository.AddAsync(employee, cancellationToken);
        await membershipRepository.AddAsync(membership, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(employee);
    }

    public async Task<IReadOnlyList<EmployeeResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        var employees = await userRepository.GetEmployeesByWorkshopAsync(
            workshopId,
            cancellationToken);

        return employees.Select(Map).ToArray();
    }

    public async Task<EmployeeResponse?> UpdateRoleAsync(
        Guid workshopId,
        Guid employeeId,
        UpdateEmployeeRoleRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EmployeeRole == EmployeeRole.Owner)
        {
            throw new ArgumentException(
                "The owner role cannot be assigned to an employee.",
                nameof(request));
        }

        var employee = await userRepository.GetEmployeeByIdAsync(
            employeeId,
            workshopId,
            cancellationToken);

        if (employee is null)
        {
            return null;
        }

        employee.ChangeEmployeeRole(request.EmployeeRole);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(employee);
    }

    public async Task<bool> SetActiveAsync(
        Guid workshopId,
        Guid employeeId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var employee = await userRepository.GetEmployeeByIdAsync(
            employeeId,
            workshopId,
            cancellationToken);

        if (employee is null)
        {
            return false;
        }

        if (isActive)
        {
            employee.Activate();
        }
        else
        {
            employee.Deactivate();
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static EmployeeResponse Map(User employee)
    {
        return new EmployeeResponse(
            employee.Id,
            employee.WorkshopId!.Value,
            employee.Username,
            employee.Email,
            employee.EmployeeRole!.Value,
            employee.IsActive);
    }
}
