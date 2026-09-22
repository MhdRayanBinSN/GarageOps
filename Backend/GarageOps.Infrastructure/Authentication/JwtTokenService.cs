using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GarageOps.Application.Authentication;
using GarageOps.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace GarageOps.Infrastructure.Authentication;

public sealed class JwtTokenService : ITokenService
{
    private readonly IConfiguration configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public AccessTokenResult CreateToken(User user)
    {
        var section = configuration.GetSection("Jwt");
        var key = section["Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");
        var issuer = section["Issuer"] ?? "GarageOps";
        var audience = section["Audience"] ?? "GarageOps.Client";
        var expirationMinutes = int.TryParse(
            section["ExpirationMinutes"],
            out var configuredExpirationMinutes)
            ? configuredExpirationMinutes
            : 60;
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new("user_type", user.UserType.ToString())
        };

        if (user.WorkshopId is not null)
        {
            claims.Add(new Claim("workshop_id", user.WorkshopId.Value.ToString()));
        }

        if (user.EmployeeRole is not null)
        {
            claims.Add(new Claim(ClaimTypes.Role, user.EmployeeRole.Value.ToString()));
        }

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AccessTokenResult(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt);
    }
}
