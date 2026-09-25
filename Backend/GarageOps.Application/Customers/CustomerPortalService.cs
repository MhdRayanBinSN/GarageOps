using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Application.Authentication;
using GarageOps.Domain.Entities;
using GarageOps.Domain.Enums;

namespace GarageOps.Application.Customers;

public sealed class CustomerPortalService : ICustomerPortalService
{
    private readonly ICustomerRepository customers;
    private readonly IUserRepository users;
    private readonly ICustomerPortalReadRepository portalRead;
    private readonly IUnitOfWork unitOfWork;
    private readonly IPasswordHasher passwordHasher;

    public CustomerPortalService(
        ICustomerRepository customers, IUserRepository users,
        ICustomerPortalReadRepository portalRead, IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher)
    {
        this.customers = customers;
        this.users = users;
        this.portalRead = portalRead;
        this.unitOfWork = unitOfWork;
        this.passwordHasher = passwordHasher;
    }

    public async Task<CustomerPortalAccessResponse> CreateAccessAsync(
        Guid workshopId, Guid customerId, CreateCustomerPortalAccessRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Trim().Length < 3)
            throw new ArgumentException("Username must contain at least 3 characters.");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            throw new ArgumentException("Password must contain at least 8 characters.");
        var customer = await customers.GetByIdAsync(customerId, workshopId, cancellationToken)
            ?? throw new KeyNotFoundException("Customer not found in this workshop.");
        if (!customer.IsActive) throw new InvalidOperationException("Portal access cannot be created for an inactive customer.");
        if (customer.PortalUserId is not null)
            throw new InvalidOperationException("This customer already has portal access.");
        if (await users.GetByUsernameAsync(request.Username, cancellationToken) is not null)
            throw new InvalidOperationException("That username is already in use.");

        var user = new User(workshopId, request.Username.Trim(), customer.Email,
            passwordHasher.Hash(request.Password), UserType.Customer, null);
        customer.LinkPortalUser(user.Id);
        await users.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new CustomerPortalAccessResponse(user.Id, customer.Id, user.Username);
    }

    public Task<CustomerPortalProfileResponse?> GetProfileAsync(Guid userId, CancellationToken cancellationToken) =>
        portalRead.GetProfileAsync(userId, cancellationToken);

    public Task<IReadOnlyList<CustomerPortalJobResponse>> GetJobsAsync(Guid userId, CancellationToken cancellationToken) =>
        portalRead.GetJobsAsync(userId, cancellationToken);

    public Task<IReadOnlyList<CustomerPortalInvoiceResponse>> GetInvoicesAsync(Guid userId, CancellationToken cancellationToken) =>
        portalRead.GetInvoicesAsync(userId, cancellationToken);

    public Task<IReadOnlyList<CustomerPortalPaymentDetailResponse>> GetPaymentsAsync(Guid userId, CancellationToken cancellationToken) =>
        portalRead.GetPaymentsAsync(userId, cancellationToken);

    public Task<IReadOnlyList<CustomerPortalVehicleResponse>> GetVehiclesAsync(Guid userId, CancellationToken cancellationToken) =>
        portalRead.GetVehiclesAsync(userId, cancellationToken);
}
