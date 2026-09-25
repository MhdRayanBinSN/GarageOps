using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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

    public async Task SetRoleAsync(Guid workshopId, Guid userId, GarageOps.Domain.Enums.EmployeeRole role, CancellationToken cancellationToken)
    {
        var membership = await dbContext.WorkshopMemberships.SingleOrDefaultAsync(
            item => item.WorkshopId == workshopId && item.UserId == userId,
            cancellationToken);
        membership?.ChangeRole(role);
    }

    public async Task SetActiveAsync(Guid workshopId, Guid userId, bool isActive, CancellationToken cancellationToken)
    {
        var membership = await dbContext.WorkshopMemberships.SingleOrDefaultAsync(
            item => item.WorkshopId == workshopId && item.UserId == userId,
            cancellationToken);
        if (membership is null) return;
        if (isActive) membership.Activate();
        else membership.Deactivate();
    }
}
