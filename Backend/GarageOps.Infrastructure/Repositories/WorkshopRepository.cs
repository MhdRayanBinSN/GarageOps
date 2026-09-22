using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;

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
}
