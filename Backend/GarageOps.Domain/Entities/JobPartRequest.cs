using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class JobPartRequest : BaseEntity
{
    public Guid WorkshopId { get; private set; }
    public Guid JobCardId { get; private set; }
    public Guid JobTaskId { get; private set; }
    public Guid PartId { get; private set; }
    public Guid RequestedByUserId { get; private set; }
    public Guid? ProcessedByUserId { get; private set; }
    public int Quantity { get; private set; }
    public PartRequestStatus Status { get; private set; } = PartRequestStatus.Pending;
    public string Notes { get; private set; } = string.Empty;
    public DateTime? ProcessedAt { get; private set; }

    public Workshop Workshop { get; private set; } = null!;
    public JobCard JobCard { get; private set; } = null!;
    public JobTask JobTask { get; private set; } = null!;
    public Part Part { get; private set; } = null!;
    public User RequestedByUser { get; private set; } = null!;
    public User? ProcessedByUser { get; private set; }

    private JobPartRequest() { }

    public JobPartRequest(Guid workshopId, Guid jobCardId, Guid jobTaskId, Guid partId,
        Guid requestedByUserId, int quantity, string? notes)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        WorkshopId = workshopId;
        JobCardId = jobCardId;
        JobTaskId = jobTaskId;
        PartId = partId;
        RequestedByUserId = requestedByUserId;
        Quantity = quantity;
        Notes = notes?.Trim() ?? string.Empty;
    }

    public void Process(PartRequestStatus status, Guid processedByUserId)
    {
        var allowed = Status switch
        {
            PartRequestStatus.Pending => status is PartRequestStatus.Approved or PartRequestStatus.Rejected,
            PartRequestStatus.Approved => status is PartRequestStatus.Issued or PartRequestStatus.Rejected,
            _ => false
        };
        if (!allowed) throw new InvalidOperationException("This part request can no longer be changed to the selected status.");
        Status = status;
        ProcessedByUserId = processedByUserId;
        ProcessedAt = DateTime.UtcNow;
        UpdatedAt = ProcessedAt;
    }
}
