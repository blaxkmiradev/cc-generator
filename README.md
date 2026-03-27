# 💳 CC Generator

> **For development & testing purposes only. Not for real transactions.**

A sleek, web-based **credit card number generator** that produces Luhn-valid test card numbers in the exact format `CARD|MM|YY|CVV` — perfect for populating test environments, QA automation, and payment gateway sandboxes.

---

## ✨ Features

- 🔢 **BIN-based generation** — input any 4–6 digit BIN prefix
- ✅ **Luhn algorithm** — every card number passes the checksum
- 💡 **Auto card brand detection** — Visa, Mastercard, Amex, Discover
- 🔒 **CVV/CVC** — 3 digits (Visa/MC/Discover) or 4 digits (Amex)
- 📅 **Expiry dates** — valid MM/YY set 2–5 years in the future
- 👤 **Dummy cardholder names** — randomly generated
- 📋 **Clean output format** — `CARD|MM|YY|CVV`, one per line
- 📥 **Copy & Download** — grab results instantly
- 🚀 **Up to 500 cards** per generation
- 🌐 **REST API** — JSON, CSV, or text output

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/cc-generator.git
cd cc-generator
npm install
npm start
```

Open your browser at **http://localhost:5000**

---

## 🔧 Usage

### Web UI

1. Enter a BIN (e.g. `411111` for Visa)
2. Set the quantity (1–500)
3. Optionally select a card brand
4. Click **⚡ Generate**
5. Copy or download the results

### API

**POST** `/api/generate`

```json
{
  "bin": "411111",
  "count": 10,
  "brand": "visa",
  "format": "json"
}
```

**Parameters:**

| Field    | Type   | Default | Description                                      |
|----------|--------|---------|--------------------------------------------------|
| `bin`    | string | —       | 4–6 digit BIN prefix (required)                  |
| `count`  | number | 10      | Number of cards to generate (max 500)            |
| `brand`  | string | auto    | `visa`, `mastercard`, `amex`, `discover`         |
| `format` | string | `json`  | `json`, `csv`, `text`, `pipe`                    |

**Response (JSON):**

```json
{
  "cards": [
    {
      "cardNumber": "4111116321872677",
      "cvv": "927",
      "expiry": "03/30",
      "name": "Sophia Miller",
      "brand": "VISA"
    }
  ],
  "count": 1
}
```

**Pipe format output:**

```
4111116321872677|03|30|927
4111111229162337|03|30|892
```

---

## 🗂️ Project Structure

```
cc-generator/
├── server.js         # Express backend + Luhn logic
├── public/
│   └── index.html    # Frontend UI
├── package.json
└── README.md
```

---

## 🃏 Supported Card Types

| Brand      | BIN Prefix      | Card Length | CVV Length |
|------------|-----------------|-------------|------------|
| Visa       | 4               | 16          | 3          |
| Mastercard | 51–55           | 16          | 3          |
| Amex       | 34, 37          | 15          | 4          |
| Discover   | 6011, 644–649, 65 | 16        | 3          |

---

## ⚙️ Environment Variables

| Variable | Default | Description       |
|----------|---------|-------------------|
| `PORT`   | `5000`  | HTTP server port  |

---

## 🛡️ Disclaimer

This tool generates **fictitious card numbers** that pass the Luhn algorithm check. They are **not real credit card numbers** and **cannot be used** for actual financial transactions. Use only in authorized development and testing environments.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Made with 💜 for developers who need test data fast.
