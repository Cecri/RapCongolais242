/**
 * FICHIER : src/app/(site)/abonnez-vous/BoutonPaypal.tsx
 * RÔLE : Charge le SDK JavaScript PayPal et affiche les boutons de
 * paiement pour un palier donné. Un verrou (dejaRenduRef) empêche le
 * double rendu que React déclenche volontairement en développement
 * (Strict Mode), qui sinon fait planter le SDK PayPal (rendu deux fois
 * dans le même conteneur avant la fin du premier rendu).
 */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { creerCommandePaypalAction, confirmerPaiementPaypalAction } from "./actions";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (selector: string) => void };
    };
  }
}

type PremiumPlan = "MONTHLY" | "SEMESTRIAL" | "YEARLY";

export default function BoutonPaypal({ plan }: { plan: PremiumPlan }) {
  const router = useRouter();
  const conteneurRef = useRef<HTMLDivElement>(null);
  const dejaRenduRef = useRef(false);

  useEffect(() => {
    if (dejaRenduRef.current) return;

    const idConteneur = `paypal-btn-${plan}`;

    function afficherBoutons() {
      if (!window.paypal || !conteneurRef.current || dejaRenduRef.current) return;
      dejaRenduRef.current = true;

      window.paypal.Buttons({
        style: { layout: "horizontal", height: 40 },
        createOrder: async () => {
          return await creerCommandePaypalAction(plan);
        },
        onApprove: async (data: { orderID: string }) => {
          await confirmerPaiementPaypalAction(data.orderID, plan);
          router.refresh();
        },
      }).render(`#${idConteneur}`);
    }

    if (window.paypal) {
      afficherBoutons();
      return;
    }

    const scriptExistant = document.getElementById("paypal-sdk");
    if (scriptExistant) {
      scriptExistant.addEventListener("load", afficherBoutons);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = afficherBoutons;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  return <div id={`paypal-btn-${plan}`} ref={conteneurRef} />;
}