using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IWorkshopMembershipRepository
{
    Task AddAsync(
        WorkshopMembership membership,
        CancellationToken cancellationToken);

    Task SetRoleAsync(Guid workshopId, Guid userId, GarageOps.Domain.Enums.EmployeeRole role, CancellationToken cancellationToken);

    Task SetActiveAsync(Guid workshopId, Guid userId, bool isActive, CancellationToken cancellationToken);
}
