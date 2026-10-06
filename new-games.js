'use strict';
const regionNames=['Kanto','Johto','Hoenn','Sinnoh','Teselia','Kalos','Alola','Galar / Hisui','Paldea'];
const genPanel=document.createElement('fieldset');genPanel.className='multi-generation';genPanel.innerHTML='<legend>Combiná generaciones</legend><span class="generation-actions"><button type="button" id="all-generations">Todas</button><button type="button" id="no-generations">Ninguna</button></span>';
$('generation').hidden=true;$('generation').insertAdjacentElement('afterend',genPanel);
regionNames.forEach((name,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=String(i+1);label.append(input,document.createTextNode(name));genPanel.append(label);input.onchange=()=>{const selected=[...genPanel.querySelectorAll('input:checked')].map(e=>e.value);if(!selected.length){input.checked=true;return;}generation=selected.length===9?'all':selected.join(',');start(current);};});
function syncGenerations(){genPanel.disabled=current==='stats700'&&active700();genPanel.querySelectorAll('input').forEach(e=>e.checked=generation==='all'||generation.split(',').includes(e.value));try{localStorage.setItem('poke-generation',generation);}catch{}}
$('all-generations').onclick=()=>{generation='all';start(current);};
function setGenerationGamesAvailable(available){document.body.classList.toggle('no-generation-selected',!available);document.querySelectorAll('[data-game],[data-infinite]').forEach(button=>button.disabled=!available);}
function clearGenerationSelection(){genPanel.querySelectorAll('input').forEach(input=>input.checked=false);setGenerationGamesAvailable(false);$('pool-count').textContent='Elegí al menos una región para jugar';}
$('no-generations').onclick=clearGenerationSelection;
let extraRound=0,extraAnswered=false,speedPair=[],evoPath=[],evoHidden=0,pokedleGuesses=[],pokedleTarget=null;
const monImage=m=>`<img src="${spriteUrl(m.sprite)}" alt="${m.name}" width="110" height="110">`;
const evoStage=m=>m.final?(m.evolved?'Etapa final':'Sin evolución'):m.evolved?'Intermedia':'Inicial';
const canonicalPokedexMons=mons.filter(m=>m.id<10000).sort((a,b)=>b.name.length-a.name.length);
function pokedexNumber(m){if(m.id<10000)return m.id;return canonicalPokedexMons.find(base=>m.name===base.name||m.name.startsWith(`${base.name} `))?.id||m.id;}
function pokemonColorId(m){return POKE_COLOR_IDS[pokedexNumber(m)]||0;}
function pokemonColorBadge(m){const id=pokemonColorId(m);return `<span class="pokedle-color color-${id}"><i aria-hidden="true"></i>${POKE_COLOR_NAMES[id]||'Desconocido'}</span>`;}
function pokedleKey(){return `pokedle-daily-v4:${dayKey()}:${generation}:${gameDifficulty}`;}
function savePokedle(){try{localStorage.setItem(pokedleKey(),JSON.stringify({target:pokedleTarget.id,guesses:pokedleGuesses}));}catch{}}
function loadPokedle(fresh=false){const pool=eligible();let saved=null;try{saved=JSON.parse(localStorage.getItem(pokedleKey()));}catch{}const target=pool.find(m=>m.id===saved?.target);if(!fresh&&target){pokedleTarget=target;pokedleGuesses=Array.isArray(saved.guesses)?[...new Set(saved.guesses)].filter(id=>pool.some(m=>m.id===id)):[];}else{const candidates=pool.filter(m=>m.id!==(target?.id||pokedleTarget?.id)),ordered=typeof dailyDistinctOrder==='function'?dailyDistinctOrder(candidates,'pokedle'):shuffle(candidates);pokedleTarget=ordered[0]||pool[0];pokedleGuesses=[];savePokedle();}}
function typeMatchState(guess,target){const a=new Set(guess.types),b=new Set(target.types);return a.size===b.size&&[...a].every(t=>b.has(t))?'right':[...a].some(t=>b.has(t))?'partial':'wrong';}
function renderPokedle(animate=false){
 const won=pokedleGuesses.includes(pokedleTarget.id);
 score=won?Math.max(100,700-pokedleGuesses.length*100):0;$('score').textContent=score;$('progress').textContent=`INTENTOS ${pokedleGuesses.length} · SIN LÍMITE`;
 const meanings={right:'Coincidencia exacta',partial:'Coincidencia parcial',wrong:'No coincide'};
 const cell=(state,text)=>{if(typeof state==='boolean')state=state?'right':'wrong';return `<td class="clue-${state}" aria-label="${meanings[state]}"><span class="sr-only">${meanings[state]}: </span>${text}</td>`;};
 const showDetails=gameDifficulty!=='expert';
 const rows=pokedleGuesses.map((id,i)=>{const m=mons.find(x=>x.id===id),exact=m.id===pokedleTarget.id,dex=pokedexNumber(m),targetDex=pokedexNumber(pokedleTarget),dexMatch=dex===targetDex,dexDirection=dexMatch?'=':dex<targetDex?'↑':'↓',color=pokemonColorId(m);return `<tr${animate&&i===pokedleGuesses.length-1?' class="pokedle-reveal"':''}><th scope="row" class="clue-${exact?'right':'wrong'}" aria-label="${exact?'Pokémon correcto':'Pokémon incorrecto'}">${m.name}</th>${cell(dexMatch,`#${String(dex).padStart(3,'0')} ${dexDirection}`)}${cell(typeMatchState(m,pokedleTarget),typeBadges(m))}${cell(color===pokemonColorId(pokedleTarget),pokemonColorBadge(m))}${cell(m.gen===pokedleTarget.gen,m.gen)}${showDetails?cell(m.height===pokedleTarget.height,`${m.height/10} m ${m.height===pokedleTarget.height?'=':m.height<pokedleTarget.height?'↑':'↓'}`)+cell(m.weight===pokedleTarget.weight,`${m.weight/10} kg ${m.weight===pokedleTarget.weight?'=':m.weight<pokedleTarget.weight?'↑':'↓'}`)+cell(evoStage(m)===evoStage(pokedleTarget),evoStage(m)):''}</tr>`;}).join('');
 const easyHint=gameDifficulty==='easy'?`<p class="difficulty-hint">Pista inicial: debutó en la generación ${pokedleTarget.gen} y uno de sus tipos es ${typeNames[pokedleTarget.types[0]]}.</p>`:'';
 $('game').innerHTML=`<p class="grid-instructions">Adiviná el Pokémon del día con intentos ilimitados. El color es una pista propia y las flechas del número indican si el secreto está más arriba o abajo en la Pokédex.${showDetails?' También indican si es más alto o pesado.':' En Experto verás número, tipo, color y generación.'}</p>${easyHint}<div class="pokedle-legend"><span class="legend-right">Verde: coincide</span><span class="legend-partial">Amarillo: comparte un tipo</span><span class="legend-wrong">Rojo: no coincide</span></div><div class="clue-scroll"><table class="clue-table"><thead><tr><th>Pokémon</th><th>N.º Pokédex</th><th>Tipos</th><th>Color</th><th>Gen.</th>${showDetails?'<th>Altura</th><th>Peso</th><th>Evolución</th>':''}</tr></thead><tbody>${rows}</tbody></table></div>${won?`<div class="result${animate?' pokedle-victory':''}">${monImage(pokedleTarget)}<h3>¡Lo encontraste!</h3><p>${pokedleTarget.name} · ${pokedleGuesses.length} intentos</p><button id="pokedle-next" class="next">Otro Pokémon</button></div>`:'<form id="pokedle-form" class="top-form"><label for="pokedle-answer">Tu Pokémon</label><div><input id="pokedle-answer" autocomplete="off" required><button class="next">Adivinar</button></div></form>'}`;
 if(won){typeof markDailyPlayed==='function'&&markDailyPlayed('pokedle',true);$('pokedle-next').onclick=()=>{loadPokedle(true);$('feedback').replaceChildren();renderPokedle();};return;}
 autocomplete('pokedle-answer');$('pokedle-form').onsubmit=e=>{e.preventDefault();if(current!=='pokedle'||pokedleGuesses.includes(pokedleTarget.id))return;const m=findPokemon(resolvePrediction($('pokedle-answer').value));if(!m){$('feedback').textContent='Elegí un Pokémon de las generaciones seleccionadas.';return;}if(pokedleGuesses.includes(m.id)){$('feedback').textContent='Ya probaste ese Pokémon.';return;}pokedleGuesses.push(m.id);savePokedle();$('feedback').replaceChildren();renderPokedle(true);if(!pokedleGuesses.includes(pokedleTarget.id))$('pokedle-answer').focus();};
}
function evolutionPaths(){const pool=eligible(),ids=new Set(pool.map(m=>m.id));return pool.filter(m=>m.parent&&ids.has(m.parent)).map(m=>{const parent=pool.find(x=>x.id===m.parent),grand=pool.find(x=>x.id===parent.parent);return grand?[grand,parent,m]:[parent,m];});}
function finishExtra(){ typeof markDailyPlayed==='function'&&markDailyPlayed(current,score/500>.65);$('game').innerHTML=`<div class="result"><h3>${score/100} de 5</h3><p>${score} puntos</p><button id="extra-again" class="next">Otra partida</button></div>`;$('extra-again').onclick=()=>start(current);$('progress').textContent='PARTIDA TERMINADA';}
function renderExtra(){
 if(extraRound===5){finishExtra();return;}extraAnswered=false;$('progress').textContent=`RONDA ${extraRound+1} / 5`;
 if(current==='speed'){const pool=typeof dailyDistinctOrder==='function'&&!(typeof infiniteMode!=='undefined'&&infiniteMode)?dailyDistinctOrder(eligible(),`speed-${extraRound}`):shuffle(eligible()),a=pool[0];let choices=pool.filter(m=>m.stats[5]!==a.stats[5]);if(gameDifficulty==='easy'){const wide=choices.filter(m=>Math.abs(m.stats[5]-a.stats[5])>=40);if(wide.length)choices=wide;}else if(gameDifficulty==='expert'){const close=choices.filter(m=>Math.abs(m.stats[5]-a.stats[5])<=10);if(close.length)choices=close;}const b=shuffle(choices)[0];speedPair=shuffle([a,b]);$('game').innerHTML=`<p class="question">¿Quién tiene más Velocidad base?</p><p class="grid-note">${gameDifficulty==='easy'?'Diferencia amplia entre los dos Pokémon.':gameDifficulty==='expert'?'Velocidades muy parecidas y sprites ocultos.':'Comparación equilibrada.'}</p><div class="speed-options"></div>`;speedPair.forEach(m=>{const b=document.createElement('button');b.className=`impostor-card${gameDifficulty==='expert'?' speed-expert':''}`;b.dataset.pokemonId=String(m.id);b.innerHTML=monImage(m)+`<b>${m.name}</b>`;b.onclick=()=>answerExtra(m.id);document.querySelector('.speed-options').append(b);});
 }else{let paths=evolutionPaths();const daily=typeof dailyDistinctOrder==='function'&&!(typeof infiniteMode!=='undefined'&&infiniteMode);paths=daily?dailyDistinctOrder(paths,`evolution-${extraRound}`,path=>path.map(m=>m.id).join('-')):shuffle(paths);if(!paths.length){$('game').innerHTML='<p>No hay cadenas completas entre las generaciones elegidas. Agregá otra generación.</p>';return;}evoPath=paths[0];evoHidden=gameDifficulty==='easy'?evoPath.length-1:Math.floor(activeRandom()*evoPath.length);const target=evoPath[evoHidden],optionCount=gameDifficulty==='easy'?3:gameDifficulty==='expert'?6:4;$('game').innerHTML=`<p class="question">Completá la cadena evolutiva</p><div class="evo-chain${gameDifficulty==='expert'?' evo-expert':''}">${evoPath.map((m,i)=>`${i?' → ':''}<div${i===evoHidden?' class="evo-missing"':''}>${i===evoHidden?'<strong>?</strong>':monImage(m)+`<b>${m.name}</b>`}</div>`).join('')}</div><p class="grid-note">${gameDifficulty==='easy'?'Falta la última etapa y hay tres opciones.':gameDifficulty==='expert'?'Seis opciones y las etapas visibles aparecen como siluetas.':'Cuatro opciones y puede faltar cualquier etapa.'}</p><div class="speed-options"></div>`;shuffle([target,...shuffle(eligible().filter(m=>!evoPath.some(p=>p.id===m.id))).slice(0,optionCount-1)]).forEach(m=>{const b=document.createElement('button');b.className='next';b.dataset.pokemonId=String(m.id);b.textContent=m.name;b.onclick=()=>answerExtra(m.id);document.querySelector('.speed-options').append(b);});}
}
function answerExtra(id){
 if(extraAnswered||!['speed','evolution'].includes(current))return;
 extraAnswered=true;
 const correct=current==='speed'?speedPair.reduce((a,b)=>a.stats[5]>b.stats[5]?a:b):evoPath[evoHidden];
 const chosen=mons.find(m=>m.id===id),hit=id===correct.id;
 if(hit)score+=100;
 $('score').textContent=score;
 document.querySelector('.speed-options').querySelectorAll('button').forEach(b=>{
  b.disabled=true;const buttonId=Number(b.dataset.pokemonId);
  if(current==='evolution'){
   if(buttonId===correct.id)b.classList.add('evo-option-correct');
   else if(buttonId===id)b.classList.add('evo-option-wrong');
  }else{
   const mon=mons.find(m=>m.id===buttonId),verdict=document.createElement('span');verdict.className='speed-verdict';
   if(buttonId===correct.id){b.classList.add('speed-correct');verdict.textContent=`✓ MÁS RÁPIDO · ${mon.stats[5]}`;}
   else if(buttonId===id){b.classList.add('speed-wrong');verdict.textContent=`✕ TU ELECCIÓN · ${mon.stats[5]}`;}
   else{b.classList.add('speed-other');verdict.textContent=`MÁS LENTO · ${mon.stats[5]}`;}
   b.append(verdict);
  }
 });
 if(current==='evolution'){
  const missing=document.querySelector('.evo-missing');
  missing.classList.add('evo-revealed',hit?'evo-hit':'evo-miss');
  missing.innerHTML=monImage(correct)+`<b>${correct.name}</b><span>${hit?'✓ ACERTASTE':'✕ ERA ESTE'}</span>`;
  $('feedback').textContent=hit?`¡Correcto! Elegiste a ${chosen.name}. +100. `:`Incorrecto: elegiste a ${chosen.name}. La respuesta era ${correct.name}. `;
  $('feedback').append(document.createTextNode(evoPath.map(m=>m.name).join(' → ')));
 }else{const other=speedPair.find(m=>m.id!==correct.id);$('feedback').textContent=hit?`¡Correcto! ${correct.name} es más rápido: ${correct.stats[5]} contra ${other.stats[5]} de ${other.name}. +100 puntos.`:`Incorrecto. Elegiste a ${chosen.name} (${chosen.stats[5]}), pero ${correct.name} es más rápido (${correct.stats[5]}).`; }
 const next=document.createElement('button');next.className='next';next.textContent=extraRound===4?'Ver resultado':'Siguiente';const roundAtClick=extraRound;next.onclick=()=>{if(extraRound!==roundAtClick)return;extraRound++;$('feedback').replaceChildren();renderExtra();};$('feedback').append(next);
}
const startBeforeNewGames=start;
start=function(game){if(!['pokedle','speed','evolution'].includes(game)){startBeforeNewGames(game);syncGenerations();return;}clearTimeout(timeout);clearInterval(clock);$('grid-dialog').close();current=game;score=0;extraRound=0;$('score').textContent='000';$('feedback').replaceChildren();$('restart').disabled=game==='pokedle';$('restart').textContent=game==='pokedle'?'Pokémon del día · sin saltos':'Reiniciar';$('generation').disabled=false;$('game-label').textContent=game==='pokedle'?'POKÉMON DEL DÍA · INTENTOS ILIMITADOS':'PONÉ A PRUEBA TU POKÉDEX';$('game-title').textContent={pokedle:'Pokédle',speed:'¿Quién es más rápido?',evolution:'Cadena evolutiva'}[game];$('daily-label').hidden=true;$('pool-count').textContent=`${eligible().length} Pokémon disponibles`;document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game)));if(game==='pokedle'){loadPokedle();renderPokedle();}else renderExtra();syncGenerations();};
syncGenerations();

const render700BeforeMulti=render700;render700=function(revealed=false){render700BeforeMulti(revealed);syncGenerations();};

const restartBeforeUnlimited=$('restart').onclick;$('restart').onclick=()=>{if(current==='pokedle'){loadPokedle(true);$('feedback').replaceChildren();renderPokedle();}else restartBeforeUnlimited();};
