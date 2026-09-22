using GarageOps.Domain.Enums;

namespace GarageOps.Application.Authentication;

public sealed record LoginRequest(
    string Username,
    string Password);

public sealed record LoginResponse(
    Guid UserId,
    Guid? WorkshopId,
    UserType UserType,
    EmployeeRole? EmployeeRole,
    string AccessToken,
    DateTime ExpiresAt);
