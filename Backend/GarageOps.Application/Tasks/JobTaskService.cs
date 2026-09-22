using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;

namespace GarageOps.Application.Tasks;

public sealed class JobTaskService : IJobTaskService
{
    private readonly IJobCardRepository jobCardRepository;
    private readonly IJobTaskRepository taskRepository;
    private readonly IUnitOfWork unitOfWork;

    public JobTaskService(
        IJobCardRepository jobCardRepository,
        IJobTaskRepository taskRepository,
        IUnitOfWork unitOfWork)
    {
        this.jobCardRepository = jobCardRepository;
        this.taskRepository = taskRepository;
        this.unitOfWork = unitOfWork;
    }

    public async Task<JobTaskResponse> CreateAsync(
        Guid workshopId,
        Guid jobCardId,
        CreateJobTaskRequest request,
        CancellationToken cancellationToken)
    {
        var jobCard = await jobCardRepository.GetByIdAsync(
            jobCardId,
            workshopId,
            cancellationToken);

        if (jobCard is null)
        {
            throw new KeyNotFoundException("Job card was not found.");
        }

        var task = new JobTask(
            jobCardId,
            request.Title,
            request.Description,
            request.EstimatedHours);

        await taskRepository.AddAsync(task, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(task);
    }

    public async Task<IReadOnlyList<JobTaskResponse>> GetByJobCardAsync(
        Guid workshopId,
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        var jobCard = await jobCardRepository.GetByIdAsync(
            jobCardId,
            workshopId,
            cancellationToken);

        if (jobCard is null)
        {
            throw new KeyNotFoundException("Job card was not found.");
        }

        var tasks = await taskRepository.GetByJobCardAsync(
            jobCardId,
            cancellationToken);

        return tasks.Select(Map).ToArray();
    }

    public Task<JobTaskResponse?> AssignAsync(
        Guid workshopId,
        Guid jobCardId,
        Guid taskId,
        AssignJobTaskRequest request,
        CancellationToken cancellationToken)
    {
        return UpdateTaskAsync(
            workshopId,
            jobCardId,
            taskId,
            task => task.AssignTo(request.UserId),
            cancellationToken);
    }

    public Task<JobTaskResponse?> UpdateStatusAsync(
        Guid workshopId,
        Guid jobCardId,
        Guid taskId,
        UpdateJobTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        return UpdateTaskAsync(
            workshopId,
            jobCardId,
            taskId,
            task => task.UpdateStatus(request.Status),
            cancellationToken);
    }

    private async Task<JobTaskResponse?> UpdateTaskAsync(
        Guid workshopId,
        Guid jobCardId,
        Guid taskId,
        Action<JobTask> update,
        CancellationToken cancellationToken)
    {
        var jobCard = await jobCardRepository.GetByIdAsync(
            jobCardId,
            workshopId,
            cancellationToken);

        if (jobCard is null)
        {
            return null;
        }

        var task = await taskRepository.GetByIdAsync(
            taskId,
            jobCardId,
            cancellationToken);

        if (task is null)
        {
            return null;
        }

        update(task);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(task);
    }

    private static JobTaskResponse Map(JobTask task)
    {
        return new JobTaskResponse(
            task.Id,
            task.JobCardId,
            task.AssignedToUserId,
            task.Title,
            task.Description,
            task.Status,
            task.EstimatedHours,
            task.ActualHours,
            task.CreatedAt,
            task.UpdatedAt);
    }
}
