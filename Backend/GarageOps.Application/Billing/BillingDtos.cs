using GarageOps.Domain.Enums;

namespace GarageOps.Application.Billing;

public sealed record CreateInvoiceRequest(Guid JobCardId, Guid CustomerId, string InvoiceNumber, decimal Subtotal, decimal Tax);
public sealed record InvoiceResponse(Guid Id, Guid WorkshopId, Guid JobCardId, Guid CustomerId, string InvoiceNumber, decimal Subtotal, decimal Tax, decimal Total, InvoiceStatus Status);
public sealed record CreatePaymentRequest(decimal Amount, PaymentMethod Method);
public sealed record PaymentResponse(Guid Id, Guid InvoiceId, decimal Amount, PaymentMethod Method, DateTime PaidAt);
