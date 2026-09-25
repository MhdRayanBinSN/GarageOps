using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IJobTaskRepository
{
    Task AddAsync(JobTask task, CancellationToken cancellationToken);

    Task<List<JobTask>> GetByJobCardAsync(
        Guid jobCardId,
        CancellationToken cancellationToken);

    Task<List<JobTask>> GetAssignedToUserAsync(
        Guid workshopId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<JobTask?> GetByIdAsync(
        Guid taskId,
        Guid jobCardId,
        CancellationToken cancellationToken);
}
