export type CardPaymentFields = {
  holderName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
};

export type CardPaymentFieldKey = keyof CardPaymentFields;

export type CardPaymentErrors = Partial<Record<CardPaymentFieldKey, string>>;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara visual: grupos de 4 dígitos. */
export function formatCardNumberInput(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** Máscara MM/AA. */
export function formatExpirationInput(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    let n = Number(cardNumber[i]);
    if (Number.isNaN(n)) return false;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function parseExpiration(expiration: string): { month: number; year: number } | null {
  const trimmed = expiration.trim();
  const match = /^(\d{2})\/(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

function isExpirationValid(expiration: string): boolean {
  const parsed = parseExpiration(expiration);
  if (!parsed) return false;
  const now = new Date();
  const expiryEnd = new Date(parsed.year, parsed.month, 0, 23, 59, 59, 999);
  return expiryEnd >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function validateCardPayment(fields: CardPaymentFields): CardPaymentErrors {
  const errors: CardPaymentErrors = {};

  const holderName = fields.holderName.trim();
  if (holderName.length < 3) {
    errors.holderName = "Ingresá el nombre del titular (mínimo 3 caracteres).";
  } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]+$/.test(holderName)) {
    errors.holderName = "El nombre solo puede contener letras y espacios.";
  }

  const cardNumber = digitsOnly(fields.cardNumber);
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    errors.cardNumber = "El número de tarjeta debe tener entre 13 y 19 dígitos.";
  } else if (!luhnCheck(cardNumber)) {
    errors.cardNumber = "Número de tarjeta inválido.";
  }

  if (!fields.expiration.trim()) {
    errors.expiration = "Ingresá el vencimiento (MM/AA).";
  } else if (!parseExpiration(fields.expiration)) {
    errors.expiration = "Usá el formato MM/AA.";
  } else if (!isExpirationValid(fields.expiration)) {
    errors.expiration = "La tarjeta está vencida.";
  }

  const cvv = digitsOnly(fields.cvv);
  if (cvv.length < 3 || cvv.length > 4) {
    errors.cvv = "El CVV debe tener 3 o 4 dígitos.";
  }

  return errors;
}

/** Simula procesamiento de pago (sin pasarela externa). */
export async function processMockCardPayment(): Promise<{ ok: true } | { ok: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}
