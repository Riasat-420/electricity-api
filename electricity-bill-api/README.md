# Electricity Bill API

A Node.js API to scrape electricity bill details for Pakistani distribution companies (DISCOs).

## Supported Companies

- **LESCO** (Lahore Electric Supply Company)
- **FESCO** (Faisalabad Electric Supply Company)
- **MEPCO** (Multan Electric Power Company)

## Installation

1. Navigate to the project directory:
   ```bash
   cd electricity-bill-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server runs on port `3000` by default.

## API Endpoints

### Get Bill Details

**URL:** `/api/bill`
**Method:** `GET`

**Query Parameters:**

- `company`: The name of the distribution company (e.g., `lesco`, `fesco`, `mepco`).
- `ref`: The 14-digit reference number of the consumer.

**Example Request:**

```http
GET http://localhost:3000/api/bill?company=lesco&ref=12345678901234
```

**Success Response:**

```json
{
  "status": "success",
  "company": "LESCO",
  "consumer_name": "JOHN DOE",
  "reference_number": "12345678901234",
  "bill_month": "NOV 2023",
  "due_date": "25 NOV 2023",
  "payable_within_duedate": "1500",
  "payable_after_duedate": "1650",
  "units_consumed": "120",
  "bill_url": "https://bill.pitc.com.pk/lescobill..."
}
```

**Error Response:**

```json
{
  "status": "error",
  "message": "Invalid Reference Number or Record Not Found"
}
```
