using GarageOps.Domain.Enums;
using JobTaskStatus = GarageOps.Domain.Enums.TaskStatus;

namespace GarageOps.Application.Tasks;

public sealed record CreateJobTaskRequest(
    string Title,
    string Description,
    decimal? EstimatedHours);

public sealed record AssignJobTaskRequest(Guid UserId);

public sealed record UpdateJobTaskStatusRequest(JobTaskStatus Status);

public sealed record JobTaskResponse(
    Guid Id,
    Guid JobCardId,
    Guid? AssignedToUserId,
    string Title,
    string Description,
    JobTaskStatus Status,
    decimal? EstimatedHours,
    decimal? ActualHours,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
