using PaymentForm.Api.Models;

namespace PaymentForm.Api.Services;

public interface IPaymentService
{
    Task<PaymentResponse> CreateAsync(CreatePaymentRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<PaymentResponse>> ListAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<PaymentStatsResponse> GetStatsAsync(CancellationToken cancellationToken);
}
