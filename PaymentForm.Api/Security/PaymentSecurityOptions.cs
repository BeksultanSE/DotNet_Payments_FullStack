namespace PaymentForm.Api.Security;

public sealed class PaymentSecurityOptions
{
    public const string SectionName = "PaymentSecurity";
    public string? ApiKey { get; set; }
    public string? HmacSecret { get; set; }
}
