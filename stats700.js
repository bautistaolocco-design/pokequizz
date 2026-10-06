'use strict';
const STAT_LABELS=['PS','Ataque','Defensa','Ataque Especial','Defensa Especial','Velocidad'];
const STAT_SHORT=['PS','ATQ','DEF','AT. ESP.','DEF. ESP.','VEL'];
const STATS_STORAGE='poke-reto-700-v3';
let statsGame=null,statsSpinning=false;
const isInfinite700=()=>typeof infiniteMode!=='undefined'&&infiniteMode;
const pokemon700=id=>mons.find(m=>m.id===id);
const finalEligible700=()=>eligible().filter(m=>m.final);
const customStats700=()=>STAT_LABELS.map((_,stat)=>{const choice=statsGame?.choices.find(c=>c.stat===stat);return choice?pokemon700(choice.pokemon).stats[stat]:0;});
const total700=()=>customStats700().reduce((sum,value)=>sum+value,0);
const active700=()=>!!statsGame&&statsGame.choices.length<6;
const dailyBuilding700=()=>!!statsGame&&!isInfinite700()&&!statsGame.battle?.finished;

function legendaryPool700(){
 const selected=eligible().filter(m=>m.legendary&&!m.mythical);
 const all=mons.filter(m=>m.legendary&&!m.mythical);
 return selected.length?selected:all;
}
function dailyLegend700(){
 const pool=legendaryPool700();
 if(typeof dailyDistinctOrder==='function')return dailyDistinctOrder(pool,'stats700-legendary')[0];
 return pool[0];
}
function read700(){
 if(isInfinite700())return null;
 try{
  const data=JSON.parse(localStorage.getItem(STATS_STORAGE));
  if(!data||data.day!==dayKey()||!validGeneration(data.gen)||!Array.isArray(data.queue)||data.queue.length!==6||new Set(data.queue).size!==6||!Array.isArray(data.choices)||data.choices.length>6)return null;
  if(!data.queue.every(id=>mons.some(m=>m.id===id&&m.final&&inGeneration(m,data.gen))))return null;
  if(!data.choices.every((c,i)=>c&&Number.isInteger(c.stat)&&c.stat>=0&&c.stat<6&&c.pokemon===data.queue[i])||new Set(data.choices.map(c=>c.stat)).size!==data.choices.length)return null;
  const legend=pokemon700(data.legend),champion=data.champion?pokemon700(data.champion):null;
  if(!legend?.legendary||data.champion&&!champion)return null;
  let battle=null;
  if(data.battle){
   const b=data.battle;
   if(!champion||![b.playerHp,b.playerMax,b.enemyHp,b.enemyMax,b.turn].every(Number.isFinite)||!Array.isArray(b.log))return null;
   battle={playerHp:b.playerHp,playerMax:b.playerMax,enemyHp:b.enemyHp,enemyMax:b.enemyMax,turn:b.turn,log:b.log.slice(-6).map(String),finished:!!b.finished,won:!!b.won};
  }
  return{day:data.day,gen:data.gen,queue:[...data.queue],choices:data.choices.map(c=>({stat:c.stat,pokemon:c.pokemon})),champion:champion?.id||null,legend:legend.id,battle};
 }catch{return null;}
}
function save700(){if(isInfinite700())return;try{localStorage.setItem(STATS_STORAGE,JSON.stringify(statsGame));}catch{}}
function new700(){
 if(active700()||dailyBuilding700())return false;
 const daily=!isInfinite700(),pool=finalEligible700();
 const queue=(daily&&typeof dailyDistinctOrder==='function'?dailyDistinctOrder(pool,'stats700-roulette'):shuffle(pool)).slice(0,6).map(m=>m.id);
 statsGame={day:dayKey(),gen:generation,queue,choices:[],champion:null,legend:daily?dailyLegend700().id:null,battle:null};
 save700();$('feedback').replaceChildren();render700();return true;
}

