using Microsoft.EntityFrameworkCore;
using PaymentForm.Api.Data;
using PaymentForm.Api.Models;

namespace PaymentForm.Api.Repositories;

public sealed class PaymentRepository(PaymentsDbContext dbContext) : IPaymentRepository
{
    public async Task<Payment> AddAsync(Payment payment, CancellationToken cancellationToken)
    {
        dbContext.Payments.Add(payment);
        await dbContext.SaveChangesAsync(cancellationToken);
        return payment;
    }

    public async Task<IReadOnlyList<Payment>> ListAsync(int page, int pageSize, CancellationToken cancellationToken) =>
        await dbContext.Payments.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

    public async Task<(decimal TotalSum, long TotalCount, IReadOnlyList<DailyPaymentStats> Daily)> GetStatsAsync(CancellationToken cancellationToken)
    {
        var totals = await dbContext.Payments.AsNoTracking()
            .GroupBy(_ => 1)
            .Select(group => new { Count = group.LongCount(), Sum = group.Sum(payment => (decimal?)payment.Amount) ?? 0m })
            .SingleOrDefaultAsync(cancellationToken);

        var daily = await dbContext.Payments.AsNoTracking()
            .GroupBy(payment => payment.CreatedAt.Date)
            .Select(group => new { Date = group.Key, Count = group.LongCount(), Sum = group.Sum(payment => payment.Amount) })
            .OrderByDescending(group => group.Date)
            .ToListAsync(cancellationToken);

        return (totals?.Sum ?? 0m, totals?.Count ?? 0L,
            daily.Select(x => new DailyPaymentStats(DateOnly.FromDateTime(x.Date), x.Count, x.Sum)).ToArray());
    }
}
