# One Possible Future

A static speculative experience: Present → Thought Unfolds → Trace → Future Artifact.

## Preview

Open `index.html` in a browser. No installation or build is needed.

Alternatively, from this directory run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit http://localhost:8080.

## Interaction

Enter any thought, select an association, and follow its growing trace. Select “See what remains” to reveal a future artifact. “Let the others return” restores the associations; “Return to this thought” preserves the input for editing; “Trace another thought” starts over.

## Extend

`script.js` contains `scenarios` (topic matching and association chains) and `artifactTemplates` (artifact types and content). Each association includes its own continuation and final theme. Templates currently render receipts, key tags, calendar fragments, postcards, tickets, and notes. The `variants` arrays reserve other formats for future renderers; they are not randomly selected. All content is local, with no image generation or network service.

`style.css` controls paper treatments, staggered mobile composition, line growth, and reduced-motion behavior.

## Contextual thought generation

`thought-engine.js` now replaces the old scenario presets:

- `parseThought(input, chain)` returns category, topic, intent, keywords, entities, concerns and tone. Local keyword scoring covers travel, food, housing, career, relationships, school, money, creative projects, wellbeing and general decisions.
- `generateNextThoughts(parsed)` combines topic variants with input objects, activities, dates and locations. It uses the selected concern and earlier chain nodes for subsequent layers.
- `qualityFilter` removes duplicate concerns, similar sentences, repeated openings, generic phrases and overly long text. Unclassified input receives a fallback anchored to its own words.
- `script.js` maintains the original and selected association nodes in `state.chain`. “Let this thought unfold” opens another contextual layer; “See what remains” reveals the artifact at any point.

This is deterministic local language matching, not full natural-language understanding. English has the broadest coverage; selected Chinese keywords are supported. Unusual phrasing, ambiguous entities and mixed topics can still require new rules. There is no text AI API configured.

A future server-side model adapter can replace parsing/generation while returning the same parsed fields and `{text, angle, concern}` association objects. Validate JSON and apply the existing quality filter before rendering; retain local generation for network or parse failures. Keep API credentials on the server.

Run regression checks with `node tests/thought-engine.test.cjs` from this directory. The tests cover the five requested examples, all ten categories, fallback, sentence limits, duplicate filtering and multi-level context.
