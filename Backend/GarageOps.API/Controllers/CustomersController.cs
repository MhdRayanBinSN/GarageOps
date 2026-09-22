using System.Security.Claims;
using GarageOps.Application.Customers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Roles = "Owner,Manager,ServiceAdvisor")]
[Route("api/workshops/{workshopId:guid}/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly ICustomerService customerService;

    public CustomersController(ICustomerService customerService)
    {
        this.customerService = customerService;
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create(
        Guid workshopId,
        CreateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var customer = await customerService.CreateAsync(
            workshopId,
            request,
            cancellationToken);

        return Created($"/api/customers/{customer.Id}", customer);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerResponse>>> GetAll(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        return Ok(await customerService.GetByWorkshopAsync(
            workshopId,
            cancellationToken));
    }

    [HttpGet("{customerId:guid}")]
    public async Task<ActionResult<CustomerResponse>> GetById(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var customer = await customerService.GetByIdAsync(
            workshopId,
            customerId,
            cancellationToken);

        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPut("{customerId:guid}")]
    public async Task<ActionResult<CustomerResponse>> Update(
        Guid workshopId,
        Guid customerId,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var customer = await customerService.UpdateAsync(
            workshopId,
            customerId,
            request,
            cancellationToken);

        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpDelete("{customerId:guid}")]
    public async Task<ActionResult> Deactivate(
        Guid workshopId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var deactivated = await customerService.DeactivateAsync(
            workshopId,
            customerId,
            cancellationToken);

        return deactivated ? NoContent() : NotFound();
    }

    private bool OwnsWorkshop(Guid workshopId)
    {
        var claim = User.FindFirstValue("workshop_id");
        return Guid.TryParse(claim, out var tokenWorkshopId)
            && tokenWorkshopId == workshopId;
    }
}
