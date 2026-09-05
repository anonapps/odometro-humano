'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

const KM_PER_YEAR = 5000;

type Option = [string, string, number];
type Category = 'preventive' | 'movement' | 'recovery' | 'load' | 'exposure' | 'history';
type Question = { key: string; category: Category; eyebrow: string; question: string; hint?: string; options: Option[] };
type Answers = Record<string, string> & { age: string };

const initialAnswers: Answers = { age: '32' };

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
  { key: 'stressduration', category: 'load', eyebrow: '12 · DURACIÓN DE LA CARGA', question: '¿Desde cuándo sientes ese nivel de estrés?', hint: 'Solo responde esto si tu estrés es moderado, alto o muy alto.', options: [['long', 'Más de un año', 0.03], ['year', '6–12 meses', 0.02], ['months', '1–6 meses', 0.01], ['short', 'Menos de un mes', 0]] },
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

const categoryLabels: Record<Category, string> = { preventive: 'Mantenimiento', movement: 'Movimiento', recovery: 'Recuperación', load: 'Carga mental', exposure: 'Exposición', history: 'Historial médico' };

function formatKm(value: number) { return new Intl.NumberFormat('es-ES').format(Math.round(value)); }
function answerScore(question: Question, answers: Answers) { return question.options.find(([id]) => id === answers[question.key])?.[2] ?? 0; }
function categoryScore(category: Category, answers: Answers) {
  const values = steps.filter((item) => item.category === category).map((item) => answerScore(item, answers));
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.max(0, Math.min(100, Math.round(50 - total * 500)));
}
function scoreLabel(score: number) { return score >= 45 ? 'EN RUTA' : 'ATENCIÓN'; }
function getStatus(rate: number) {
  if (rate <= -0.08) return { label: 'MOTOR CUIDADO', text: 'Tus hábitos dibujan un marcador favorable.', tone: 'good' };
  if (rate >= 0.12) return { label: 'PIDE UNA PUESTA A PUNTO', text: 'Tu marcador sugiere que hay margen de mejora.', tone: 'alert' };
  return { label: 'EN RUTA', text: 'Tu marcador está cerca de la referencia del juego.', tone: 'neutral' };
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

function CategoryIcon({ category }: { category: Category }) {
  const common = { width: 44, height: 44, viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (category === 'preventive') return <svg {...common}><path d="M24 40S8 31 8 19a9 9 0 0 1 16-5 9 9 0 0 1 16 5c0 12-16 21-16 21Z"/><path d="M14 23h6l3-6 4 12 3-6h5"/></svg>;
  if (category === 'movement') return <svg {...common}><circle cx="30" cy="8" r="4"/><path d="m26 14-5 7 5 5 4-6 5 4"/><path d="m21 21-7 1-5 7"/><path d="m26 26-4 9-7 5"/><path d="m30 24 7 8 5 1"/></svg>;
  if (category === 'recovery') return <svg {...common}><path d="M9 36V19h30v17"/><path d="M5 36h38"/><path d="M14 19c0-6 4-9 10-9s10 3 10 9"/><path d="M31 6v4M35 8l-2 2M39 12h-3"/></svg>;
  if (category === 'load') return <svg {...common}><path d="M24 42V21"/><path d="M24 21c0-8 6-13 13-13 0 8-5 13-13 13Z"/><path d="M24 27c0-6-5-10-11-10 0 7 4 10 11 10Z"/><path d="M17 42h14"/></svg>;
  if (category === 'exposure') return <svg {...common}><path d="M9 35c10-14 19-22 32-25-2 14-10 25-23 30"/><path d="M13 39c5-6 9-11 14-15"/></svg>;
  return <svg {...common}><rect x="12" y="10" width="24" height="32" rx="4"/><path d="M18 10V7h12v3M24 18v12M18 24h12"/></svg>;
}

export default function Home() {
  const [screen, setScreen] = useState<'start' | 'questions' | 'result'>('start');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const age = Math.max(0, Math.min(120, Number(answers.age) || 0));
  const chronological = age * KM_PER_YEAR;
  const adjustmentRate = useMemo(() => steps.reduce((total, item) => total + answerScore(item, answers), 0), [answers]);
  const biological = Math.max(0, chronological * (1 + adjustmentRate));
  const deltaKm = biological - chronological;
  const status = getStatus(adjustmentRate);
  const current = steps[step];
  const completedCount = steps.reduce((count, item) => count + (answers[item.key] ? 1 : 0), 0);
  const categories: Category[] = ['preventive', 'movement', 'recovery', 'load', 'exposure', 'history'];

  const begin = (event: FormEvent) => { event.preventDefault(); setScreen('questions'); };
  const advance = (nextAnswers: Answers = answers) => {
    const next = nextIndex(step, nextAnswers);
    if (next >= steps.length) setScreen('result'); else setStep(next);
  };
  const choose = (value: string) => setAnswers((old) => ({ ...old, [current.key]: value }));
  const chooseAndAdvance = (value: string) => {
    const nextAnswers = { ...answers, [current.key]: value };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  };
  const goBack = () => {
    const previous = previousIndex(step, answers);
    if (previous < 0) setScreen('start'); else setStep(previous);
  };
  const reset = () => { setAnswers(initialAnswers); setStep(0); setScreen('start'); };

  return (
    <main className="shell">
      <header><Link className="brand" href="/" aria-label="Odómetro Humano, inicio"><span className="brand-mark">O</span> ODÓMETRO <em>HUMANO</em></Link></header>
      <div id="top" className="road-line" />

      {screen === 'start' && <section className="hero">
        <p className="eyebrow">TU VIDA, EN KILÓMETROS</p>
        <h1>¿Cuánto marca<br /><i>tu motor?</i></h1>
        <p className="intro">Una estimación lúdica de tu recorrido cronológico y biológico.</p>
        <form onSubmit={begin} className="age-card">
          <label htmlFor="age">TU EDAD</label>
          <div className="age-row"><input id="age" type="number" min="0" max="120" value={answers.age} onChange={(e) => setAnswers({ ...answers, age: e.target.value })} /><span>AÑOS</span></div>
          <input className="slider" type="range" min="0" max="100" value={age} onChange={(e) => setAnswers({ ...answers, age: e.target.value })} aria-label="Edad" />
          <div className="scale"><span>0</span><span>50</span><span>100</span></div>
          <button type="submit">ENCENDER EL MOTOR <b>→</b></button>
        </form>
        <p className="disclaimer">No guardamos tus respuestas. Esto no es un diagnóstico ni una predicción médica.</p>
      </section>}

      {screen === 'questions' && current && <section className="question-wrap">
        <div className="progress"><span>DIAGNÓSTICO RÁPIDO</span><span>{completedCount} / {steps.length}</span><div><i style={{ width: `${(completedCount / steps.length) * 100}%` }} /></div></div>
        <div className="question-content">
          <p className="eyebrow">{current.eyebrow}</p>
          <h2>{current.question}</h2>
          {current.hint && <p className="question-hint">{current.hint}</p>}
          <div className="options">
            {current.options.map(([id, label]) => <button key={id} type="button" onClick={() => choose(id)} className={answers[current.key] === id ? 'selected' : ''}>
              <span>{label}</span><span className="option-arrow" role="button" tabIndex={0} aria-label={`Seleccionar ${label} y continuar`} onClick={(event) => { event.stopPropagation(); chooseAndAdvance(id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); chooseAndAdvance(id); } }}>→</span>
            </button>)}
          </div>
          <div className="question-actions"><button type="button" className="back" onClick={goBack}>← ATRÁS</button><button type="button" className="next" disabled={!answers[current.key]} onClick={() => advance()}>SIGUIENTE →</button></div>
          <p className="disclaimer">Estimación educativa. Tu salud real no cabe en un cuestionario.</p>
        </div>
      </section>}

      {screen === 'result' && <section className="result">
        <p className="eyebrow">LECTURA COMPLETADA</p>
        <h2>El mecánico de<br /><i>turno dice:</i></h2>
        <div className="result-panel">
          <div className="systems-header"><span>SISTEMAS</span><span>ESTADO</span></div>
          <div className="systems-list">
            {categories.map((category) => {
              const score = categoryScore(category, answers);
              const label = scoreLabel(score);
              return <div className="system" key={category}>
                <div className="system-name"><span className="system-icon"><CategoryIcon category={category} /></span><strong>{categoryLabels[category]}</strong></div>
                <div className="meter" aria-label={`${categoryLabels[category]}: ${score}%`}><span>{Array.from({ length: 10 }).map((_, index) => <i key={index} className={index < Math.round(score / 10) ? 'filled' : ''} />)}</span></div>
                <div className={`system-status ${label === 'ATENCIÓN' ? 'attention' : ''}`}>{label}</div>
              </div>;
            })}
          </div>
        </div>
        <div className="result-summary">
          <div><span>KM CRONOLÓGICOS</span><strong>{formatKm(chronological)} <small>KM</small></strong></div>
          <div><span>KM BIOLÓGICOS</span><strong>{formatKm(biological)} <small>KM</small></strong></div>
          <div className={`overall-status ${status.tone}`}><span>{status.label}</span><b>{deltaKm < 0 ? '−' : '+'}{formatKm(Math.abs(deltaKm))} <small>KM</small></b></div>
        </div>
        <button className="restart" onClick={reset}>↻ CALCULAR DE NUEVO</button>
        <p className="disclaimer">Un juego para hablar de prevención, no una herramienta clínica. Consulta a profesionales para decisiones sobre tu salud.</p>
      </section>}
      <footer><span>HECHO PARA CUIDAR EL VIAJE</span><span>·</span><span>TUS DATOS NO SALEN DE ESTE DISPOSITIVO</span></footer>
    </main>
  );
}