function render700(revealed=false){
 if(isInfinite700())return renderInfinite700(revealed);
 statsSpinning=false;
 const step=statsGame.choices.length,statsDone=step===6,battleDone=!!statsGame.battle?.finished;
 score=total700();$('generation').disabled=!battleDone;$('restart').disabled=true;$('restart').textContent=battleDone?'✓ Partida de hoy completada':'Sin saltos · desafío en curso';
 $('score').textContent=String(score).padStart(3,'0');
 $('progress').textContent=battleDone?'BATALLA TERMINADA':statsGame.battle?`TURNO ${statsGame.battle.turn}`:statsGame.champion?'BATALLA FINAL':statsDone?'ELEGÍ TU POKÉMON':`ESTADÍSTICA ${step+1} / 6`;
 if(statsGame.battle)return renderBattle700();
 if(statsGame.champion)return beginBattle700();
 $('game').innerHTML='<p class="grid-instructions">Construí las seis estadísticas de tu campeón eligiendo una por cada Pokémon de la ruleta. Después elegí qué Pokémon usará esos valores y enfrentá al <b>legendario del día</b>. No podés saltar Pokémon.</p><div id="pokemon700-stage"></div><div class="stats700-slots" aria-label="Estadísticas de tu campeón"></div><p class="grid-note">Los valores permanecen ocultos hasta elegirlos. La ruleta solo usa etapas evolutivas finales y la partida queda guardada en este navegador.</p>';
 if(!statsDone){
  const m=pokemon700(statsGame.queue[step]);$('pokemon700-stage').innerHTML=`<div class="random700"><img src="${spriteUrl(m.sprite)}" alt="${m.name}" width="160" height="160"><div><span class="eyebrow">RULETA · ELECCIÓN ${step+1} DE 6</span><h3>${m.name}</h3><p>${typeBadges(m)}</p><small>Elegí una estadística sin conocer su valor</small></div></div>`;
 }else renderChampionPicker700();
 renderSlots700(statsDone);
 if(!statsDone&&!revealed)spin700(step);
}

function renderInfinite700(revealed=false){
 statsSpinning=false;
 const done=!active700(),step=statsGame.choices.length,total=total700();score=total;
 $('generation').disabled=!done;$('restart').disabled=!done;$('restart').textContent=done?'↻ Nueva partida':'Sin saltos · partida en curso';
 $('score').textContent=String(total).padStart(3,'0');$('progress').textContent=done?'PARTIDA TERMINADA':`POKÉMON ${step+1} / 6`;
 $('game').innerHTML='<p class="grid-instructions">Sumá <b>700 puntos o más</b> eligiendo una estadística de cada Pokémon. Usá las seis estadísticas, una vez cada una, sin ver sus valores. No podés saltar Pokémon.</p><div class="target700"><span id="target700-label"></span><progress id="target700-meter" max="700" value="0" aria-label="Puntos hacia la meta de 700"></progress></div><div id="pokemon700-stage"></div><div class="stats700-slots" aria-label="Estadísticas disponibles"></div><p class="grid-note">Solo aparecen Pokémon en su etapa evolutiva final. Estadísticas base de las formas base. El Pokémon cambia solo después de elegir y no se puede saltar.</p>';
 $('target700-label').textContent=`${total} / 700 · ${total>=700?'¡Meta alcanzada!':`Faltan ${700-total} puntos`}`;$('target700-meter').value=Math.min(total,700);
 if(!done){
  const m=pokemon700(statsGame.queue[step]);$('pokemon700-stage').innerHTML=`<div class="random700"><img src="${spriteUrl(m.sprite)}" alt="${m.name}" width="160" height="160"><div><span class="eyebrow">TU POKÉMON ALEATORIO</span><h3>${m.name}</h3><p>${typeBadges(m)}</p><small>#${String(m.id).padStart(3,'0')} · Generación ${m.gen}</small></div></div>`;
 }else{
  $('pokemon700-stage').innerHTML=`<div class="result result700"><span class="eyebrow">SEIS ESTADÍSTICAS COMPLETADAS</span><h3>${total>=700?'¡Superaste el Reto 700!':'¡Te faltó un poco!'}</h3><p>${total>=700?`Sumaste ${total} puntos. ¡Gran selección!`:`Sumaste ${total} puntos. Faltaron ${700-total} para la meta.`}</p><button id="new700" class="play-again">Otra partida aleatoria</button></div>`;$('new700').onclick=new700;
 }
 renderSlots700(done);
 if(!done&&!revealed)spin700(step);
 if(done&&typeof markDailyPlayed==='function')markDailyPlayed('stats700',total>=700);
}

