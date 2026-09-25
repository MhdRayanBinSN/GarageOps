using System.Security.Claims;
using GarageOps.Application.Parts;
using GarageOps.Application.Authorization;
using GarageOps.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Policy = Permissions.PartsWorkflowView)]
[Route("api/job-cards/{jobCardId:guid}/part-requests")]
public sealed class JobCardPartRequestsController : ControllerBase
{
    private readonly IPartRequestService service;
    public JobCardPartRequestsController(IPartRequestService service) => this.service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PartRequestResponse>>> Get(Guid jobCardId, CancellationToken cancellationToken)
    {
        if (!TryGetContext(out var workshopId, out var userId, out var role)) return Forbid();
        try { return Ok(await service.GetByJobCardAsync(workshopId, jobCardId, userId, role, cancellationToken)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost]
    [Authorize(Policy = Permissions.PartsRequest)]
    public async Task<ActionResult<PartRequestResponse>> Create(Guid jobCardId, CreatePartRequestRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetContext(out var workshopId, out var userId, out var role)) return Forbid();
        try
        {
            var result = await service.CreateAsync(workshopId, jobCardId, userId, role, request, cancellationToken);
            return Created($"/api/job-cards/{jobCardId}/part-requests/{result.Id}", result);
        }
        catch (KeyNotFoundException exception) { return NotFound(exception.Message); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (ArgumentException exception) { return BadRequest(exception.Message); }
        catch (InvalidOperationException exception) { return BadRequest(exception.Message); }
    }

    private bool TryGetContext(out Guid workshopId, out Guid userId, out EmployeeRole role)
    {
        workshopId = Guid.Empty;
        userId = Guid.Empty;
        role = default;
        return Guid.TryParse(User.FindFirstValue("workshop_id"), out workshopId)
            && Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId)
            && Enum.TryParse(User.FindFirstValue("employee_role"), out role);
    }
}
