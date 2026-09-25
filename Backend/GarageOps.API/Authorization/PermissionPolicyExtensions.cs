using GarageOps.Application.Authorization;

namespace GarageOps.API.Authorization;

public static class PermissionPolicyExtensions
{
    public static IServiceCollection AddGarageOpsPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            foreach (var permission in Permissions.All)
            {
                options.AddPolicy(permission, policy => policy.RequireClaim("permission", permission));
            }
        });
        return services;
    }
}
