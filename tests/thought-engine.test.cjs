const assert = require('node:assert/strict');
const {parseThought,generateNextThoughts}=require('../thought-engine.js');
const cases=[['what to eat','food'],['where is a good choice for snowboarding in thanksgiving','travel'],['should I move back home after graduation','home'],['I’m worried about finding an internship','work'],['I miss someone I don’t talk to anymore','relationship'],['studying for an exam','school'],['worried about debt','money'],['working on a painting project','creative'],['I need more sleep','wellbeing'],['should I choose this or that','decision'],['purple clouds','open']];
for(const [input,topic] of cases){
 const p=parseThought(input);assert.equal(p.category,topic);
 const thoughts=generateNextThoughts(p);assert.equal(thoughts.length,5);assert.equal(new Set(thoughts.map(t=>t.text)).size,5);
 assert.ok(thoughts.every(t=>t.text.length<=130));
 if(topic==='travel'){assert.match(thoughts.map(t=>t.text).join(' '),/snow/);assert.match(thoughts.map(t=>t.text).join(' '),/thanksgiving/i);}
 if(topic==='work')assert.match(thoughts.map(t=>t.text).join(' '),/internship/);
 for(const selected of thoughts){
  const chain=[{type:'original',text:input},{type:'association',...selected}];
  for(let depth=0;depth<4;depth++){
   const next=generateNextThoughts(parseThought(input,chain));
   assert.ok(next.length>=4 && next.length<=6,`${topic} depth ${depth}: ${next.length}`);
   assert.ok(next.every(n=>!chain.some(c=>c.text===n.text)));
   chain.push({type:'association',...next[depth%next.length]});
  }
 }
 console.log(topic+': '+thoughts.map(t=>t.text).join(' | '));
}
assert.notDeepEqual(generateNextThoughts(parseThought('snowboarding trip')),generateNextThoughts(parseThought('hiking trip')));
console.log('PASS: topic classification, five distinct thoughts, length limits, entities, and 220 contextual continuation sets.');
