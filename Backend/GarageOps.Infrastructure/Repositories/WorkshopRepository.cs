using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class WorkshopRepository : IWorkshopRepository
{
    private readonly GarageOpsDbContext dbContext;

    public WorkshopRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(Workshop workshop, CancellationToken cancellationToken)
    {
        return dbContext.Workshops.AddAsync(workshop, cancellationToken).AsTask();
    }

    public Task<Workshop?> GetByIdAsync(Guid workshopId, CancellationToken cancellationToken)
    {
        return dbContext.Workshops.SingleOrDefaultAsync(workshop => workshop.Id == workshopId, cancellationToken);
    }
}
