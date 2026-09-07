import { profileAge, type PublicProfile } from './publicProfiles';

type DeathCause = 'natural' | 'accident' | 'excess' | 'unknown';

const DEATH_DATA: Record<string, { year: number; cause: DeathCause }> = {
  'Gabriel Garcia Marquez': { year: 2014, cause: 'excess' },
  'Gunter Grass': { year: 2015, cause: 'natural' },
  'Sidney Poitier': { year: 2022, cause: 'natural' },
  'Christopher Plummer': { year: 2021, cause: 'natural' },
  'Sean Connery': { year: 2020, cause: 'natural' },
  'Gene Hackman': { year: 2025, cause: 'natural' },
  'Maggie Smith': { year: 2024, cause: 'disease' as DeathCause },
  'Quincy Jones': { year: 2024, cause: 'natural' },
  'Muhammad Ali': { year: 2016, cause: 'disease' as DeathCause },
  'Pelé': { year: 2022, cause: 'disease' as DeathCause },
  'Diego Maradona': { year: 2020, cause: 'excess' },
  'Ayrton Senna': { year: 1994, cause: 'accident' },
  'Kobe Bryant': { year: 2020, cause: 'accident' },
};

const DEATH_BONUS_KM: Record<DeathCause, number> = {
  natural: 30_000,
  accident: 60_000,
  excess: 100_000,
  unknown: 30_000,
};

export function profileDeathYear(profile: PublicProfile) {
  return DEATH_DATA[profile.name]?.year;
}

export function profileDeathCause(profile: PublicProfile): DeathCause | undefined {
  return DEATH_DATA[profile.name]?.cause;
}

export function profileDeathBonusKm(profile: PublicProfile) {
  const cause = profileDeathCause(profile);
  if (!cause) return 0;
  return DEATH_BONUS_KM[cause];
}

export function profileKmWithDeath(profile: PublicProfile, baseKm: number) {
  return baseKm + profileDeathBonusKm(profile);
}

export function profileDeathLine(profile: PublicProfile) {
  const deathYear = profileDeathYear(profile);
  if (!deathYear) return undefined;
  return `Falleció en ${deathYear} · Tendría ${profileAge(profile.birthDate)} años hoy`;
}
