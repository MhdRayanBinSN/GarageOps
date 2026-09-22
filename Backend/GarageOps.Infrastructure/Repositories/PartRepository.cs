using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class PartRepository : IPartRepository
{
    private readonly GarageOpsDbContext dbContext;

    public PartRepository(GarageOpsDbContext dbContext) => this.dbContext = dbContext;

    public Task AddAsync(Part part, CancellationToken cancellationToken) => dbContext.Parts.AddAsync(part, cancellationToken).AsTask();

    public Task<List<Part>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken) => dbContext.Parts.AsNoTracking().Where(part => part.WorkshopId == workshopId).OrderBy(part => part.Name).ToListAsync(cancellationToken);

    public Task<Part?> GetByIdAsync(Guid id, Guid workshopId, CancellationToken cancellationToken) => dbContext.Parts.SingleOrDefaultAsync(part => part.Id == id && part.WorkshopId == workshopId, cancellationToken);
}
