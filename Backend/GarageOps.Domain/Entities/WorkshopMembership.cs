using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class WorkshopMembership : BaseEntity
{
    public Guid WorkshopId { get; private set; }

    public Guid UserId { get; private set; }

    public EmployeeRole EmployeeRole { get; private set; }

    public bool IsActive { get; private set; } = true;

    public Workshop Workshop { get; private set; } = null!;

    public User User { get; private set; } = null!;

    private WorkshopMembership()
    {
    }

    public WorkshopMembership(
        Guid workshopId,
        Guid userId,
        EmployeeRole employeeRole)
    {
        WorkshopId = workshopId;
        UserId = userId;
        EmployeeRole = employeeRole;
    }
}