function renderSlots700(disabled){
 const board=document.querySelector('.stats700-slots');
 STAT_LABELS.forEach((label,stat)=>{
  const chosen=statsGame.choices.find(c=>c.stat===stat),b=document.createElement('button');b.type='button';b.className='stat700-slot';b.disabled=!!chosen||disabled;
  const name=document.createElement('b');name.textContent=label;const value=document.createElement('strong');value.textContent=chosen?pokemon700(chosen.pokemon).stats[stat]:disabled?'—':'?';const note=document.createElement('span');note.textContent=chosen?pokemon700(chosen.pokemon).name:'Elegir esta estadística';
  if(chosen)b.classList.add('used');b.append(name,value,note);
  if(!disabled&&!chosen){const expected=statsGame.queue[statsGame.choices.length],expectedStep=statsGame.choices.length;b.onclick=()=>choose700(stat,expected,expectedStep);}
  board.append(b);
 });
}

function renderChampionPicker700(){
 const stage=$('pokemon700-stage'),legend=pokemon700(statsGame.legend),stats=customStats700();
 stage.innerHTML=`<div class="champion700-picker"><div><span class="eyebrow">TUS ESTADÍSTICAS ESTÁN LISTAS</span><h3>Elegí a tu Pokémon</h3><p>La especie que elijas conservará su tipo y apariencia, pero peleará con los seis valores que construiste.</p></div><div class="custom-stat-grid">${STAT_SHORT.map((name,i)=>`<span><small>${name}</small><b>${stats[i]}</b></span>`).join('')}</div><div class="legend-tease"><img src="${spriteUrl(legend.sprite)}" alt="Silueta del legendario rival"><span><small>RIVAL DEL DÍA</small><b>Legendario misterioso</b></span></div><form id="champion700-form"><label for="champion700-input">Tu Pokémon</label><input id="champion700-input" autocomplete="off" placeholder="Escribí un nombre…" required><button class="next" type="submit">Elegir y revelar rival</button></form></div>`;
 const rival=stage.querySelector('.legend-tease img');rival.classList.add('silhouette');autocomplete('champion700-input');
 $('champion700-form').onsubmit=e=>{e.preventDefault();selectChampion700($('champion700-input').value);};
}

function selectChampion700(value){
 if(isInfinite700()||statsGame.choices.length!==6||statsGame.champion)return false;
 const name=typeof resolvePrediction==='function'?resolvePrediction(value):value,m=findPokemon(name);
 if(!m){$('feedback').textContent='Elegí un Pokémon de las generaciones seleccionadas.';return false;}
 statsGame.champion=m.id;save700();$('feedback').textContent=`¡${m.name} será tu campeón! El legendario del día está por aparecer.`;beginBattle700();return true;
}

function beginBattle700(){
 if(!statsGame.champion)return;
 if(!statsGame.battle){
  const s=customStats700(),legend=pokemon700(statsGame.legend);
  statsGame.battle={playerHp:140+s[0]*2,playerMax:140+s[0]*2,enemyHp:160+legend.stats[0]*2,enemyMax:160+legend.stats[0]*2,turn:1,log:[`¡Un ${legend.name} salvaje apareció!`],finished:false,won:false};save700();
 }
 renderBattle700();
}

