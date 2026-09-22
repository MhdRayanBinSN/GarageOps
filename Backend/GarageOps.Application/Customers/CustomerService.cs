using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;

namespace GarageOps.Application.Customers;

public sealed class CustomerService : ICustomerService
{
    private readonly ICustomerRepository customerRepository;
    private readonly IUnitOfWork unitOfWork;

    public CustomerService(
        ICustomerRepository customerRepository,
        IUnitOfWork unitOfWork)
    {
        this.customerRepository = customerRepository;
        this.unitOfWork = unitOfWork;
    }

    public async Task<CustomerResponse> CreateAsync(
        Guid workshopId,
        CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var customer = new Customer(
            workshopId,
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Email,
            request.Address);

        await customerRepository.AddAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(customer);
    }

    public async Task<IReadOnlyList<CustomerResponse>> GetByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        var customers = await customerRepository.GetByWorkshopAsync(
            workshopId,
            cancellationToken);

        return customers.Select(Map).ToArray();
    }

    public async Task<CustomerResponse?> GetByIdAsync(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await customerRepository.GetByIdAsync(
            customerId,
            workshopId,
            cancellationToken);

        return customer is null ? null : Map(customer);
    }

    public async Task<CustomerResponse?> UpdateAsync(
        Guid workshopId,
        Guid customerId,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var customer = await customerRepository.GetByIdAsync(
            customerId,
            workshopId,
            cancellationToken);

        if (customer is null)
        {
            return null;
        }

        customer.UpdateDetails(
            request.FirstName,
            request.LastName,
            request.Phone,
            request.Email,
            request.Address);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(customer);
    }

    public async Task<bool> DeactivateAsync(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await customerRepository.GetByIdAsync(
            customerId,
            workshopId,
            cancellationToken);

        if (customer is null)
        {
            return false;
        }

        customer.Deactivate();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CustomerResponse Map(Customer customer)
    {
        return new CustomerResponse(
            customer.Id,
            customer.WorkshopId,
            customer.FirstName,
            customer.LastName,
            customer.Phone,
            customer.Email,
            customer.Address,
            customer.IsActive);
    }
}
