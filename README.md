# PaymentForm — Full-Stack Payment Application

A simplified full-stack service for accepting and viewing payment data.
Built with **ASP.NET Core 10** (backend API) + **vanilla HTML/CSS/JS** (frontend SPA) + **SQLite** (database).

---

## ⚡ Quick Start (3 steps)

### Step 1 — Run the server

Open a terminal in the project root and run:

```powershell
dotnet run --project .\PaymentForm.Api\PaymentForm.Api.csproj
```

The first time you run it, .NET will:
- Download any missing packages
- Create the SQLite database file (`payments.db`) automatically
- Apply the database schema

You should see:
```
Now listening on: http://localhost:5096
Application started.
```

### Step 2 — Open the app

Open your browser and go to:
```
http://localhost:5096
```

### Step 3 — Use the app

You'll see three tabs at the top:

| Tab | What it does |
|-----|-------------|
| **Create Payment** | Fill in the form and submit a payment |
| **History** | View all submitted payments in a table |
| **Statistics** | See total counts, sums, and daily breakdowns |

---

## Prerequisites

You only need **one thing** installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) — download and install it, then verify with:
  ```powershell
  dotnet --version
  # Should print: 10.x.xxx
  ```

No PostgreSQL, no Node.js, no Docker required.

---

## How to Use the App

### Creating a Payment

1. Click **Create Payment** tab
2. Fill in the form:
   - **Wallet Number** *(required)* — any identifier, e.g. `W-10042`
   - **Account / UserId** *(required)* — user identifier, e.g. `user_123`
   - **Email** *(required)* — must be a valid email address
   - **Phone** *(optional)* — phone number
   - **Amount** *(required)* — positive number, e.g. `150.50`
   - **Currency** *(required)* — choose RUB, USD, or EUR
   - **Comment** *(optional)* — any note
3. Click **Create Payment** button
4. A green toast notification will confirm success

### Viewing History

1. Click **History** tab
2. The table shows all payments, newest first
3. Use **Previous / Next** buttons to paginate through pages of 10

### Viewing Statistics

1. Click **Statistics** tab
2. See total payment count and total sum (with animated counters)
3. See a table breaking down payments by day

---

## Calling the API Directly (PowerShell)

The frontend calls the API automatically, but you can also call it yourself.

### Create a payment

```powershell
$body = @{
    walletNumber = "W-001"
    account      = "TestUser"
    email        = "test@example.com"
    phone        = "+79990001234"
    amount       = 150.50
    currency     = "RUB"
    comment      = "Test payment"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri 'http://localhost:5096/api/payments' `
    -Method Post `
    -ContentType 'application/json' `
    -Headers @{ 'X-Api-Key' = 'TestApiKey-PaymentForm-2024-SecureKey!!' } `
    -Body $body
```

### List payments

```powershell
Invoke-RestMethod 'http://localhost:5096/api/payments?page=1&pageSize=10'
```

### Get statistics

```powershell
Invoke-RestMethod 'http://localhost:5096/api/payments/stats'
```

---

## Validation Rules

The API enforces these rules on `POST /api/payments`:

| Field | Rule |
|-------|------|
| `walletNumber` | Required, max 100 characters |
| `account` | Required, max 200 characters |
| `email` | Required, must be valid email format |
| `phone` | Optional, phone format if provided |
| `amount` | Required, must be greater than 0 |
| `currency` | Required, must be `RUB`, `USD`, or `EUR` |
| `comment` | Optional, max 1000 characters |

Validation also runs in the browser — the form won't submit unless all required fields are correct.

---

## API Security

The `POST /api/payments` endpoint requires authentication.
Send the API key in the `X-Api-Key` request header:

```
X-Api-Key: TestApiKey-PaymentForm-2024-SecureKey!!
```

The frontend does this automatically. The key is configured in `appsettings.json`.

GET endpoints (`/api/payments` and `/api/payments/stats`) are **public** — no key needed.

---

## Stopping the Server

Press **Ctrl+C** in the terminal where the server is running.

---

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Payments": "Data Source=payments.db"
  },
  "PaymentSecurity": {
    "ApiKey": "TestApiKey-PaymentForm-2024-SecureKey!!",
    "HmacSecret": ""
  }
}
```

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:Payments` | Path to the SQLite database file |
| `PaymentSecurity:ApiKey` | The secret key clients must send in `X-Api-Key` header |
| `PaymentSecurity:HmacSecret` | Alternative: HMAC-SHA256 secret (leave empty to disable) |

You can override any setting with an environment variable (replace `:` with `__`):

```powershell
$env:PaymentSecurity__ApiKey = "my-new-strong-key-at-least-32-bytes!!"
dotnet run --project .\PaymentForm.Api\PaymentForm.Api.csproj
```

---

## Project Structure (brief)

```
PaymentForm.Api/
├── Controllers/        # HTTP endpoints (API layer)
├── Services/           # Business logic
├── Repositories/       # Database access
├── Data/               # EF Core DbContext
├── Models/             # Entity + DTOs
├── Security/           # Auth middleware
├── Migrations/         # Database schema history
├── wwwroot/            # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       └── pages/
│           ├── create-payment.js
│           ├── payment-history.js
│           └── statistics.js
├── Program.cs          # App startup & configuration
└── appsettings.json    # Settings
```

