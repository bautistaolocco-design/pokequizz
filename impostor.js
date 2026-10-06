'use strict';
let impostorDeck=[],impostorRound=0,impostorAnswered=false;
function impostorRules(pool){
 const rules=[];
 const add=(id,family,label,test,negative='no cumple esa característica')=>rules.push({id,family,label,test,negative});
 for(const t of Object.keys(typeNames).map(Number))add(`type-${t}`,'tipos',`son de tipo ${typeNames[t]}`,m=>m.types.includes(t),m=>`es de tipo ${typeLabel(m)}`);
 for(const key of new Set(pool.filter(m=>m.types.length===2).map(m=>[...m.types].sort((a,b)=>a-b).join('-')))){const types=key.split('-').map(Number);add(`dual-${key}`,'tipos',`son de tipo ${types.map(t=>typeNames[t]).join(' / ')}`,m=>types.every(t=>m.types.includes(t)),m=>`es de tipo ${typeLabel(m)}`);}
 const tags=[['misty','entrenadores','formaron parte del equipo de Misty en el anime'],['brock','entrenadores','formaron parte del equipo de Brock en el anime'],['dawn','entrenadores','formaron parte del equipo de Dawn en el anime'],['rocket','entrenadores','acompañaron a Jessie y James como miembros de su equipo en el anime'],['starter','iniciales','pertenecen a las familias de los iniciales de Planta, Fuego o Agua'],['stone','evoluciones','pueden evolucionar usando una piedra evolutiva'],['trade','evoluciones','pueden evolucionar mediante intercambio'],['friendship','evoluciones','pueden evolucionar por amistad'],['branch','evoluciones','tienen más de una especie como evolución directa'],['regional','formas','tienen una variante regional'],['gmax','formas','tienen una forma Gigamax'],['fossil','fosiles','son Pokémon fósiles o sus evoluciones'],['pseudo','especiales','son pseudolegendarios en su etapa final'],['ultra','especiales','son Ultraentes'],['paradox','especiales','son Pokémon Paradoja']];
 for(const [tag,family,label] of tags)add(tag,family,label,m=>m.impostorTags.includes(tag));
 for(const [prop,family,label] of [['ash','entrenadores','formaron parte del equipo de Ash'],['mega','formas','tienen megaevolución'],['legendary','especiales','son legendarios'],['mythical','especiales','son singulares'],['baby','evoluciones','son Pokémon bebé'],['evolved','evoluciones','tienen una preevolución'],['final','evoluciones','no tienen otra evolución normal']])add(prop,family,label,m=>!!m[prop]);
 for(const gen of new Set(pool.map(m=>m.gen)))add(`gen-${gen}`,'generaciones',`debutaron en la generación ${gen}`,m=>m.gen===gen,m=>`debutó en la generación ${m.gen}`);
 for(const [stat,name] of [[1,'Ataque'],[2,'Defensa'],[5,'Velocidad']])for(const value of new Set(pool.map(m=>m.stats[stat])))add(`stat-${stat}-${value}`,'estadisticas',`tienen ${value} de ${name} base`,m=>m.stats[stat]===value,m=>`tiene ${m.stats[stat]} de ${name} base`);
 add('speed-over100','estadisticas','tienen más de 100 de Velocidad base',m=>m.stats[5]>100,m=>`tiene ${m.stats[5]} de Velocidad base`);
 for(const id of new Set(pool.flatMap(m=>m.abilities)))add(`ability-${id}`,'habilidades',`pueden tener la habilidad ${POKE_DATA.abilityNames[id]} (incluidas las ocultas)`,m=>m.abilities.includes(id),'no puede tener esa habilidad en su forma base');
 let available=rules.map(r=>({...r,yes:pool.filter(r.test),no:pool.filter(m=>!r.test(m))})).filter(r=>r.yes.length>=5&&r.no.length);
 if(gameDifficulty==='easy')available=available.filter(r=>['tipos','generaciones','entrenadores','iniciales'].includes(r.family));
 else if(gameDifficulty==='medium')available=available.filter(r=>!['estadisticas','habilidades'].includes(r.family));
 return available;
}
function buildImpostor(pool){
 const available=impostorRules(pool),chosen=[],families=new Set();
 while(chosen.length<5){
  let candidates=available.filter(c=>!chosen.some(x=>x.id===c.id));if(!candidates.length)break;
  const fresh=candidates.filter(c=>!families.has(c.family));if(fresh.length)candidates=fresh;
  const family=shuffle([...new Set(candidates.map(c=>c.family))])[0],rule=shuffle(candidates.filter(c=>c.family===family))[0];chosen.push(rule);families.add(rule.family);
 }
 return shuffle(chosen).map(c=>{const friends=shuffle(c.yes).slice(0,5),odd=shuffle(c.no)[0];return{members:shuffle([...friends,odd]),odd:odd.id,ruleId:c.id,family:c.family,label:c.label,negative:typeof c.negative==='function'?c.negative(odd):c.negative};});
}
function renderImpostor(){
 if(impostorRound>=impostorDeck.length){typeof markDailyPlayed==='function'&&markDailyPlayed('impostor',score/100/impostorDeck.length>.65);$('game').innerHTML=`<div class="result"><span class="eyebrow">IMPOSTORES DESCUBIERTOS</span><h3>${score/100} de ${impostorDeck.length}</h3><p>Sumaste ${score} puntos.</p><button id="impostor-again" class="next">Otra partida</button></div>`;$('impostor-again').onclick=()=>start('impostor');$('progress').textContent='PARTIDA TERMINADA';return;}
 impostorAnswered=false;$('progress').textContent=`RONDA ${impostorRound+1} / ${impostorDeck.length}`;
 $('game').innerHTML='<p class="grid-instructions">Cinco Pokémon comparten una característica: entrenadores, iniciales, habilidades, evoluciones, formas especiales, fósiles, estadísticas y más. <b>Eliminá al único que no pertenece al grupo.</b></p><div class="impostor-board" aria-label="Elegir al impostor"></div><div id="impostor-reveal"></div><p class="grid-note">Habilidades de las formas base, incluidas las ocultas. Los métodos de evolución pueden depender del juego o de una forma regional. Equipos del anime: miembros actuales y anteriores.</p>';
 const puzzle=impostorDeck[impostorRound],board=document.querySelector('.impostor-board');if(gameDifficulty==='easy')$('impostor-reveal').innerHTML=`<p class="difficulty-hint">Pista: la conexión pertenece a <b>${puzzle.family}</b>.</p>`;
 puzzle.members.forEach(m=>{const b=document.createElement('button');b.className='impostor-card';b.dataset.pokemon=String(m.id);b.innerHTML=`<img src="${spriteUrl(m.sprite)}" alt="" width="120" height="120"><b>${m.name}</b>`;const expected=impostorRound;b.onclick=()=>pickImpostor(m.id,expected);board.append(b);});
}
function pickImpostor(id,expectedRound){
 if(current!=='impostor'||impostorAnswered||expectedRound!==impostorRound||impostorRound>=impostorDeck.length)return{ok:false};
 const p=impostorDeck[impostorRound];if(!p.members.some(m=>m.id===id))return{ok:false};impostorAnswered=true;const correct=id===p.odd;if(correct)score+=100;
 $('score').textContent=String(score).padStart(3,'0');const odd=mons.find(m=>m.id===p.odd);
 for(const b of document.querySelector('.impostor-board').children){b.disabled=true;if(Number(b.dataset.pokemon)===p.odd)b.classList.add('impostor-found');else if(Number(b.dataset.pokemon)===id)b.classList.add('impostor-wrong');}
 $('feedback').textContent=correct?'¡Encontraste al impostor! +100 puntos.':'Ese Pokémon pertenece al grupo.';
 $('impostor-reveal').innerHTML=`<div class="impostor-explanation"><b>El impostor es ${odd.name}</b><p>Los otros cinco ${p.label}. ${odd.name} ${p.negative}.</p><button id="impostor-next" class="next">${impostorRound===impostorDeck.length-1?'Ver resultado':'Siguiente ronda'}</button></div>`;
 $('impostor-next').onclick=()=>{if(current!=='impostor'||!impostorAnswered||impostorRound!==expectedRound)return;impostorRound++;$('feedback').replaceChildren();renderImpostor();};return{ok:true,correct};
}
const startBeforeImpostor=start;
start=function(game){
 if(game!=='impostor')return startBeforeImpostor(game);
 clearTimeout(timeout);clearInterval(clock);$('grid-dialog').close();current=game;score=0;impostorRound=0;const pool=eligible();impostorDeck=buildImpostor(pool);
 if(typeof infiniteMode==='undefined'||!infiniteMode){const signature=deck=>deck.map(p=>`${p.ruleId}:${p.odd}`).join('|'),todaySeed=dailyChallengeSeed('impostor'),yesterdaySeed=dailyChallengeSeed('impostor',priorDayKey());activeRandom=seededRandom(yesterdaySeed);const previous=buildImpostor(pool);for(let salt=1;signature(impostorDeck)===signature(previous)&&salt<=64;salt++){activeRandom=seededRandom(`${todaySeed}:retry-${salt}`);impostorDeck=buildImpostor(pool);}activeRandom=seededRandom(todaySeed);}
 $('generation').disabled=false;$('restart').disabled=false;$('restart').textContent='↻ Reiniciar';$('feedback').replaceChildren();$('daily-label').hidden=true;
 $('pool-count').textContent=`${eligible().length} Pokémon disponibles`;$('game-label').textContent='UNO NO ENCAJA';$('game-title').textContent='El impostor';$('score').textContent='000';
 document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game)));renderImpostor();
};
