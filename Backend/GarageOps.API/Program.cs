using GarageOps.Application.Abstractions.Persistence;
using GarageOps.Application.Authentication;
using GarageOps.Application.Employees;
using GarageOps.Application.Customers;
using GarageOps.Application.Jobs;
using GarageOps.Application.Tasks;
using GarageOps.Application.Catalog;
using GarageOps.Application.Billing;
using GarageOps.Application.Parts;
using GarageOps.Application.Authorization;
using GarageOps.API.Authorization;
using GarageOps.Application.Workshops.Services;
using GarageOps.Infrastructure.Persistence;
using GarageOps.Infrastructure.Authentication;
using GarageOps.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "GarageOps API",
        Version = "v1",
        Description = "Vehicle Workshop Management System – REST API",
    });

    // JWT Bearer auth button in Swagger UI
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token. Example: eyJhbGci..."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userIdClaim = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var username = context.Principal?.Identity?.Name;
                if (!Guid.TryParse(userIdClaim, out var userId) || string.IsNullOrWhiteSpace(username))
                {
                    context.Fail("The token does not identify a valid workshop user.");
                    return;
                }

                var users = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
                var user = await users.GetByUsernameAsync(username, context.HttpContext.RequestAborted);
                var tokenWorkshop = context.Principal?.FindFirst("workshop_id")?.Value;
                var tokenRole = context.Principal?.FindFirst("employee_role")?.Value;
                var tokenUserType = context.Principal?.FindFirst("user_type")?.Value;
                if (user is null || !user.IsActive || user.Id != userId
                    || user.WorkshopId?.ToString() != tokenWorkshop
                    || (user.EmployeeRole?.ToString() ?? "") != tokenRole
                    || user.UserType.ToString() != tokenUserType)
                {
                    context.Fail("This account is inactive or its access has changed. Sign in again.");
                }
            }
        };
    });

builder.Services.AddGarageOpsPolicies();

builder.Services.AddDbContext<GarageOpsDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("GarageOps")));


// Repositories
builder.Services.AddScoped<IWorkshopRepository, WorkshopRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWorkshopMembershipRepository, WorkshopMembershipRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Authentication
builder.Services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddScoped<IWorkshopRegistrationService, WorkshopRegistrationService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

// Employees
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// Customers
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ICustomerPortalService, CustomerPortalService>();
builder.Services.AddScoped<ICustomerPortalReadRepository, CustomerPortalReadRepository>();

// Jobs
builder.Services.AddScoped<IJobCardRepository, JobCardRepository>();
builder.Services.AddScoped<IJobCardService, JobCardService>();

// Tasks
builder.Services.AddScoped<IJobTaskRepository, JobTaskRepository>();
builder.Services.AddScoped<IJobTaskService, JobTaskService>();

// Catalog
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IPartRepository, PartRepository>();
builder.Services.AddScoped<ICatalogService, CatalogService>();

// Billing
builder.Services.AddScoped<IBillingRepository, BillingRepository>();
builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<IJobPartRequestRepository, JobPartRequestRepository>();
builder.Services.AddScoped<IPartRequestService, PartRequestService>();


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider
        .GetRequiredService<GarageOpsDbContext>();

    dbContext.Database.Migrate();
}


// Fix for Swagger UI compatibility: Swashbuckle emits "openapi": "3.0.4" which Swagger UI regex rejects.
app.Use(async (context, next) =>
{
    if (context.Request.Path.Value != null && context.Request.Path.Value.EndsWith("swagger.json", StringComparison.OrdinalIgnoreCase))
    {
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await next();

        context.Response.Body = originalBodyStream;
        responseBody.Seek(0, SeekOrigin.Begin);
        var json = await new StreamReader(responseBody).ReadToEndAsync();
        
        // Rewrite 3.0.4 to 3.0.1 for Swagger UI regex compatibility
        json = json.Replace("\"openapi\": \"3.0.4\"", "\"openapi\": \"3.0.1\"");

        context.Response.ContentType = "application/json;charset=utf-8";
        await context.Response.WriteAsync(json);
        return;
    }

    await next();
});

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "GarageOps API v1");
    options.DocumentTitle = "GarageOps API – Swagger UI";
    options.RoutePrefix = "swagger";
});

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
