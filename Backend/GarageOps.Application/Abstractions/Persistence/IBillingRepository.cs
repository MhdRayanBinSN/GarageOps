using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IBillingRepository
{
    Task AddInvoiceAsync(Invoice invoice, CancellationToken cancellationToken);
    Task<Invoice?> GetInvoiceAsync(Guid invoiceId, Guid workshopId, CancellationToken cancellationToken);
    Task AddPaymentAsync(Payment payment, CancellationToken cancellationToken);
    Task<List<Payment>> GetPaymentsAsync(Guid invoiceId, CancellationToken cancellationToken);
}
