namespace GarageOps.Domain.Enums;

public enum JobStatus
{
    Draft = 1,
    Received = 2,
    Diagnosing = 3,
    AwaitingApproval = 4,
    Approved = 5,
    InProgress = 6,
    QualityCheck = 7,
    ReadyForDelivery = 8,
    Completed = 9,
    Cancelled = 10
}