function hpPercent700(value,max){return Math.max(0,Math.min(100,Math.round(value/max*100)));}
function renderBattle700(){
 const champion=pokemon700(statsGame.champion),legend=pokemon700(statsGame.legend),b=statsGame.battle,s=customStats700();
 $('score').textContent=String(total700()).padStart(3,'0');$('progress').textContent=b.finished?'BATALLA TERMINADA':`TURNO ${b.turn}`;
 $('game').innerHTML=`<div class="final700-battle"><p class="grid-instructions">Tu ${champion.name} usa las estadísticas que construiste. En cada turno ambos Pokémon actúan y la <b>Velocidad decide quién ataca primero</b>.</p><div class="battle700-arena"><article class="fighter700 enemy"><div class="fighter700-info"><span>LEGENDARIO DEL DÍA</span><h3>${legend.name}</h3><div class="hp700"><i style="width:${hpPercent700(b.enemyHp,b.enemyMax)}%"></i></div><small>${Math.max(0,b.enemyHp)} / ${b.enemyMax} PS</small></div><img src="${spriteUrl(legend.sprite)}" alt="${legend.name}"></article><b class="versus700">VS</b><article class="fighter700 player"><img src="${spriteUrl(champion.sprite)}" alt="${champion.name}"><div class="fighter700-info"><span>TU CAMPEÓN · ${total700()} PUNTOS</span><h3>${champion.name}</h3><div class="hp700"><i style="width:${hpPercent700(b.playerHp,b.playerMax)}%"></i></div><small>${Math.max(0,b.playerHp)} / ${b.playerMax} PS</small></div></article></div><div class="custom-stat-grid compact">${STAT_SHORT.map((name,i)=>`<span><small>${name}</small><b>${s[i]}</b></span>`).join('')}</div><div class="battle700-log" aria-live="polite">${b.log.map(line=>`<p>${line}</p>`).join('')}</div><div class="battle700-actions"></div></div>`;
 const actions=document.querySelector('.battle700-actions');
 if(b.finished){
  actions.innerHTML=`<div class="result result700"><span class="eyebrow">DESAFÍO DIARIO COMPLETADO</span><h3>${b.won?'¡Victoria legendaria!':'El legendario ganó esta vez'}</h3><p>${b.won?`${champion.name} derrotó a ${legend.name}.`:`${legend.name} resistió el desafío. Mañana tendrás una nueva combinación.`}</p></div>`;
  if(typeof markDailyPlayed==='function')markDailyPlayed('stats700',b.won);return;
 }
 actions.innerHTML='<button type="button" data-action="physical"><b>Ataque físico</b><small>Usa Ataque contra Defensa</small></button><button type="button" data-action="special"><b>Ataque especial</b><small>Usa At. Esp. contra Def. Esp.</small></button><button type="button" data-action="defend"><b>Defender</b><small>Reduce el golpe rival y recupera PS</small></button>';
 actions.querySelectorAll('button').forEach(button=>button.onclick=()=>battleTurn700(button.dataset.action));
}

function damage700(attack,defense){return Math.max(14,Math.min(90,Math.round(22+attack*.42-defense*.17)));}
function battleTurn700(action){
 const b=statsGame?.battle;if(!b||b.finished||!['physical','special','defend'].includes(action))return;
 const s=customStats700(),legend=pokemon700(statsGame.legend),champion=pokemon700(statsGame.champion),enemySpecial=damage700(legend.stats[3],s[4])>damage700(legend.stats[1],s[2]),enemyDamage=enemySpecial?damage700(legend.stats[3],s[4]):damage700(legend.stats[1],s[2]);
 const playerDamage=action==='special'?damage700(s[3],legend.stats[4]):damage700(s[1],legend.stats[2]),playerFirst=s[5]>=legend.stats[5],lines=[];
 const playerAttack=()=>{b.enemyHp=Math.max(0,b.enemyHp-playerDamage);lines.push(`${champion.name} usó ${action==='special'?'Ataque especial':'Ataque físico'} e hizo ${playerDamage} de daño.`);};
 const enemyAttack=()=>{const dealt=action==='defend'?Math.max(7,Math.round(enemyDamage*.45)):enemyDamage;b.playerHp=Math.max(0,b.playerHp-dealt);lines.push(`${legend.name} respondió con un ataque ${enemySpecial?'especial':'físico'} e hizo ${dealt} de daño.`);};
 if(action==='defend'){
  const healed=Math.min(24,b.playerMax-b.playerHp);b.playerHp+=healed;lines.push(`${champion.name} se protegió${healed?` y recuperó ${healed} PS`:''}.`);enemyAttack();
 }else if(playerFirst){playerAttack();if(b.enemyHp>0)enemyAttack();}
 else{enemyAttack();if(b.playerHp>0)playerAttack();}
 b.log=[...b.log,...lines].slice(-6);b.turn++;
 if(b.enemyHp<=0||b.playerHp<=0){b.finished=true;b.won=b.enemyHp<=0;b.log.push(b.won?`¡${champion.name} derrotó a ${legend.name}!`:`${legend.name} ganó el combate.`);}
 save700();renderBattle700();
}

