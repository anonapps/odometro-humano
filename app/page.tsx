'use client';

import { FormEvent, useMemo, useState } from 'react';

const KM_PER_YEAR = 18000;

type Answers = {
  age: number;
  vaccination: string;
  checkups: string;
  movement: string;
  smoking: string;
  health: string;
};

type AnswerKey = Exclude<keyof Answers, 'age'>;
type Question = { key: AnswerKey; eyebrow: string; question: string; options: [string, string, number][] };

const initialAnswers: Answers = { age: 32, vaccination: '', checkups: '', movement: '', smoking: '', health: '' };

const steps: Question[] = [
  { key: 'vaccination', eyebrow: '01 · MANTENIMIENTO', question: '¿Llevas tus vacunas recomendadas al día?', options: [['yes', 'Sí, al día', -12000], ['some', 'Algunas pendientes', 0], ['no', 'No estoy seguro/a', 8000]] },
  { key: 'checkups', eyebrow: '02 · ITV HUMANA', question: '¿Cuándo pasaste tu última revisión preventiva?', options: [['year', 'En el último año', -24000], ['two', 'Hace 1–2 años', -8000], ['none', 'Hace más / nunca', 16000]] },
  { key: 'movement', eyebrow: '03 · MOTOR EN MARCHA', question: '¿Cómo se mueve tu cuerpo en una semana normal?', options: [['active', 'Me muevo 3+ días', -18000], ['some', 'Algo, pero irregular', 0], ['sedentary', 'Casi nada', 18000]] },
  { key: 'smoking', eyebrow: '04 · HUMO EN EL MOTOR', question: '¿Cuál es tu relación con el tabaco?', options: [['never', 'No fumo', -9000], ['former', 'Lo dejé', 7000], ['current', 'Fumo actualmente', 35000]] },
  { key: 'health', eyebrow: '05 · HISTORIAL DE TALLER', question: '¿Has pasado por una enfermedad seria o cirugía mayor?', options: [['none', 'No', 0], ['recovered', 'Sí, ya recuperada', 18000], ['ongoing', 'Sí, en curso', 48000]] }
];

function formatKm(value: number) {
  return new Intl.NumberFormat('es-ES').format(Math.round(value));
}

function getStatus(delta: number) {
  if (delta <= -25000) return { label: 'MOTOR CUIDADO', text: 'Tus hábitos cuentan: tu ITV humana va al día.', tone: 'good' };
  if (delta >= 30000) return { label: 'PIDE UNA PUESTA A PUNTO', text: 'Un pequeño cambio hoy puede aligerar muchos kilómetros.', tone: 'alert' };
  return { label: 'EN RUTA', text: 'Tu marcador está cerca de lo esperado. Sigue cuidando el motor.', tone: 'neutral' };
}

export default function Home() {
  const [screen, setScreen] = useState<'start' | 'questions' | 'result'>('start');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const chronological = Math.max(0, answers.age) * KM_PER_YEAR;
  const adjustment = useMemo(() => steps.reduce((total, item) => {
    const selected = answers[item.key];
    return total + (item.options.find(([id]) => id === selected)?.[2] ?? 0);
  }, 0), [answers]);
  const biological = Math.max(0, chronological + adjustment);
  const status = getStatus(adjustment);
  const current = steps[step];

  const begin = (event: FormEvent) => {
    event.preventDefault();
    setScreen('questions');
  };
  const choose = (value: string) => setAnswers((old) => ({ ...old, [current.key]: value }));
  const next = () => step < steps.length - 1 ? setStep(step + 1) : setScreen('result');
  const reset = () => { setAnswers(initialAnswers); setStep(0); setScreen('start'); };

  return (
    <main className="shell">
      <header><a className="brand" href="#top" aria-label="Odómetro Humano, inicio"><span className="brand-mark">O</span> ODÓMETRO <em>HUMANO</em></a><span className="header-tag">BETA · 2026</span></header>
      <div id="top" className="road-line" />

      {screen === 'start' && <section className="hero">
        <p className="eyebrow">TU VIDA, EN KILÓMETROS</p>
        <h1>¿Cuánto marca<br /><i>tu motor?</i></h1>
        <p className="intro">Una estimación lúdica de tu recorrido cronológico y biológico.</p>
        <form onSubmit={begin} className="age-card">
          <label htmlFor="age">TU EDAD</label>
          <div className="age-row"><input id="age" type="number" min="0" max="120" value={answers.age} onChange={(e) => setAnswers({ ...answers, age: Number(e.target.value) })} /><span>AÑOS</span></div>
          <input className="slider" type="range" min="0" max="100" value={answers.age} onChange={(e) => setAnswers({ ...answers, age: Number(e.target.value) })} aria-label="Edad" />
          <div className="scale"><span>0</span><span>50</span><span>100</span></div>
          <button type="submit">ENCENDER EL MOTOR <b>→</b></button>
        </form>
        <p className="disclaimer">No guardamos tus respuestas. Esto no es un diagnóstico ni una predicción médica.</p>
      </section>}

      {screen === 'questions' && <section className="question-wrap">
        <div className="progress"><span>DIAGNÓSTICO RÁPIDO</span><span>{step + 1} / {steps.length}</span><div><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
        <p className="eyebrow">{current.eyebrow}</p>
        <h2>{current.question}</h2>
        <div className="options">{current.options.map(([id, label]) => <button key={id} onClick={() => choose(id)} className={answers[current.key] === id ? 'selected' : ''}><span>{label}</span><b>→</b></button>)}</div>
        <div className="question-actions"><button className="back" onClick={() => step === 0 ? setScreen('start') : setStep(step - 1)}>← VOLVER</button><button className="next" disabled={!answers[current.key]} onClick={next}>{step === steps.length - 1 ? 'VER MI MARCADOR' : 'SIGUIENTE'} →</button></div>
        <p className="disclaimer">Estimación educativa. Tu salud real no cabe en un cuestionario.</p>
      </section>}

      {screen === 'result' && <section className="result">
        <p className="eyebrow">LECTURA COMPLETADA</p><h2>Este es tu<br /><i>cuadro de mandos.</i></h2>
        <div className="dash"><div className="dash-label">KILÓMETROS CRONOLÓGICOS</div><div className="km">{formatKm(chronological)}<small> KM</small></div><div className="dash-rule" /><div className="dash-label">KILÓMETROS BIOLÓGICOS</div><div className="km bright">{formatKm(biological)}<small> KM</small></div></div>
        <div className={`status ${status.tone}`}><span className="status-dot" /><div><b>{status.label}</b><p>{status.text}</p></div><strong>{adjustment < 0 ? '−' : '+'}{formatKm(Math.abs(adjustment))}<small> KM</small></strong></div>
        <button className="restart" onClick={reset}>↻ CALCULAR DE NUEVO</button>
        <p className="disclaimer">Un juego para hablar de prevención, no una herramienta clínica. Consulta a profesionales para decisiones sobre tu salud.</p>
      </section>}
      <footer><span>HECHO PARA CUIDAR EL VIAJE</span><span>·</span><span>TUS DATOS NO SALEN DE ESTE DISPOSITIVO</span></footer>
    </main>
  );
}
