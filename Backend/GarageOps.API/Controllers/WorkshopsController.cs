using GarageOps.Application.Workshops.DTOs;
using GarageOps.Application.Workshops.Services;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Route("api/workshops")]
public sealed class WorkshopsController : ControllerBase
{
    private readonly IWorkshopRegistrationService registrationService;

    public WorkshopsController(IWorkshopRegistrationService registrationService)
    {
        this.registrationService = registrationService;
    }

    [HttpPost("registration")]
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
}
