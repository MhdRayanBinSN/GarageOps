using System.Security.Claims;
using GarageOps.Application.Parts;
using GarageOps.Application.Authorization;
using GarageOps.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Policy = Permissions.PartsProcess)]
[Route("api/workshops/{workshopId:guid}/part-requests")]
public sealed class WorkshopPartRequestsController : ControllerBase
{
    private readonly IPartRequestService service;
    public WorkshopPartRequestsController(IPartRequestService service) => this.service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PartRequestResponse>>> Get(Guid workshopId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        return Ok(await service.GetByWorkshopAsync(workshopId, cancellationToken));
    }

    [HttpPatch("{requestId:guid}/status")]
    public async Task<ActionResult<PartRequestResponse>> Process(Guid workshopId, Guid requestId, ProcessPartRequestRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)
            || !Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Forbid();
        if (request.Status == PartRequestStatus.Pending) return BadRequest("A request cannot be moved back to Pending.");
        try
        {
            var result = await service.ProcessAsync(workshopId, requestId, userId, request, cancellationToken);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException exception) { return BadRequest(exception.Message); }
    }

    private bool OwnsWorkshop(Guid workshopId) =>
        Guid.TryParse(User.FindFirstValue("workshop_id"), out var tokenWorkshopId)
        && tokenWorkshopId == workshopId;
}
