using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarageOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAdminEmployeeRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Users SET EmployeeRole = NULL WHERE UserType = 2;");
            migrationBuilder.Sql("DELETE FROM WorkshopMemberships WHERE EmployeeRole = 1 AND UserId IN (SELECT Id FROM Users WHERE UserType = 2);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Users SET EmployeeRole = 1 WHERE UserType = 2 AND EmployeeRole IS NULL;");
            migrationBuilder.Sql(@"INSERT INTO WorkshopMemberships (Id, CreatedAt, UpdatedAt, WorkshopId, UserId, EmployeeRole, IsActive)
                SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))), CURRENT_TIMESTAMP, NULL, Users.WorkshopId, Users.Id, 1, 1
                FROM Users WHERE UserType = 2 AND NOT EXISTS (SELECT 1 FROM WorkshopMemberships WHERE WorkshopMemberships.UserId = Users.Id);");
        }
    }
}
