using GarageOps.Domain.Common;
using GarageOps.Domain.Enums;

namespace GarageOps.Domain.Entities;

public class JobCard : BaseEntity
{
    public Guid WorkshopId { get; private set; }

    public Guid CustomerId { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public JobStatus Status { get; private set; } = JobStatus.Draft;

    public Workshop Workshop { get; private set; } = null!;

    public Customer Customer { get; private set; } = null!;

    public string VehicleRegistrationNumber { get; private set; } = string.Empty;

    public string VehicleMake { get; private set; } = string.Empty;

    public string VehicleModel { get; private set; } = string.Empty;

    public int VehicleYear { get; private set; }

    public User CreatedByUser { get; private set; } = null!;

    private JobCard()
    {
    }

    public JobCard(
        Guid workshopId,
        Guid customerId,
        Guid createdByUserId,
        string title,
        string description,
        string vehicleRegistrationNumber,
        string vehicleMake,
        string vehicleModel,
        int vehicleYear)
    {
        WorkshopId = workshopId;
        CustomerId = customerId;
        CreatedByUserId = createdByUserId;
        Title = title;
        Description = description;
        VehicleRegistrationNumber = vehicleRegistrationNumber;
        VehicleMake = vehicleMake;
        VehicleModel = vehicleModel;
        VehicleYear = vehicleYear;
    }
}
