using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface ICustomerRepository
{
    Task AddAsync(Customer customer, CancellationToken cancellationToken);

    Task<List<Customer>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<Customer?> GetByIdAsync(
        Guid customerId,
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<Customer?> GetByPortalUserIdAsync(Guid userId, CancellationToken cancellationToken);
}
