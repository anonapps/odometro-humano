'use client';

import { FormEvent, useMemo, useState } from 'react';

const KM_PER_YEAR = 5000;

type Option = [string, string, number];
type Category = 'preventive' | 'movement' | 'recovery' | 'load' | 'exposure' | 'history';
type Question = { key: string; category: Category; eyebrow: string; question: string; options: Option[] };
type Answers = Record<string, string> & { age: string };

const initialAnswers: Answers = { age: '32' };

const steps: Question[] = [
  { key: 'vaccination', category: 'preventive', eyebrow: '01 · MANTENIMIENTO', question: '¿Llevas tus vacunas recomendadas al día?', options: [['yes', 'Sí, al día', -0.03], ['some', 'Algunas pendientes', 0], ['no', 'No estoy seguro/a', 0.02]] },
  { key: 'checkups', category: 'preventive', eyebrow: '02 · ITV HUMANA', question: '¿Cuándo fue tu última revisión preventiva?', options: [['year', 'En el último año', -0.04], ['two', 'Hace 1–2 años', 0], ['none', 'Hace más / nunca', 0.04]] },
  { key: 'dental', category: 'preventive', eyebrow: '03 · REVISIÓN', question: '¿Cómo llevas tus revisiones dentales?', options: [['recent', 'Al día', -0.02], ['sometimes', 'De vez en cuando', 0], ['never', 'Las tengo olvidadas', 0.02]] },
  { key: 'movement', category: 'movement', eyebrow: '04 · MOTOR EN MARCHA', question: '¿Cuántos días te mueves de forma activa en una semana normal?', options: [['active', '5+ días', -0.05], ['regular', '3–4 días', -0.03], ['some', '1–2 días', 0], ['sedentary', 'Casi ninguno', 0.05]] },
  { key: 'strength', category: 'movement', eyebrow: '05 · CHASIS', question: '¿Incluyes fuerza o ejercicios de resistencia?', options: [['often', '2+ veces por semana', -0.03], ['sometimes', 'A veces', 0], ['never', 'Prácticamente nunca', 0.02]] },
  { key: 'sportinjury', category: 'movement', eyebrow: '06 · LESIONES DEPORTIVAS', question: '¿Has tenido alguna lesión deportiva importante?', options: [['none', 'Ninguna', 0], ['sprain', 'Esguince / lesión muscular', 0.01], ['fracture', 'Fractura', 0.02], ['ligament', 'Ligamentos / menisco', 0.025], ['other', 'Otra lesión relevante', 0.015]] },
  { key: 'injuryimpact', category: 'movement', eyebrow: '07 · ESTADO DEL CHASIS', question: '¿Alguna lesión te limita actualmente?', options: [['none', 'No', -0.01], ['occasionally', 'Ocasionalmente', 0.01], ['regularly', 'Sí, regularmente', 0.025], ['limited', 'Limita mis actividades', 0.04]] },
  { key: 'sleep', category: 'recovery', eyebrow: '08 · RECUPERACIÓN', question: '¿Cuántas horas duermes normalmente?', options: [['short', 'Menos de 6 horas', 0.04], ['six', '6–7 horas', 0.01], ['seven', '7–8 horas', -0.03], ['long', 'Más de 8 horas', 0]] },
  { key: 'rested', category: 'recovery', eyebrow: '09 · ARRANQUE EN FRÍO', question: '¿Te despiertas habitualmente descansado/a?', options: [['yes', 'Sí, normalmente', -0.02], ['mixed', 'Depende del día', 0], ['no', 'Rara vez', 0.03]] },
  { key: 'sleepquality', category: 'recovery', eyebrow: '10 · CALIDAD', question: '¿Cómo valorarías la calidad de tu sueño?', options: [['good', 'Buena', -0.02], ['fair', 'Irregular', 0.01], ['poor', 'Mala', 0.03], ['unknown', 'No lo tengo claro', 0]] },
  { key: 'stress', category: 'load', eyebrow: '11 · CARGA DEL MOTOR', question: '¿Cómo describirías tu nivel de estrés habitual?', options: [['low', 'Bajo', -0.03], ['moderate', 'Moderado', 0], ['high', 'Alto', 0.03], ['veryhigh', 'Muy alto', 0.06]] },
  { key: 'stressduration', category: 'load', eyebrow: '12 · DURACIÓN DE LA CARGA', question: '¿Desde cuándo sientes ese nivel de estrés?', options: [['short', 'Menos de un mes', 0], ['months', '1–6 meses', 0.01], ['year', '6–12 meses', 0.02], ['long', 'Más de un año', 0.03]] },
  { key: 'disconnect', category: 'load', eyebrow: '13 · DESCANSO MENTAL', question: '¿Tienes tiempo real para desconectar?', options: [['often', 'Sí, con frecuencia', -0.02], ['sometimes', 'A veces', 0], ['rarely', 'Casi nunca', 0.02]] },
  { key: 'smoking', category: 'exposure', eyebrow: '14 · HUMO EN EL MOTOR', question: '¿Cuál es tu relación con el tabaco?', options: [['never', 'No fumo', -0.04], ['former', 'Lo dejé', -0.01], ['occasional', 'Ocasional', 0.02], ['current', 'Fumo actualmente', 0.08]] },
  { key: 'alcohol', category: 'exposure', eyebrow: '15 · CONSUMO', question: '¿Cómo describirías tu consumo de alcohol?', options: [['none', 'Nunca / casi nunca', -0.02], ['occasional', 'Ocasional', 0], ['regular', 'Regular', 0.02], ['frequent', 'Frecuente', 0.04]] },
  { key: 'diet', category: 'exposure', eyebrow: '16 · COMBUSTIBLE', question: '¿Cómo describirías tu alimentación habitual?', options: [['balanced', 'Variada y equilibrada', -0.03], ['mixed', 'Bastante irregular', 0.01], ['poor', 'Poco equilibrada', 0.03], ['unknown', 'No sabría decir', 0]] },
  { key: 'surgery', category: 'history', eyebrow: '17 · HISTORIAL DE TALLER', question: '¿Has tenido alguna cirugía relevante?', options: [['none', 'No', 0], ['minor', 'Cirugía menor', 0.005], ['orthopedic', 'Ortopédica / traumatológica', 0.01], ['abdominal', 'Abdominal', 0.01], ['cardiac', 'Cardiovascular', 0.01], ['neuro', 'Neurológica', 0.01], ['other', 'Otra', 0.005]] },
  { key: 'surgeryimpact', category: 'history', eyebrow: '18 · REPARACIÓN', question: '¿Te queda alguna limitación importante por una cirugía?', options: [['none', 'No', 0], ['minor', 'Leve', 0.005], ['moderate', 'Moderada', 0.01], ['major', 'Importante', 0.015]] },
  { key: 'cancer', category: 'history', eyebrow: '19 · HISTORIAL MÉDICO', question: '¿Has tenido un diagnóstico de cáncer?', options: [['none', 'No', 0], ['treated', 'Sí, tratado', 0.005], ['followup', 'Sí, en seguimiento', 0.005], ['active', 'Sí, actualmente', 0.005], ['prefer', 'Prefiero no responder', 0]] },
  { key: 'cancertype', category: 'history', eyebrow: '20 · TIPO DE HISTORIAL', question: 'Si quieres especificarlo, ¿qué tipo fue?', options: [['breast', 'Mama', 0], ['prostate', 'Próstata', 0], ['colon', 'Colon / recto', 0], ['lung', 'Pulmón', 0], ['skin', 'Piel', 0], ['blood', 'Hematológico', 0], ['other', 'Otro / prefiero no especificar', 0]] },
  { key: 'chronic', category: 'history', eyebrow: '21 · ESTADO GENERAL', question: '¿Tienes alguna enfermedad crónica diagnosticada?', options: [['none', 'No', 0], ['controlled', 'Sí, controlada', 0.005], ['variable', 'Sí, variable', 0.01], ['active', 'Sí, activa', 0.015], ['prefer', 'Prefiero no responder', 0]] },
  { key: 'medication', category: 'history', eyebrow: '22 · MANTENIMIENTO', question: '¿Tomas medicación de forma habitual?', options: [['none', 'No', 0], ['occasional', 'Ocasionalmente', 0], ['regular', 'Sí, regularmente', 0.005], ['multiple', 'Varias medicaciones', 0.01], ['prefer', 'Prefiero no responder', 0]] },
  { key: 'wellbeing', category: 'load', eyebrow: '23 · PANEL DE CONTROL', question: '¿Cómo valorarías tu bienestar general?', options: [['high', 'Muy bueno', -0.03], ['good', 'Bueno', -0.015], ['mixed', 'Intermedio', 0.01], ['low', 'Bajo', 0.03]] },
  { key: 'social', category: 'load', eyebrow: '24 · CONEXIONES', question: '¿Sientes que tienes personas con las que contar?', options: [['yes', 'Sí, claramente', -0.02], ['some', 'Algunas', 0], ['no', 'Pocas / ninguna', 0.02], ['prefer', 'Prefiero no responder', 0]] }
];

