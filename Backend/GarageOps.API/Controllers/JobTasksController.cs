using System.Security.Claims;
using GarageOps.Application.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Roles = "Owner,Manager,ServiceAdvisor,Mechanic,Technician")]
[Route("api/job-cards/{jobCardId:guid}/tasks")]
public sealed class JobTasksController : ControllerBase
{
    private readonly IJobTaskService taskService;

    public JobTasksController(IJobTaskService taskService)
    {
        this.taskService = taskService;
    }

    [HttpPost]
    public async Task<ActionResult<JobTaskResponse>> Create(
        Guid jobCardId,
        CreateJobTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId))
        {
            return Forbid();
        }

        try
        {
            var task = await taskService.CreateAsync(
                workshopId,
                jobCardId,
                request,
                cancellationToken);

            return Created($"/api/tasks/{task.Id}", task);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<JobTaskResponse>>> GetAll(
        Guid jobCardId,
        CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId))
        {
            return Forbid();
        }

        try
        {
            return Ok(await taskService.GetByJobCardAsync(
                workshopId,
                jobCardId,
                cancellationToken));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{taskId:guid}/assign")]
    public async Task<ActionResult<JobTaskResponse>> Assign(
        Guid jobCardId,
        Guid taskId,
        AssignJobTaskRequest request,
        CancellationToken cancellationToken)
    {
        return await Update(
            jobCardId,
            taskId,
            () => taskService.AssignAsync(
                GetWorkshopId(),
                jobCardId,
                taskId,
                request,
                cancellationToken));
    }

    [HttpPatch("{taskId:guid}/status")]
    public async Task<ActionResult<JobTaskResponse>> UpdateStatus(
        Guid jobCardId,
        Guid taskId,
        UpdateJobTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        return await Update(
            jobCardId,
            taskId,
            () => taskService.UpdateStatusAsync(
                GetWorkshopId(),
                jobCardId,
                taskId,
                request,
                cancellationToken));
    }

    private async Task<ActionResult<JobTaskResponse>> Update(
        Guid jobCardId,
        Guid taskId,
        Func<Task<JobTaskResponse?>> operation)
    {
        if (!TryGetWorkshopId(out _))
        {
            return Forbid();
        }

        var task = await operation();
        return task is null ? NotFound() : Ok(task);
    }

    private Guid GetWorkshopId()
    {
        return Guid.Parse(User.FindFirstValue("workshop_id")!);
    }

    private bool TryGetWorkshopId(out Guid workshopId)
    {
        return Guid.TryParse(
            User.FindFirstValue("workshop_id"),
            out workshopId);
    }
}
