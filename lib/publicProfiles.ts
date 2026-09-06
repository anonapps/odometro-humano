export type ProfileRole = 'athlete' | 'actor' | 'politician' | 'entrepreneur' | 'musician' | 'other';

export type PublicProfile = {
  name: string;
  birthDate: string;
  role: ProfileRole;
  facts: string[];
};

// Lightweight game data. Facts are public biographical signals, not medical records.
const RAW_PROFILES: [string, string, ProfileRole, string[]][] = [["Cristiano Ronaldo","1985-02-05","athlete",["surgery:ankle","professional_sport:football"]],["Rafael Nadal","1986-06-03","athlete",["sports_injury:foot","sports_injury:hip"]],["Novak Djokovic","1987-05-22","athlete",["surgery:elbow","professional_sport:tennis"]],["Lionel Messi","1987-06-24","athlete",["professional_sport:football"]],["LeBron James","1984-12-30","athlete",["professional_sport:basketball"]],["Serena Williams","1981-09-26","athlete",["surgery:foot","major_illness:embolism"]],["Roger Federer","1981-08-08","athlete",["surgery:knee","sports_injury:back"]],["Tiger Woods","1975-12-30","athlete",["surgery:knee","surgery:back"]],["David Beckham","1975-05-02","athlete",["sports_injury:ankle","professional_sport:football"]],["Tom Brady","1977-08-03","athlete",["professional_sport:american_football"]],["Usain Bolt","1986-08-21","athlete",["professional_sport:athletics"]],["Michael Phelps","1985-06-30","athlete",["professional_sport:swimming"]],["Simone Biles","1997-03-14","athlete",["mental_health:publicly_discussed","professional_sport:gymnastics"]],["Naomi Osaka","1997-10-16","athlete",["mental_health:publicly_discussed","professional_sport:tennis"]],["Kylian Mbappe","1998-12-20","athlete",["professional_sport:football"]],["Erling Haaland","2000-07-21","athlete",["professional_sport:football"]],["Carlos Alcaraz","2003-05-05","athlete",["professional_sport:tennis"]],["Jude Bellingham","2003-06-29","athlete",["professional_sport:football"]],["Coco Gauff","2004-03-13","athlete",["professional_sport:tennis"]],["Lamine Yamal","2007-07-13","athlete",["professional_sport:football"]],["Gavi","2004-08-05","athlete",["professional_sport:football"]],["Chris Hemsworth","1983-08-11","actor",["physical_activity:high"]],["Ryan Reynolds","1976-10-23","actor",["physical_activity:high"]],["Ryan Gosling","1980-11-12","actor",["physical_activity:role_training"]],["Jake Gyllenhaal","1980-12-19","actor",["physical_activity:role_training"]],["Chris Evans","1981-06-13","actor",["physical_activity:high"]],["Matt Damon","1970-10-08","actor",[]],["Brad Pitt","1963-12-18","actor",["physical_activity:role_training"]],["George Clooney","1961-05-06","actor",[]],["Denzel Washington","1954-12-28","actor",[]],["Keanu Reeves","1964-09-02","actor",["physical_activity:role_training"]],["Dwayne Johnson","1972-05-02","actor",["physical_activity:high"]],["Jennifer Lopez","1969-07-24","actor",["physical_activity:high"]],["Lady Gaga","1986-03-28","actor",[]],["Beyonce","1981-09-04","musician",["surgery:cesarean","pregnancy_complication:preeclampsia"]],["Adele","1988-05-05","musician",["surgery:vocal_cord"]],["Taylor Swift","1989-12-13","musician",["physical_activity:performance"]],["Bruno Mars","1985-10-08","musician",[]],["Rihanna","1988-02-20","musician",[]],["Justin Timberlake","1981-01-31","musician",[]],["Ed Sheeran","1991-02-17","musician",[]],["Billie Eilish","2001-12-18","musician",["mental_health:publicly_discussed"]],["Zendaya","1996-09-01","actor",["physical_activity:role_training"]],["Timothee Chalamet","1995-12-27","actor",["physical_activity:role_training"]],["Emma Watson","1990-04-15","actor",[]],["Daniel Radcliffe","1989-07-23","actor",[]],["Margot Robbie","1990-07-02","actor",["physical_activity:role_training"]],["Millie Bobby Brown","2004-02-19","actor",[]],["Tom Hanks","1956-07-09","actor",["major_illness:type_2_diabetes"]],["Meryl Streep","1949-06-22","actor",[]],["Arnold Schwarzenegger","1947-07-30","actor",["surgery:heart"]],["Sylvester Stallone","1946-07-06","actor",["sports_injury:neck","surgery:heart"]],["Harrison Ford","1942-07-13","actor",["sports_injury:shoulder"]],["Patrick Stewart","1940-07-13","actor",[]],["Ringo Starr","1940-07-07","musician",[]],["Paul McCartney","1942-06-18","musician",[]],["Mick Jagger","1943-07-26","musician",["surgery:heart"]],["Dolly Parton","1946-01-19","musician",[]],["Cher","1946-05-20","musician",[]],["Stevie Wonder","1950-05-13","musician",[]],["Elton John","1947-03-25","musician",["surgery:hip"]],["Billy Joel","1949-05-09","musician",["surgery:hip"]],["Madonna","1958-08-16","musician",["surgery:hip"]],["Oprah Winfrey","1954-01-29","other",[]],["Gordon Ramsay","1966-11-08","other",["sports_injury:knee"]],["Bill Gates","1955-10-28","entrepreneur",[]],["Jeff Bezos","1964-01-12","entrepreneur",[]],["Elon Musk","1971-06-28","entrepreneur",[]],["Mark Zuckerberg","1984-05-14","entrepreneur",[]],["Barack Obama","1961-08-04","politician",["physical_activity:regular"]],["Donald Trump","1946-06-14","politician",[]],["Joe Biden","1942-11-20","politician",["surgery:hip","surgery:skin"]],["Bill Clinton","1946-08-19","politician",["surgery:heart"]],["George W Bush","1946-07-06","politician",["surgery:knee"]],["Emmanuel Macron","1977-12-21","politician",[]],["Pedro Sanchez","1972-02-29","politician",[]],["Rishi Sunak","1980-05-12","politician",["physical_activity:regular"]],["Angela Merkel","1954-07-17","politician",[]],["Hillary Clinton","1947-10-26","politician",["surgery:elbow"]],["Tony Blair","1953-05-06","politician",["surgery:heart"]],["Nicolas Sarkozy","1955-01-28","politician",[]],["Michelle Obama","1964-01-17","other",["physical_activity:regular"]],["David Attenborough","1926-05-08","other",[]],["Mel Brooks","1926-06-28","actor",[]],["Sophia Loren","1934-09-20","actor",["surgery:hip"]],["Judi Dench","1934-12-09","actor",["major_illness:macular_degeneration"]],["Ian McKellen","1939-05-25","actor",["cancer:prostate"]],["Julie Andrews","1935-10-01","actor",["surgery:throat"]],["Maggie Smith","1934-12-28","actor",["cancer:breast"]],["Anthony Hopkins","1937-12-31","actor",[]],["Michael Caine","1933-03-14","actor",[]],["Jane Fonda","1937-12-21","actor",["cancer:breast"]],["Morgan Freeman","1937-06-01","actor",["major_illness:fibromyalgia"]],["Jack Nicholson","1937-04-22","actor",[]],["Clint Eastwood","1930-05-31","actor",[]],["Quincy Jones","1933-03-14","musician",[]],["Yoko Ono","1933-02-18","other",[]],["Gabriel Garcia Marquez","1927-03-06","other",["historical_reference","disease:lymphatic_cancer"]],["Gunter Grass","1927-10-16","other",["historical_reference"]],["Sidney Poitier","1927-02-20","actor",["historical_reference"]],["Christopher Plummer","1929-12-13","actor",["historical_reference"]],["Sean Connery","1930-08-25","actor",["historical_reference"]],["Gene Hackman","1930-01-30","actor",["historical_reference"]],["Muhammad Ali","1942-01-17","athlete",["major_illness:Parkinsons"]],["Pelé","1940-10-23","athlete",["historical_reference","major_illness:cancer"]],["Diego Maradona","1960-10-30","athlete",["historical_reference","substance_use:documented"]],["Michael Schumacher","1969-01-03","athlete",["major_injury:brain"]],["Ayrton Senna","1960-03-21","athlete",["historical_reference"]],["Kobe Bryant","1978-08-23","athlete",["historical_reference"]],["Diego Simeone","1970-04-28","athlete",["professional_sport:football"]],["Jose Mourinho","1963-01-26","athlete",["physical_activity:unknown"]],["Iain Armitage","2008-07-15","actor",["professional_activity:acting"]],["Mia Talerico","2008-09-17","actor",["professional_activity:acting"]],["Walker Scobell","2009-01-06","actor",["professional_activity:acting"]],["Ryan Kaji","2011-10-06","other",["professional_activity:content_creator"]]];

