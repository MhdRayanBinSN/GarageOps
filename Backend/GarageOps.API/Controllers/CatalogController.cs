using System.Security.Claims;
using GarageOps.Application.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Roles = "Owner,Manager,ServiceAdvisor")]
[Route("api/workshops/{workshopId:guid}")]
public sealed class CatalogController : ControllerBase
{
    private readonly ICatalogService catalogService;

    public CatalogController(ICatalogService catalogService)
    {
        this.catalogService = catalogService;
    }

    [HttpPost("services")]
    public async Task<ActionResult<ServiceResponse>> CreateService(Guid workshopId, CreateServiceRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var service = await catalogService.CreateServiceAsync(workshopId, request, cancellationToken);
        return Created($"/api/services/{service.Id}", service);
    }

    [HttpGet("services")]
    public async Task<ActionResult<IReadOnlyList<ServiceResponse>>> GetServices(Guid workshopId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        return Ok(await catalogService.GetServicesAsync(workshopId, cancellationToken));
    }

    [HttpPut("services/{serviceId:guid}")]
    public async Task<ActionResult<ServiceResponse>> UpdateService(Guid workshopId, Guid serviceId, UpdateServiceRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var service = await catalogService.UpdateServiceAsync(workshopId, serviceId, request, cancellationToken);
        return service is null ? NotFound() : Ok(service);
    }

    [HttpDelete("services/{serviceId:guid}")]
    public async Task<ActionResult> DeactivateService(Guid workshopId, Guid serviceId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var changed = await catalogService.DeactivateServiceAsync(workshopId, serviceId, cancellationToken);
        return changed ? NoContent() : NotFound();
    }

    [HttpPost("parts")]
    public async Task<ActionResult<PartResponse>> CreatePart(Guid workshopId, CreatePartRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var part = await catalogService.CreatePartAsync(workshopId, request, cancellationToken);
        return Created($"/api/parts/{part.Id}", part);
    }

    [HttpGet("parts")]
    public async Task<ActionResult<IReadOnlyList<PartResponse>>> GetParts(Guid workshopId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        return Ok(await catalogService.GetPartsAsync(workshopId, cancellationToken));
    }

    [HttpPut("parts/{partId:guid}")]
    public async Task<ActionResult<PartResponse>> UpdatePart(Guid workshopId, Guid partId, UpdatePartRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var part = await catalogService.UpdatePartAsync(workshopId, partId, request, cancellationToken);
        return part is null ? NotFound() : Ok(part);
    }

    [HttpPatch("parts/{partId:guid}/stock")]
    public async Task<ActionResult<PartResponse>> AdjustStock(Guid workshopId, Guid partId, AdjustStockRequest request, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        try
        {
            var part = await catalogService.AdjustStockAsync(workshopId, partId, request, cancellationToken);
            return part is null ? NotFound() : Ok(part);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("parts/{partId:guid}")]
    public async Task<ActionResult> DeactivatePart(Guid workshopId, Guid partId, CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var changed = await catalogService.DeactivatePartAsync(workshopId, partId, cancellationToken);
        return changed ? NoContent() : NotFound();
    }

    private bool OwnsWorkshop(Guid workshopId)
    {
        return Guid.TryParse(User.FindFirstValue("workshop_id"), out var tokenWorkshopId)
            && tokenWorkshopId == workshopId;
    }
}
