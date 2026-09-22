using GarageOps.Domain.Entities;

namespace GarageOps.Application.Authentication;

public interface ITokenService
{
    AccessTokenResult CreateToken(User user);
}

public sealed record AccessTokenResult(
    string AccessToken,
    DateTime ExpiresAt);
