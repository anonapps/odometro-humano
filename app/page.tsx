'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { profileAge, profileKm, publicProfiles, type PublicProfile } from '../lib/publicProfiles';
import { profileDeathLine, profileKmWithDeath } from '../lib/profileDeath';
import { carForBirthYear, type CarRecord } from '../lib/carData';

const KM_PER_YEAR = 5000;
type Option = [string, string, number];
type Category = 'preventive' | 'movement' | 'recovery' | 'load' | 'exposure' | 'history';
type Question = { key: string; category: Category; eyebrow: string; question: string; hint?: string; options: Option[] };
type Answers = Record<string, string> & { age: string };
type ProfileView = PublicProfile & { age: number; km: number; tag: string };
type WikiPage = { title?: string; thumbnail?: { source?: string } };
type WikiResponse = { query?: { pages?: Record<string, WikiPage> } };

const initialAnswers: Answers = { age: '18' };

const steps: Question[] = [
  { key: 'vaccination', category: 'preventive', eyebrow: '01 · MANTENIMIENTO', question: '¿Llevas tus vacunas recomendadas al día?', options: [['yes', 'Sí, al día', -0.03], ['some', 'Algunas pendientes', 0], ['no', 'No estoy seguro/a', 0.02]] },
  { key: 'checkups', category: 'preventive', eyebrow: '02 · ITV HUMANA', question: '¿Cuándo fue tu última revisión preventiva?', options: [['year', 'En el último año', -0.04], ['two', 'Hace 1–2 años', 0], ['none', 'Hace más / nunca', 0.04]] },
  { key: 'dental', category: 'preventive', eyebrow: '03 · REVISIÓN', question: '¿Cómo llevas tus revisiones dentales?', options: [['recent', 'Al día', -0.02], ['sometimes', 'De vez en cuando', 0], ['never', 'Las tengo olvidadas', 0.02]] },
  { key: 'movement', category: 'movement', eyebrow: '04 · MOTOR EN MARCHA', question: '¿Cuántos días te mueves de forma activa en una semana normal?', hint: 'Ejemplos: caminar a buen ritmo, correr, bicicleta, nadar, hacer deporte o una sesión de ejercicio que te haga moverte de verdad.', options: [['active', '5+ días', -0.05], ['regular', '3–4 días', -0.03], ['some', '1–2 días', 0], ['sedentary', 'Casi ningún día', 0.05]] },
  { key: 'strength', category: 'movement', eyebrow: '05 · CHASIS', question: '¿Incluyes fuerza o ejercicios de resistencia?', hint: 'Por ejemplo: pesas, máquinas, bandas, calistenia o ejercicios de fuerza con tu propio peso.', options: [['often', '2+ veces por semana', -0.03], ['sometimes', 'Alguna vez al mes', 0], ['never', 'Prácticamente nunca', 0.02]] },
  { key: 'sportinjury', category: 'movement', eyebrow: '06 · LESIONES DEPORTIVAS', question: '¿Has tenido alguna lesión deportiva importante?', hint: 'Ejemplos: fractura, rotura de ligamentos o menisco, lesión muscular importante o un esguince que necesitó tratamiento o te apartó del deporte.', options: [['ligament', 'Ligamentos / menisco', 0.025], ['fracture', 'Fractura', 0.02], ['sprain', 'Esguince / lesión muscular', 0.01], ['other', 'Otra lesión relevante', 0.015], ['none', 'Ninguna', 0]] },
  { key: 'injuryimpact', category: 'movement', eyebrow: '07 · ESTADO DEL CHASIS', question: '¿Alguna lesión te limita actualmente?', hint: 'Por ejemplo, si hoy dificulta caminar, correr, entrenar, trabajar, dormir o realizar alguna actividad habitual.', options: [['limited', 'Sí, limita bastante mis actividades', 0.04], ['regularly', 'Sí, me limita con frecuencia', 0.025], ['occasionally', 'Solo en algunas ocasiones', 0.01], ['none', 'No, actualmente no me limita', -0.01]] },
  { key: 'sleep', category: 'recovery', eyebrow: '08 · RECUPERACIÓN', question: '¿Cuántas horas duermes normalmente?', options: [['short', 'Menos de 6 horas', 0.04], ['six', '6–7 horas', 0.01], ['seven', '7–8 horas', -0.03], ['long', 'Más de 8 horas', 0]] },
  { key: 'rested', category: 'recovery', eyebrow: '09 · ARRANQUE EN FRÍO', question: '¿Te despiertas habitualmente descansado/a?', options: [['yes', 'Sí, normalmente', -0.02], ['mixed', 'Depende del día', 0], ['no', 'Rara vez', 0.03]] },
  { key: 'sleepquality', category: 'recovery', eyebrow: '10 · CALIDAD', question: '¿Cómo valorarías la calidad de tu sueño?', options: [['good', 'Buena', -0.02], ['fair', 'Irregular', 0.01], ['poor', 'Mala', 0.03], ['unknown', 'No lo tengo claro', 0]] },
  { key: 'stress', category: 'load', eyebrow: '11 · CARGA DEL MOTOR', question: '¿Cómo describirías tu nivel de estrés habitual?', options: [['veryhigh', 'Muy alto', 0.06], ['high', 'Alto', 0.03], ['moderate', 'Moderado', 0], ['low', 'Bajo / casi inexistente', -0.03]] },
  { key: 'stressduration', category: 'load', eyebrow: '12 · DURACIÓN DE LA CARGA', question: '¿Desde cuándo sientes ese nivel de estrés?', hint: 'Solo aparece cuando has indicado estrés moderado, alto o muy alto.', options: [['long', 'Más de un año', 0.03], ['year', '6–12 meses', 0.02], ['months', '1–6 meses', 0.01], ['short', 'Menos de un mes', 0]] },
  { key: 'disconnect', category: 'load', eyebrow: '13 · DESCANSO MENTAL', question: '¿Tienes tiempo real para desconectar?', options: [['often', 'Sí, con frecuencia', -0.02], ['sometimes', 'A veces', 0], ['rarely', 'Casi nunca', 0.02]] },
  { key: 'smoking', category: 'exposure', eyebrow: '14 · HUMO EN EL MOTOR', question: '¿Cuál es tu relación con el tabaco?', options: [['current', 'Fumo actualmente', 0.08], ['occasional', 'Fumo ocasionalmente', 0.02], ['former', 'Fumé en el pasado, pero lo dejé', -0.01], ['never', 'Nunca fumo', -0.04]] },
  { key: 'alcohol', category: 'exposure', eyebrow: '15 · CONSUMO', question: '¿Con qué frecuencia consumes alcohol?', hint: 'Frecuente = varios días por semana o casi a diario. Regular = forma parte de tu semana. Ocasional = algunas ocasiones aisladas.', options: [['frequent', 'Frecuente · varios días por semana', 0.04], ['regular', 'Regular · forma parte de mi semana', 0.02], ['occasional', 'Ocasional · algunas ocasiones', 0], ['none', 'Nunca / casi nunca', -0.02]] },
  { key: 'diet', category: 'exposure', eyebrow: '16 · COMBUSTIBLE', question: '¿Cómo describirías tu alimentación habitual?', hint: 'Irregular = cambian mucho tus horarios, cantidades o elecciones. Poco equilibrada = comes de forma regular, pero con poca variedad o exceso de ultraprocesados, azúcar, sal o grasas.', options: [['poor', 'Poco equilibrada · calidad mejorable', 0.03], ['mixed', 'Irregular · depende mucho del día', 0.01], ['balanced', 'Variada y equilibrada', -0.03], ['unknown', 'No sabría decir', 0]] },
  { key: 'softdrugs', category: 'exposure', eyebrow: '17 · OTRAS SUSTANCIAS', question: '¿Con qué frecuencia consumes cannabis u otras sustancias que considerarías drogas blandas?', hint: 'Por ejemplo, cannabis. Si no consumes, elige “Nunca”.', options: [['frequent', 'Frecuente · varios días por semana', 0.05], ['regular', 'Regular · forma parte de mi semana', 0.03], ['occasional', 'Ocasional · algunas veces al año', 0.01], ['none', 'Nunca', 0]] },
  { key: 'harddrugs', category: 'exposure', eyebrow: '18 · OTRAS SUSTANCIAS', question: '¿Con qué frecuencia consumes drogas duras?', hint: 'Por ejemplo, cocaína, metanfetamina u opioides de uso no médico. Si no consumes, elige “Nunca”.', options: [['frequent', 'Frecuente · varios días por semana', 0.1], ['regular', 'Regular · forma parte de mi semana', 0.07], ['occasional', 'Ocasional · algunas veces al año', 0.04], ['none', 'Nunca', 0]] },
  { key: 'surgery', category: 'history', eyebrow: '19 · HISTORIAL DE TALLER', question: '¿Has tenido alguna cirugía relevante?', hint: 'Ejemplos: operación abdominal, de corazón, columna, cirugía ortopédica/traumatológica o neurológica; también una intervención con hospitalización o recuperación significativa.', options: [['cardiac', 'Cardiovascular', 0.01], ['neuro', 'Neurológica', 0.01], ['orthopedic', 'Ortopédica / traumatológica', 0.01], ['abdominal', 'Abdominal', 0.01], ['other', 'Otra cirugía relevante', 0.005], ['minor', 'Cirugía menor', 0.005], ['none', 'Ninguna', 0]] },
  { key: 'surgeryimpact', category: 'history', eyebrow: '20 · REPARACIÓN', question: '¿Te queda alguna limitación importante por una cirugía?', hint: 'Por ejemplo: movilidad reducida, dolor persistente, menor capacidad física o necesidad de adaptar actividades.', options: [['major', 'Sí, importante', 0.015], ['moderate', 'Sí, moderada', 0.01], ['minor', 'Sí, leve', 0.005], ['none', 'No', 0]] },
  { key: 'cancer', category: 'history', eyebrow: '21 · HISTORIAL MÉDICO', question: '¿Has tenido un diagnóstico de cáncer?', options: [['active', 'Sí, actualmente', 0.005], ['followup', 'Sí, en seguimiento', 0.005], ['treated', 'Sí, tratado y finalizado', 0.005], ['prefer', 'Prefiero no responder', 0], ['none', 'No', 0]] },
  { key: 'cancertype', category: 'history', eyebrow: '22 · TIPO DE HISTORIAL', question: 'Si quieres especificarlo, ¿qué tipo fue?', options: [['breast', 'Mama', 0], ['prostate', 'Próstata', 0], ['colon', 'Colon / recto', 0], ['lung', 'Pulmón', 0], ['skin', 'Piel', 0], ['blood', 'Hematológico', 0], ['other', 'Otro / prefiero no especificar', 0]] },
  { key: 'chronic', category: 'history', eyebrow: '23 · ESTADO GENERAL', question: '¿Tienes alguna enfermedad crónica diagnosticada?', hint: 'Ejemplos: diabetes, hipertensión, asma, EPOC, artritis, enfermedad cardiovascular, renal o tiroidea, o una condición neurológica crónica.', options: [['active', 'Sí, activa', 0.015], ['variable', 'Sí, con control variable', 0.01], ['controlled', 'Sí, bien controlada', 0.005], ['prefer', 'Prefiero no responder', 0], ['none', 'No', 0]] },
  { key: 'medication', category: 'history', eyebrow: '24 · MANTENIMIENTO', question: '¿Tomas medicación de forma habitual?', options: [['multiple', 'Varias medicaciones', 0.01], ['regular', 'Sí, regularmente', 0.005], ['occasional', 'Ocasionalmente', 0], ['prefer', 'Prefiero no responder', 0], ['none', 'No', 0]] },
  { key: 'wellbeing', category: 'load', eyebrow: '25 · PANEL DE CONTROL', question: '¿Cómo valorarías tu bienestar general?', options: [['high', 'Muy bueno', -0.03], ['good', 'Bueno', -0.015], ['mixed', 'Intermedio', 0.01], ['low', 'Bajo', 0.03]] },
  { key: 'social', category: 'load', eyebrow: '26 · CONEXIONES', question: '¿Sientes que tienes personas con las que contar?', options: [['yes', 'Sí, claramente', -0.02], ['some', 'Algunas', 0], ['no', 'Pocas / ninguna', 0.02], ['prefer', 'Prefiero no responder', 0]] }
];

