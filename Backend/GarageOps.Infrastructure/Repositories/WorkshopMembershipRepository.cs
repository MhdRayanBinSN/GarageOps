using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;

namespace GarageOps.Infrastructure.Repositories;

public sealed class WorkshopMembershipRepository : IWorkshopMembershipRepository
{
    private readonly GarageOpsDbContext dbContext;

    public WorkshopMembershipRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(
        WorkshopMembership membership,
        CancellationToken cancellationToken)
    {
        return dbContext.WorkshopMemberships.AddAsync(membership, cancellationToken).AsTask();
    }
}
