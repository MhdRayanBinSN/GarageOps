using GarageOps.Domain.Enums;
using JobTaskStatus = GarageOps.Domain.Enums.TaskStatus;

namespace GarageOps.Application.Customers;

public sealed record CreateCustomerPortalAccessRequest(string Username, string Password);
public sealed record CustomerPortalAccessResponse(Guid UserId, Guid CustomerId, string Username);

public sealed record CustomerPortalProfileResponse(
    Guid CustomerId, string FirstName, string LastName, string Phone, string Email,
    string Address, string WorkshopName);

public sealed record CustomerPortalTaskResponse(
    Guid Id, string Title, JobTaskStatus Status, decimal? EstimatedHours, decimal? ActualHours,
    string? WorkPerformed);
public sealed record CustomerPortalPartResponse(string Name, int Quantity);

public sealed record CustomerPortalJobResponse(
    Guid Id, string Title, string Description, JobStatus Status, DateTime CreatedAt,
    string VehicleRegistrationNumber, string VehicleMake, string VehicleModel, int VehicleYear,
    IReadOnlyList<CustomerPortalTaskResponse> Tasks,
    IReadOnlyList<CustomerPortalPartResponse> Parts);

public sealed record CustomerPortalPaymentResponse(decimal Amount, PaymentMethod Method, DateTime PaidAt);
public sealed record CustomerPortalPaymentDetailResponse(
    Guid Id, Guid InvoiceId, string InvoiceNumber, decimal Amount, PaymentMethod Method, DateTime PaidAt);
public sealed record CustomerPortalVehicleResponse(
    string RegistrationNumber, string Make, string Model, int Year, DateTime LastServicedAt);

public sealed record CustomerPortalInvoiceResponse(
    Guid Id, Guid JobCardId, string InvoiceNumber, decimal Subtotal, decimal Tax,
    decimal Total, InvoiceStatus Status, DateTime CreatedAt,
    IReadOnlyList<CustomerPortalPaymentResponse> Payments);
