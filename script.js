"use strict";

// Template registry: add a renderer and variations here to extend the archive.
const artifactTemplates = {
  food: { type: "receipt", variants: ["receipt", "menu"], label: "RECEIPT", place: "Shanghai", title: "THE FAMILIAR TABLE", lines: ["2 bowls of noodles", "Jasmine tea", "Table 04"], footer: "Thank you for staying a little longer." },
  home: { type: "key-tag", variants: ["key tag", "address card"], label: "KEY TAG", place: "Shanghai", title: "A PLACE TO RETURN", lines: ["Room 04", "A key kept for you", "Come in when you arrive."], footer: "Somewhere familiar, again." },
  work: { type: "calendar", variants: ["calendar", "ID badge", "email fragment"], label: "CALENDAR / APRIL", place: "Personal calendar", title: "TIME SET ASIDE", lines: ["FRIDAY / 18", "09:00 — An hour of your own", "Leave this space open."], footer: "No agenda attached." },
  relationship: { type: "postcard", variants: ["postcard", "message", "voicemail transcript"], label: "POSTCARD", place: "To someone familiar", title: "THINKING OF YOU", lines: ["There was no special occasion.", "Just a quiet afternoon", "and something I wanted to tell you."], footer: "Until our next conversation." },
  travel: { type: "ticket", variants: ["ticket", "luggage tag"], label: "RAIL TICKET", place: "One unhurried journey", title: "THE LONG WAY HOME", lines: ["DEPARTURE 08:42", "Carriage 02 / Seat 04", "One passenger · Window seat"], footer: "Keep this part of the journey." },
  open: { type: "note", variants: ["note"], label: "A NOTE KEPT", place: "Somewhere, later", title: "FOR ANOTHER DAY", lines: ["A small thought stayed.", "It became something to return to.", "Leave a little room for it."], footer: "Found between the pages." }
};
const state = { thought: "", topic: null, direction: null, artifact: null, parsed: null, chain: [], branchBase: [] };
const $ = id => document.getElementById(id);
let transitionTimer;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function reveal(sectionId, headingId) {
  $(sectionId).hidden = false;
  $(headingId).focus({ preventScroll: true });
  $(sectionId).scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
}
function clearSelection() {
  clearTimeout(transitionTimer);
  state.direction = null;
  state.artifact = null;
  $("thought-space").classList.remove("has-selection");
  document.querySelectorAll(".association").forEach(button => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); button.disabled = false; });
  ["reconsider", "second-step", "future-step"].forEach(id => { $(id).hidden = true; });
}
function selectDirection(direction, selected) {
  clearSelection();
  state.direction = direction;
  state.chain = [...state.branchBase, {type: "association", ...direction}];
  $("thought-space").classList.add("has-selection");
  document.querySelectorAll(".association").forEach(button => { const active = button === selected; button.classList.toggle("selected", active); button.setAttribute("aria-pressed", String(active)); button.disabled = !active; });
  $("reconsider").hidden = false;
  const path = state.chain.map(node => node.text);
  $("trace-path").replaceChildren(...path.map((thought, index) => {
    const node = document.createElement("li");
    node.style.setProperty("--i", index);
    const number = document.createElement("span");
    number.className = "trace-number";
    number.textContent = `0${index + 1}`;
    const text = document.createElement("p");
    text.textContent = thought;
    node.append(number, text);
    return node;
  }));
  $("status").textContent = "Your thought is leaving a trace.";
  transitionTimer = setTimeout(() => reveal("second-step", "second-heading"), reducedMotion() ? 0 : 700);
}
$("thought-form").addEventListener("submit", event => {
  event.preventDefault();
  const thought = $("thought").value.trim();
  if (!thought) { $("input-error").textContent = "Write a thought before continuing."; $("thought").focus(); return; }
  clearSelection();
  state.thought = thought;
  state.chain = [{type: "original", text: thought}];
  state.parsed = ThoughtEngine.parseThought(thought, state.chain);
  state.topic = state.parsed.category;
  $("input-error").textContent = "";
  $("thought-summary").textContent = `“${thought}”`;
  $("center-thought").textContent = thought;
  $("thought-summary").hidden = false;
  $("edit-thought").hidden = false;
  $("thought-form").hidden = true;
  renderAssociations();
  $("status").textContent = "Five associations are unfolding around your thought.";
  reveal("first-step", "first-heading");
});
function renderAssociations() {
  state.branchBase = state.chain.map(node => ({...node}));
  $("center-thought").textContent = state.chain.at(-1).text;
  $("first-branches").replaceChildren(...ThoughtEngine.generateNextThoughts(state.parsed, state.chain).map((direction, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "association";
    button.style.setProperty("--delay", `${index * .14}s`);
    button.textContent = direction.text;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => selectDirection(direction, button));
    return button;
  }));
}
$("unfold-again").addEventListener("click", () => {
  if (!state.direction) return;
  clearSelection();
  state.parsed = ThoughtEngine.parseThought(state.thought, state.chain);
  renderAssociations();
  reveal("first-step", "first-heading");
});
$("reconsider").addEventListener("click", () => { clearSelection(); state.chain = [...state.branchBase]; document.querySelector(".association").focus(); });
function renderArtifact() {
  const template = artifactTemplates[state.topic] || artifactTemplates.open;
  $("artifact-coordinate").textContent = `${template.place.toUpperCase()} / A FRAGMENT FROM 2031`;
  const artifact = $("artifact");
  artifact.className = `artifact ${template.type}`;
  artifact.replaceChildren();
  const add = (tag, className, text) => { const element = document.createElement(tag); element.className = className; element.textContent = text; artifact.append(element); };
  add("p", "artifact-label", template.label);
  add("h3", "artifact-title", template.title);
  add("p", "artifact-place", template.place);
  add("p", "artifact-date", "2031.04.18");
  const lines = [...template.lines];
  if (state.topic === "food" && state.direction.concern === "rest") lines.splice(0, 3, "1 bowl of noodles", "Warm jasmine tea", "Table 04 / Take your time");
  if (state.topic === "food" && state.direction.concern === "ease") lines[0] = "The usual noodles";
  lines.forEach((line, index) => add("p", `artifact-item${index === 0 ? " artifact-first-item" : ""}`, line));
  add("p", "artifact-footer", template.footer);
  add("p", "artifact-stamp", `KEPT / 00418 · ${state.direction.concern.toUpperCase()}`);
  state.artifact = template.type;
  $("future-description").textContent = `A thought about ${state.parsed.topic} became a thought about ${state.direction.concern}.`;
}
$("reveal-artifact").addEventListener("click", () => {
  if (!state.direction) return;
  renderArtifact();
  reveal("future-step", "future-heading");
  $("status").textContent = "A future artifact has appeared.";
});
function returnToInput(reset) {
  clearSelection();
  ["first-step", "thought-summary", "edit-thought"].forEach(id => { $(id).hidden = true; });
  if (reset) { $("thought-form").reset(); Object.assign(state, { thought: "", topic: null, direction: null, artifact: null, parsed: null, chain: [], branchBase: [] }); }
  $("thought-form").hidden = false;
  $("input-error").textContent = "";
  $("status").textContent = reset ? "A new trace begins." : "Your thought is ready to edit.";
  $("thought").focus();
}
$("edit-thought").addEventListener("click", () => returnToInput(false));
$("restart").addEventListener("click", () => returnToInput(true));
