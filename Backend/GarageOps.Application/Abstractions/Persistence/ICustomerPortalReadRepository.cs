using GarageOps.Application.Customers;

namespace GarageOps.Application.Abstractions.Persistence;

public interface ICustomerPortalReadRepository
{
    Task<CustomerPortalProfileResponse?> GetProfileAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalJobResponse>> GetJobsAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalInvoiceResponse>> GetInvoicesAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalPaymentDetailResponse>> GetPaymentsAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalVehicleResponse>> GetVehiclesAsync(Guid userId, CancellationToken cancellationToken);
}
