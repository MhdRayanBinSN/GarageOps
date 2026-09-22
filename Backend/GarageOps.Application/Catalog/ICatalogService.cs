namespace GarageOps.Application.Catalog;

public interface ICatalogService
{
    Task<ServiceResponse> CreateServiceAsync(Guid workshopId, CreateServiceRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceResponse>> GetServicesAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<ServiceResponse?> UpdateServiceAsync(Guid workshopId, Guid id, UpdateServiceRequest request, CancellationToken cancellationToken);
    Task<bool> DeactivateServiceAsync(Guid workshopId, Guid id, CancellationToken cancellationToken);
    Task<PartResponse> CreatePartAsync(Guid workshopId, CreatePartRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<PartResponse>> GetPartsAsync(Guid workshopId, CancellationToken cancellationToken);
    Task<PartResponse?> UpdatePartAsync(Guid workshopId, Guid id, UpdatePartRequest request, CancellationToken cancellationToken);
    Task<PartResponse?> AdjustStockAsync(Guid workshopId, Guid id, AdjustStockRequest request, CancellationToken cancellationToken);
    Task<bool> DeactivatePartAsync(Guid workshopId, Guid id, CancellationToken cancellationToken);
}
