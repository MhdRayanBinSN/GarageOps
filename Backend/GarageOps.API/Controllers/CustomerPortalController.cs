using System.Security.Claims;
using GarageOps.Application.Authorization;
using GarageOps.Application.Customers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Route("api/customer-portal")]
[Authorize]
public sealed class CustomerPortalController : ControllerBase
{
    private readonly ICustomerPortalService portal;
    public CustomerPortalController(ICustomerPortalService portal) => this.portal = portal;

    [HttpGet("me")]
    [Authorize(Policy = Permissions.CustomerProfileOwn)]
    public async Task<ActionResult<CustomerPortalProfileResponse>> GetProfile(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Forbid();
        var profile = await portal.GetProfileAsync(userId, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("jobs")]
    [Authorize(Policy = Permissions.CustomerJobsOwn)]
    public async Task<ActionResult<IReadOnlyList<CustomerPortalJobResponse>>> GetJobs(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Forbid();
        return Ok(await portal.GetJobsAsync(userId, cancellationToken));
    }

    [HttpGet("invoices")]
    [Authorize(Policy = Permissions.CustomerInvoicesOwn)]
    public async Task<ActionResult<IReadOnlyList<CustomerPortalInvoiceResponse>>> GetInvoices(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Forbid();
        return Ok(await portal.GetInvoicesAsync(userId, cancellationToken));
    }

    [HttpGet("payments")]
    [Authorize(Policy = Permissions.CustomerPaymentsOwn)]
    public async Task<ActionResult<IReadOnlyList<CustomerPortalPaymentDetailResponse>>> GetPayments(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Forbid();
        return Ok(await portal.GetPaymentsAsync(userId, cancellationToken));
    }

    [HttpGet("vehicles")]
    [Authorize(Policy = Permissions.CustomerJobsOwn)]
    public async Task<ActionResult<IReadOnlyList<CustomerPortalVehicleResponse>>> GetVehicles(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Forbid();
        return Ok(await portal.GetVehiclesAsync(userId, cancellationToken));
    }

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
