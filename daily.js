'use strict';
const DAILY_ZONE='America/Argentina/Buenos_Aires',DAILY_RESET_HOUR=9;
function dayKey(now=new Date()){const shifted=new Date(now.getTime()-DAILY_RESET_HOUR*60*60*1000),parts=new Intl.DateTimeFormat('en-CA',{timeZone:DAILY_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(shifted);const val=t=>parts.find(p=>p.type===t).value;return `${val('year')}-${val('month')}-${val('day')}`;}
let playingDay=dayKey(),connectionMode='normal',connectionGroups=[],connectionOrder=[],connectionSolved=[],connectionSelection=[],connectionErrors=0,connectionFinished=false;
function seededRandom(key){let h=2166136261;for(const ch of key){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function priorDayKey(date=dayKey()){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}
function stableNumber(key){let h=2166136261;for(const ch of String(key)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function dailyChoiceIndex(length,key,date=dayKey()){if(length<2)return 0;const ordinal=Math.floor(Date.parse(`${date}T00:00:00Z`)/86400000);return(stableNumber(key)+ordinal)%length;}
function dailyChallengeSeed(game,date=dayKey()){const gens=generation==='all'?'all':generation.split(',').sort((a,b)=>Number(a)-Number(b)).join(',');return `poke-shared-v2:${date}:${game}:${gameDifficulty}:${gens}`;}
function dailyDistinctOrder(items,key,signature=item=>item?.id??String(item),date=dayKey()){
 const current=seededShuffle(items,seededRandom(`${dailyChallengeSeed(key,date)}:order`));if(current.length<2)return current;
 const previous=seededShuffle(items,seededRandom(`${dailyChallengeSeed(key,priorDayKey(date))}:order`));
 if(signature(current[0])===signature(previous[0])){const swap=current.findIndex((item,index)=>index>0&&signature(item)!==signature(previous[0]));if(swap>0)[current[0],current[swap]]=[current[swap],current[0]];}
 return current;
}
const dailyStorageKey=(game,mode='')=>`poke-daily-v7:${playingDay}:${generation}:${game}:${gameDifficulty}:${mode}${game==='top10'?':simple-v1':game==='grid'?':criteria-v1':''}`;
function readDaily(game,mode=''){try{return JSON.parse(localStorage.getItem(dailyStorageKey(game,mode)))||null;}catch{return null;}}
function writeDaily(game,data,mode=''){try{localStorage.setItem(dailyStorageKey(game,mode),JSON.stringify(data));}catch{}}
function dailyCaption(){return `DESAFÍO DIARIO · ${playingDay.split('-').reverse().join('/')} · CAMBIA A LAS 09:00 DE ARGENTINA`;}
function showDaily(){const e=$('daily-label');e.hidden=!['grid','top10','connections'].includes(current);e.textContent=dailyCaption();$('restart').textContent=['grid','top10','connections'].includes(current)?'↻ Volver al desafío':'↻ Reiniciar';}
function ensureToday(){if(dayKey()===playingDay)return true;playingDay=dayKey();start(current);$('feedback').textContent='¡Llegó un nuevo día! Este es el desafío de hoy.';return false;}
function dailyTopSpec(){
 const pool=eligible(),specs=[
  {category:'total',pool,title:'Los 10 Pokémon con mayor suma de estadísticas'},
  {category:'weight',pool,title:'Los 10 Pokémon más pesados'},
  {category:'height',pool,title:'Los 10 Pokémon más altos'}
 ];
 const dayNumber=Math.floor(Date.parse(`${playingDay}T00:00:00Z`)/86400000);
 return specs[(dayNumber+(generation==='all'?0:generation.split(',').reduce((a,n)=>a+Number(n),0)))%specs.length];
}
function dailyTopPool(){return dailyTopSpec().pool;}
function saveTopDaily(){writeDaily('top10',{found:topFound,deadline,finished:topFinished,started:topStarted},topMode);}
function saveGridDaily(){writeDaily('grid',{answers:gridCells.map(c=>c.answer?{id:c.answer.id,shiny:!!c.shiny}:null)});}
function suggestionsFor(value){const key=normalizeName(value.trim());if(!key)return[];return eligible().filter(m=>normalizeName(m.name).includes(key)).sort((a,b)=>Number(normalizeName(b.name).startsWith(key))-Number(normalizeName(a.name).startsWith(key))||a.id-b.id).slice(0,6);}
function resolvePrediction(value){const exact=findPokemon(value);return exact?.name||suggestionsFor(value)[0]?.name||value;}
function autocomplete(inputId){
 const input=$(inputId);if(!input||input.dataset.autocomplete)return;input.dataset.autocomplete='true';input.removeAttribute('list');
 const list=document.createElement('div');list.id=`${inputId}-suggestions`;list.className='pokemon-suggestions';list.setAttribute('role','listbox');list.hidden=true;input.insertAdjacentElement('afterend',list);
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',list.id);input.setAttribute('aria-expanded','false');
 let predictions=[],active=0;
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function paint(){list.replaceChildren();list.hidden=!predictions.length;input.setAttribute('aria-expanded',String(!!predictions.length));predictions.forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.id=`${inputId}-option-${m.id}`;b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===active));b.tabIndex=-1;const sprite=document.createElement('img');sprite.src=`${spriteUrl(m.sprite)}`;sprite.alt='';sprite.width=42;sprite.height=42;const name=document.createElement('span');name.textContent=m.name;b.append(sprite,name);b.onmousedown=e=>e.preventDefault();b.onclick=()=>{input.value=m.name;close();input.focus();};list.append(b);});if(predictions.length)input.setAttribute('aria-activedescendant',`${inputId}-option-${predictions[active].id}`);}
 input.oninput=()=>{predictions=suggestionsFor(input.value);active=0;paint();};input.onblur=close;
 input.onkeydown=e=>{if(e.isComposing)return;if(e.key==='Escape'){close();return;}if(!list.hidden&&predictions.length){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+predictions.length)%predictions.length;paint();}else if(e.key==='Enter'){e.preventDefault();input.value=predictions[active].name;close();input.form.requestSubmit();}}};
}
const legacyStart=start;
start=function(game){
 const infinite=typeof infiniteMode!=='undefined'&&infiniteMode;
 playingDay=dayKey();try{localStorage.setItem('poke-generation',generation);}catch{}
 if(game==='connections'){
  clearTimeout(timeout);clearInterval(clock);$('grid-dialog').close();current=game;score=0;$('feedback').replaceChildren();document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game)));$('pool-count').textContent=`${eligible().length} Pokémon disponibles`;$('game-label').textContent='ENCONTRÁ LO QUE TIENEN EN COMÚN';$('game-title').textContent='Conexiones Pokémon';renderConnectionSetup();update();$('progress').textContent='GRUPOS 0 / 4';
 }else{
  activeRandom=infinite||game==='stats700'?Math.random:seededRandom(dailyChallengeSeed(game,playingDay));
  legacyStart(game);
  if(game==='grid'&&!infinite){const saved=readDaily('grid');if(Array.isArray(saved?.answers))saved.answers.slice(0,gridCells.length).forEach((entry,i)=>{const id=typeof entry==='object'?entry?.id:entry,mon=gridCells[i]?.candidates.find(m=>m.id===id);if(mon){gridCells[i].answer=mon;gridCells[i].shiny=!!(typeof entry==='object'&&entry.shiny);}});score=gridCells.filter(c=>c.answer).length*100;renderGrid();}
 }
 if(infinite)$('daily-label').hidden=true;else showDaily();
};
renderTopSetup=function(){
 topCategory=dailyTopSpec().category;
 $('game').innerHTML='<div class="top-setup"><p>Completá el Top 10 de hoy. La consigna usa todos los Pokémon de la generación elegida y una categoría fácil de reconocer.</p><h3 id="daily-top-title"></h3><fieldset><legend>Modo de juego</legend><label><input type="radio" name="top-mode" value="normal"> Normal</label><label><input type="radio" name="top-mode" value="timed"> 2 minutos</label></fieldset><p class="grid-note">Misma consigna durante todo el día. Formas base, incluidos legendarios. Empates: menor número de Pokédex. El avance se guarda por generación y modo en este navegador.</p><button id="begin-top" class="next">Jugar desafío de hoy</button></div>';
 $('daily-top-title').textContent=dailyTopSpec().title;document.querySelector(`input[name="top-mode"][value="${topMode}"]`).checked=true;$('begin-top').onclick=()=>{topMode=document.querySelector('input[name="top-mode"]:checked').value;beginTop();};
};
const legacyBeginTop=beginTop;
beginTop=function(){if(!ensureToday())return;topCategory=dailyTopSpec().category;const saved=readDaily('top10',topMode);legacyBeginTop();if(saved?.started){topFound=Array.isArray(saved.found)?[...new Set(saved.found.filter(id=>topAnswers.some(m=>m.id===id)))]:[];score=topFound.length*100;if(Number.isFinite(saved.deadline))deadline=saved.deadline;renderTop();if(saved.finished||topFound.length===10)finishTop(topFound.length===10?'¡Ya completaste el desafío de hoy!':'Tu desafío de hoy ya terminó. Mañana habrá otro.');else if(topMode==='timed'&&Date.now()>=deadline)finishTop('¡Se terminó el tiempo!');}saveTopDaily();};
const legacyRenderTop=renderTop;
renderTop=function(){legacyRenderTop();$('top-heading').textContent=dailyTopSpec().title;autocomplete('top-answer');};
const legacyTopAnswer=checkTopAnswer;
checkTopAnswer=function(name){if(!ensureToday())return{ok:false,message:'El desafío se renovó. Empezá el de hoy.'};const result=legacyTopAnswer(resolvePrediction(name));if(result.ok)saveTopDaily();return result;};
const legacyFinishTop=finishTop;
finishTop=function(message){legacyFinishTop(message);$('give-up').textContent='Volver al desafío de hoy';saveTopDaily();};
const legacyGridAnswer=checkGridAnswer;
checkGridAnswer=function(index,name){const infinite=typeof infiniteMode!=='undefined'&&infiniteMode;if(!infinite&&!ensureToday())return{ok:false,message:'El desafío se renovó. Elegí una casilla del nuevo día.'};const result=legacyGridAnswer(index,resolvePrediction(name));if(result.ok&&!infinite){const mon=gridCells[index]?.answer,capture=typeof window.captureDailyGridPokemon==='function'?window.captureDailyGridPokemon(mon,index):{shiny:false,newEntry:false};result.message+=capture.shiny?' ✨ ¡Apareció shiny y quedó guardado en tu Pokédex!':capture.newEntry?' ¡Nuevo registro en tu Pokédex!':' Ya estaba registrado en tu Pokédex.';saveGridDaily();}return result;};
const legacyOpenCell=openCell;
openCell=function(index){legacyOpenCell(index);autocomplete('pokemon-answer');};
function connectionRules(pool,mode){
 const rules=[],add=(id,label,test)=>rules.push({id,label,test});
 for(const type of Object.keys(typeNames).map(Number)){
  if(mode==='easy')add(`type-${type}`,`Tipo ${typeNames[type]}`,m=>m.types.includes(type));
  else{add(`single-${type}`,`Solo tipo ${typeNames[type]}`,m=>m.types.length===1&&m.types.includes(type));add(`dual-${type}`,`Doble tipo, uno es ${typeNames[type]}`,m=>m.types.length===2&&m.types.includes(type));}
 }
 const tagLabels={starter:'Pokémon iniciales',fossil:'Pokémon fósiles',pseudo:'Pseudolegendarios',ultra:'Ultraentes',paradox:'Pokémon paradoja',regional:'Formas regionales',alola:'Formas de Alola',galar:'Formas de Galar',hisui:'Formas de Hisui',mega:'Megaevoluciones',gmax:'Formas Gigamax',stone:'Evolucionan con piedra',trade:'Evolucionan por intercambio',friendship:'Evolucionan por amistad',branch:'Tienen evolución ramificada',ash:'Pokémon de Ash',brock:'Pokémon de Brock',misty:'Pokémon de Misty',dawn:'Pokémon de Dawn',rocket:'Pokémon del Team Rocket'};
 const easyTags=['starter','fossil','ash','brock','misty','rocket'],normalTags=['pseudo','regional','stone','trade','friendship','branch','dawn'],hardTags=['mega','gmax','alola','galar','hisui','ultra','paradox'];
 [...easyTags,...mode==='easy'?[]:normalTags,...mode==='hard'?hardTags:[]].forEach(tag=>add(`tag-${tag}`,tagLabels[tag],m=>tag==='ash'?m.ash:m.impostorTags.includes(tag)));
 for(let gen=1;gen<=9;gen++)add(`generation-${gen}`,`Debutaron en ${regionNames[gen-1]}`,m=>m.gen===gen);
 add('legend','Pokémon legendarios',m=>m.legendary);add('myth','Pokémon singulares',m=>m.mythical);add('baby','Pokémon bebés',m=>m.baby);
 if(mode!=='easy'){
  const abilityLabels={5:'Robustez',22:'Intimidación',26:'Levitación',31:'Pararrayos',34:'Clorofila',65:'Espesura',66:'Mar Llamas',67:'Torrente'};
  Object.entries(abilityLabels).forEach(([ability,label])=>add(`ability-${ability}`,`Habilidad ${label}`,m=>m.abilities.includes(Number(ability))));
  add('light','Pesan menos de 10 kg',m=>m.weight<100);add('heavy','Pesan 100 kg o más',m=>m.weight>=1000);add('short','Miden menos de 0,6 m',m=>m.height<6);add('tall','Miden 2 m o más',m=>m.height>=20);
 }
 if(mode==='hard'){
  const statNames=['PS','Ataque','Defensa','Ataque Especial','Defensa Especial','Velocidad'];
  statNames.forEach((name,index)=>add(`best-stat-${index}`,`${name} es su estadística más alta`,m=>m.stats[index]===Math.max(...m.stats)));
  add('high-total','Total base de 500 o más',m=>m.total>=500);add('low-total','Total base menor a 350',m=>m.total<350);add('final-evolved','Etapa final con preevolución',m=>m.final&&m.evolved);add('single-stage','No tienen línea evolutiva',m=>m.final&&!m.evolved);
 }
 return rules.map(r=>({...r,candidates:pool.filter(r.test)})).filter(r=>r.candidates.length>=4&&r.candidates.length<=pool.length-4);
}
function buildConnections(pool,mode,key){
 const rng=seededRandom(key);let rules=connectionRules(pool,mode);
 for(let phase=0;phase<2;phase++){
  for(let attempt=0;attempt<1800;attempt++){
   const selected=seededShuffle(rules,rng).slice(0,4);if(selected.length<4)continue;
   const candidates=selected.map((r,i)=>r.candidates.filter(m=>selected.every((other,j)=>i===j||!other.test(m))));
   if(candidates.some(c=>c.length<4))continue;
   return selected.map((r,i)=>({id:r.id,label:r.label,members:seededShuffle(candidates[i],rng).slice(0,4)}));
  }
  rules=connectionRules(pool,'easy');
 }
 throw new Error('No hay cuatro grupos disponibles.');
}
function renderConnectionSetup(){
 $('game').innerHTML='<div class="top-setup"><p>Encontrá cuatro grupos de cuatro Pokémon que compartan una conexión.</p><p class="grid-note">Las conexiones pueden ser tipos, generaciones, evoluciones, habilidades, estadísticas, formas especiales o equipos de entrenadores. Fácil muestra las categorías; Medio permite errores ilimitados; Experto termina al quinto error.</p><button id="begin-connections" class="next">Jugar desafío de hoy</button></div>';
 $('begin-connections').onclick=beginConnections;
}
function saveConnections(){writeDaily('connections',{solved:connectionSolved,errors:connectionErrors,finished:connectionFinished},connectionMode);}
function beginConnections(){
 if(!ensureToday())return;const pool=eligible(),baseKey=`v2:${playingDay}:${generation}:connections:${connectionMode}`,previousKey=`v2:${priorDayKey(playingDay)}:${generation}:connections:${connectionMode}`,signature=groups=>groups.map(g=>`${g.id}:${g.members.map(m=>m.id).sort((a,b)=>a-b).join('-')}`).sort().join('|'),previous=buildConnections(pool,connectionMode,previousKey);connectionGroups=buildConnections(pool,connectionMode,baseKey);
 for(let salt=1;signature(connectionGroups)===signature(previous)&&salt<=64;salt++)connectionGroups=buildConnections(pool,connectionMode,`${baseKey}:retry-${salt}`);
 connectionOrder=seededShuffle(connectionGroups.flatMap(g=>g.members),seededRandom(`v2:${playingDay}:${generation}:${connectionMode}:order`));
 const saved=readDaily('connections',connectionMode);connectionSolved=Array.isArray(saved?.solved)?[...new Set(saved.solved.filter(id=>connectionGroups.some(g=>g.id===id)))]:[];
 connectionErrors=Number.isInteger(saved?.errors)&&saved.errors>=0?saved.errors:0;connectionSelection=[];connectionFinished=!!saved?.finished||connectionSolved.length===4||(connectionMode==='hard'&&connectionErrors>=5);score=connectionSolved.length*100;renderConnections();
}
function renderConnections(){
 $('game').innerHTML='<p class="grid-instructions">Seleccioná 4 Pokémon con algo en común y comprobá el grupo.</p><p id="connection-hints" class="grid-note"></p><div class="solved-connections"></div><div class="connections-board" role="group" aria-label="Elegir cuatro Pokémon relacionados"></div><div class="connection-controls"><span id="connection-status"></span><button id="clear-connections" class="subtle">Deseleccionar</button><button id="submit-connections" class="next">Comprobar grupo</button></div><p id="connection-result" role="status" aria-live="polite"></p>';
 $('connection-hints').textContent=connectionMode==='easy'?`Categorías: ${connectionGroups.map(g=>g.label).join(' · ')}`:'';
 connectionGroups.filter(g=>connectionSolved.includes(g.id)||(connectionFinished&&!connectionSolved.includes(g.id))).forEach(g=>{const e=document.createElement('div');e.className='solved-group';if(!connectionSolved.includes(g.id))e.classList.add('revealed');const h=document.createElement('b');h.textContent=g.label;const names=document.createElement('span');names.textContent=g.members.map(m=>m.name).join(' · ');e.append(h,names);document.querySelector('.solved-connections').append(e);});
 if(!connectionFinished)connectionOrder.filter(m=>!connectionGroups.some(g=>connectionSolved.includes(g.id)&&g.members.some(x=>x.id===m.id))).forEach(m=>{const b=document.createElement('button');b.className='connection-card';b.setAttribute('aria-pressed',String(connectionSelection.includes(m.id)));b.innerHTML=`<img src="${spriteUrl(m.sprite)}" alt=""><span>${m.name}</span>`;b.onclick=()=>toggleConnection(m.id);document.querySelector('.connections-board').append(b);});
 $('connection-status').textContent=`${connectionSelection.length} / 4 elegidos · ${connectionMode==='hard'?`${Math.max(0,5-connectionErrors)} errores restantes`:`${connectionErrors} errores`}`;
 $('submit-connections').disabled=connectionSelection.length!==4||connectionFinished;$('clear-connections').disabled=connectionFinished||!connectionSelection.length;
 $('submit-connections').onclick=submitConnection;$('clear-connections').onclick=()=>{connectionSelection=[];renderConnections();};
 if(connectionFinished){typeof markDailyPlayed==='function'&&markDailyPlayed('connections',connectionSolved.length===4);$('connection-result').textContent=connectionSolved.length===4?'¡Encontraste las cuatro conexiones! Desafío de hoy completado.':'Se agotaron los 5 errores. Estas eran las conexiones de hoy.';}
 update();$('progress').textContent=`GRUPOS ${connectionSolved.length} / 4`;
}
function toggleConnection(id){if(connectionFinished||!ensureToday())return;const available=connectionOrder.some(m=>m.id===id)&&!connectionGroups.some(g=>connectionSolved.includes(g.id)&&g.members.some(m=>m.id===id));if(!available)return;const index=connectionSelection.indexOf(id);if(index>=0)connectionSelection.splice(index,1);else if(connectionSelection.length<4)connectionSelection.push(id);renderConnections();}
function submitConnection(){
 if(connectionFinished||connectionSelection.length!==4||!ensureToday())return{ok:false};
 const found=connectionGroups.find(g=>!connectionSolved.includes(g.id)&&g.members.every(m=>connectionSelection.includes(m.id)));
 if(found){connectionSolved.push(found.id);score+=100;connectionSelection=[];connectionFinished=connectionSolved.length===4;saveConnections();renderConnections();$('feedback').textContent=`¡Correcto! ${found.label}. +100 puntos.`;return{ok:true};}
 connectionErrors++;const nearly=connectionGroups.some(g=>!connectionSolved.includes(g.id)&&g.members.filter(m=>connectionSelection.includes(m.id)).length===3);connectionFinished=connectionMode==='hard'&&connectionErrors>=5;saveConnections();renderConnections();$('feedback').textContent=nearly?'¡Casi! Tres Pokémon pertenecen al mismo grupo.':'Todavía no. Buscá otra conexión.';return{ok:false};
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&dayKey()!==playingDay&&['grid','top10','connections'].includes(current))ensureToday();});
try{const preferred=localStorage.getItem('poke-generation');if(preferred&&validGeneration(preferred)){generation=preferred;$('generation').value=generation;}}catch{}
start('grid');
