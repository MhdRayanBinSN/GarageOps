using GarageOps.Application.Abstractions.Persistence;

namespace GarageOps.Application.Authentication;

public sealed class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository userRepository;
    private readonly IPasswordHasher passwordHasher;
    private readonly ITokenService tokenService;

    public AuthenticationService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }

    public async Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByUsernameAsync(
            request.Username,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        var token = tokenService.CreateToken(user);

        return new LoginResponse(
            user.Id,
            user.WorkshopId,
            user.UserType,
            user.EmployeeRole,
            token.AccessToken,
            token.ExpiresAt);
    }
}
