using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;

namespace GarageOps.Application.Jobs;

public sealed class JobCardService : IJobCardService
{
    private readonly IJobCardRepository jobCardRepository;
    private readonly IUnitOfWork unitOfWork;

    public JobCardService(
        IJobCardRepository jobCardRepository,
        IUnitOfWork unitOfWork)
    {
        this.jobCardRepository = jobCardRepository;
        this.unitOfWork = unitOfWork;
    }

    public async Task<JobCardResponse> CreateAsync(
        Guid workshopId,
        Guid createdByUserId,
        CreateJobCardRequest request,
        CancellationToken cancellationToken)
    {
        var jobCard = new JobCard(
            workshopId,
            request.CustomerId,
            createdByUserId,
            request.Title,
            request.Description,
            request.VehicleRegistrationNumber,
            request.VehicleMake,
            request.VehicleModel,
            request.VehicleYear);

        await jobCardRepository.AddAsync(jobCard, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(jobCard);
    }

    public async Task<IReadOnlyList<JobCardResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        var jobCards = await jobCardRepository.GetByWorkshopAsync(
            workshopId,
            cancellationToken);

        return jobCards.Select(Map).ToArray();
    }

    public async Task<JobCardResponse?> GetByIdAsync(
        Guid workshopId,
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        var jobCard = await jobCardRepository.GetByIdAsync(
            jobCardId,
            workshopId,
            cancellationToken);

        return jobCard is null ? null : Map(jobCard);
    }

    public async Task<JobCardResponse?> UpdateStatusAsync(
        Guid workshopId,
        Guid jobCardId,
        UpdateJobStatusRequest request,
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

        jobCard.UpdateStatus(request.Status);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(jobCard);
    }

    private static JobCardResponse Map(JobCard jobCard)
    {
        return new JobCardResponse(
            jobCard.Id,
            jobCard.WorkshopId,
            jobCard.CustomerId,
            jobCard.CreatedByUserId,
            jobCard.Title,
            jobCard.Description,
            jobCard.VehicleRegistrationNumber,
            jobCard.VehicleMake,
            jobCard.VehicleModel,
            jobCard.VehicleYear,
            jobCard.Status,
            jobCard.CreatedAt,
            jobCard.UpdatedAt);
    }
}
