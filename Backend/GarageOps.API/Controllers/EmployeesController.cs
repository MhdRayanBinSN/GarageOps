using System.Security.Claims;
using GarageOps.Application.Authorization;
using GarageOps.Application.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarageOps.API.Controllers;

[ApiController]
[Authorize(Policy = Permissions.EmployeesView)]
[Route("api/workshops/{workshopId:guid}/employees")]
public sealed class EmployeesController : ControllerBase
{
    private readonly IEmployeeService employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        this.employeeService = employeeService;
    }

    [HttpPost]
    [Authorize(Policy = Permissions.EmployeesManage)]
    [ProducesResponseType(typeof(EmployeeResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<EmployeeResponse>> Create(
        Guid workshopId,
        CreateEmployeeRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        if (request.EmployeeRole is not GarageOps.Domain.Enums.EmployeeRole.FrontDesk
            and not GarageOps.Domain.Enums.EmployeeRole.Mechanic)
            return BadRequest("New employees can only be Front Desk or Mechanic.");

        var employee = await employeeService.CreateAsync(
            workshopId,
            request,
            cancellationToken);

        return Created($"/api/employees/{employee.Id}", employee);
    }

    [HttpGet]
    [Authorize(Policy = Permissions.EmployeesView)]
    [ProducesResponseType(typeof(IReadOnlyList<EmployeeResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EmployeeResponse>>> GetAll(
        Guid workshopId,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        return Ok(await employeeService.GetByWorkshopAsync(
            workshopId,
            cancellationToken));
    }

    [HttpPut("{employeeId:guid}/role")]
    [Authorize(Policy = Permissions.EmployeesManage)]
    public async Task<ActionResult<EmployeeResponse>> UpdateRole(
        Guid workshopId,
        Guid employeeId,
        UpdateEmployeeRoleRequest request,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        if (request.EmployeeRole is not GarageOps.Domain.Enums.EmployeeRole.FrontDesk
            and not GarageOps.Domain.Enums.EmployeeRole.Mechanic)
            return BadRequest("Employees can only be Front Desk or Mechanic.");

        var employee = await employeeService.UpdateRoleAsync(
            workshopId,
            employeeId,
            request,
            cancellationToken);

        return employee is null ? NotFound() : Ok(employee);
    }

    [HttpPatch("{employeeId:guid}/activate")]
    [Authorize(Policy = Permissions.EmployeesManage)]
    public Task<ActionResult> Activate(
        Guid workshopId,
        Guid employeeId,
        CancellationToken cancellationToken)
    {
        return SetActive(workshopId, employeeId, true, cancellationToken);
    }

    [HttpPatch("{employeeId:guid}/deactivate")]
    [Authorize(Policy = Permissions.EmployeesManage)]
    public Task<ActionResult> Deactivate(
        Guid workshopId,
        Guid employeeId,
        CancellationToken cancellationToken)
    {
        return SetActive(workshopId, employeeId, false, cancellationToken);
    }

    private async Task<ActionResult> SetActive(
        Guid workshopId,
        Guid employeeId,
        bool isActive,
        CancellationToken cancellationToken)
    {
        if (!OwnsWorkshop(workshopId))
        {
            return Forbid();
        }

        var updated = await employeeService.SetActiveAsync(
            workshopId,
            employeeId,
            isActive,
            cancellationToken);

        return updated ? NoContent() : NotFound();
    }

    private bool OwnsWorkshop(Guid workshopId)
    {
        var claim = User.FindFirstValue("workshop_id");
        return Guid.TryParse(claim, out var tokenWorkshopId)
            && tokenWorkshopId == workshopId;
    }
}
