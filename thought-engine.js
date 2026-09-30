"use strict";

// Pure local semantic adapter. No network requests or user-input logging.
(function (root) {
  const domains = {
    travel: { match: /\b(travel|trip|flight|train|journey|holiday|vacation|snowboard\w*|skiing|ski|thanksgiving|beach|hiking|visit|destination)\b|旅行|旅游|滑雪|感恩节/i, label: "a trip", concerns: ["conditions", "crowds", "escape", "travel effort", "experience"], rows: [
      ["practical", "conditions", "I want {activity} to feel worth the journey.", "The conditions for {activity} matter more than the photos."],
      ["uncertainty", "crowds", "I’m wondering how crowded {time} might feel.", "Sharing a destination with a crowd could change the trip."],
      ["emotion", "escape", "Perhaps this trip is about getting some distance from my routine.", "A different pace might matter more than a different place."],
      ["tradeoff", "travel effort", "I don’t want to spend the whole break traveling.", "Getting to {place} could use up the energy I hoped to recover."],
      ["desire", "experience", "This trip should feel different from an ordinary vacation.", "I’m picturing what I would remember about {activity}."],
      ["memory", "company", "I’m thinking about who I’d enjoy sharing {activity} with.", "Past trips shape what I hope to find in {place}."] ] },
    food: { match: /\b(eat|eating|food|dinner|lunch|breakfast|hungry|meal|tea|coffee|cook\w*|pizza|noodles|sushi|restaurant)\b|吃|饿|餐|咖啡/i, label: "a meal", concerns: ["comfort", "effort", "familiarity", "energy", "cost"], rows: [
      ["desire", "comfort", "I want something warm.", "A comforting meal matters more than an impressive one."],
      ["practical", "effort", "I don’t want to spend too much time deciding what to eat.", "Cooking {object} might take more energy than I have tonight."],
      ["memory", "familiarity", "Maybe I’m craving something familiar.", "There’s a meal I associate with feeling looked after."],
      ["emotion", "energy", "I could be more tired than hungry.", "Choosing {object} feels harder when I’m worn out."],
      ["tradeoff", "cost", "The price of {object} is part of what I’m weighing.", "Convenience and the cost of a meal are pulling in different directions."],
      ["uncertainty", "company", "Eating alone or with someone would change what I feel like having.", "I’m wondering whether I want food or a reason to take a break."] ] },
    home: { match: /\b(home|house|housing|apartment|rent|city|move|moving|live|living|relocat\w*)\b|搬|住房|住哪里|回家/i, label: "where to live", concerns: ["belonging", "cost", "independence", "identity", "stability"], rows: [
      ["emotion", "belonging", "I want to stay close to people I care about.", "Living in {place} would change who I see on ordinary days."],
      ["practical", "cost", "I’m thinking about housing costs more than I want to admit.", "Rent could decide how much freedom I have in {place}."],
      ["desire", "independence", "Part of me wants somewhere completely new.", "Having space of my own matters in this move."],
      ["uncertainty", "identity", "I’m not sure whether I’m choosing a city or choosing a life.", "The move {time} feels tied to who I’m becoming."],
      ["memory", "stability", "I’m comparing a future home with places where I felt settled.", "A familiar address might offer comfort without feeling like mine."],
      ["tradeoff", "opportunity", "Where I live will shape the opportunities I can reach.", "A place that feels safe might also feel limiting."] ] },
    work: { match: /\b(work|job|career|internship\w*|interview\w*|resume|cv|hiring|unemploy\w*|office|boss|coworker|promotion|deadline)\b|实习|工作|职业|面试/i, label: "my work", concerns: ["opportunity", "confidence", "fit", "comparison", "security"], rows: [
      ["practical", "opportunity", "Finding {object} feels like a lot of effort without a clear timeline.", "I’m wondering how much energy the search for {object} will take."],
      ["emotion", "confidence", "I’m afraid of what a rejection might make me believe about myself.", "Waiting to hear about {object} can make my confidence feel fragile."],
      ["desire", "fit", "Learning something meaningful matters to me in {object}.", "I want {object} to fit the person I’m becoming."],
      ["tradeoff", "comparison", "Other people’s progress is changing how I judge my own.", "My idea of success in {object} might come from someone else."],
      ["uncertainty", "security", "I’m wondering how long I can afford to wait for {object}.", "Stability and curiosity don’t always point toward the same work."],
      ["memory", "confidence", "I’m remembering a time my work was appreciated.", "Past feedback follows me into the search for {object}."] ] },
    relationship: { match: /\b(friend\w*|love|relationship|family|partner|someone|miss|lonely|breakup|dating|talk to|text\w*)\b|朋友|关系|想念|孤独|分手/i, label: "this connection", concerns: ["absence", "memory", "boundaries", "uncertainty", "closeness"], rows: [
      ["emotion", "absence", "I miss the ordinary conversations more than I expected.", "Their absence shows up in small parts of my day."],
      ["memory", "memory", "I’m wondering whether I miss them or who I was around them.", "Some memories of {person} feel closer than the present."],
      ["tradeoff", "boundaries", "Missing someone doesn’t settle whether contact would feel right.", "Part of me values the distance that now exists between us."],
      ["uncertainty", "uncertainty", "There are things about the silence that I still don’t understand.", "I don’t know if {person} remembers our connection the same way."],
      ["desire", "closeness", "I wish there were somewhere for the things I never said.", "Feeling understood by {person} is what I keep returning to."],
      ["practical", "contact", "I’m imagining what hearing from {person} would actually feel like.", "A conversation with {person} might carry more weight than I expect."] ] },
    school: { match: /\b(school|college|university|class|course|exam|study|studying|homework|degree|graduat\w*|semester|major|thesis)\b|学校|学习|毕业|考试/i, label: "my studies", concerns: ["pressure", "interest", "time", "identity", "support"], rows: [
      ["emotion", "pressure", "My expectations around {object} are becoming heavy.", "A result in {object} can feel bigger than one piece of work."],
      ["desire", "interest", "I’m wondering what I actually enjoy learning in {object}.", "Curiosity and good grades don’t always ask the same thing of me."],
      ["practical", "time", "There’s only so much time I can give {object}.", "Rest keeps getting squeezed out by my studies."],
      ["uncertainty", "identity", "I’m imagining who I’ll be when this stage of school ends.", "The path beyond {object} still feels hard to picture."],
      ["tradeoff", "support", "Asking for help with {object} can feel unexpectedly difficult.", "I’m comparing my pace at school with everyone else’s."],
      ["memory", "interest", "I’m remembering what first made me curious about {object}.", "An earlier school experience may be shaping this expectation."] ] },
    money: { match: /\b(money|budget|saving\w*|debt|loan|afford|salary|bills|finance\w*|expensive|cost|buy|purchase)\b|钱|预算|存款|债|工资/i, label: "my finances", concerns: ["security", "freedom", "tradeoff", "pressure", "future"], rows: [
      ["emotion", "security", "Having enough for {object} would help me feel safer.", "Uncertainty about money takes up more space than I expected."],
      ["desire", "freedom", "I’m thinking about what money would let me say no to.", "Some of this wish for {object} is a wish for freedom."],
      ["tradeoff", "tradeoff", "Spending on {object} means postponing something else.", "Present comfort and future security are competing for the same money."],
      ["practical", "pressure", "I’m wondering how much room my budget really has.", "Keeping track of {object} takes energy too."],
      ["uncertainty", "future", "It’s hard to picture which future expense I’m preparing for.", "I don’t know what amount would finally feel like enough."],
      ["memory", "security", "Earlier experiences with money still shape this decision.", "What I learned about spending may not match what I need now."] ] },
    creative: { match: /\b(creative|creativity|art|design|project|paint\w*|write|writing|novel|music|film|website|portfolio|photograph\w*|make something)\b|创作|设计|作品|写作|绘画/i, label: "this project", concerns: ["expression", "audience", "perfection", "time", "direction"], rows: [
      ["desire", "expression", "There’s something I want {object} to say that I can’t quite name.", "Making {object} could help me understand what I’m feeling."],
      ["emotion", "audience", "I’m wondering whose reaction I’m imagining while making {object}.", "Showing unfinished work can feel unusually personal."],
      ["tradeoff", "perfection", "Wanting {object} to be good might be keeping it unfinished.", "Polishing the work and discovering the work need different kinds of time."],
      ["practical", "time", "I’m thinking about how much space {object} can have in my day.", "The scale of {object} may be bigger than my available energy."],
      ["uncertainty", "direction", "I’m not sure which part of {object} I’m most curious to follow.", "There might be more than one version of this project worth making."],
      ["memory", "expression", "I’m remembering what made me start {object} in the first place.", "An old creative impulse might still be hiding inside this work."] ] },
    wellbeing: { match: /\b(health|wellbeing|well-being|sleep|tired|exhaust\w*|stress\w*|anxiety|anxious|burnout|exercise|sick|pain|rest|overwhelm\w*)\b|健康|睡|累|焦虑|压力/i, label: "my wellbeing", concerns: ["energy", "rest", "expectations", "support", "routine"], rows: [
      ["emotion", "energy", "I’m noticing how much {object} affects the rest of my day.", "My energy may be lower than the demands I’m placing on it."],
      ["desire", "rest", "Rest sounds appealing, but giving myself time for it feels difficult.", "I wish caring for myself didn’t feel like another task."],
      ["tradeoff", "expectations", "I’m measuring my capacity against a version of myself with more energy.", "Slowing down could mean letting an expectation go."],
      ["practical", "support", "I’m wondering what kind of support would feel welcome.", "Explaining {object} to someone could take energy of its own."],
      ["uncertainty", "routine", "It’s hard to tell which parts of my routine leave me depleted.", "A gentler day might look different from the one I planned."],
      ["memory", "rest", "I’m remembering a time when rest came more easily.", "My idea of feeling well may need room to change."] ] },
    decision: { match: /\b(should|choose|choice|decid\w*|decision|whether|which|plan|planning|better|or)\b|选择|决定|应该|计划/i, label: "this choice", concerns: ["values", "tradeoff", "uncertainty", "expectations", "reversibility"], rows: [
      ["desire", "values", "With {anchor}, I’m wondering what matters most to me.", "One part of {anchor} keeps drawing my attention."],
      ["tradeoff", "tradeoff", "Choosing around {anchor} may mean letting another possibility go.", "The easiest version of {anchor} may not be the most satisfying."],
      ["uncertainty", "uncertainty", "I’m unsure what I still need to know about {anchor}.", "Waiting for certainty about {anchor} has a cost of its own."],
      ["emotion", "expectations", "Other people’s expectations may be shaping {anchor}.", "I’m imagining how I’d feel once {anchor} was settled."],
      ["practical", "reversibility", "I’m wondering which parts of {anchor} could change later.", "Some parts of {anchor} may be easier to try than to predict."],
      ["memory", "values", "An earlier choice might be influencing how I see {anchor}.", "I’m comparing {anchor} with something I’ve already lived through."] ] }
  };
  const stop = new Set("i im i'm me my we our you your a an the is am are was were be been to of for in on at and but or it this that something someone any what where when why how should would could can do dont don't not want good choice after about finding with have has feel feels more than really anymore".split(" "));
  const normalize = s => String(s || "").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
  const tokens = s => normalize(s).toLowerCase().match(/[\p{L}\p{N}]+(?:'[\p{L}]+)?/gu) || [];
  const clip = (s, max = 38) => s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
  const hash = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0);
  const extract = (text, regex) => [...new Set(text.match(regex) || [])];
  function parseThought(input, chain = []) {
    const text = normalize(input);
    const history = chain.length ? chain.map(n => ({ ...n, text: normalize(n.text) })) : [{ type: "original", text }];
    const original = history[0].text;
    // Original domain stays stable; all selected nodes contribute to concerns and keywords.
    const scores = Object.entries(domains).map(([key, d]) => [key, (d.match.test(original) ? 10 : 0) + history.reduce((n, item) => n + (d.match.test(item.text) ? 1 : 0), 0)]);
    if (/\b(move|live|living|home|housing)\b/i.test(original)) scores.find(x => x[0] === "home")[1] += 8;
    if (/\b(internship|job|career|interview)\b/i.test(original)) scores.find(x => x[0] === "work")[1] += 8;
    if (/\b(snowboard\w*|ski|skiing)\b/i.test(original)) scores.find(x => x[0] === "travel")[1] += 8;
    scores.find(x => x[0] === "decision")[1] *= .4;
    scores.sort((a, b) => b[1] - a[1]);
    const category = scores[0][1] > 0 ? scores[0][0] : "open";
    const domain = domains[category];
    const context = history.map(n => n.text).join(" ");
    const keywords = [...new Set(tokens(original).filter(w => !stop.has(w)))].slice(0, 12);
    const contextKeywords = [...new Set(tokens(context).filter(w => !stop.has(w)))].slice(0, 60);
    const entities = {
      times: extract(original, /\b(?:Thanksgiving|Christmas|summer|winter|weekend|tonight|tomorrow|after graduation|next (?:week|month|year)|\d{4})\b/gi),
      activities: extract(original, /\b(?:snowboarding|skiing|hiking|cooking|writing|painting|traveling|studying)\b/gi),
      places: extract(original, /\b(?:in|to|near|from)\s+([A-Z][\p{L}-]+(?:\s+[A-Z][\p{L}-]+){0,2})/gu).map(s => s.replace(/^(?:in|to|near|from)\s+/, "")).filter(s => !/^(Thanksgiving|Christmas)$/.test(s)),
      people: extract(original, /\b(?:my (?:friend|partner|mother|father|family|ex|sister|brother)|someone)\b/gi)
    };
    const specific = keywords.find(w => /^(internship|job|interview|resume|coffee|tea|pizza|noodles|sushi|dinner|lunch|breakfast|rent|apartment|thesis|exam|degree|project|website|portfolio|novel|music|sleep|stress|pain|debt|loan|salary|car)$/.test(w));
    const objects = { food: "a meal", work: "a role", home: "a home", relationship: "this connection", school: "my studies", money: "my expenses", creative: "this project", wellbeing: "my wellbeing", travel: "this trip", decision: "this choice", open: "this thought" };
    const object = specific ? (/^(internship|interview|exam|apartment)$/.test(specific) ? "an " : /^(job|project|website|portfolio|novel|car|degree)$/.test(specific) ? "a " : "") + specific : objects[category];
    const last = history[history.length - 1];
    const focus = last.type === "association" ? last.concern || domain?.concerns.find(c => last.text.toLowerCase().includes(c)) || "uncertainty" : null;
    const intent = /\b(worried|worry|afraid|anxious)\b/i.test(original) ? "worry" : /\b(miss|remember|used to)\b/i.test(original) ? "memory" : /\b(should|where|what|which|choice|choose|whether)\b/i.test(original) ? "decision" : /\b(plan|going to|will)\b/i.test(original) ? "planning" : "exploration";
    return { input: text, original, category, topic: entities.activities[0] ? `${entities.activities[0]} trip` : specific || domain?.label || clip(keywords.join(" ")) || "an unfinished thought", intent: `${category === "open" ? "general" : category} ${intent}`, keywords, contextKeywords, entities, concerns: [...new Set([...history.map(n => n.concern).filter(Boolean), ...(domain?.concerns || ["meaning", "uncertainty", "attention", "desire", "memory"])])], tone: intent === "worry" ? "uncertain" : intent === "memory" ? "nostalgic" : intent === "decision" ? "practical" : "exploratory", focus, chain: history, object };
  }
  function slots(p) {
    return { object: p.object, activity: p.entities.activities[0] || "the trip", time: p.entities.times[0] || "the time I’m considering", place: p.entities.places[0] || "a new place", person: p.entities.people[0] || "them", anchor: `“${clip(p.keywords.join(" ") || p.original)}”` };
  }
  function fill(text, values) { return text.replace(/\{(\w+)\}/g, (_, k) => values[k] || "this thought"); }
  function similarity(a, b) {
    const synonyms = { want: "desire", wish: "desire", hoping: "desire", cost: "money", costs: "money", price: "money", crowded: "crowd", crowds: "crowd", tired: "energy", exhausted: "energy" };
    const set = text => new Set(tokens(text).filter(w => !stop.has(w)).map(w => synonyms[w] || w));
    const x = set(a), y = set(b);
    return [...x].filter(w => y.has(w)).length / Math.max(1, new Set([...x, ...y]).size);
  }
  function qualityFilter(candidates, chain = [], limit = 5) {
    const result = [], openings = new Map();
    for (const item of candidates) {
      const text = item.text.trim(), opening = tokens(text).slice(0, 2).join(" ");
      if (text.length < 16 || text.length > 112 || /\{\w+\}|Maybe this is a beginning|Something feels familiar|I wonder what I’m missing/i.test(text)) continue;
      if (result.some(x => x.concern === item.concern || similarity(x.text, text) > .62) || chain.some(x => normalize(x.text) === normalize(text) || similarity(x.text, text) > .8)) continue;
      if ((openings.get(opening) || 0) >= 2) continue;
      result.push({ ...item, text }); openings.set(opening, (openings.get(opening) || 0) + 1);
      if (result.length === limit) break;
    }
    return result;
  }
  function generateNextThoughts(p) {
    const values = slots(p), domain = domains[p.category], seed = hash(p.original);
    let candidates = [];
    if (p.focus) {
      // The selected concern is the subject of the next layer, not a new root topic.
      const subject = clip(`${p.focus} around ${p.entities.activities[0] || p.object}`, 46);
      const previous = p.chain.slice(1, -1).map(n => n.concern).filter(Boolean);
      const earlier = previous.length ? clip(previous.slice(-2).join(" and "), 30) : "my original question";
      const depthRows = [
        ["practical", "effort", `Making room for ${subject} could take more effort than I expected.`],
        ["emotion", "expectations", `My expectations about ${subject} may be adding pressure.`],
        ["memory", "memory", `Past experiences might explain why ${subject} matters to me.`],
        ["tradeoff", "tradeoff", `Focusing on ${subject} might leave less room for ${earlier}.`],
        ["desire", "values", `I’m trying to name what I hope ${subject} will give me.`],
        ["uncertainty", "uncertainty", `There’s still something about ${subject} I can’t predict.`],
        ["practical", "support", `Sharing the weight of ${subject} could change how it feels.`],
        ["desire", "freedom", `I’m wondering how much choice I have around ${subject}.`]
      ];
      candidates = depthRows.map(([angle, concern, text]) => ({ angle, concern, text }));
      if (p.category === "travel" && p.focus === "crowds") candidates = [
        { angle: "practical", concern: "time", text: `Long waits could take away the time I hoped to spend ${values.activity}.` },
        { angle: "emotion", concern: "space", text: `A busy ${values.time} trip might leave me wanting more room to myself.` },
        { angle: "tradeoff", concern: "timing", text: `I’m weighing a quieter trip against keeping the ${values.time} dates.` },
        { angle: "desire", concern: "company", text: "Sharing the slopes could feel lively, or it could feel overwhelming." },
        { angle: "uncertainty", concern: "expectations", text: "I’m wondering how much crowding would actually change my enjoyment." }, ...candidates];
    } else if (domain) {
      candidates = domain.rows.flatMap(([angle, concern, ...variants]) => {
        // Alternate variants are backstops for the quality filter, not unrelated presets.
        const offset = seed % variants.length;
        return variants.map((_, i) => ({ angle, concern, text: fill(variants[(i + offset) % variants.length], values) }));
      });
      if (p.category === "travel" && /snowboard|ski/i.test(p.original)) {
        candidates = candidates.filter(c => c.concern !== "conditions" && c.concern !== "crowds");
        candidates.unshift({ angle: "practical", concern: "conditions", text: "I want somewhere that already has reliable snow." }, { angle: "uncertainty", concern: "crowds", text: `I’m worried ${values.time} might make the trip crowded.` });
      }
      if (p.category === "home" && /\b(back|return)\b|回家/i.test(p.original)) candidates.unshift(
        { angle: "tradeoff", concern: "independence", text: "Moving back home could mean comfort and less independence at the same time." },
        { angle: "uncertainty", concern: "identity", text: `Returning home ${values.time} might feel different from visiting.` });
      if (p.category === "relationship" && !/miss|anymore|silence|breakup|used to|想念|分手/i.test(p.original)) candidates = [
        ["emotion", "closeness", "I’m thinking about what feeling close to {person} means to me."],
        ["practical", "time", "Making time for {person} is part of what I’m weighing."],
        ["tradeoff", "boundaries", "Closeness with {person} and space for myself both matter."],
        ["uncertainty", "expectations", "I’m unsure whether {person} and I expect the same things."],
        ["memory", "memory", "Past conversations shape how I understand {person}."]
      ].map(([angle, concern, text]) => ({ angle, concern, text: fill(text, values) }));
      // Ensure an actual object/place/time from the input appears even within broad topics.
      if (p.keywords.length && !candidates.slice(0, 5).some(c => p.keywords.some(k => c.text.toLowerCase().includes(k)))) candidates.unshift({ angle: "uncertainty", concern: "meaning", text: `I’m wondering what feels most important about ${values.anchor}.` });
    } else {
      // Only unclassified inputs reach this anchored fallback.
      candidates = domains.decision.rows.flatMap(([angle, concern, ...variants]) => variants.map(text => ({ angle, concern, text: fill(text, values) })));
    }
    let result = qualityFilter(candidates, p.chain);
    // Extra contextual variants handle long chains or heavily filtered candidates.
    if (result.length < 4) {
      const anchor = `“${clip(p.chain.at(-1).text, 30)}”`;
      const extras = ["I’m noticing a tension inside {anchor}.", "Living with {anchor} could change my ordinary day.", "There may be an expectation hidden in {anchor}.", "My past gives {anchor} a particular weight.", "I’m curious which part of {anchor} I could let change.", "Someone else might hear a different need in {anchor}."];
      result = qualityFilter([...result, ...extras.map((t, i) => ({ text: fill(t, { anchor }), angle: ["emotion", "practical", "uncertainty", "memory", "desire", "tradeoff"][i], concern: `reflection ${i}` }))], p.chain);
    }
    return result;
  }
  const api = { parseThought, generateNextThoughts, qualityFilter };
  root.ThoughtEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
