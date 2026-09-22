namespace GarageOps.Application.Customers;

public sealed record CreateCustomerRequest(
    string FirstName,
    string LastName,
    string Phone,
    string Email,
    string Address);

public sealed record UpdateCustomerRequest(
    string FirstName,
    string LastName,
    string Phone,
    string Email,
    string Address);

public sealed record CustomerResponse(
    Guid Id,
    Guid WorkshopId,
    string FirstName,
    string LastName,
    string Phone,
    string Email,
    string Address,
    bool IsActive);
