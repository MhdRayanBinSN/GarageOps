using System.Security.Claims;
using GarageOps.Application.Jobs;
using GarageOps.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Policy = Permissions.JobsManage)]
[Route("api/workshops/{workshopId:guid}/job-cards")]
public sealed class JobCardsController : ControllerBase
{
    private readonly IJobCardService jobCardService;

    public JobCardsController(IJobCardService jobCardService)
    {
        this.jobCardService = jobCardService;
    }

    [HttpPost]
    public async Task<ActionResult<JobCardResponse>> Create(
        Guid workshopId,
        CreateJobCardRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)
            || !Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Forbid();
        }

        var jobCard = await jobCardService.CreateAsync(
            workshopId,
            userId,
            request,
            cancellationToken);

        return Created($"/api/job-cards/{jobCard.Id}", jobCard);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<JobCardResponse>>> GetAll(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        return Ok(await jobCardService.GetByWorkshopAsync(
            workshopId,
            cancellationToken));
    }

    [HttpGet("{jobCardId:guid}")]
    public async Task<ActionResult<JobCardResponse>> GetById(
        Guid workshopId,
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var jobCard = await jobCardService.GetByIdAsync(
            workshopId,
            jobCardId,
            cancellationToken);

        return jobCard is null ? NotFound() : Ok(jobCard);
    }

    [HttpPatch("{jobCardId:guid}/status")]
    public async Task<ActionResult<JobCardResponse>> UpdateStatus(
        Guid workshopId,
        Guid jobCardId,
        UpdateJobStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var jobCard = await jobCardService.UpdateStatusAsync(
            workshopId,
            jobCardId,
            request,
            cancellationToken);

        return jobCard is null ? NotFound() : Ok(jobCard);
    }

    [HttpPut("{jobCardId:guid}/details")]
    public async Task<ActionResult<JobCardResponse>> UpdateDetails(
        Guid workshopId, Guid jobCardId, UpdateJobCardDetailsRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId)) return Forbid();
        var jobCard = await jobCardService.UpdateDetailsAsync(workshopId, jobCardId, request, cancellationToken);
        return jobCard is null ? NotFound() : Ok(jobCard);
    }

    private bool OwnsWorkshop(Guid workshopId)
    {
        var claim = User.FindFirstValue("workshop_id");
        return Guid.TryParse(claim, out var tokenWorkshopId)
            && tokenWorkshopId == workshopId;
    }
}
