using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;

namespace GarageOps.Application.Billing;

public sealed class BillingService : IBillingService
{
    private readonly IBillingRepository billingRepository;
    private readonly IUnitOfWork unitOfWork;

    public BillingService(IBillingRepository billingRepository, IUnitOfWork unitOfWork)
    {
        this.billingRepository = billingRepository;
        this.unitOfWork = unitOfWork;
    }

    public async Task<InvoiceResponse> CreateInvoiceAsync(Guid workshopId, CreateInvoiceRequest request, CancellationToken cancellationToken)
    {
        var invoice = new Invoice(workshopId, request.JobCardId, request.CustomerId, request.InvoiceNumber, request.Subtotal, request.Tax);
        await billingRepository.AddInvoiceAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(invoice);
    }

    public async Task<InvoiceResponse?> GetInvoiceAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await billingRepository.GetInvoiceAsync(invoiceId, workshopId, cancellationToken);
        return invoice is null ? null : Map(invoice);
    }

    public async Task<InvoiceResponse?> FinalizeInvoiceAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await billingRepository.GetInvoiceAsync(invoiceId, workshopId, cancellationToken);
        if (invoice is null) return null;
        invoice.FinalizeInvoice();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(invoice);
    }

    public async Task<PaymentResponse?> AddPaymentAsync(Guid workshopId, Guid invoiceId, CreatePaymentRequest request, CancellationToken cancellationToken)
    {
        var invoice = await billingRepository.GetInvoiceAsync(invoiceId, workshopId, cancellationToken);
        if (invoice is null) return null;
        var paid = invoice.Payments.Sum(payment => payment.Amount);
        if (paid + request.Amount > invoice.Total) throw new InvalidOperationException("Payment exceeds invoice total.");
        var payment = new Payment(invoiceId, request.Amount, request.Method);
        await billingRepository.AddPaymentAsync(payment, cancellationToken);
        if (paid + request.Amount == invoice.Total) invoice.MarkPaid();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(payment);
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetPaymentsAsync(Guid workshopId, Guid invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await billingRepository.GetInvoiceAsync(invoiceId, workshopId, cancellationToken);
        if (invoice is null) throw new KeyNotFoundException("Invoice was not found.");
        return (await billingRepository.GetPaymentsAsync(invoiceId, cancellationToken)).Select(Map).ToArray();
    }

    private static InvoiceResponse Map(Invoice invoice) => new(invoice.Id, invoice.WorkshopId, invoice.JobCardId, invoice.CustomerId, invoice.InvoiceNumber, invoice.Subtotal, invoice.Tax, invoice.Total, invoice.Status);
    private static PaymentResponse Map(Payment payment) => new(payment.Id, payment.InvoiceId, payment.Amount, payment.Method, payment.PaidAt);
}
