using System.ComponentModel.DataAnnotations;

namespace PaymentForm.Api.Models;

public sealed record CreatePaymentRequest(
    [Required, StringLength(100, MinimumLength = 1)] string WalletNumber,
    [Required, StringLength(200, MinimumLength = 1)] string Account,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Phone, StringLength(32)] string? Phone,
    [Range(0.01, (double)decimal.MaxValue)] decimal Amount,
    [Required, RegularExpression("^(RUB|USD|EUR)$")] string Currency,
    [StringLength(1000)] string? Comment);

public sealed record PaymentResponse(
    Guid Id,
    string WalletNumber,
    string Account,
    string Email,
    string? Phone,
    decimal Amount,
    string Currency,
    string? Comment,
    string Status,
    DateTime CreatedAt)
{
    public static PaymentResponse From(Payment payment) => new(
        payment.Id, payment.WalletNumber, payment.Account, payment.Email,
        payment.Phone, payment.Amount, payment.Currency, payment.Comment,
        payment.Status.ToString(), payment.CreatedAt);
}

public sealed record PaymentStatsResponse(
    decimal TotalSum,
    long TotalCount,
    IReadOnlyList<DailyPaymentStats> DailyBreakdown);

public sealed record DailyPaymentStats(DateOnly Date, long Count, decimal Sum);
