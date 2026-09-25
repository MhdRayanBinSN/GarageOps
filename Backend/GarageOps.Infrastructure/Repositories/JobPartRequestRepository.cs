using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class JobPartRequestRepository : IJobPartRequestRepository
{
    private readonly GarageOpsDbContext db;
    public JobPartRequestRepository(GarageOpsDbContext db) => this.db = db;

    public Task AddAsync(JobPartRequest request, CancellationToken cancellationToken) => db.JobPartRequests.AddAsync(request, cancellationToken).AsTask();

    public Task<List<JobPartRequest>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken) =>
        Query().Where(request => request.WorkshopId == workshopId)
            .OrderBy(request => request.Status).ThenByDescending(request => request.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<List<JobPartRequest>> GetByJobCardAsync(Guid workshopId, Guid jobCardId, CancellationToken cancellationToken) =>
        Query().Where(request => request.WorkshopId == workshopId && request.JobCardId == jobCardId)
            .OrderByDescending(request => request.CreatedAt).ToListAsync(cancellationToken);

    public Task<JobPartRequest?> GetByIdAsync(Guid workshopId, Guid requestId, CancellationToken cancellationToken) =>
        Query().SingleOrDefaultAsync(request => request.WorkshopId == workshopId && request.Id == requestId, cancellationToken);

    private IQueryable<JobPartRequest> Query() => db.JobPartRequests
        .Include(request => request.Part)
        .Include(request => request.JobCard)
        .Include(request => request.JobTask)
        .Include(request => request.RequestedByUser)
        .Include(request => request.ProcessedByUser);
}
