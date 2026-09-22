namespace GarageOps.Application.Billing;

public interface IBillingService
{
    Task<InvoiceResponse> CreateInvoiceAsync(Guid workshopId, CreateInvoiceRequest request, CancellationToken cancellationToken);
    Task<InvoiceResponse?> GetInvoiceAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken);
    Task<InvoiceResponse?> FinalizeInvoiceAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken);
    Task<PaymentResponse?> AddPaymentAsync(Guid workshopId, Guid invoiceId, CreatePaymentRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<PaymentResponse>> GetPaymentsAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken);
}
