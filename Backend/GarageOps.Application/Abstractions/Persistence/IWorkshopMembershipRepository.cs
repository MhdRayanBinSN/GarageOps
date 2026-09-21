using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IWorkshopMembershipRepository
{
    Task AddAsync(
        WorkshopMembership membership,
        CancellationToken cancellationToken);
}
