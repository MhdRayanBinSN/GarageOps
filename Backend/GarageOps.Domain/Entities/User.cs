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

        if (userType == UserType.WorkshopOwner && employeeRole != Enums.EmployeeRole.Owner)
        {
            throw new ArgumentException(
                "A workshop owner must have the Owner employee role.",
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
}