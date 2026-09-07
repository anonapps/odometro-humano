import { profileAge, type PublicProfile } from './publicProfiles';

const DEATH_YEARS: Record<string, number> = {
  'Gabriel Garcia Marquez': 2014,
  'Gunter Grass': 2015,
  'Sidney Poitier': 2022,
  'Christopher Plummer': 2021,
  'Sean Connery': 2020,
  'Gene Hackman': 2025,
  'Maggie Smith': 2024,
  'Quincy Jones': 2024,
  'Muhammad Ali': 2016,
  'Pelé': 2022,
  'Diego Maradona': 2020,
  'Ayrton Senna': 1994,
  'Kobe Bryant': 2020,
};

const CURRENT_YEAR = 2026;
const HISTORICAL_KM_PER_YEAR = 10_000;

export function profileDeathYear(profile: PublicProfile) {
  return DEATH_YEARS[profile.name];
}

export function profileDeathBonusKm(profile: PublicProfile) {
  const deathYear = profileDeathYear(profile);
  if (!deathYear) return 0;
  return Math.max(0, CURRENT_YEAR - deathYear) * HISTORICAL_KM_PER_YEAR;
}

export function profileKmWithDeath(profile: PublicProfile, baseKm: number) {
  return baseKm + profileDeathBonusKm(profile);
}

export function profileDeathLine(profile: PublicProfile) {
  const deathYear = profileDeathYear(profile);
  if (!deathYear) return undefined;
  return `Falleció en ${deathYear} · Tendría ${profileAge(profile.birthDate)} años hoy`;
}
