using GarageOps.Domain.Entities;

namespace GarageOps.Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task AddAsync(User user, CancellationToken cancellationToken);
}
