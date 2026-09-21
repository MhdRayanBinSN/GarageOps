using GarageOps.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Persistence;

public sealed class GarageOpsDbContext : DbContext
{
    public GarageOpsDbContext(DbContextOptions<GarageOpsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workshop> Workshops => Set<Workshop>();

    public DbSet<User> Users => Set<User>();

    public DbSet<WorkshopMembership> WorkshopMemberships => Set<WorkshopMembership>();
}
