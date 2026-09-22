using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IPartRepository
{
    Task AddAsync(Part part, CancellationToken cancellationToken);
    Task<List<Part>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<Part?> GetByIdAsync(Guid id, Guid workshopId, CancellationToken cancellationToken);
}