const categoryLabels: Record<Category, string> = { preventive: 'MANTENIMIENTO', movement: 'MOVIMIENTO', recovery: 'RECUPERACIÓN', load: 'CARGA MENTAL', exposure: 'EXPOSICIÓN', history: 'HISTORIAL' };

function formatKm(value: number) { return new Intl.NumberFormat('es-ES').format(Math.round(value)); }
function answerScore(question: Question, answers: Answers) { const selected = answers[question.key]; return question.options.find(([id]) => id === selected)?.[2] ?? 0; }
function categoryScore(category: Category, answers: Answers) { const values = steps.filter((item) => item.category === category).map((item) => answerScore(item, answers)); if (!values.length) return 0; const total = values.reduce((sum, value) => sum + value, 0); return Math.max(0, Math.min(100, Math.round(50 - total * 500))); }
function scoreLabel(score: number) { if (score >= 70) return 'BUENO'; if (score >= 45) return 'EN RUTA'; return 'ATENCIÓN'; }
function getStatus(rate: number) { if (rate <= -0.08) return { label: 'MOTOR CUIDADO', text: 'Tus hábitos dibujan un marcador favorable.', tone: 'good' }; if (rate >= 0.12) return { label: 'PIDE UNA PUESTA A PUNTO', text: 'Hay varias áreas donde un cambio puede mejorar el marcador.', tone: 'alert' }; return { label: 'EN RUTA', text: 'Tu marcador está cerca de la referencia del juego.', tone: 'neutral' }; }