function spin700(step){
 statsSpinning=true;const stage=$('pokemon700-stage'),pool=finalEligible700(),expected=statsGame.queue[step];
 for(const b of document.querySelector('.stats700-slots').children)b.disabled=true;
 let ticks=0;
 function tick(){
  if(current!=='stats700'||statsGame.choices.length!==step||statsGame.queue[step]!==expected)return;
  if(ticks++>=10){statsSpinning=false;render700(true);return;}
  const m=pool[Math.floor(Math.random()*pool.length)];stage.innerHTML=`<div class="random700 roulette700"><img src="${spriteUrl(m.sprite)}" alt="" width="160" height="160"><div><span class="eyebrow">GIRANDO LA RULETA…</span><h3>${m.name}</h3><p>¿Quién te va a tocar?</p></div></div>`;timeout=setTimeout(tick,100);
 }
 tick();
}
function choose700(stat,expectedPokemon,expectedStep){
 if(current!=='stats700'||statsSpinning||!active700()||!Number.isInteger(stat)||stat<0||stat>5||expectedStep!==statsGame.choices.length||expectedPokemon!==statsGame.queue[expectedStep]||statsGame.choices.some(c=>c.stat===stat))return{ok:false};
 const m=pokemon700(expectedPokemon),points=m.stats[stat];statsGame.choices.push({stat,pokemon:expectedPokemon});save700();const complete=!active700();render700();$('feedback').textContent=complete?'Completaste las seis estadísticas. Ahora elegí el Pokémon que enfrentará al legendario.':`${m.name} aportó ${points} puntos de ${STAT_LABELS[stat]}.`;return{ok:true,points,total:total700(),complete};
}

const startBefore700=start;
start=function(game){
 if(game!=='stats700'){$('generation').disabled=false;$('restart').disabled=false;return startBefore700(game);}
 clearTimeout(timeout);clearInterval(clock);$('grid-dialog').close();current=game;$('feedback').replaceChildren();
 if(!statsGame)statsGame=read700();
 if(statsGame&&(active700()||dailyBuilding700())){generation=statsGame.gen;$('generation').value=generation;}
 document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game)));
 $('pool-count').textContent=`${finalEligible700().length} Pokémon finales disponibles`;$('game-label').textContent=isInfinite700()?'SEIS ELECCIONES · UNA META':'CREÁ TU CAMPEÓN';$('game-title').textContent=isInfinite700()?'Reto 700 · Infinito':'Reto 700 · Batalla legendaria';$('daily-label').hidden=true;
 if(!statsGame)new700();else render700();
};
const generationBefore700=$('generation').onchange;
$('generation').onchange=()=>{if(current==='stats700'&&(active700()||dailyBuilding700())){$('generation').value=statsGame.gen;generation=statsGame.gen;return;}generationBefore700();};
$('restart').onclick=()=>{if(current==='stats700'){if(isInfinite700()&&!active700())new700();return;}start(current);};
