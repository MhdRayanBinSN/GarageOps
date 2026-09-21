using GarageOps.Application.Workshops.DTOs;

namespace GarageOps.Application.Workshops.Services;

public interface IWorkshopRegistrationService
{
    Task<WorkshopRegistrationResponse> RegisterAsync(
        WorkshopRegistrationRequest request,
        CancellationToken cancellationToken);
}