export default function Home() {
  const [screen, setScreen] = useState<'start' | 'questions' | 'result'>('start');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const age = Math.max(0, Math.min(120, Number(answers.age) || 0));
  const chronological = age * KM_PER_YEAR;
  const lifestyleRate = useMemo(() => steps.filter((item) => item.category !== 'history').reduce((total, item) => total + answerScore(item, answers), 0), [answers]);
  const historyRate = useMemo(() => steps.filter((item) => item.category === 'history').reduce((total, item) => total + answerScore(item, answers), 0), [answers]);
  const biological = Math.max(0, chronological * (1 + lifestyleRate));
  const adjustmentKm = biological - chronological;
  const status = getStatus(lifestyleRate);
  const current = steps[step];
  const categories = (Object.keys(categoryLabels) as Category[]).map((category) => ({ category, label: categoryLabels[category], score: categoryScore(category, answers) }));

  const begin = (event: FormEvent) => { event.preventDefault(); setScreen('questions'); };
  const choose = (value: string) => setAnswers((old) => ({ ...old, [current.key]: value }));
  const next = () => {
    if (current.key === 'cancer' && answers.cancer === 'none') {
      setStep(step + 2);
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else setScreen('result');
  };
  const back = () => {
    if (step === 0) {
      setScreen('start');
      return;
    }
    if (current.key === 'chronic' && answers.cancer === 'none') {
      setStep(step - 2);
      return;
    }
    setStep(step - 1);
  };
  const reset = () => { setAnswers(initialAnswers); setStep(0); setScreen('start'); };

  return (
    <main className="shell">
      <header><a className="brand" href="#top" aria-label="Odómetro Humano, inicio"><span className="brand-mark">O</span> ODÓMETRO <em>HUMANO</em></a><span className="header-tag">BETA · 2026</span></header>
      <div id="top" className="road-line" />

      {screen === 'start' && <section className="hero">
        <p className="eyebrow">TU VIDA, EN KILÓMETROS</p>
        <h1>¿Cuánto marca<br /><i>tu motor?</i></h1>
        <p className="intro">Una lectura lúdica de tus hábitos, recuperación, carga y recorrido vital.</p>
        <form onSubmit={begin} className="age-card">
          <label htmlFor="age">TU EDAD</label>
          <div className="age-row"><input id="age" type="number" min="0" max="120" value={answers.age} onChange={(e) => setAnswers({ ...answers, age: e.target.value })} /><span>AÑOS</span></div>
          <input className="slider" type="range" min="0" max="100" value={age} onChange={(e) => setAnswers({ ...answers, age: e.target.value })} aria-label="Edad" />
          <div className="scale"><span>0</span><span>50</span><span>100</span></div>
          <button type="submit">ENCENDER EL MOTOR <b>→</b></button>
        </form>
        <div className="feature-strip"><span>24 VARIABLES</span><span>6 SISTEMAS</span><span>100% LOCAL</span></div>
        <p className="disclaimer">No guardamos tus respuestas. Es un juego educativo: no calcula esperanza de vida, riesgo médico ni diagnósticos.</p>
      </section>}

      {screen === 'questions' && <section className="question-wrap">
        <div className="progress"><span>LECTURA DETALLADA</span><span>{step + 1} / {steps.length}</span><div><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
        <p className="eyebrow">{current.eyebrow}</p>
        <h2>{current.question}</h2>
        <div className="options">{current.options.map(([id, label]) => <button key={id} onClick={() => choose(id)} className={answers[current.key] === id ? 'selected' : ''}><span>{label}</span><b>→</b></button>)}</div>
        <div className="question-actions"><button className="back" onClick={back}>← VOLVER</button><button className="next" disabled={!answers[current.key]} onClick={next}>{step === steps.length - 1 ? 'VER MI MARCADOR' : 'SIGUIENTE'} →</button></div>
        <p className="disclaimer">Las preguntas sensibles son opcionales. La lectura es educativa y no sustituye una valoración profesional.</p>
      </section>}

      {screen === 'result' && <section className="result">
        <p className="eyebrow">LECTURA COMPLETADA · 24 VARIABLES</p>
        <h2>Este es tu<br /><i>cuadro de mandos.</i></h2>
        <div className="dash"><div className="dash-label">KILÓMETROS CRONOLÓGICOS</div><div className="km">{formatKm(chronological)}<small> KM</small></div><div className="dash-rule" /><div className="dash-label">KILÓMETROS DE HÁBITOS</div><div className="km bright">{formatKm(biological)}<small> KM</small></div></div>
        <div className={`status ${status.tone}`}><span className="status-dot" /><div><b>{status.label}</b><p>{status.text}</p></div><strong>{adjustmentKm < 0 ? '−' : '+'}{formatKm(Math.abs(adjustmentKm))}<small> KM</small></strong></div>
        <div className="systems"><div className="systems-title"><span>SISTEMAS DEL VEHÍCULO</span><span>ESTADO</span></div>{categories.map(({ category, label, score }) => <div className="system" key={category}><span>{label}</span><div className="meter"><i style={{ width: `${score}%` }} /></div><b>{scoreLabel(score)}</b></div>)}</div>
        <div className="history-note"><div className="dash-label">HISTORIAL / CONTEXTO</div><p>{historyRate > 0 ? 'Has declarado elementos de historial médico que merecen contexto individual. No se convierten directamente en una predicción.' : 'No has añadido carga al bloque de historial, o has preferido no responder.'}</p></div>
        <button className="restart" onClick={reset}>↻ CALCULAR DE NUEVO</button>
        <p className="disclaimer">Los kilómetros son una metáfora creada para este juego. No representan años de vida, esperanza de vida, probabilidad de enfermedad ni estado clínico.</p>
      </section>}
      <footer><span>HECHO PARA CUIDAR EL VIAJE</span><span>·</span><span>TUS DATOS NO SALEN DE ESTE DISPOSITIVO</span></footer>
    </main>
  );
}
