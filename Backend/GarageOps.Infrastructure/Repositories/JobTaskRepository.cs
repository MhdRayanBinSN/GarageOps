using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class JobTaskRepository : IJobTaskRepository
{
    private readonly GarageOpsDbContext dbContext;

    public JobTaskRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(JobTask task, CancellationToken cancellationToken)
    {
        return dbContext.JobTasks.AddAsync(task, cancellationToken).AsTask();
    }

    public Task<List<JobTask>> GetByJobCardAsync(
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        return dbContext.JobTasks
            .AsNoTracking()
            .Where(task => task.JobCardId == jobCardId)
            .Include(task => task.JobCard)
            .OrderBy(task => task.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<List<JobTask>> GetAssignedToUserAsync(
        Guid workshopId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return dbContext.JobTasks
            .AsNoTracking()
            .Where(task => task.AssignedToUserId == userId
                && task.JobCard.WorkshopId == workshopId)
            .Include(task => task.JobCard)
            .OrderBy(task => task.Status)
            .ThenByDescending(task => task.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<JobTask?> GetByIdAsync(
        Guid taskId,
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        return dbContext.JobTasks.SingleOrDefaultAsync(
            task => task.Id == taskId && task.JobCardId == jobCardId,
            cancellationToken);
    }
}
