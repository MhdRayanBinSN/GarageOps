using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class JobCardRepository : IJobCardRepository
{
    private readonly GarageOpsDbContext dbContext;

    public JobCardRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(JobCard jobCard, CancellationToken cancellationToken)
    {
        return dbContext.JobCards.AddAsync(jobCard, cancellationToken).AsTask();
    }

    public Task<List<JobCard>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.JobCards
            .AsNoTracking()
            .Where(jobCard => jobCard.WorkshopId == workshopId)
            .OrderByDescending(jobCard => jobCard.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<JobCard?> GetByIdAsync(
        Guid jobCardId,
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.JobCards.SingleOrDefaultAsync(
            jobCard => jobCard.Id == jobCardId
                && jobCard.WorkshopId == workshopId,
            cancellationToken);
    }
}
