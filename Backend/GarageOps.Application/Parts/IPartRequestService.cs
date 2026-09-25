using GarageOps.Domain.Enums;

namespace GarageOps.Application.Parts;

public interface IPartRequestService
{
    Task<PartRequestResponse> CreateAsync(Guid workshopId, Guid jobCardId, Guid userId, EmployeeRole role, CreatePartRequestRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<PartRequestResponse>> GetByJobCardAsync(Guid workshopId, Guid jobCardId, Guid userId, EmployeeRole role, CancellationToken cancellationToken);
    Task<IReadOnlyList<PartRequestResponse>> GetByWorkshopAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<PartRequestResponse?> ProcessAsync(Guid workshopId, Guid requestId, Guid userId, ProcessPartRequestRequest request, CancellationToken cancellationToken);
}
