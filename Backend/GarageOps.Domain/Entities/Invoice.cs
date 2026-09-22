using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid WorkshopId { get; private set; }
    public Guid JobCardId { get; private set; }
    public Guid CustomerId { get; private set; }
    public string InvoiceNumber { get; private set; } = string.Empty;
    public decimal Subtotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal Total { get; private set; }
    public InvoiceStatus Status { get; private set; } = InvoiceStatus.Draft;
    public Workshop Workshop { get; private set; } = null!;
    public JobCard JobCard { get; private set; } = null!;
    public Customer Customer { get; private set; } = null!;
    public ICollection<Payment> Payments { get; private set; } = new List<Payment>();

    private Invoice() { }

    public Invoice(Guid workshopId, Guid jobCardId, Guid customerId, string invoiceNumber, decimal subtotal, decimal tax)
    {
        WorkshopId = workshopId;
        JobCardId = jobCardId;
        CustomerId = customerId;
        InvoiceNumber = invoiceNumber;
        Subtotal = subtotal;
        Tax = tax;
        Total = subtotal + tax;
    }

    public void FinalizeInvoice()
    {
        if (Status != InvoiceStatus.Draft) throw new InvalidOperationException("Only draft invoices can be finalized.");
        Status = InvoiceStatus.Finalized;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkPaid()
    {
        Status = InvoiceStatus.Paid;
        UpdatedAt = DateTime.UtcNow;
    }
}
