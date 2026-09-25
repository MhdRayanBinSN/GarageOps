using GarageOps.Domain.Common;

namespace GarageOps.Domain.Entities;

public class Workshop : BaseEntity
{
    public string Name { get; private set; } = string.Empty;

    public string Phone { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string Address { get; private set; } = string.Empty;

    public bool IsActive { get; private set; } = true;

    private Workshop()
    {
    }

    public Workshop(
        string name,
        string phone,
        string email,
        string address)
    {
        Name = name;
        Phone = phone;
        Email = email;
        Address = address;
    }

    public void UpdateDetails(string name, string phone, string email, string address)
    {
        Name = name;
        Phone = phone;
        Email = email;
        Address = address;
        UpdatedAt = DateTime.UtcNow;
    }
}
