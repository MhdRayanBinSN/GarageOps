namespace GarageOps.Application.Workshops.DTOs;

public sealed record WorkshopRegistrationRequest(
    string WorkshopName,
    string WorkshopPhone,
    string WorkshopEmail,
    string WorkshopAddress,
    string AdminUsername,
    string AdminEmail,
    string AdminPassword);

public sealed record WorkshopRegistrationResponse(
    Guid WorkshopId,
    Guid AdminUserId);

public sealed record UpdateWorkshopRequest(string Name, string Phone, string Email, string Address);

public sealed record WorkshopDetailsResponse(Guid Id, string Name, string Phone, string Email, string Address);
