# Payment Form API

ASP.NET Core Web API targeting .NET 10 / C# 14, backed by PostgreSQL and EF Core 10.

## Requirements

- .NET 10 SDK
- PostgreSQL 14 or later
- PowerShell (commands below are PowerShell syntax)

## Configure and run

From the repository root, set your database connection and at least one payment authorization method. Environment variables override `appsettings.json`:

```powershell
$env:ConnectionStrings__Payments = "Host=localhost;Port=5432;Database=payment_form;Username=postgres;Password=YOUR_PASSWORD"
$env:PaymentSecurity__ApiKey = "$( [guid]::NewGuid().ToString('N') )$( [guid]::NewGuid().ToString('N') )"
dotnet restore .\PaymentForm.Api\PaymentForm.Api.csproj
dotnet run --project .\PaymentForm.Api\PaymentForm.Api.csproj
```

Alternatively, set `PaymentSecurity__HmacSecret` to a secret of at least 32 UTF-8 bytes. You may configure either or both methods. Do not commit real secrets. The sample connection string in `appsettings.json` is for local development only.

The OpenAPI document is available at `http://localhost:5000/openapi/v1.json` while running in Development. The actual URL is printed by `dotnet run`.

## Database migrations

The project references EF Core Design 10 and the Npgsql EF Core 10 provider. Install the matching CLI tool once, then create/apply migrations:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.12
dotnet ef migrations add InitialCreate --project .\PaymentForm.Api\PaymentForm.Api.csproj --startup-project .\PaymentForm.Api\PaymentForm.Api.csproj
dotnet ef database update --project .\PaymentForm.Api\PaymentForm.Api.csproj --startup-project .\PaymentForm.Api\PaymentForm.Api.csproj
```

Migrations are source controlled under `PaymentForm.Api/Migrations`. For a fresh clone, run `database update`; for a schema change, create a new migration first. Set the connection string and `PaymentSecurity` variables before invoking design-time commands, as application options are validated at startup.

## API

`POST /api/payments` accepts JSON with `walletNumber`, `account`, `email`, optional `phone`, positive `amount`, `currency` (`RUB`, `USD`, or `EUR`), and optional `comment`. A valid request returns `201 Created` with the persisted payment. Data annotation errors return `400 ProblemDetails`; missing or invalid authorization returns `401 ProblemDetails`.

`GET /api/payments?page=1&pageSize=20` returns payments newest first. Page size is limited to 1–100. `GET /api/payments/stats` returns total sum/count and a UTC daily breakdown. Totals include all recorded payment statuses.

### Authorization

Send either `X-Api-Key: <configured key>` or `X-Signature: <hex HMAC-SHA256>`. HMAC is calculated from the exact UTF-8 request body bytes, without changing whitespace or adding a newline:

```powershell
$body = '{"walletNumber":"wallet-001","account":"Example User","email":"user@example.com","phone":"+79990000000","amount":125.50,"currency":"RUB","comment":"Order 123"}'
$secret = $env:PaymentSecurity__HmacSecret
$hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($secret))
$signature = [Convert]::ToHexString($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))).ToLowerInvariant()
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/payments -ContentType 'application/json' -Headers @{ 'X-Signature' = $signature } -Body $body
```

If you configured an API key, use `-Headers @{ 'X-Api-Key' = $env:PaymentSecurity__ApiKey }` instead. The HMAC covers only the raw body, as requested; deploy behind HTTPS and use a distinct secret per client in production.
