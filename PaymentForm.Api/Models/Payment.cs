namespace PaymentForm.Api.Models;

public enum PaymentStatus
{
    Created,
    Rejected
}

public sealed class Payment
{
    public Guid Id { get; set; }
    public required string WalletNumber { get; set; }
    public required string Account { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public decimal Amount { get; set; }
    public required string Currency { get; set; }
    public string? Comment { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
