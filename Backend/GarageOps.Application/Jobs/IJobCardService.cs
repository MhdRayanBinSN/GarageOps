namespace GarageOps.Application.Jobs;

public interface IJobCardService
{
    Task<JobCardResponse> CreateAsync(
        Guid workshopId,
        Guid createdByUserId,
        CreateJobCardRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<JobCardResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<JobCardResponse?> GetByIdAsync(
        Guid workshopId,
        Guid jobCardId,
        CancellationToken cancellationToken);

    Task<JobCardResponse?> UpdateStatusAsync(
        Guid workshopId,
        Guid jobCardId,
        UpdateJobStatusRequest request,
        CancellationToken cancellationToken);

    Task<JobCardResponse?> UpdateDetailsAsync(
        Guid workshopId,
        Guid jobCardId,
        UpdateJobCardDetailsRequest request,
        CancellationToken cancellationToken);
}
