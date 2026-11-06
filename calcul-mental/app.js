"use strict";

const stages = [
  ["Les bases", ["add", "sub"]],
  ["Les tables", ["add", "sub", "mul", "div"]],
  ["De tête", ["add", "sub", "mul", "div"]],
  ["Décimaux", ["decimal", "scale", "priority"]],
  ["Pourcentages", ["percent", "change", "ratio"]],
  ["Expert", ["mul", "div", "priority", "percent", "reverse"]]
];
const target = 10;
const random = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = values => values[random(0, values.length - 1)];
const format = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 6 }).format;

const lessons = {
  add: ["Faire un nombre rond", "8 + 7 = 10 + 5 = 15. Prenez 2 dans le 7 pour compléter le 8 à 10."],
  sub: ["Compter l’écart", "43 − 38 : de 38 à 40, il y a 2, puis 3 jusqu’à 43. L’écart vaut 5."],
  mul: ["Décomposer un produit", "17 × 14 = 17 × 10 + 17 × 4 = 170 + 68 = 238."],
  div: ["Retrouver le produit", "144 ÷ 12 : 12 × 10 = 120 et il reste 24, soit 2 × 12. Le quotient vaut 12."],
  decimal: ["Calculer en dixièmes ou en centièmes", "2,8 + 0,6 = 28 dixièmes + 6 dixièmes = 34 dixièmes, soit 3,4."],
  scale: ["Déplacer la virgule", "3,7 × 100 = 370. Pour diviser par 100, déplacez la virgule de deux rangs vers la gauche."],
  priority: ["Repérer l’opération à faire d’abord", "5 + 4 × 6 = 5 + 24 = 29. Les parenthèses passent d’abord, puis les multiplications et divisions."],
  percent: ["Combiner des pourcentages faciles", "15 % de 80 = 10 % de 80 + 5 % de 80 = 8 + 4 = 12. Les 5 % sont la moitié des 10 %."],
  change: ["Calculer la variation puis l’appliquer", "80 € avec 15 % de remise : 10 % valent 8 €, 5 % valent 4 €. Le prix final est 80 − 12 = 68 €."],
  ratio: ["Ramener le total à 100", "18 sur 60 = 3 sur 10 = 30 sur 100, soit 30 %."],
  reverse: ["Retrouver la valeur de départ", "Après une baisse de 20 %, il reste 64 €. Les 80 % valent 64 €, donc 10 % valent 8 € et 100 % valent 80 €."]
};

function multiplication(a, b) {
  const [small, large] = [Math.min(a, b), Math.max(a, b)];
  if (small === 1) return { lesson: ["Multiplier par 1", "1 × 17 = 17. Multiplier par 1 conserve le nombre."], hint: "Multiplier par 1 conserve le nombre." };
  if (small === 2) return { lesson: ["Doubler", "2 × 17 = 17 + 17 = 34."], hint: `Additionnez ${large} et ${large}.` };
  if (small === 5) return { lesson: ["Prendre la moitié de × 10", "5 × 16 = 160 ÷ 2 = 80."], hint: `Prenez la moitié de ${large} × 10.` };
  if (small === 10 || large === 10 || large === 20) {
    const factor = large === 20 ? 20 : 10;
    const other = a === factor ? b : a;
    return { lesson: factor === 20 ? ["Doubler puis multiplier par 10", "20 × 14 = 28 × 10 = 280."] : ["Multiplier par 10", "10 × 14 = 140."],
      hint: factor === 20 ? `Doublez ${other}, puis multipliez par 10.` : `Multipliez ${other} par 10.` };
  }
  const near = [a, b].find(value => [9, 11, 19, 21].includes(value));
  if (near) {
    const other = near === a ? b : a;
    const round = Math.round(near / 10) * 10;
    const add = near > round;
    return { lesson: ["Arrondir puis compenser", "19 × 14 = 20 × 14 − 14 = 280 − 14 = 266. Pour 11, partez de 10 et ajoutez une fois le nombre."],
      hint: `Calculez ${round} × ${other}, puis ${add ? "ajoutez" : "retirez"} ${other}.` };
  }
  if (small === 4 || small === 8) return { lesson: ["Doubler plusieurs fois", "8 × 13 : 13 → 26 → 52 → 104. Trois doubles remplacent la multiplication par 8."], hint: `Doublez ${large} ${small === 4 ? "deux" : "trois"} fois.` };
  const tens = Math.floor(large / 10) * 10;
  return { lesson: lessons.mul, hint: tens ? `Calculez ${small} × ${tens}, puis ajoutez ${small} × ${large - tens}.` : `Calculez ${large} × ${small - 1}, puis ajoutez ${large}.` };
}

