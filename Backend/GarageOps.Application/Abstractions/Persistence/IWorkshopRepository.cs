using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IWorkshopRepository
{
    Task AddAsync(Workshop workshop, CancellationToken cancellationToken);

    Task<Workshop?> GetByIdAsync(Guid workshopId, CancellationToken cancellationToken);
}
