using System.Text;
using Microsoft.EntityFrameworkCore;
using PaymentForm.Api.Data;
using PaymentForm.Api.Repositories;
using PaymentForm.Api.Security;
using PaymentForm.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Payments")
    ?? throw new InvalidOperationException("ConnectionStrings:Payments is required.");

builder.Services.AddDbContext<PaymentsDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler(_ => { });
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddOptions<PaymentSecurityOptions>()
    .Bind(builder.Configuration.GetSection(PaymentSecurityOptions.SectionName))
    .Validate(options =>
        (!string.IsNullOrWhiteSpace(options.ApiKey) || !string.IsNullOrWhiteSpace(options.HmacSecret)) &&
        (string.IsNullOrWhiteSpace(options.ApiKey) || Encoding.UTF8.GetByteCount(options.ApiKey) >= 32) &&
        (string.IsNullOrWhiteSpace(options.HmacSecret) || Encoding.UTF8.GetByteCount(options.HmacSecret) >= 32),
        "Configure a PaymentSecurity:ApiKey or HmacSecret; each configured value must be at least 32 UTF-8 bytes.")
    .ValidateOnStart();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Auto-apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentsDbContext>();
    await db.Database.MigrateAsync();
}

app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseMiddleware<PaymentAuthorizationMiddleware>();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
