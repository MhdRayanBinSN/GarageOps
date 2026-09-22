using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IJobCardRepository
{
    Task AddAsync(JobCard jobCard, CancellationToken cancellationToken);

    Task<List<JobCard>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<JobCard?> GetByIdAsync(
        Guid jobCardId,
        Guid workshopId,
        CancellationToken cancellationToken);
}
