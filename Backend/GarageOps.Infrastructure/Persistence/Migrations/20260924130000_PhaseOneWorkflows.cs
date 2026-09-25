using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarageOps.Infrastructure.Persistence.Migrations;

public partial class PhaseOneWorkflows : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "WorkPerformed",
            table: "JobTasks",
            type: "TEXT",
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateTable(
            name: "JobPartRequests",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "TEXT", nullable: false),
                WorkshopId = table.Column<Guid>(type: "TEXT", nullable: false),
                JobCardId = table.Column<Guid>(type: "TEXT", nullable: false),
                JobTaskId = table.Column<Guid>(type: "TEXT", nullable: false),
                PartId = table.Column<Guid>(type: "TEXT", nullable: false),
                RequestedByUserId = table.Column<Guid>(type: "TEXT", nullable: false),
                ProcessedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                Status = table.Column<int>(type: "INTEGER", nullable: false),
                Notes = table.Column<string>(type: "TEXT", nullable: false),
                ProcessedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_JobPartRequests", x => x.Id);
                table.ForeignKey("FK_JobPartRequests_JobCards_JobCardId", x => x.JobCardId, "JobCards", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_JobPartRequests_JobTasks_JobTaskId", x => x.JobTaskId, "JobTasks", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_JobPartRequests_Parts_PartId", x => x.PartId, "Parts", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_JobPartRequests_Users_ProcessedByUserId", x => x.ProcessedByUserId, "Users", "Id", onDelete: ReferentialAction.NoAction);
                table.ForeignKey("FK_JobPartRequests_Users_RequestedByUserId", x => x.RequestedByUserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_JobPartRequests_Workshops_WorkshopId", x => x.WorkshopId, "Workshops", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex("IX_JobPartRequests_JobCardId", "JobPartRequests", "JobCardId");
        migrationBuilder.CreateIndex("IX_JobPartRequests_JobTaskId", "JobPartRequests", "JobTaskId");
        migrationBuilder.CreateIndex("IX_JobPartRequests_PartId", "JobPartRequests", "PartId");
        migrationBuilder.CreateIndex("IX_JobPartRequests_ProcessedByUserId", "JobPartRequests", "ProcessedByUserId");
        migrationBuilder.CreateIndex("IX_JobPartRequests_RequestedByUserId", "JobPartRequests", "RequestedByUserId");
        migrationBuilder.CreateIndex("IX_JobPartRequests_WorkshopId", "JobPartRequests", "WorkshopId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "JobPartRequests");
        migrationBuilder.DropColumn(name: "WorkPerformed", table: "JobTasks");
    }
}
