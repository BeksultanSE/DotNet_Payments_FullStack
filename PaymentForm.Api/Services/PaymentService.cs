using PaymentForm.Api.Models;
using PaymentForm.Api.Repositories;

namespace PaymentForm.Api.Services;

public sealed class PaymentService(IPaymentRepository repository, TimeProvider timeProvider) : IPaymentService
{
    public async Task<PaymentResponse> CreateAsync(CreatePaymentRequest request, CancellationToken cancellationToken)
    {
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            WalletNumber = request.WalletNumber.Trim(),
            Account = request.Account.Trim(),
            Email = request.Email.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Amount = request.Amount,
            Currency = request.Currency.Trim().ToUpperInvariant(),
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            Status = PaymentStatus.Created,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime
        };

        return PaymentResponse.From(await repository.AddAsync(payment, cancellationToken));
    }

    public async Task<IReadOnlyList<PaymentResponse>> ListAsync(int page, int pageSize, CancellationToken cancellationToken) =>
        (await repository.ListAsync(page, pageSize, cancellationToken)).Select(PaymentResponse.From).ToArray();

    public async Task<PaymentStatsResponse> GetStatsAsync(CancellationToken cancellationToken)
    {
        var (sum, count, daily) = await repository.GetStatsAsync(cancellationToken);
        return new PaymentStatsResponse(sum, count, daily);
    }
}