function makeQuestion(kind, level, intensity) {
  const tier = intensity + 1;
  let a, b, c, p, prompt, answer, hint, suffix = "";
  let lesson = lessons[kind];
  switch (kind) {
    case "add":
    case "sub": {
      const limits = [2 + tier * 3, 18 + tier * 10, 40 + tier * 30];
      a = random(1, limits[level]);
      b = random(1, kind === "add" ? limits[level] : a);
      prompt = kind === "add" ? `${a} + ${b}` : `${a} − ${b}`;
      answer = kind === "add" ? a + b : a - b;
      const gap = kind === "sub" && a - b <= 12;
      if (gap) {
        hint = `Partez de ${b} et comptez ce qu’il faut ajouter pour atteindre ${a}.`;
        break;
      }
      const bridge = (10 - a % 10) % 10;
      if (kind === "add" && bridge && b > bridge) {
        hint = `Ajoutez ${bridge} pour atteindre ${a + bridge}, puis ajoutez les ${b - bridge} qui restent.`;
        break;
      }
      const tens = Math.floor(b / 10) * 10;
      const action = kind === "add" ? "Ajoutez" : "Retirez";
      hint = tens ? `${action} ${tens}, puis ${b - tens}.` :
        `${action} ${b} en comptant ${kind === "add" ? "vers le haut" : "vers le bas"} à partir de ${a}.`;
      break;
    }
    case "mul":
    case "div":
      a = random(2, level === 5 ? 22 + tier * 9 : level === 2 ? 14 + tier * 2 : 6 + tier * 2);
      b = random(2, level === 5 ? 12 + tier * 5 : level === 2 ? 14 + tier * 2 : 6 + tier * 2);
      if (kind === "mul") {
        prompt = `${a} × ${b}`;
        answer = a * b;
        ({ lesson, hint } = multiplication(a, b));
      } else {
        prompt = `${a * b} ÷ ${b}`;
        answer = a;
        hint = `Quel nombre multiplié par ${b} donne ${a * b} ?`;
      }
      break;
    case "decimal": {
      const divisor = tier === 3 ? 100 : 10;
      a = random(11, 60 * tier);
      b = random(1, a);
      const add = random(0, 1);
      prompt = `${format(a / divisor)} ${add ? "+" : "−"} ${format(b / divisor)}`;
      answer = (add ? a + b : a - b) / divisor;
      hint = `Calculez en ${divisor === 100 ? "centièmes" : "dixièmes"}, puis replacez la virgule.`;
      break;
    }
    case "scale": {
      a = random(13, 90 * tier) / 10;
      b = tier === 1 ? 10 : pick([10, 100]);
      const multiply = random(0, 1);
      prompt = `${format(a)} ${multiply ? "×" : "÷"} ${b}`;
      answer = multiply ? a * b : a / b;
      hint = `Décalez la virgule de ${b === 10 ? "1 rang" : "2 rangs"} vers la ${multiply ? "droite" : "gauche"}.`;
      break;
    }
    case "priority":
      a = random(2, 8 * tier);
      b = random(2, level === 5 ? 15 : 9);
      c = random(2, 6 + tier);
      if (level === 5) {
        const d = random(2, 9);
        prompt = `(${a} + ${b}) × ${c} − ${d}`;
        answer = (a + b) * c - d;
        hint = "Calculez la parenthèse, puis la multiplication, puis la soustraction.";
      } else {
        prompt = `${a} + ${b} × ${c}`;
        answer = a + b * c;
        hint = "Commencez par la multiplication.";
      }
      break;
    case "percent":
    case "change": {
      p = level === 5 ? pick([7, 12, 17, 22, 35, 42, 65]) :
        pick(tier === 1 ? [10, 25, 50] : tier === 2 ? [5, 15, 20, 25, 40, 75] : [12, 18, 30, 35, 45, 65]);
      a = random(2, 12 * tier) * (tier === 1 && level !== 5 ? 20 : 5);
      const delta = a * p / 100;
      hint = `1 % de ${a} vaut ${format(a / 100)}. Multipliez par ${p}.`;
      if (kind === "change") {
        const raise = random(0, 1);
        prompt = `${a} après ${raise ? "une hausse" : "une baisse"} de ${p} %`;
        answer = raise ? a + delta : a - delta;
        hint += raise ? " Ajoutez ce résultat à la valeur de départ." : " Retirez ce résultat de la valeur de départ.";
      } else {
        prompt = `${p} % de ${a}`;
        answer = delta;
      }
      break;
    }
    case "ratio":
      b = pick([20, 25, 40, 50, 80, 200]);
      p = pick(tier === 1 ? [25, 50, 75] : [15, 25, 35, 45, 60, 75]);
      a = b * p / 100;
      prompt = `${format(a)} sur ${b}, en %`;
      answer = p;
      suffix = " %";
      hint = "Divisez la partie par le total, puis multipliez par 100.";
      break;
    case "reverse":
      p = pick(tier === 1 ? [10, 20, 25, 50] : [12, 15, 18, 24, 35, 40]);
      a = random(4, 12 * tier) * 10;
      b = random(0, 1) ? 100 + p : 100 - p;
      prompt = `Après ${b > 100 ? "+" : "−"}${p} % : ${format(a * b / 100)}. Valeur initiale ?`;
      answer = a;
      hint = `Le résultat représente ${b} % de la valeur initiale. Ramenez-le à 100 %.`;
      break;
  }
  return { kind, prompt, answer, hint, suffix, lesson };
}

