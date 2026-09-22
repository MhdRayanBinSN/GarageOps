namespace GarageOps.Application.Customers;

public interface ICustomerService
{
    Task<CustomerResponse> CreateAsync(
        Guid workshopId,
        CreateCustomerRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<CustomerResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<CustomerResponse?> GetByIdAsync(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken);

    Task<CustomerResponse?> UpdateAsync(
        Guid workshopId,
        Guid customerId,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken);

    Task<bool> DeactivateAsync(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken);
}