export const publicProfiles: PublicProfile[] = RAW_PROFILES.map(([name, birthDate, role, facts]) => ({ name, birthDate, role, facts }));

export function profileAge(birthDate: string, now = new Date('2026-09-06T12:00:00Z')) {
  const birth = new Date(`${birthDate}T12:00:00Z`);
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

const FACT_KM: Record<string, number> = {
  professional_sport: -15000,
  physical_activity: -5000,
  'physical_activity:high': -12000,
  'physical_activity:regular': -8000,
  'physical_activity:role_training': -7000,
  sports_injury: 6000,
  major_injury: 10000,
  surgery: 7000,
  major_illness: 12000,
  cancer: 15000,
  disease: 15000,
  mental_health: 3000,
  pregnancy_complication: 5000,
  substance_use: 10000,
};

export function profileKm(profile: PublicProfile) {
  const age = profileAge(profile.birthDate);
  const adjustment = profile.facts.reduce((sum, fact) => sum + (FACT_KM[fact] ?? FACT_KM[fact.split(':')[0]] ?? 0), 0);
  return Math.max(0, age * 5000 + adjustment);
}

export function profileNote(profile: PublicProfile) {
  const facts = profile.facts;
  if (facts.some((f) => f.startsWith('professional_sport'))) return 'Deporte profesional de élite.';
  if (facts.some((f) => f.startsWith('physical_activity'))) return 'Actividad física públicamente conocida.';
  if (facts.some((f) => f.startsWith('surgery'))) return 'Cirugía públicamente documentada.';
  if (facts.some((f) => f.startsWith('sports_injury'))) return 'Lesión deportiva públicamente documentada.';
  if (facts.some((f) => ['major_illness','cancer','disease'].some((k) => f.startsWith(k)))) return 'Antecedente de salud públicamente conocido.';
  if (facts.some((f) => f.startsWith('mental_health'))) return 'Salud mental públicamente comentada.';
  if (facts.some((f) => f.startsWith('substance_use'))) return 'Antecedente de consumo públicamente documentado.';
  return 'Trayectoria pública disponible.';
}
