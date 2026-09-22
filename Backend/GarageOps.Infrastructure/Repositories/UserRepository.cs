using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Domain.Entities;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly GarageOpsDbContext dbContext;

    public UserRepository(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task AddAsync(User user, CancellationToken cancellationToken)
    {
        return dbContext.Users.AddAsync(user, cancellationToken).AsTask();
    }

    public Task<User?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken)
    {
        return dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                user => user.Username == username,
                cancellationToken);
    }

    public Task<List<User>> GetEmployeesByWorkshopAsync(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.Users
            .AsNoTracking()
            .Where(user => user.WorkshopId == workshopId
                && user.UserType == Domain.Enums.UserType.WorkshopEmployee)
            .OrderBy(user => user.Username)
            .ToListAsync(cancellationToken);
    }

    public Task<User?> GetEmployeeByIdAsync(
        Guid employeeId,
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        return dbContext.Users
            .SingleOrDefaultAsync(user => user.Id == employeeId
                && user.WorkshopId == workshopId
                && user.UserType == Domain.Enums.UserType.WorkshopEmployee,
                cancellationToken);
    }
}