const key = "jeux-calcul-mental-v1";
const emptyStage = kinds => Object.fromEntries(kinds.map(kind => [kind, { points: 0, skill: 0 }]));
const maximum = (index, position) => {
  const count = stages[index][1].length;
  return Math.floor(target / count) + Number(position < target % count);
};

function restore() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  const levels = stages.map(([, kinds], index) => {
    const level = emptyStage(kinds);
    kinds.forEach((kind, position) => {
      const entry = saved?.levels?.[index]?.[kind];
      if (Number.isInteger(entry?.points)) level[kind].points = Math.max(0, Math.min(maximum(index, position), entry.points));
      if (Number.isInteger(entry?.skill)) level[kind].skill = Math.max(0, Math.min(6, entry.skill));
    });
    return level;
  });
  const tables = Array.from({ length: 20 }, (_, index) => {
    const factors = saved?.tables?.[index];
    return Array.isArray(factors) ? [...new Set(factors.filter(n => Number.isInteger(n) && n >= 1 && n <= 20))] : [];
  });
  return { levels, tables, active: Number.isInteger(saved?.active) ? saved.active : 0 };
}

const state = restore();
const points = index => Object.values(state.levels[index]).reduce((sum, kind) => sum + kind.points, 0);
const unlocked = index => stages.slice(0, index).every((_, previous) => points(previous) === target);
if (!stages[state.active] || !unlocked(state.active)) state.active = 0;
const seen = stages.map(() => []);
let current;
let streak = 0;
let answered = false;
let storageFailed = false;
let mode = "journey";
let table = 1;
let lastFactor = 0;
let advanceTimer;
const shownLessons = new Set();

function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageFailed = true; }
}

function selectQuestion(index) {
  const kinds = stages[index][1];
  const progress = state.levels[index];
  const pending = kinds.filter((kind, position) => progress[kind].points < maximum(index, position));
  const pool = pending.length ? pending : kinds;
  const weights = pool.flatMap(kind => Array(1 + Math.floor((6 - progress[kind].skill) / 2)).fill(kind));
  const recent = seen[index];
  let question;
  for (let attempt = 0; attempt < 40; attempt++) {
    const kind = pick(weights);
    question = makeQuestion(kind, index, Math.min(2, Math.floor(progress[kind].skill / 2)));
    if (!recent.includes(question.prompt)) break;
  }
  recent.push(question.prompt);
  if (recent.length > 20) recent.shift();
  return question;
}

