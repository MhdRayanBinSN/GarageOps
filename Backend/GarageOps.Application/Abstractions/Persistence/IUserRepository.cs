using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task AddAsync(User user, CancellationToken cancellationToken);

    Task<User?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken);

    Task<List<User>> GetEmployeesByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken);

    Task<User?> GetEmployeeByIdAsync(
        Guid employeeId,
        Guid workshopId,
        CancellationToken cancellationToken);
}
