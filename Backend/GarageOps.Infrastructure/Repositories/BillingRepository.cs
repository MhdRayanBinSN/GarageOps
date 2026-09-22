using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class BillingRepository : IBillingRepository
{
    private readonly GarageOpsDbContext dbContext;

    public BillingRepository(GarageOpsDbContext dbContext) => this.dbContext = dbContext;

    public Task AddInvoiceAsync(Invoice invoice, CancellationToken cancellationToken) => dbContext.Invoices.AddAsync(invoice, cancellationToken).AsTask();

    public Task<Invoice?> GetInvoiceAsync(Guid invoiceId, Guid workshopId, CancellationToken cancellationToken) => dbContext.Invoices.Include(invoice => invoice.Payments).SingleOrDefaultAsync(invoice => invoice.Id == invoiceId && invoice.WorkshopId == workshopId, cancellationToken);

    public Task AddPaymentAsync(Payment payment, CancellationToken cancellationToken) => dbContext.Payments.AddAsync(payment, cancellationToken).AsTask();

    public Task<List<Payment>> GetPaymentsAsync(Guid invoiceId, CancellationToken cancellationToken) => dbContext.Payments.AsNoTracking().Where(payment => payment.InvoiceId == invoiceId).OrderBy(payment => payment.PaidAt).ToListAsync(cancellationToken);
}
