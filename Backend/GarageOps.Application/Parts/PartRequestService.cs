using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Domain.Enums;

namespace GarageOps.Application.Parts;

public sealed class PartRequestService : IPartRequestService
{
    private readonly IJobPartRequestRepository requests;
    private readonly IJobCardRepository jobCards;
    private readonly IJobTaskRepository tasks;
    private readonly IPartRepository parts;
    private readonly IUnitOfWork unitOfWork;

    public PartRequestService(IJobPartRequestRepository requests, IJobCardRepository jobCards,
        IJobTaskRepository tasks, IPartRepository parts, IUnitOfWork unitOfWork)
    {
        this.requests = requests;
        this.jobCards = jobCards;
        this.tasks = tasks;
        this.parts = parts;
        this.unitOfWork = unitOfWork;
    }

    public async Task<PartRequestResponse> CreateAsync(Guid workshopId, Guid jobCardId, Guid userId,
        EmployeeRole role, CreatePartRequestRequest request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0) throw new ArgumentException("Requested quantity must be greater than zero.");
        var jobCard = await jobCards.GetByIdAsync(jobCardId, workshopId, cancellationToken)
            ?? throw new KeyNotFoundException("Job card was not found.");
        var task = await tasks.GetByIdAsync(request.JobTaskId, jobCardId, cancellationToken)
            ?? throw new KeyNotFoundException("Job task was not found on this job card.");
        if ((role is EmployeeRole.Mechanic or EmployeeRole.Technician)
            && task.AssignedToUserId != userId)
        {
            throw new UnauthorizedAccessException("You can request parts only for a task assigned to you.");
        }
        var part = await parts.GetByIdAsync(request.PartId, workshopId, cancellationToken)
            ?? throw new KeyNotFoundException("Part was not found.");
        if (!part.IsActive) throw new InvalidOperationException("This part is no longer available.");

        var item = new JobPartRequest(workshopId, jobCardId, task.Id, part.Id, userId, request.Quantity, request.Notes);
        await requests.AddAsync(item, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        item = await requests.GetByIdAsync(workshopId, item.Id, cancellationToken) ?? item;
        return Map(item);
    }

    public async Task<IReadOnlyList<PartRequestResponse>> GetByJobCardAsync(Guid workshopId, Guid jobCardId,
        Guid userId, EmployeeRole role, CancellationToken cancellationToken)
    {
        if (await jobCards.GetByIdAsync(jobCardId, workshopId, cancellationToken) is null)
            throw new KeyNotFoundException("Job card was not found.");
        var items = await requests.GetByJobCardAsync(workshopId, jobCardId, cancellationToken);
        if (role is EmployeeRole.Mechanic or EmployeeRole.Technician)
            items = items.Where(item => item.RequestedByUserId == userId).ToList();
        return items.Select(Map).ToArray();
    }

    public async Task<IReadOnlyList<PartRequestResponse>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken) =>
        (await requests.GetByWorkshopAsync(workshopId, cancellationToken)).Select(Map).ToArray();

    public async Task<PartRequestResponse?> ProcessAsync(Guid workshopId, Guid requestId, Guid userId,
        ProcessPartRequestRequest request, CancellationToken cancellationToken)
    {
        var item = await requests.GetByIdAsync(workshopId, requestId, cancellationToken);
        if (item is null) return null;
        if (request.Status == PartRequestStatus.Issued)
        {
            var part = await parts.GetByIdAsync(item.PartId, workshopId, cancellationToken);
            if (part is null || !part.IsActive) throw new InvalidOperationException("The requested part is unavailable.");
            part.AdjustStock(-item.Quantity);
        }
        item.Process(request.Status, userId);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(item);
    }

    private static PartRequestResponse Map(JobPartRequest request) => new(
        request.Id, request.WorkshopId, request.JobCardId, request.JobTaskId, request.PartId,
        request.Part.Name, request.Part.PartNumber, request.Quantity, request.Status,
        request.RequestedByUserId, request.RequestedByUser.Username, request.ProcessedByUserId,
        request.ProcessedByUser?.Username, request.Notes, request.JobCard.Title,
        request.JobCard.VehicleRegistrationNumber, request.JobTask.Title, request.CreatedAt,
        request.ProcessedAt);
}
