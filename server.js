const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));

// First names and last names for dummy cardholder name generation
const FIRST_NAMES = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Emma','Liam','Noah','Oliver','Ava','Sophia','Isabella','Mia','Charlotte','Amelia'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Moore','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson'];

// Card brand patterns
const BRAND_PATTERNS = {
  visa:       { prefix: ['4'], cvvLen: 3, len: 16 },
  mastercard: { prefix: ['51','52','53','54','55'], cvvLen: 3, len: 16 },
  amex:       { prefix: ['34','37'], cvvLen: 4, len: 15 },
  discover:   { prefix: ['6011','644','645','646','647','648','649','65'], cvvLen: 3, len: 16 },
};

function detectBrand(bin) {
  const b = String(bin);
  if (/^4/.test(b)) return 'visa';
  if (/^5[1-5]/.test(b)) return 'mastercard';
  if (/^3[47]/.test(b)) return 'amex';
  if (/^6(011|4[4-9]|5)/.test(b)) return 'discover';
  return 'unknown';
}

function luhnComplete(partial) {
  // partial: string of digits without check digit
  const digits = partial.split('').map(Number);
  let sum = 0;
  const shouldDouble = true; // we're adding check digit, so rightmost of partial gets doubled
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  return partial + check;
}

function luhnValid(num) {
  const digits = String(num).split('').map(Number);
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function randDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function generateCard(bin, brand) {
  const detectedBrand = brand && BRAND_PATTERNS[brand] ? brand : detectBrand(bin);
  const info = BRAND_PATTERNS[detectedBrand] || { cvvLen: 3, len: 16 };
  const totalLen = info.len;

  // Build partial number: BIN + random middle digits (leave last digit for Luhn)
  const binStr = String(bin);
  const middleLen = totalLen - binStr.length - 1;
  const middle = randDigits(middleLen);
  const partial = binStr + middle;
  const cardNumber = luhnComplete(partial);

  // CVV
  const cvv = randDigits(info.cvvLen);

  // Expiry: 2 to 5 years in future
  const now = new Date();
  const yearsAhead = 2 + Math.floor(Math.random() * 4);
  const expYear = (now.getFullYear() + yearsAhead) % 100;
  const expMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const expiry = `${expMonth}/${String(expYear).padStart(2, '0')}`;

  // Cardholder name
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;

  return { cardNumber, cvv, expiry, name, brand: detectedBrand.toUpperCase() };
}

app.post('/api/generate', (req, res) => {
  const { bin, count = 10, brand, format = 'json', includeNames = true } = req.body;

  if (!bin || !/^\d{4,6}$/.test(String(bin))) {
    return res.status(400).json({ error: 'BIN must be 4–6 digits' });
  }
  const n = Math.min(Math.max(parseInt(count) || 10, 1), 500);

  const cards = [];
  for (let i = 0; i < n; i++) {
    cards.push(generateCard(bin, brand?.toLowerCase()));
  }

  if (format === 'json') {
    return res.json({ cards, count: cards.length });
  }

  if (format === 'csv') {
    const rows = ['Card Number,CVV,Expiry,Name,Brand'];
    cards.forEach(c => rows.push(`${c.cardNumber},${c.cvv},${c.expiry},"${c.name}",${c.brand}`));
    res.setHeader('Content-Type', 'text/plain');
    return res.send(rows.join('\n'));
  }

  if (format === 'text') {
    const lines = cards.map(c =>
      `${c.cardNumber} | CVV: ${c.cvv} | Exp: ${c.expiry}${includeNames ? ` | ${c.name}` : ''} | ${c.brand}`
    );
    res.setHeader('Content-Type', 'text/plain');
    return res.send(lines.join('\n'));
  }

  res.json({ cards });
});

app.listen(PORT, () => console.log(`💳 CC Generator running on http://localhost:${PORT}`));