function formatKm(value: number) { return new Intl.NumberFormat('es-ES').format(Math.round(value)); }
function answerScore(question: Question, answers: Answers) { return question.options.find(([id]) => id === answers[question.key])?.[2] ?? 0; }
function getStatus(rate: number) {
  if (rate <= -0.08) return { label: 'MOTOR CUIDADO', tone: 'good' };
  if (rate >= 0.12) return { label: 'PIDE UNA PUESTA A PUNTO', tone: 'alert' };
  return { label: 'EN RUTA', tone: 'neutral' };
}
function nextIndex(index: number, answers: Answers) {
  if (steps[index]?.key === 'cancer' && answers.cancer === 'none') return index + 2;
  if (steps[index]?.key === 'stress' && answers.stress === 'low') return index + 2;
  return index + 1;
}
function previousIndex(index: number, answers: Answers) {
  if (steps[index]?.key === 'chronic' && answers.cancer === 'none') return index - 2;
  if (steps[index]?.key === 'disconnect' && answers.stress === 'low') return index - 2;
  return index - 1;
}
function fameScore(name: string) {
  const top: Record<string, number> = {
    'Cristiano Ronaldo':10,'Lionel Messi':10,'LeBron James':10,'Serena Williams':10,'Novak Djokovic':10,'Rafael Nadal':10,'Roger Federer':10,
    'Chris Hemsworth':9,'Ryan Reynolds':9,'Ryan Gosling':9,'Chris Evans':9,'Dwayne Johnson':10,'Jennifer Lopez':10,'Beyonce':10,'Taylor Swift':10,
    'Rihanna':10,'Adele':9,'Bruno Mars':9,'Justin Timberlake':9,'Leonardo DiCaprio':10,'Robert Downey Jr.':10,'Elon Musk':10,'Mark Zuckerberg':9,
    'Barack Obama':10,'Donald Trump':10,'Joe Biden':9,'David Beckham':10,'Tom Brady':10,'Usain Bolt':10,'Michael Phelps':10,'Tiger Woods':10,
    'Simone Biles':9,'Naomi Osaka':8,'Kylian Mbappe':9,'Erling Haaland':9,'Carlos Alcaraz':9,'Jude Bellingham':8,'Coco Gauff':8,'Lamine Yamal':8,'Gavi':7,
    'Zendaya':9,'Millie Bobby Brown':8,'Timothee Chalamet':9,'Emma Watson':9,'Daniel Radcliffe':9,'Margot Robbie':9,'Tom Hanks':10,'Meryl Streep':10,
    'Arnold Schwarzenegger':10,'Sylvester Stallone':10,'Harrison Ford':10,'Patrick Stewart':9,'Ringo Starr':10,'Paul McCartney':10,'Mick Jagger':10,'Dolly Parton':10,
    'Cher':10,'Stevie Wonder':10,'Elton John':10,'Billy Joel':9,'Madonna':10,'Oprah Winfrey':10,'Gordon Ramsay':9,'Bill Gates':10,'Jeff Bezos':10,
    'Angela Merkel':9,'Hillary Clinton':9,'Tony Blair':8,'Michelle Obama':9,'David Attenborough':9,'Mel Brooks':9,
    'Sophia Loren':10,'Judi Dench':9,'Ian McKellen':9,'Julie Andrews':10,'Maggie Smith':10,'Anthony Hopkins':10,'Michael Caine':10,'Jane Fonda':9,
    'Morgan Freeman':10,'Jack Nicholson':10,'Clint Eastwood':10,'Yoko Ono':9,'Gabriel Garcia Marquez':10,'Gunter Grass':8,'Sidney Poitier':10,'Christopher Plummer':9,
    'Sean Connery':10,'Gene Hackman':9,'Muhammad Ali':10,'Pelé':10,'Diego Maradona':10,'Michael Schumacher':10,'Ayrton Senna':10,'Kobe Bryant':10,'Diego Simeone':8,'Jose Mourinho':9,
  };
  return top[name] ?? 7;
}
function profileDescription(profile: PublicProfile) {
  if (profile.name === 'Carlos Alcaraz') return 'Jugador profesional de tenis';
  if (profile.name === 'Jude Bellingham') return 'Jugador de fútbol profesional';
  if (profile.name === 'Donald Trump') return 'Presidente de Estados Unidos';
  if (profile.name === 'Barack Obama') return 'Presidente de Estados Unidos';
  if (profile.name === 'Ayrton Senna') return 'Piloto profesional de Fórmula 1';
  if (profile.name === 'Kobe Bryant') return 'Jugador profesional de baloncesto';
  if (profile.name === 'Diego Maradona') return 'Jugador profesional de fútbol';
  if (profile.name === 'Pelé') return 'Jugador profesional de fútbol';
  if (profile.name === 'Muhammad Ali') return 'Boxeador profesional';
  if (profile.role === 'athlete') return 'Deportista profesional';
  if (profile.role === 'actor') return 'Actor';
  if (profile.role === 'politician') return 'Político';
  if (profile.role === 'musician') return 'Músico';
  if (profile.role === 'entrepreneur') return 'Empresario';
  return 'Personalidad pública';
}

