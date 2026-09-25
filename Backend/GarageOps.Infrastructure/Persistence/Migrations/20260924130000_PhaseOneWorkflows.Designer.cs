using GarageOps.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarageOps.Infrastructure.Persistence.Migrations;

[DbContext(typeof(GarageOpsDbContext))]
[Migration("20260924130000_PhaseOneWorkflows")]
partial class PhaseOneWorkflows
{
    protected override void BuildTargetModel(Microsoft.EntityFrameworkCore.ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "8.0.31");
    }
}
