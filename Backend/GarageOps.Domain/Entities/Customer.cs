using GarageOps.Domain.Common;

namespace GarageOps.Domain.Entities;

public class Customer : BaseEntity
{
    public Guid WorkshopId { get; private set; }

    public string FirstName { get; private set; } = string.Empty;

    public string LastName { get; private set; } = string.Empty;

    public string Phone { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string Address { get; private set; } = string.Empty;

    public Guid? PortalUserId { get; private set; }

    public bool IsActive { get; private set; } = true;

    public Workshop Workshop { get; private set; } = null!;

    public User? PortalUser { get; private set; }

    private Customer()
    {
    }

    public Customer(
        Guid workshopId,
        string firstName,
        string lastName,
        string phone,
        string email,
        string address)
    {
        WorkshopId = workshopId;
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        Email = email;
        Address = address;
    }

    public void UpdateDetails(
        string firstName,
        string lastName,
        string phone,
        string email,
        string address)
    {
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        Email = email;
        Address = address;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        PortalUser?.Deactivate();
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkPortalUser(Guid userId)
    {
        if (PortalUserId is not null)
            throw new InvalidOperationException("This customer already has a portal account.");
        PortalUserId = userId;
        UpdatedAt = DateTime.UtcNow;
    }
}