function useWikiImages(names: string[]) {
  const key = names.join('|');
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!key) return;
    const requestedNames = key.split('|');
    fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(key)}`)
      .then((response) => response.json() as Promise<WikiResponse>)
      .then((data) => {
        const next: Record<string, string> = {};
        Object.values(data.query?.pages ?? {}).forEach((page) => {
          const title = page.title;
          const source = page.thumbnail?.source;
          if (!title || !source) return;
          const requested = requestedNames.find((name) => name.localeCompare(title, undefined, { sensitivity: 'base' }) === 0);
          if (requested) next[requested] = source;
        });
        setImages(next);
      })
      .catch(() => setImages({}));
  }, [key]);
  return images;
}
function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }

function ProfileCard({ profile, image }: { profile: ProfileView; image?: string }) {
  const deathLine = profileDeathLine(profile);
  return <article className="profile-card">
    {image ? <div className="profile-photo" style={{ backgroundImage: `url("${image}")` }} role="img" aria-label={`Foto de ${profile.name}`} /> : <div className="profile-photo profile-initials" role="img" aria-label={`Perfil de ${profile.name}`}><span>{initials(profile.name)}</span></div>}
    <div className="profile-body"><h5>{profile.name}</h5><div className="profile-age">{deathLine ?? `${profile.age} años`}</div><div className="profile-km">{formatKm(profile.km)} <small>KM</small></div><span className="profile-tag">● {profile.tag}</span><p>{profileDescription(profile)}</p></div>
  </article>;
}

function CarCard({ car, image }: { car: CarRecord; image?: string }) {
  return <section className="car-match" aria-labelledby="car-title">
    <div className="car-heading"><span className="car-kicker">¿QUÉ COCHE TE CORRESPONDE?</span><h3 id="car-title">{car.model} <span>— {car.year}</span></h3></div>
    <div className="car-visual">{image ? <div className="car-photo" style={{ backgroundImage: `url("${image}")` }} role="img" aria-label={`Imagen de ${car.model}`} /> : <div className="car-photo car-placeholder">🚗</div>}</div>
  </section>;
}

export default function Home() {
  const [screen, setScreen] = useState<'start' | 'questions' | 'result'>('start');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const age = Math.max(18, Math.min(99, Number(answers.age) || 18));
  const chronological = age * KM_PER_YEAR;
  const adjustmentRate = useMemo(() => steps.reduce((total, item) => total + answerScore(item, answers), 0), [answers]);
  const biological = Math.max(0, chronological * (1 + adjustmentRate));
  const deltaKm = biological - chronological;
  const status = getStatus(adjustmentRate);
  const current = steps[step];
  const completedCount = steps.reduce((count, item) => count + (answers[item.key] ? 1 : 0), 0);

  const allProfiles: ProfileView[] = useMemo(() => publicProfiles.map((profile) => ({ ...profile, age: profileAge(profile.birthDate), km: profileKmWithDeath(profile, profileKm(profile)), tag: 'Similar' })), []);
  const sourcePool = allProfiles.filter((profile) => profile.age >= 18 && profile.age <= 99 && Math.abs(profile.age - age) <= 5);
  const candidates = sourcePool.sort((a, b) => (fameScore(b.name) - fameScore(a.name)) || (Math.abs(a.age - age) - Math.abs(b.age - age)) || (Math.abs(a.km - biological) - Math.abs(b.km - biological)));
  const selectedProfiles = candidates.slice(0, 5).map((profile) => ({ ...profile, tag: Math.abs(profile.km - biological) <= 8000 ? 'Muy similar' : Math.abs(profile.km - biological) <= 20000 ? 'Similar' : profile.km < biological ? 'Menor' : 'Mayor' }));
  const profileImages = useWikiImages(selectedProfiles.map((profile) => profile.name));

  const birthYear = 2025 - age;
  const car = carForBirthYear(birthYear);
  const carImages = useWikiImages([car.wikiTitle]);

  const begin = (event: FormEvent) => { event.preventDefault(); setScreen('questions'); };
  const advance = (nextAnswers: Answers = answers) => { const next = nextIndex(step, nextAnswers); if (next >= steps.length) setScreen('result'); else setStep(next); };
  const chooseAndAdvance = (value: string) => { const nextAnswers = { ...answers, [current.key]: value }; setAnswers(nextAnswers); advance(nextAnswers); };
  const goBack = () => { const previous = previousIndex(step, answers); if (previous < 0) setScreen('start'); else setStep(previous); };
  const reset = () => { setAnswers(initialAnswers); setStep(0); setScreen('start'); };

  return <main className="shell">
    <header><button className="brand" type="button" onClick={reset} aria-label="Odómetro Humano, reiniciar análisis"><span className="brand-mark">O</span> ODÓMETRO <em>HUMANO</em></button></header>
    <div id="top" className="road-line" />

    {screen === 'start' && <section className="hero">
      <p className="eyebrow">TU VIDA, EN KILÓMETROS</p><h1>¿Cuánto marca<br /><i>tu motor?</i></h1><p className="intro">Una estimación lúdica de tu recorrido cronológico y biológico.</p>
      <form onSubmit={begin} className="age-card"><label htmlFor="age">TU EDAD</label><div className="age-row"><input id="age" type="number" min="18" max="99" value={answers.age} onChange={(e) => setAnswers({ ...answers, age: String(Math.max(18, Math.min(99, Number(e.target.value) || 18))) })} /><span>AÑOS</span></div>
      <input className="slider" type="range" min="18" max="99" value={age} onChange={(e) => setAnswers({ ...answers, age: e.target.value })} aria-label="Edad entre 18 y 99 años" /><div className="scale"><span>18</span><span>58</span><span>99</span></div>
      <button type="submit">ENCENDER EL MOTOR <b>→</b></button></form>
    </section>}

    {screen === 'questions' && current && <section className="question-wrap">
      <div className="progress"><span>DIAGNÓSTICO RÁPIDO</span><span>{completedCount} / {steps.length}</span><div><i style={{ width: `${(completedCount / steps.length) * 100}%` }} /></div></div>
      <div className="question-content"><p className="eyebrow">{current.eyebrow}</p><h2>{current.question}</h2>{current.hint && <p className="question-hint">{current.hint}</p>}
        <div className="options">{current.options.map(([id, label]) => <button key={id} type="button" onClick={() => chooseAndAdvance(id)} className={answers[current.key] === id ? 'selected' : ''}><span>{label}</span><span className="option-arrow" aria-hidden="true">→</span></button>)}</div>
        <div className="question-actions"><button type="button" className="back" onClick={goBack}>← ATRÁS</button></div>
      </div>
    </section>}

    {screen === 'result' && <section className="result">
      <div className="result-top"><div className="result-reading"><p className="eyebrow">TU ODÓMETRO</p><div className="result-km-grid"><div className="result-km-card"><span>EDAD CRONOLÓGICA</span><strong>{formatKm(chronological)} <small>KM</small></strong></div><div className={`result-km-card ${deltaKm > 0 ? 'km-higher' : deltaKm < 0 ? 'km-lower' : ''}`}><span>EDAD BIOLÓGICA</span><strong>{formatKm(biological)} <small>KM</small></strong></div></div>
      <div className={`result-status ${status.tone}`}><strong>{status.label}</strong></div></div>
      <CarCard car={car} image={carImages[car.wikiTitle]} />
      </div>
      <div className="profiles-heading"><span className="eyebrow">¿A QUIÉN TE PARECES?</span></div>
      <div className="profiles-grid">{selectedProfiles.map((profile) => <ProfileCard key={profile.name} profile={profile} image={profileImages[profile.name]} />)}</div>
      <button className="restart" onClick={reset}>↻ CALCULAR DE NUEVO</button>
    </section>}
    <footer><span>HECHO PARA CUIDAR EL VIAJE</span><span>·</span><span>TUS DATOS NO SALEN DE ESTE DISPOSITIVO</span></footer>
  </main>;
}
