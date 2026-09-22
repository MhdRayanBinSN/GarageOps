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

    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<JobCard> JobCards => Set<JobCard>();

    public DbSet<JobTask> JobTasks => Set<JobTask>();

    public DbSet<Service> Services => Set<Service>();

    public DbSet<Part> Parts => Set<Part>();

    public DbSet<Invoice> Invoices => Set<Invoice>();

    public DbSet<Payment> Payments => Set<Payment>();
}
