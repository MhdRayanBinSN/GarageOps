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
    private readonly IWorkshopMembershipRepository membershipRepository;
    private readonly IUnitOfWork unitOfWork;
    private readonly IPasswordHasher passwordHasher;

    public WorkshopRegistrationService(
        IWorkshopRepository workshopRepository,
        IUserRepository userRepository,
        IWorkshopMembershipRepository membershipRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher)
    {
        this.workshopRepository = workshopRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
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

        var owner = new User(
            workshop.Id,
            request.OwnerUsername,
            request.OwnerEmail,
            passwordHasher.Hash(request.OwnerPassword),
            UserType.WorkshopOwner,
            EmployeeRole.Owner);

        var membership = new WorkshopMembership(
            workshop.Id,
            owner.Id,
            EmployeeRole.Owner);

        await workshopRepository.AddAsync(workshop, cancellationToken);
        await userRepository.AddAsync(owner, cancellationToken);
        await membershipRepository.AddAsync(membership, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new WorkshopRegistrationResponse(workshop.Id, owner.Id);
    }
}
