using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class ServiceRepository : IServiceRepository
{
    private readonly GarageOpsDbContext dbContext;

    public ServiceRepository(GarageOpsDbContext dbContext) => this.dbContext = dbContext;

    public Task AddAsync(Service service, CancellationToken cancellationToken) => dbContext.Services.AddAsync(service, cancellationToken).AsTask();

    public Task<List<Service>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken) => dbContext.Services.AsNoTracking().Where(service => service.WorkshopId == workshopId).OrderBy(service => service.Name).ToListAsync(cancellationToken);

    public Task<Service?> GetByIdAsync(Guid id, Guid workshopId, CancellationToken cancellationToken) => dbContext.Services.SingleOrDefaultAsync(service => service.Id == id && service.WorkshopId == workshopId, cancellationToken);
}
