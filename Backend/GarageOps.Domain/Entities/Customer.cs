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

    public bool IsActive { get; private set; } = true;

    public Workshop Workshop { get; private set; } = null!;

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
}
