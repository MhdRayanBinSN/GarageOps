namespace GarageOps.Application.Workshops.DTOs;

public sealed record WorkshopRegistrationRequest(
    string WorkshopName,
    string WorkshopPhone,
    string WorkshopEmail,
    string WorkshopAddress,
    string OwnerUsername,
    string OwnerEmail,
    string OwnerPassword);

public sealed record WorkshopRegistrationResponse(
    Guid WorkshopId,
    Guid OwnerUserId);
