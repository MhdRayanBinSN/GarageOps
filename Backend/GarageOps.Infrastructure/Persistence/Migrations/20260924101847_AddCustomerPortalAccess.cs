using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarageOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerPortalAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PortalUserId",
                table: "Customers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_PortalUserId",
                table: "Customers",
                column: "PortalUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Users_PortalUserId",
                table: "Customers",
                column: "PortalUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Users_PortalUserId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_PortalUserId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "PortalUserId",
                table: "Customers");
        }
    }
}
