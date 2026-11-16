using Microsoft.EntityFrameworkCore;
using PaymentForm.Api.Models;

namespace PaymentForm.Api.Data;

public sealed class PaymentsDbContext(DbContextOptions<PaymentsDbContext> options) : DbContext(options)
{
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var payment = modelBuilder.Entity<Payment>();
        payment.ToTable("payments");
        payment.HasKey(x => x.Id);
        payment.Property(x => x.Id).ValueGeneratedNever();
        payment.Property(x => x.WalletNumber).HasMaxLength(100).IsRequired();
        payment.Property(x => x.Account).HasMaxLength(200).IsRequired();
        payment.Property(x => x.Email).HasMaxLength(254).IsRequired();
        payment.Property(x => x.Phone).HasMaxLength(32);
        payment.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
        payment.Property(x => x.Currency).HasMaxLength(3).IsRequired();
        payment.Property(x => x.Comment).HasMaxLength(1000);
        payment.Property(x => x.Status).HasConversion<string>().HasMaxLength(16).IsRequired();
        payment.Property(x => x.CreatedAt).IsRequired();
        payment.HasIndex(x => x.CreatedAt);
    }
}
