using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class CustomerRepository : ICustomerRepository
{
    private readonly GarageOpsDbContext dbContext;

    public CustomerRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(Customer customer, CancellationToken cancellationToken)
    {
        return dbContext.Customers.AddAsync(customer, cancellationToken).AsTask();
    }

    public Task<List<Customer>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.Customers
            .AsNoTracking()
            .Where(customer => customer.WorkshopId == workshopId)
            .OrderBy(customer => customer.LastName)
            .ThenBy(customer => customer.FirstName)
            .ToListAsync(cancellationToken);
    }

    public Task<Customer?> GetByIdAsync(
        Guid customerId,
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.Customers.SingleOrDefaultAsync(
            customer => customer.Id == customerId
                && customer.WorkshopId == workshopId,
            cancellationToken);
    }
}
