using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Application.Customers;
using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GarageOps.Infrastructure.Repositories;

public sealed class CustomerPortalReadRepository : ICustomerPortalReadRepository
{
    private readonly GarageOpsDbContext db;
    public CustomerPortalReadRepository(GarageOpsDbContext db) => this.db = db;

    public Task<CustomerPortalProfileResponse?> GetProfileAsync(Guid userId, CancellationToken cancellationToken) =>
        db.Customers.AsNoTracking()
            .Where(customer => customer.PortalUserId == userId && customer.IsActive)
            .Select(customer => new CustomerPortalProfileResponse(
                customer.Id, customer.FirstName, customer.LastName, customer.Phone,
                customer.Email, customer.Address, customer.Workshop.Name))
            .SingleOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<CustomerPortalJobResponse>> GetJobsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var jobs = await db.JobCards.AsNoTracking()
            .Where(job => job.Customer.PortalUserId == userId && job.Customer.IsActive)
            .OrderByDescending(job => job.CreatedAt)
            .ToListAsync(cancellationToken);
        var ids = jobs.Select(job => job.Id).ToArray();
        var tasks = await db.JobTasks.AsNoTracking()
            .Where(task => ids.Contains(task.JobCardId))
            .OrderBy(task => task.CreatedAt)
            .ToListAsync(cancellationToken);
        var issuedParts = await db.JobPartRequests.AsNoTracking()
            .Where(request => ids.Contains(request.JobCardId)
                && request.Status == GarageOps.Domain.Enums.PartRequestStatus.Issued)
            .ToListAsync(cancellationToken);

        return jobs.Select(job => new CustomerPortalJobResponse(
            job.Id, job.Title, job.Description, job.Status, job.CreatedAt,
            job.VehicleRegistrationNumber, job.VehicleMake, job.VehicleModel, job.VehicleYear,
            tasks.Where(task => task.JobCardId == job.Id)
                .Select(task => new CustomerPortalTaskResponse(
                    task.Id, task.Title, task.Status, task.EstimatedHours, task.ActualHours, task.WorkPerformed))
                .ToArray(),
            issuedParts.Where(request => request.JobCardId == job.Id)
                .Select(request => new CustomerPortalPartResponse(request.Part.Name, request.Quantity))
                .ToArray()))
            .ToArray();
    }

    public async Task<IReadOnlyList<CustomerPortalInvoiceResponse>> GetInvoicesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var invoices = await db.Invoices.AsNoTracking()
            .Include(invoice => invoice.Payments)
            .Where(invoice => invoice.Customer.PortalUserId == userId && invoice.Customer.IsActive)
            .OrderByDescending(invoice => invoice.CreatedAt)
            .ToListAsync(cancellationToken);

        return invoices.Select(invoice => new CustomerPortalInvoiceResponse(
            invoice.Id, invoice.JobCardId, invoice.InvoiceNumber, invoice.Subtotal,
            invoice.Tax, invoice.Total, invoice.Status, invoice.CreatedAt,
            invoice.Payments.OrderByDescending(payment => payment.PaidAt)
                .Select(payment => new CustomerPortalPaymentResponse(payment.Amount, payment.Method, payment.PaidAt))
                .ToArray()))
            .ToArray();
    }

    public async Task<IReadOnlyList<CustomerPortalPaymentDetailResponse>> GetPaymentsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await db.Payments.AsNoTracking()
            .Where(payment => payment.Invoice.Customer.PortalUserId == userId && payment.Invoice.Customer.IsActive)
            .OrderByDescending(payment => payment.PaidAt)
            .Select(payment => new CustomerPortalPaymentDetailResponse(
                payment.Id, payment.InvoiceId, payment.Invoice.InvoiceNumber,
                payment.Amount, payment.Method, payment.PaidAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CustomerPortalVehicleResponse>> GetVehiclesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var jobs = await db.JobCards.AsNoTracking()
            .Where(job => job.Customer.PortalUserId == userId && job.Customer.IsActive)
            .OrderByDescending(job => job.CreatedAt)
            .Select(job => new CustomerPortalVehicleResponse(
                job.VehicleRegistrationNumber, job.VehicleMake, job.VehicleModel,
                job.VehicleYear, job.CreatedAt))
            .ToListAsync(cancellationToken);
        return jobs.GroupBy(vehicle => vehicle.RegistrationNumber, StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .ToArray();
    }
}
