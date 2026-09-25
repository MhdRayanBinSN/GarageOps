using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IJobPartRequestRepository
{
    Task AddAsync(JobPartRequest request, CancellationToken cancellationToken);
    Task<List<JobPartRequest>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<List<JobPartRequest>> GetByJobCardAsync(Guid workshopId, Guid jobCardId, CancellationToken cancellationToken);
    Task<JobPartRequest?> GetByIdAsync(Guid workshopId, Guid requestId, CancellationToken cancellationToken);
}
