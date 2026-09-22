using GarageOps.Application.Abstractions.Persistence;

namespace GarageOps.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly GarageOpsDbContext dbContext;

    public UnitOfWork(GarageOpsDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
