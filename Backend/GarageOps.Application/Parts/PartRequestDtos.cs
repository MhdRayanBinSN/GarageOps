using GarageOps.Domain.Enums;

namespace GarageOps.Application.Parts;

public sealed record CreatePartRequestRequest(Guid JobTaskId, Guid PartId, int Quantity, string? Notes);
public sealed record ProcessPartRequestRequest(PartRequestStatus Status);
public sealed record PartRequestResponse(
    Guid Id, Guid WorkshopId, Guid JobCardId, Guid JobTaskId, Guid PartId,
    string PartName, string PartNumber, int Quantity, PartRequestStatus Status,
    Guid RequestedByUserId, string RequestedByName, Guid? ProcessedByUserId,
    string? ProcessedByName, string Notes, string JobTitle,
    string VehicleRegistrationNumber, string TaskTitle, DateTime CreatedAt,
    DateTime? ProcessedAt);
