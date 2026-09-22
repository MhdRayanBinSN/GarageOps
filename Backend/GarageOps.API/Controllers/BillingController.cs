using System.Security.Claims;
using GarageOps.Application.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Roles = "Owner,Manager,ServiceAdvisor")]
[Route("api")]
public sealed class BillingController : ControllerBase
{
    private readonly IBillingService billingService;

    public BillingController(IBillingService billingService) => this.billingService = billingService;

    [HttpPost("job-cards/{jobCardId:guid}/invoice")]
    public async Task<ActionResult<InvoiceResponse>> CreateInvoice(Guid jobCardId, CreateInvoiceRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)) return Forbid();
        if (request.JobCardId != jobCardId) return BadRequest("Job card IDs do not match.");
        var invoice = await billingService.CreateInvoiceAsync(workshopId, request, cancellationToken);
        return Created($"/api/invoices/{invoice.Id}", invoice);
    }

    [HttpGet("invoices/{invoiceId:guid}")]
    public async Task<ActionResult<InvoiceResponse>> GetInvoice(Guid invoiceId, CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)) return Forbid();
        var invoice = await billingService.GetInvoiceAsync(workshopId, invoiceId, cancellationToken);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    [HttpPost("invoices/{invoiceId:guid}/finalize")]
    public async Task<ActionResult<InvoiceResponse>> FinalizeInvoice(Guid invoiceId, CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)) return Forbid();
        try
        {
            var invoice = await billingService.FinalizeInvoiceAsync(workshopId, invoiceId, cancellationToken);
            return invoice is null ? NotFound() : Ok(invoice);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPost("invoices/{invoiceId:guid}/payments")]
    public async Task<ActionResult<PaymentResponse>> AddPayment(Guid invoiceId, CreatePaymentRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)) return Forbid();
        try
        {
            var payment = await billingService.AddPaymentAsync(workshopId, invoiceId, request, cancellationToken);
            return payment is null ? NotFound() : Ok(payment);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpGet("invoices/{invoiceId:guid}/payments")]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>> GetPayments(Guid invoiceId, CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)) return Forbid();
        try
        {
            return Ok(await billingService.GetPaymentsAsync(workshopId, invoiceId, cancellationToken));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private bool TryGetWorkshopId(out Guid workshopId) => Guid.TryParse(User.FindFirstValue("workshop_id"), out workshopId);
}
