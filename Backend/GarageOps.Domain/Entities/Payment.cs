using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentMethod Method { get; private set; }
    public DateTime PaidAt { get; private set; }
    public Invoice Invoice { get; private set; } = null!;

    private Payment() { }

    public Payment(Guid invoiceId, decimal amount, PaymentMethod method)
    {
        if (amount <= 0) throw new ArgumentException("Payment amount must be positive.", nameof(amount));
        InvoiceId = invoiceId;
        Amount = amount;
        Method = method;
        PaidAt = DateTime.UtcNow;
    }
}
