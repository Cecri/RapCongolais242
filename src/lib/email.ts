/**
 * FICHIER : src/lib/email.ts
 * RÔLE : Envoi d'emails via Resend. Deux usages : notifier l'admin à
 * chaque nouvelle demande de paiement manuel, et notifier l'utilisateur
 * une fois son Premium validé.
 *
 * IMPORTANT : utilise actuellement l'adresse de test "onboarding@resend.dev",
 * qui ne peut envoyer que vers l'adresse du compte Resend lui-même. Une
 * fois le vrai domaine acheté et vérifié dans Resend, remplacer
 * "onboarding@resend.dev" par une adresse du type "no-reply@rapcongolais242.com"
 * pour pouvoir envoyer à tous les utilisateurs.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const EXPEDITEUR = "RapCongolais242 <onboarding@resend.dev>";

export async function envoyerNotificationAdminNouvelleDemande(details: {
  nomUtilisateur: string;
  provider: string;
  plan: string;
  reference: string;
}) {
  try {
    await resend.emails.send({
      from: EXPEDITEUR,
      to: process.env.ADMIN_NOTIFICATION_EMAIL!,
      subject: "Nouvelle demande de paiement Premium",
      html: `
        <p>Nouvelle demande de paiement manuel à vérifier :</p>
        <ul>
          <li><strong>Utilisateur :</strong> ${details.nomUtilisateur}</li>
          <li><strong>Moyen :</strong> ${details.provider}</li>
          <li><strong>Palier :</strong> ${details.plan}</li>
          <li><strong>Référence :</strong> ${details.reference}</li>
        </ul>
        <p><a href="http://localhost:3000/admin/paiements-manuels">Vérifier maintenant</a></p>
      `,
    });
  } catch (erreur) {
    console.log("[email] Échec envoi notification admin :", erreur);
  }
}

export async function envoyerConfirmationPremium(emailUtilisateur: string) {
  try {
    await resend.emails.send({
      from: EXPEDITEUR,
      to: emailUtilisateur,
      subject: "Ton abonnement Premium est activé !",
      html: `
        <p>Bonne nouvelle — ton abonnement Premium RapCongolais242 est maintenant actif.</p>
        <p>Tu peux dès à présent écouter nos sons exclusifs et soumettre de nouveaux artistes. Merci pour ton soutien à la culture congolaise !</p>
      `,
    });
  } catch (erreur) {
    console.log("[email] Échec envoi confirmation utilisateur :", erreur);
  }
}