using GarageOps.Domain.Common;

namespace GarageOps.Domain.Entities;

public class Service : BaseEntity
{
    public Guid WorkshopId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public decimal DefaultPrice { get; private set; }

    public bool IsActive { get; private set; } = true;

    public Workshop Workshop { get; private set; } = null!;

    private Service()
    {
    }

    public Service(
        Guid workshopId,
        string name,
        string description,
        decimal defaultPrice)
    {
        WorkshopId = workshopId;
        Name = name;
        Description = description;
        DefaultPrice = defaultPrice;
    }
}
