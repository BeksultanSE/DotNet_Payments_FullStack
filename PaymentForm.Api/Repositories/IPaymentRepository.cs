using PaymentForm.Api.Models;

namespace PaymentForm.Api.Repositories;

public interface IPaymentRepository
{
    Task<Payment> AddAsync(Payment payment, CancellationToken cancellationToken);
    Task<IReadOnlyList<Payment>> ListAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<(decimal TotalSum, long TotalCount, IReadOnlyList<DailyPaymentStats> Daily)> GetStatsAsync(CancellationToken cancellationToken);
}
