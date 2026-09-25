using System.Security.Claims;
using GarageOps.Application.Tasks;
using GarageOps.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize]
[Route("api/job-cards/{jobCardId:guid}/tasks")]
public sealed class JobTasksController : ControllerBase
{
    private readonly IJobTaskService taskService;

    public JobTasksController(IJobTaskService taskService)
    {
        this.taskService = taskService;
    }

    [HttpPost]
    [Authorize(Policy = Permissions.TasksManage)]
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
    [Authorize(Policy = Permissions.TasksRead)]
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
            var tasks = await taskService.GetByJobCardAsync(
                workshopId,
                jobCardId,
                cancellationToken);
            if (User.IsInRole("Mechanic"))
            {
                if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Forbid();
                tasks = tasks.Where(task => task.AssignedToUserId == userId).ToArray();
            }
            return Ok(tasks);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("~/api/job-tasks/mine")]
    [Authorize(Policy = Permissions.TasksViewAssigned)]
    public async Task<ActionResult<IReadOnlyList<JobTaskResponse>>> GetMine(CancellationToken cancellationToken)
    {
        if (!TryGetWorkshopId(out var workshopId)
            || !Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Forbid();
        }

        return Ok(await taskService.GetAssignedToUserAsync(workshopId, userId, cancellationToken));
    }

    [HttpPost("{taskId:guid}/assign")]
    [Authorize(Policy = Permissions.TasksAssign)]
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
    [Authorize(Policy = Permissions.TasksUpdateAssigned)]
    public async Task<ActionResult<JobTaskResponse>> UpdateStatus(
        Guid jobCardId,
        Guid taskId,
        UpdateJobTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (User.IsInRole("Mechanic"))
        {
            if (!TryGetWorkshopId(out var workshopId)
                || !Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Forbid();
            }

            var assignedTasks = await taskService.GetByJobCardAsync(workshopId, jobCardId, cancellationToken);
            var ownTask = assignedTasks.FirstOrDefault(task => task.Id == taskId && task.AssignedToUserId == userId);
            if (ownTask is null) return Forbid();
            if (request.Status is not GarageOps.Domain.Enums.TaskStatus.InProgress
                and not GarageOps.Domain.Enums.TaskStatus.Completed)
            {
                return BadRequest("Staff can only start or complete tasks assigned to them.");
            }
            if ((ownTask.Status == GarageOps.Domain.Enums.TaskStatus.Assigned
                    && request.Status != GarageOps.Domain.Enums.TaskStatus.InProgress)
                || (ownTask.Status == GarageOps.Domain.Enums.TaskStatus.InProgress
                    && request.Status != GarageOps.Domain.Enums.TaskStatus.Completed)
                || ownTask.Status is not GarageOps.Domain.Enums.TaskStatus.Assigned
                    and not GarageOps.Domain.Enums.TaskStatus.InProgress)
            {
                return BadRequest("Start an assigned task before completing it.");
            }
            if (request.Status == GarageOps.Domain.Enums.TaskStatus.Completed
                && (request.ActualHours is null or <= 0 || string.IsNullOrWhiteSpace(request.WorkPerformed)))
            {
                return BadRequest("Work performed and actual hours are required to complete a task.");
            }
        }

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
