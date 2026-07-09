/**
 * FICHIER : src/lib/paypal.ts
 * RÔLE : Client pour l'API REST PayPal (v2 Checkout Orders). Utilise
 * des appels fetch() directs plutôt que le SDK officiel (déprécié par
 * PayPal au profit de l'API REST directe). Bascule automatiquement
 * entre Sandbox (test) et Live selon PAYPAL_MODE dans .env.
 *
 * PayPal ne supporte pas le XOF (franc CFA) — les montants sont donc
 * en USD, converti approximativement depuis nos 3 paliers XOF.
 */

const BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const PRIX_USD_PAR_PLAN = {
  MONTHLY: "2.00",
  SEMESTRIAL: "9.00",
  YEARLY: "16.00",
} as const;

async function obtenirTokenAcces(): Promise<string> {
  const identifiants = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const reponse = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${identifiants}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!reponse.ok) {
    throw new Error("Impossible d'obtenir un token PayPal.");
  }

  const data = await reponse.json();
  return data.access_token;
}

export async function creerCommandePaypal(
  plan: keyof typeof PRIX_USD_PAR_PLAN
): Promise<string> {
  const token = await obtenirTokenAcces();

  const reponse = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: PRIX_USD_PAR_PLAN[plan],
          },
          description: `RapCongolais242 Premium — ${plan}`,
        },
      ],
    }),
  });

  if (!reponse.ok) {
    throw new Error("Impossible de créer la commande PayPal.");
  }

  const data = await reponse.json();
  return data.id;
}

export async function capturerCommandePaypal(orderId: string): Promise<boolean> {
  const token = await obtenirTokenAcces();

  const reponse = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!reponse.ok) return false;

  const data = await reponse.json();
  return data.status === "COMPLETED";
}