const elements = Object.fromEntries([
  "total", "overall", "mastered", "streak", "level-title", "level-count", "level-progress",
  "challenge", "answer-form", "answer", "submit", "next", "feedback", "help", "hint", "advance", "route",
  "journey-mode", "tables-mode", "journey-summary", "route-panel", "table-panel", "table-select",
  "table-progress", "table-count", "lesson", "lesson-title", "lesson-example", "keypad"
].map(id => [id, document.getElementById(id)]));

const allFactors = Array.from({ length: 20 }, (_, i) => i + 1);
elements["table-select"].replaceChildren(...allFactors.map(n => {
  const option = document.createElement("option");
  option.value = n;
  option.textContent = "× " + n;
  return option;
}));

function tableQuestion() {
  const pending = allFactors.filter(n => !state.tables[table - 1].includes(n));
  const pool = pending.length ? pending : allFactors;
  const alternatives = pool.filter(n => n !== lastFactor);
  const factor = pick(alternatives.length ? alternatives : pool);
  lastFactor = factor;
  return { prompt: `${table} × ${factor}`, answer: table * factor, factor, suffix: "", ...multiplication(table, factor) };
}

function drawProgress() {
  const inTables = mode === "tables";
  elements["journey-mode"].setAttribute("aria-pressed", String(!inTables));
  elements["tables-mode"].setAttribute("aria-pressed", String(inTables));
  elements["journey-summary"].hidden = inTables;
  elements["route-panel"].hidden = inTables;
  elements["table-panel"].hidden = !inTables;
  elements["level-progress"].hidden = inTables;
  elements["level-count"].hidden = inTables;
  if (inTables) {
    const count = state.tables[table - 1].length;
    elements["level-title"].textContent = `Table de ${table}`;
    elements["table-progress"].value = count;
    elements["table-count"].textContent = `${count}/20 produits réussis`;
    elements.advance.hidden = true;
    return;
  }
  const total = stages.reduce((sum, _, index) => sum + points(index), 0);
  const completed = stages.filter((_, index) => points(index) === target).length;
  elements.overall.value = total;
  elements.total.textContent = Math.floor(100 * total / (stages.length * target)) + " %";
  elements.mastered.textContent = storageFailed ? "Sauvegarde indisponible" : `${completed}/${stages.length} niveaux maîtrisés`;
  elements.streak.textContent = streak > 1 ? `${streak} bonnes réponses de suite` : "";
  elements["level-title"].textContent = `${state.active + 1}. ${stages[state.active][0]}`;
  elements["level-count"].textContent = `${points(state.active)} / ${target}`;
  elements["level-progress"].value = points(state.active);
  elements.route.replaceChildren(...stages.map(([name], index) => {
    const button = document.createElement("button");
    const detail = document.createElement("small");
    const open = unlocked(index);
    button.type = "button";
    button.className = "stage";
    button.textContent = `${index + 1}. ${name}`;
    detail.textContent = !open ? "Verrouillé" : points(index) === target ? "Maîtrisé ✓" : `${points(index)} / ${target}`;
    button.append(detail);
    button.disabled = !open;
    if (index === state.active) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => {
      if (index !== state.active) openLevel(index);
    });
    return button;
  }));
  const nextLevel = state.active + 1;
  elements.advance.hidden = !stages[nextLevel] || !unlocked(nextLevel);
  elements.advance.textContent = stages[nextLevel] ? `Niveau suivant · ${stages[nextLevel][0]} →` : "";
}

function newQuestion(focus = false) {
  clearTimeout(advanceTimer);
  current = mode === "tables" ? tableQuestion() : selectQuestion(state.active);
  const [title, example] = current.lesson;
  elements["lesson-title"].textContent = title;
  elements["lesson-example"].textContent = example;
  elements.lesson.open = !shownLessons.has(title);
  shownLessons.add(title);
  answered = false;
  elements.challenge.textContent = current.prompt;
  elements.hint.textContent = current.hint;
  elements.help.open = false;
  elements.answer.value = "";
  elements.answer.readOnly = false;
  elements.feedback.textContent = "";
  elements.feedback.className = "feedback";
  elements.submit.hidden = false;
  elements.next.hidden = true;

  if (focus) elements.answer.focus();
}

