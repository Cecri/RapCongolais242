/**
 * FICHIER : src/components/PlayPauseIcon.tsx
 * RÔLE : Icônes play/pause en vrai SVG dessiné, pas en caractère de
 * texte "▶"/"⏸" — ce dernier était affiché en emoji coloré (bouton
 * bleu rond) par certains systèmes/navigateurs (iOS, navigateurs
 * intégrés comme Snapchat/Instagram), au lieu d'un simple symbole
 * respectant nos couleurs. Un SVG rend toujours pareil, partout.
 */
export function IconPlaySmall({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

export function IconPauseSmall({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

export function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}