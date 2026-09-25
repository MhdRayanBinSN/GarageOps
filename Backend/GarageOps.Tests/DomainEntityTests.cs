using GarageOps.Domain.Entities;
using GarageOps.Domain.Enums;

namespace GarageOps.Tests;

public class DomainEntityTests
{
    [Fact]
    public void WorkshopAdminHasNoEmployeeRole()
    {
        var workshopId = Guid.NewGuid();

        var admin = new User(
            workshopId,
            "admin",
            "admin@example.com",
            "hashed-password",
            UserType.WorkshopAdmin,
            null);

        Assert.Equal(UserType.WorkshopAdmin, admin.UserType);
        Assert.Null(admin.EmployeeRole);
    }

    [Fact]
    public void PlatformAdminDoesNotBelongToWorkshop()
    {
        Assert.Throws<ArgumentException>(() => new User(
            Guid.NewGuid(),
            "platform-admin",
            "admin@example.com",
            "hashed-password",
            UserType.PlatformAdmin,
            null));
    }

    [Fact]
    public void PartCannotReduceStockBelowZero()
    {
        var part = new Part(
            Guid.NewGuid(),
            "Brake pad",
            "BP-001",
            40,
            2);

        Assert.Throws<InvalidOperationException>(() => part.AdjustStock(-3));
    }

    [Fact]
    public void InvoiceIsMarkedPaidWhenPaymentReachesTotal()
    {
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "INV-001",
            100,
            10);

        invoice.FinalizeInvoice();
        invoice.MarkPaid();

        Assert.Equal(InvoiceStatus.Paid, invoice.Status);
    }

    [Fact]
    public void PaymentRejectsNonPositiveAmount()
    {
        Assert.Throws<ArgumentException>(() => new Payment(
            Guid.NewGuid(),
            0,
            PaymentMethod.Cash));
    }
}
