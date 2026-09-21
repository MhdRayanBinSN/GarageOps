namespace GarageOps.Application.Authentication;

public interface IPasswordHasher
{
    string Hash(string password);
}
