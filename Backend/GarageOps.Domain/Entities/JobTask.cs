using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;
using JobTaskStatus = GarageOps.Domain.Enums.TaskStatus;

namespace GarageOps.Domain.Entities;

public class JobTask : BaseEntity
{
    public Guid JobCardId { get; private set; }

    public Guid? AssignedToUserId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public JobTaskStatus Status { get; private set; } = JobTaskStatus.Pending;

    public decimal? EstimatedHours { get; private set; }

    public decimal? ActualHours { get; private set; }

    public string WorkPerformed { get; private set; } = string.Empty;

    public JobCard JobCard { get; private set; } = null!;

    public User? AssignedToUser { get; private set; }

    private JobTask()
    {
    }

    public JobTask(
        Guid jobCardId,
        string title,
        string description,
        decimal? estimatedHours)
    {
        JobCardId = jobCardId;
        Title = title;
        Description = description;
        EstimatedHours = estimatedHours;
    }

    public void AssignTo(Guid userId)
    {
        AssignedToUserId = userId;
        Status = JobTaskStatus.Assigned;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStatus(JobTaskStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordWork(decimal actualHours, string workPerformed)
    {
        if (actualHours <= 0) throw new ArgumentOutOfRangeException(nameof(actualHours));
        if (string.IsNullOrWhiteSpace(workPerformed)) throw new ArgumentException("Work performed is required.", nameof(workPerformed));
        ActualHours = actualHours;
        WorkPerformed = workPerformed.Trim();
        Status = JobTaskStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }
}
