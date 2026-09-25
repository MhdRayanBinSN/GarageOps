using System.Security.Claims;
using GarageOps.Application.Catalog;
using GarageOps.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Policy = Permissions.InventoryView)]
[Route("api/workshops/{workshopId:guid}/inventory-availability")]
public sealed class InventoryAvailabilityController : ControllerBase
{
    private readonly ICatalogService catalog;
    public InventoryAvailabilityController(ICatalogService catalog) => this.catalog = catalog;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InventoryAvailabilityResponse>>> Get(Guid workshopId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue("workshop_id"), out var tokenWorkshopId)
            || tokenWorkshopId != workshopId) return Forbid();
        var parts = await catalog.GetPartsAsync(workshopId, cancellationToken);
        return Ok(parts.Select(part => new InventoryAvailabilityResponse(part.Id, part.Name, part.PartNumber, part.StockQuantity, part.IsActive)).ToArray());
    }
}
