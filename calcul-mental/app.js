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

function makeQuestion(kind, level, intensity) {
  const tier = intensity + 1;
  let a, b, c, p, prompt, answer, hint, suffix = "";
  switch (kind) {
    case "add":
    case "sub": {
      const limits = [2 + tier * 3, 18 + tier * 10, 40 + tier * 30];
      a = random(1, limits[level]);
      b = random(1, kind === "add" ? limits[level] : a);
      prompt = kind === "add" ? `${a} + ${b}` : `${a} − ${b}`;
      answer = kind === "add" ? a + b : a - b;
      const tens = Math.floor(b / 10) * 10;
      const action = kind === "add" ? "Ajoutez" : "Retirez";
      hint = tens ? `${action} ${tens}, puis ${b - tens}.` :
        `${action} ${b} en comptant ${kind === "add" ? "vers le haut" : "vers le bas"} à partir de ${a}.`;
      break;
    }
    case "mul":
    case "div":
      a = random(2, level === 5 ? 22 + tier * 9 : level === 2 ? 12 + tier * 6 : 4 + tier * 2);
      b = random(2, level === 5 ? 12 + tier * 5 : 4 + tier * 2);
      if (kind === "mul") {
        prompt = `${a} × ${b}`;
        answer = a * b;
        hint = b < 10 ? `Calculez ${a} × ${b - 1}, puis ajoutez ${a}.` :
          `Décomposez ${b} en ${Math.floor(b / 10) * 10} + ${b % 10}, puis additionnez les deux produits.`;
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
  return { kind, prompt, answer, hint, suffix };
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
  return { levels, active: Number.isInteger(saved?.active) ? saved.active : 0 };
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
  "challenge", "answer-form", "answer", "submit", "next", "feedback", "help", "hint", "advance", "route"
].map(id => [id, document.getElementById(id)]));

function drawProgress() {
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
  current = selectQuestion(state.active);
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

elements["answer-form"].addEventListener("submit", event => {
  event.preventDefault();
  if (answered) {
    newQuestion(true);
    return;
  }
  const value = parseAnswer(elements.answer.value);
  if (!Number.isFinite(value)) {
    elements.feedback.textContent = "Saisissez un nombre, par exemple 12 ou 2,5.";
    elements.feedback.className = "feedback try";
    elements.answer.focus();
    return;
  }
  answered = true;
  const index = state.active;
  const progress = state.levels[index][current.kind];
  const position = stages[index][1].indexOf(current.kind);
  const before = points(index);
  const correct = Math.abs(value - current.answer) < 1e-8;
  if (correct) {
    streak++;
    progress.skill = Math.min(6, progress.skill + 1);
    progress.points = Math.min(maximum(index, position), progress.points + 1);
  } else {
    streak = 0;
    progress.skill = Math.max(0, progress.skill - 2);
    elements.help.open = true;
  }
  save();
  drawProgress();
  const mastered = before < target && points(index) === target;
  elements.feedback.textContent = correct
    ? mastered ? (index === stages.length - 1 ? "Parcours terminé !" : "Bravo, niveau suivant débloqué !") : "Bien joué !"
    : `Réponse : ${format(current.answer)}${current.suffix}.`;
  elements.feedback.className = correct ? "feedback good" : "feedback try";
  elements.answer.readOnly = true;
  elements.submit.hidden = true;
  elements.next.hidden = false;
  elements.next.focus();
});

elements.next.addEventListener("click", () => newQuestion(true));
elements.advance.addEventListener("click", () => openLevel(state.active + 1));
drawProgress();
newQuestion();
