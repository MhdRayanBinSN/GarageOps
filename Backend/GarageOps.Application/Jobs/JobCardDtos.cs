using GarageOps.Domain.Enums;

namespace GarageOps.Application.Jobs;

public sealed record CreateJobCardRequest(
    Guid CustomerId,
    string Title,
    string Description,
    string VehicleRegistrationNumber,
    string VehicleMake,
    string VehicleModel,
    int VehicleYear);

public sealed record UpdateJobStatusRequest(JobStatus Status);

public sealed record UpdateJobCardDetailsRequest(
    string Title, string Description, string VehicleRegistrationNumber,
    string VehicleMake, string VehicleModel, int VehicleYear);

public sealed record JobCardResponse(
    Guid Id,
    Guid WorkshopId,
    Guid CustomerId,
    Guid CreatedByUserId,
    string Title,
    string Description,
    string VehicleRegistrationNumber,
    string VehicleMake,
    string VehicleModel,
    int VehicleYear,
    JobStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
