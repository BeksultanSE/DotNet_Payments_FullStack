using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using PaymentForm.Api.Models;
using PaymentForm.Api.Services;

namespace PaymentForm.Api.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<PaymentResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PaymentResponse>> Create(
        [FromBody] CreatePaymentRequest request, CancellationToken cancellationToken)
    {
        var payment = await paymentService.CreateAsync(request, cancellationToken);
        return Created("/api/payments", payment);
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PaymentResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>> Get(
        [FromQuery, Range(1, int.MaxValue)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        CancellationToken cancellationToken = default) =>
        Ok(await paymentService.ListAsync(page, pageSize, cancellationToken));

    [HttpGet("stats")]
    [ProducesResponseType<PaymentStatsResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PaymentStatsResponse>> GetStats(CancellationToken cancellationToken) =>
        Ok(await paymentService.GetStatsAsync(cancellationToken));
}