function openLevel(index) {
  state.active = index;
  save();
  drawProgress();
  newQuestion();
  elements.challenge.scrollIntoView({ block: "nearest" });
  elements.answer.focus();
}

function parseAnswer(value) {
  const input = value.trim().replace(/[\u202f\u00a0 ]/g, "").replace(",", ".");
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input) ? Number(input) : NaN;
}

function submitAnswer(automatic = false) {
  if (answered) return;
  const value = parseAnswer(elements.answer.value);
  if (!Number.isFinite(value)) {
    if (automatic) return;
    elements.feedback.textContent = "Saisissez un nombre, par exemple 12 ou 2,5.";
    elements.feedback.className = "feedback try";
    return;
  }
  const correct = Math.abs(value - current.answer) < 1e-8;
  if (automatic && !correct) {
    const typed = elements.answer.value.replace(/[\s.,]/g, "").replace(/^0+(?=\d)/, "");
    const expected = format(current.answer).replace(/[\s.,]/g, "").replace(/^0+(?=\d)/, "");
    const needsDecimal = !Number.isInteger(current.answer) && !/[.,]/.test(elements.answer.value);
    if (needsDecimal || /[.,]$/.test(elements.answer.value) || typed.length < Math.max(1, expected.length)) return;
  }
  answered = true;
  streak = correct ? streak + 1 : 0;
  let milestone = "";
  if (mode === "tables") {
    const factors = state.tables[table - 1];
    if (correct && !factors.includes(current.factor)) {
      factors.push(current.factor);
      if (factors.length === 20) milestone = "Table complète !";
    }
  } else {
    const index = state.active;
    const progress = state.levels[index][current.kind];
    const position = stages[index][1].indexOf(current.kind);
    const before = points(index);
    progress.skill = correct ? Math.min(6, progress.skill + 1) : Math.max(0, progress.skill - 2);
    if (correct) progress.points = Math.min(maximum(index, position), progress.points + 1);
    if (before < target && points(index) === target) {
      milestone = index === stages.length - 1 ? "Parcours terminé !" : "Niveau suivant débloqué !";
    }
  }
  save();
  drawProgress();
  elements.feedback.textContent = correct ? milestone || "Bien joué !" : `Réponse : ${format(current.answer)}${current.suffix}.`;
  elements.feedback.className = correct ? "feedback good" : "feedback try";
  elements.answer.readOnly = true;
  elements.submit.hidden = true;
  elements.next.hidden = correct && !milestone;
  if (!correct) elements.help.open = true;
  if (correct && !milestone) advanceTimer = setTimeout(() => newQuestion(), 850);
}

elements["answer-form"].addEventListener("submit", event => {
  event.preventDefault();
  if (answered && !elements.next.hidden) newQuestion(true);
  else submitAnswer();
});
elements.answer.addEventListener("input", () => submitAnswer(true));
elements.keypad.addEventListener("click", event => {
  const key = event.target.closest("[data-key]")?.dataset.key;
  if (!key || answered) return;
  const input = elements.answer;
  if (key === "erase") input.value = input.value.slice(0, -1);
  else if (key === ",") {
    if (/[.,]/.test(input.value)) return;
    input.value = (input.value || "0") + key;
  } else if (input.value.length < 20) input.value += key;
  if (key !== "erase") submitAnswer(true);
});
elements.submit.addEventListener("click", () => submitAnswer());
elements.next.addEventListener("click", () => newQuestion());
elements.advance.addEventListener("click", () => openLevel(state.active + 1));
function openMode(nextMode) {
  if (nextMode === mode) return;
  mode = nextMode;
  streak = 0;
  drawProgress();
  newQuestion();
}
elements["journey-mode"].addEventListener("click", () => openMode("journey"));
elements["tables-mode"].addEventListener("click", () => openMode("tables"));
elements["table-select"].addEventListener("change", event => {
  table = Number(event.target.value);
  lastFactor = 0;
  drawProgress();
  newQuestion();
});
drawProgress();
newQuestion();
