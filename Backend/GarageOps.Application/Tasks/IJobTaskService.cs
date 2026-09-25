namespace GarageOps.Application.Tasks;

public interface IJobTaskService
{
    Task<JobTaskResponse> CreateAsync(
        Guid workshopId,
        Guid jobCardId,
        CreateJobTaskRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<JobTaskResponse>> GetByJobCardAsync(
        Guid workshopId,
        Guid jobCardId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<JobTaskResponse>> GetAssignedToUserAsync(
        Guid workshopId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<JobTaskResponse?> AssignAsync(
        Guid workshopId,
        Guid jobCardId,
        Guid taskId,
        AssignJobTaskRequest request,
        CancellationToken cancellationToken);

    Task<JobTaskResponse?> UpdateStatusAsync(
        Guid workshopId,
        Guid jobCardId,
        Guid taskId,
        UpdateJobTaskStatusRequest request,
        CancellationToken cancellationToken);
}
