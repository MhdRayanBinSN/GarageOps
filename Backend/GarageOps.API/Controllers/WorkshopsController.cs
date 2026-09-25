using GarageOps.Application.Workshops.DTOs;
using GarageOps.Application.Authorization;
using GarageOps.Application.Workshops.Services;
using GarageOps.Application.Abstractions.Persistence;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Route("api/workshops")]
public sealed class WorkshopsController : ControllerBase
{
    private readonly IWorkshopRegistrationService registrationService;
    private readonly IWorkshopRepository workshopRepository;
    private readonly IUnitOfWork unitOfWork;

    public WorkshopsController(IWorkshopRegistrationService registrationService, IWorkshopRepository workshopRepository, IUnitOfWork unitOfWork)
    {
        this.registrationService = registrationService;
        this.workshopRepository = workshopRepository;
        this.unitOfWork = unitOfWork;
    }

    [HttpPost("registration")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(WorkshopRegistrationResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<WorkshopRegistrationResponse>> Register(
        WorkshopRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await registrationService.RegisterAsync(
            request,
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpGet("{workshopId:guid}")]
    [Authorize(Policy = Permissions.WorkshopManage)]
    public async Task<ActionResult<WorkshopDetailsResponse>> Get(Guid workshopId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var workshop = await workshopRepository.GetByIdAsync(workshopId, cancellationToken);
        return workshop is null ? NotFound() : Ok(new WorkshopDetailsResponse(workshop.Id, workshop.Name, workshop.Phone, workshop.Email, workshop.Address));
    }

    [HttpPut("{workshopId:guid}")]
    [Authorize(Policy = Permissions.WorkshopManage)]
    public async Task<ActionResult<WorkshopDetailsResponse>> Update(Guid workshopId, UpdateWorkshopRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var workshop = await workshopRepository.GetByIdAsync(workshopId, cancellationToken);
        if (workshop is null) return NotFound();
        workshop.UpdateDetails(request.Name, request.Phone, request.Email, request.Address);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Ok(new WorkshopDetailsResponse(workshop.Id, workshop.Name, workshop.Phone, workshop.Email, workshop.Address));
    }

    private bool OwnsWorkshop(Guid workshopId) =>
        Guid.TryParse(User.FindFirstValue("workshop_id"), out var tokenWorkshopId)
        && tokenWorkshopId == workshopId;
}
