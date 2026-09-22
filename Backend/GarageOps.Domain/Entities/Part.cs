using GarageOps.Domain.Common;

namespace GarageOps.Domain.Entities;

public class Part : BaseEntity
{
    public Guid WorkshopId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string PartNumber { get; private set; } = string.Empty;

    public decimal UnitPrice { get; private set; }

    public int StockQuantity { get; private set; }

    public bool IsActive { get; private set; } = true;

    public Workshop Workshop { get; private set; } = null!;

    private Part()
    {
    }

    public Part(
        Guid workshopId,
        string name,
        string partNumber,
        decimal unitPrice,
        int stockQuantity)
    {
        WorkshopId = workshopId;
        Name = name;
        PartNumber = partNumber;
        UnitPrice = unitPrice;
        StockQuantity = stockQuantity;
    }

    public void UpdateDetails(string name, decimal unitPrice)
    {
        Name = name;
        UnitPrice = unitPrice;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AdjustStock(int quantityChange)
    {
        if (StockQuantity + quantityChange < 0)
        {
            throw new InvalidOperationException("Stock quantity cannot be negative.");
        }

        StockQuantity += quantityChange;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
