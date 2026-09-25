namespace GarageOps.Application.Customers;

public interface ICustomerPortalService
{
    Task<CustomerPortalAccessResponse> CreateAccessAsync(
        Guid workshopId, Guid customerId, CreateCustomerPortalAccessRequest request,
        CancellationToken cancellationToken);

    Task<CustomerPortalProfileResponse?> GetProfileAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalJobResponse>> GetJobsAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalInvoiceResponse>> GetInvoicesAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalPaymentDetailResponse>> GetPaymentsAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<CustomerPortalVehicleResponse>> GetVehiclesAsync(Guid userId, CancellationToken cancellationToken);
}
