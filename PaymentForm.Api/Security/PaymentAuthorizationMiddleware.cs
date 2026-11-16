using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace PaymentForm.Api.Security;

public sealed class PaymentAuthorizationMiddleware(RequestDelegate next)
{
    private const long MaximumBodyBytes = 1_048_576;

    public async Task InvokeAsync(HttpContext context, IOptions<PaymentSecurityOptions> options)
    {
        if (!HttpMethods.IsPost(context.Request.Method) ||
            !context.Request.Path.Equals("/api/payments", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        var configured = options.Value;
        if (context.Request.ContentLength > MaximumBodyBytes)
        {
            await WriteProblemAsync(context, StatusCodes.Status413PayloadTooLarge, "Request body is too large.");
            return;
        }

        var authorized = await IsAuthorizedAsync(context, configured);
        if (context.Response.StatusCode == StatusCodes.Status413PayloadTooLarge)
            return;

        if (!authorized)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.Headers.WWWAuthenticate = "ApiKey, HMAC-SHA256";
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "A valid X-Api-Key or X-Signature header is required.");
            return;
        }

        await next(context);
    }

    private static async Task<bool> IsAuthorizedAsync(HttpContext context, PaymentSecurityOptions options)
    {
        if (!string.IsNullOrEmpty(options.ApiKey) &&
            context.Request.Headers.TryGetValue("X-Api-Key", out var suppliedKey))
        {
            var expected = Encoding.UTF8.GetBytes(options.ApiKey);
            var supplied = Encoding.UTF8.GetBytes(suppliedKey.ToString());
            if (expected.Length == supplied.Length && CryptographicOperations.FixedTimeEquals(expected, supplied))
                return true;
        }

        if (string.IsNullOrEmpty(options.HmacSecret) ||
            !context.Request.Headers.TryGetValue("X-Signature", out var suppliedSignature))
            return false;

        context.Request.EnableBuffering();
        await using var buffer = new MemoryStream();
        var chunk = new byte[8192];
        while (true)
        {
            var bytesRead = await context.Request.Body.ReadAsync(chunk, context.RequestAborted);
            if (bytesRead == 0)
                break;

            if (buffer.Length + bytesRead > MaximumBodyBytes)
            {
                await WriteProblemAsync(context, StatusCodes.Status413PayloadTooLarge, "Request body is too large.");
                context.Request.Body.Position = 0;
                return false;
            }

            await buffer.WriteAsync(chunk.AsMemory(0, bytesRead), context.RequestAborted);
        }

        context.Request.Body.Position = 0;
        var signature = suppliedSignature.ToString();
        if (signature.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
            signature = signature[7..];

        byte[] suppliedBytes;
        try
        {
            suppliedBytes = Convert.FromHexString(signature);
        }
        catch (FormatException)
        {
            return false;
        }

        var expectedBytes = HMACSHA256.HashData(Encoding.UTF8.GetBytes(options.HmacSecret), buffer.ToArray());
        return suppliedBytes.Length == expectedBytes.Length &&
               CryptographicOperations.FixedTimeEquals(suppliedBytes, expectedBytes);
    }

    private static Task WriteProblemAsync(HttpContext context, int status, string detail)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        return context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = status == StatusCodes.Status401Unauthorized ? "Unauthorized" : "Payload too large",
            Detail = detail,
            Instance = context.Request.Path
        }, cancellationToken: context.RequestAborted);
    }
}
