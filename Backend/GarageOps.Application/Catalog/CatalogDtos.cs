namespace GarageOps.Application.Catalog;

public sealed record CreateServiceRequest(string Name, string Description, decimal DefaultPrice);
public sealed record UpdateServiceRequest(string Name, string Description, decimal DefaultPrice);
public sealed record ServiceResponse(Guid Id, Guid WorkshopId, string Name, string Description, decimal DefaultPrice, bool IsActive);

public sealed record CreatePartRequest(string Name, string PartNumber, decimal UnitPrice, int StockQuantity);
public sealed record UpdatePartRequest(string Name, decimal UnitPrice);
public sealed record AdjustStockRequest(int QuantityChange);
public sealed record PartResponse(Guid Id, Guid WorkshopId, string Name, string PartNumber, decimal UnitPrice, int StockQuantity, bool IsActive);
public sealed record InventoryAvailabilityResponse(Guid Id, string Name, string PartNumber, int StockQuantity, bool IsActive);
