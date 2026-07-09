export type Artist = {
  slug: string;
  initials: string;
  name: string;
  country: string;
  genre: string;
  note: number;
  derniereSortie: string;
  bio: string;
  instagram?: string;
  youtube?: string;
  tracks: { title: string; date: string }[];
};

export const artists: Artist[] = [
  {
    slug: "cecri",
    initials: "CE",
    name: "Cecri",
    country: "Sénégal",
    genre: "Rap",
    note: 4.8,
    derniereSortie: "2026-07-02",
    bio: "Un flow direct et affirmé, porté par une présence qui traverse les frontières entre le Sénégal et sa diaspora.",
    tracks: [{ title: "140G", date: "2 juil. 2026" }],
  },
  {
    slug: "lasacem",
    initials: "LS",
    name: "LASACEM",
    country: "Paris",
    genre: "Trap",
    note: 4.5,
    derniereSortie: "2026-06-14",
    bio: "Basé à Paris, LASACEM mêle trap et influences congolaises dans des sons sombres et mélodiques.",
    tracks: [{ title: "Désolé", date: "14 juin 2026" }],
  },
  {
    slug: "dimi91",
    initials: "D9",
    name: "DIMI91",
    country: "Paris",
    genre: "Rap",
    note: 4.2,
    derniereSortie: "2026-06-08",
    bio: "Rap brut et sincère, DIMI91 raconte le quotidien de la diaspora avec des mots crus.",
    tracks: [{ title: "Mauvaisl", date: "8 juin 2026" }],
  },
  {
    slug: "ya-cetidon",
    initials: "YC",
    name: "YA CETIDON",
    country: "Ottawa",
    genre: "Afro",
    note: 4.6,
    derniereSortie: "2026-05-30",
    bio: "Installé à Ottawa, YA CETIDON porte des sonorités afro chaleureuses jusqu'au Canada.",
    tracks: [{ title: "Baltimore", date: "30 mai 2026" }],
  },
  {
    slug: "77bry",
    initials: "7B",
    name: "77BRY",
    country: "Pointe-Noire",
    genre: "Drill",
    note: 4.9,
    derniereSortie: "2026-06-20",
    bio: "Une drill percutante venue tout droit de Pointe-Noire, portée par une énergie brute.",
    tracks: [{ title: "Néonègre", date: "20 juin 2026" }],
  },
  {
    slug: "snika",
    initials: "SN",
    name: "Snika",
    country: "Brazzaville",
    genre: "Rap",
    note: 4.3,
    derniereSortie: "2026-05-15",
    bio: "Voix de Brazzaville, Snika raconte les histoires de son quartier avec finesse.",
    tracks: [{ title: "Bana Mère", date: "15 mai 2026" }],
  },
  {
    slug: "mando",
    initials: "MD",
    name: "MANDO",
    country: "Dakar",
    genre: "Afro",
    note: 4.1,
    derniereSortie: "2026-04-28",
    bio: "MANDO fusionne afrobeat et rap depuis Dakar, avec des refrains entêtants.",
    tracks: [{ title: "OUTR'4GE", date: "28 avr. 2026" }],
  },
  {
    slug: "dayarga",
    initials: "DY",
    name: "DAYARGA",
    country: "Lille",
    genre: "Rap",
    note: 4.7,
    derniereSortie: "2026-06-25",
    bio: "Depuis Lille, DAYARGA impose un rap technique et une plume affûtée.",
    tracks: [{ title: "Capote", date: "25 juin 2026" }],
  },
];