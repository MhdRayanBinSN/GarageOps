using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IWorkshopRepository
{
    Task AddAsync(Workshop workshop, CancellationToken cancellationToken);
}
