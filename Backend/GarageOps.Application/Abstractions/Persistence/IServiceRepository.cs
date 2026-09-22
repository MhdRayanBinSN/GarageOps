using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IServiceRepository
{
    Task AddAsync(Service service, CancellationToken cancellationToken);
    Task<List<Service>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<Service?> GetByIdAsync(Guid id, Guid workshopId, CancellationToken cancellationToken);
}
