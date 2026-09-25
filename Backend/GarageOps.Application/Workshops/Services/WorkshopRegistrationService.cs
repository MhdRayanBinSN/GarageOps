using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Application.Authentication;
using GarageOps.Application.Workshops.DTOs;
using GarageOps.Domain.Entities;
using GarageOps.Domain.Enums;

namespace GarageOps.Application.Workshops.Services;

public sealed class WorkshopRegistrationService : IWorkshopRegistrationService
{
    private readonly IWorkshopRepository workshopRepository;
    private readonly IUserRepository userRepository;
    private readonly IUnitOfWork unitOfWork;
    private readonly IPasswordHasher passwordHasher;

    public WorkshopRegistrationService(
        IWorkshopRepository workshopRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher)
    {
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.unitOfWork = unitOfWork;
        this.passwordHasher = passwordHasher;
    }

    public async Task<WorkshopRegistrationResponse> RegisterAsync(
        WorkshopRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var workshop = new Workshop(
            request.WorkshopName,
            request.WorkshopPhone,
            request.WorkshopEmail,
            request.WorkshopAddress);

        var admin = new User(
            workshop.Id,
            request.AdminUsername,
            request.AdminEmail,
            passwordHasher.Hash(request.AdminPassword),
            UserType.WorkshopAdmin,
            null);

        await workshopRepository.AddAsync(workshop, cancellationToken);
        await userRepository.AddAsync(admin, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new WorkshopRegistrationResponse(workshop.Id, admin.Id);
    }
}
