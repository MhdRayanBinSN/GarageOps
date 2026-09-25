using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class User : BaseEntity
{
    public Guid? WorkshopId { get; private set; }

    public string Username { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public UserType UserType { get; private set; }

    public EmployeeRole? EmployeeRole { get; private set; }

    public bool IsActive { get; private set; } = true;

    public Workshop? Workshop { get; private set; }

    private User()
    {
    }

    public User(
        Guid? workshopId,
        string username,
        string email,
        string passwordHash,
        UserType userType,
        EmployeeRole? employeeRole)
    {
        if (userType == UserType.PlatformAdmin && workshopId is not null)
        {
            throw new ArgumentException(
                "A platform admin cannot belong to a workshop.",
                nameof(workshopId));
        }

        if (userType != UserType.PlatformAdmin && workshopId is null)
        {
            throw new ArgumentException(
                "This user type must belong to a workshop.",
                nameof(workshopId));
        }

        if (userType == UserType.WorkshopAdmin && employeeRole is not null)
        {
            throw new ArgumentException(
                "A workshop Admin is not an employee and cannot have an employee role.",
                nameof(employeeRole));
        }

        if (userType == UserType.WorkshopEmployee && employeeRole is null)
        {
            throw new ArgumentException(
                "A workshop employee must have an employee role.",
                nameof(employeeRole));
        }

        if (userType == UserType.Customer && employeeRole is not null)
        {
            throw new ArgumentException(
                "A customer cannot have an employee role.",
                nameof(employeeRole));
        }

        WorkshopId = workshopId;
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        UserType = userType;
        EmployeeRole = employeeRole;
    }

    public void ChangeEmployeeRole(EmployeeRole employeeRole)
    {
        if (UserType != UserType.WorkshopEmployee)
        {
            throw new InvalidOperationException(
                "Only workshop employees can change employee roles.");
        }

        EmployeeRole = employeeRole;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
