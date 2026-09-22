using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;

namespace GarageOps.Application.Catalog;

public sealed class CatalogService : ICatalogService
{
    private readonly IServiceRepository serviceRepository;
    private readonly IPartRepository partRepository;
    private readonly IUnitOfWork unitOfWork;

    public CatalogService(IServiceRepository serviceRepository, IPartRepository partRepository, IUnitOfWork unitOfWork)
    {
        this.serviceRepository = serviceRepository;
        this.partRepository = partRepository;
        this.unitOfWork = unitOfWork;
    }

    public async Task<ServiceResponse> CreateServiceAsync(Guid workshopId, CreateServiceRequest request, CancellationToken cancellationToken)
    {
        var service = new Service(workshopId, request.Name, request.Description, request.DefaultPrice);
        await serviceRepository.AddAsync(service, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(service);
    }

    public async Task<IReadOnlyList<ServiceResponse>> GetServicesAsync(Guid workshopId, CancellationToken cancellationToken) => (await serviceRepository.GetByWorkshopAsync(workshopId, cancellationToken)).Select(Map).ToArray();

    public async Task<ServiceResponse?> UpdateServiceAsync(Guid workshopId, Guid id, UpdateServiceRequest request, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(id, workshopId, cancellationToken);
        if (service is null) return null;
        service.UpdateDetails(request.Name, request.Description, request.DefaultPrice);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(service);
    }

    public async Task<bool> DeactivateServiceAsync(Guid workshopId, Guid id, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(id, workshopId, cancellationToken);
        if (service is null) return false;
        service.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PartResponse> CreatePartAsync(Guid workshopId, CreatePartRequest request, CancellationToken cancellationToken)
    {
        var part = new Part(workshopId, request.Name, request.PartNumber, request.UnitPrice, request.StockQuantity);
        await partRepository.AddAsync(part, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(part);
    }

    public async Task<IReadOnlyList<PartResponse>> GetPartsAsync(Guid workshopId, CancellationToken cancellationToken) => (await partRepository.GetByWorkshopAsync(workshopId, cancellationToken)).Select(Map).ToArray();

    public async Task<PartResponse?> UpdatePartAsync(Guid workshopId, Guid id, UpdatePartRequest request, CancellationToken cancellationToken)
    {
        var part = await partRepository.GetByIdAsync(id, workshopId, cancellationToken);
        if (part is null) return null;
        part.UpdateDetails(request.Name, request.UnitPrice);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(part);
    }

    public async Task<PartResponse?> AdjustStockAsync(Guid workshopId, Guid id, AdjustStockRequest request, CancellationToken cancellationToken)
    {
        var part = await partRepository.GetByIdAsync(id, workshopId, cancellationToken);
        if (part is null) return null;
        part.AdjustStock(request.QuantityChange);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(part);
    }

    public async Task<bool> DeactivatePartAsync(Guid workshopId, Guid id, CancellationToken cancellationToken)
    {
        var part = await partRepository.GetByIdAsync(id, workshopId, cancellationToken);
        if (part is null) return false;
        part.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ServiceResponse Map(Service service) => new(service.Id, service.WorkshopId, service.Name, service.Description, service.DefaultPrice, service.IsActive);
    private static PartResponse Map(Part part) => new(part.Id, part.WorkshopId, part.Name, part.PartNumber, part.UnitPrice, part.StockQuantity, part.IsActive);
}
