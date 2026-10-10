'use strict';
(() => {
 const allPokemon=[...POKE_DATA.mons].sort((a,b)=>a.id-b.id||a.name.localeCompare(b.name));
 const dexState={query:'',generation:'all',type:'all',form:'all',limit:60,gridPicker:false,returnToGrid:false};
 const statLabels=['PS','Ataque','Defensa','At. Esp.','Def. Esp.','Velocidad'];
 const regionByGen=['Kanto','Johto','Hoenn','Sinnoh','Teselia','Kalos','Alola','Galar / Hisui','Paldea'];
 const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
 const isRegional=mon=>['regional','alola','galar','hisui'].some(tag=>mon.impostorTags?.includes(tag));
 const formKind=mon=>mon.mega?'Mega':mon.impostorTags?.includes('gmax')?'Gigamax':isRegional(mon)?'Regional':mon.id>1025?'Forma especial':'Especie';
 const dexNumber=mon=>mon.id<=1025?`#${String(mon.id).padStart(4,'0')}`:`FORMA ${String(mon.id).slice(-3)}`;
 const dialog=document.createElement('dialog');dialog.id='pokedex-dialog';dialog.setAttribute('aria-labelledby','pokedex-title');
 dialog.innerHTML=`<div class="pokedex-shell"><header class="pokedex-header"><div><span>POKÉDEX NACIONAL</span><h2 id="pokedex-title">Todos los Pokémon</h2><small id="pokedex-count"></small></div><button type="button" id="close-pokedex" aria-label="Cerrar Pokédex">×</button></header><div class="pokedex-tools"><label>Buscar<input id="pokedex-search" type="search" placeholder="Nombre o número" autocomplete="off"></label><label>Generación<select id="pokedex-generation"><option value="all">Todas</option>${regionByGen.map((r,i)=>`<option value="${i+1}">${i+1} · ${r}</option>`).join('')}</select></label><label>Tipo<select id="pokedex-type"><option value="all">Todos</option>${Object.entries(POKE_DATA.types).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Forma<select id="pokedex-form"><option value="all">Todas</option><option value="species">Especies base</option><option value="final">Etapas finales</option><option value="mega">Megaevoluciones</option><option value="regional">Formas regionales</option><option value="gmax">Gigamax</option><option value="special">Otras formas</option></select></label></div><p id="pokedex-context" class="pokedex-context"></p><div class="pokedex-layout"><section><div id="pokedex-grid" class="pokedex-grid"></div><button id="pokedex-more" class="next" type="button">Mostrar más</button></section><aside id="pokedex-detail" class="pokedex-detail"><p>Elegí un Pokémon para consultar su ficha.</p></aside></div></div>`;
 document.body.append(dialog);
 const byId=id=>document.getElementById(id);
 function filtered(){
  let list=dexState.gridPicker&&gridCells[activeCell]?gridCells[activeCell].candidates:allPokemon;
  const q=normalize(dexState.query);
  return list.filter(mon=>(!q||normalize(mon.name).includes(q)||String(mon.id).includes(q))&&(dexState.generation==='all'||String(mon.gen)===dexState.generation)&&(dexState.type==='all'||mon.types.includes(Number(dexState.type)))&&(dexState.form==='all'||dexState.form==='species'&&mon.id<=1025||dexState.form==='final'&&mon.final||dexState.form==='mega'&&mon.mega||dexState.form==='regional'&&isRegional(mon)||dexState.form==='gmax'&&mon.impostorTags?.includes('gmax')||dexState.form==='special'&&mon.id>1025&&!mon.mega&&!isRegional(mon)&&!mon.impostorTags?.includes('gmax')));
 }
 function render(){
  const list=filtered(),shown=list.slice(0,dexState.limit),grid=byId('pokedex-grid');grid.replaceChildren();
  byId('pokedex-count').textContent=`${list.length} resultados · ${allPokemon.filter(m=>m.id<=1025).length} especies + ${allPokemon.filter(m=>m.id>1025).length} formas`;
  byId('pokedex-context').textContent=dexState.gridPicker&&gridCells[activeCell]?`Mostrando Pokémon válidos para ${typeNames[gridRows[gridCells[activeCell].row]]} + ${typeNames[gridCols[gridCells[activeCell].col]]}. Elegí uno para llevarlo al desafío.`:'Consultá tipos, estadísticas, habilidades, región, evolución y formas especiales.';
  shown.forEach(mon=>{const button=document.createElement('button');button.type='button';button.className='pokedex-card';button.innerHTML=`<span>${dexNumber(mon)}</span><img src="${spriteUrl(mon.sprite)}" alt="" loading="lazy"><b>${mon.name}</b><small>${typeBadges(mon)}</small><em>${formKind(mon)}</em>`;button.onclick=()=>showDetail(mon);grid.append(button);});
  byId('pokedex-more').hidden=shown.length>=list.length;byId('pokedex-more').textContent=`Mostrar más (${shown.length} de ${list.length})`;
  if(!shown.length)grid.innerHTML='<p class="pokedex-empty">No hay Pokémon con esos filtros.</p>';
 }
 function showDetail(mon){
  const abilities=(mon.abilities||[]).map(id=>POKE_DATA.abilityNames[id]).filter(Boolean);
  const max=Math.max(...mon.stats);
  byId('pokedex-detail').innerHTML=`<div class="dex-hero"><span>${dexNumber(mon)}</span><img src="${spriteUrl(mon.sprite)}" alt="${mon.name}"><h3>${mon.name}</h3>${typeBadges(mon)}<p>${formKind(mon)} · Generación ${mon.gen} · ${regionByGen[mon.gen-1]||'Región especial'}</p></div><dl><div><dt>Altura</dt><dd>${mon.height/10} m</dd></div><div><dt>Peso</dt><dd>${mon.weight/10} kg</dd></div><div><dt>Total base</dt><dd>${mon.total}</dd></div><div><dt>Etapa</dt><dd>${mon.final?'Final':'No final'}</dd></div></dl><div class="dex-stats">${mon.stats.map((value,index)=>`<div class="${value===max?'best':''}"><span>${statLabels[index]}</span><progress max="255" value="${value}"></progress><b>${value}</b></div>`).join('')}</div><p><b>Habilidades:</b> ${abilities.length?abilities.join(' · '):'Sin datos disponibles'}</p>${dexState.gridPicker?'<button type="button" id="use-grid-pokemon" class="next">Usar en la cuadrícula</button>':''}`;
  const use=byId('use-grid-pokemon');if(use)use.onclick=()=>useForGrid(mon);
 }
 function useForGrid(mon){const input=byId('pokemon-answer');if(input)input.value=mon.name;dexState.returnToGrid=true;dialog.close();}
 function open(options={}){
  dexState.gridPicker=!!options.gridPicker;dexState.returnToGrid=false;dexState.query='';dexState.generation='all';dexState.type='all';dexState.form='all';dexState.limit=60;
  byId('pokedex-search').value='';byId('pokedex-generation').value='all';byId('pokedex-type').value='all';byId('pokedex-form').value='all';byId('pokedex-detail').innerHTML='<p>Elegí un Pokémon para consultar su ficha.</p>';
  if(dexState.gridPicker&&byId('grid-dialog')?.open)byId('grid-dialog').close();
  render();dialog.showModal();byId('pokedex-search').focus();
 }
 byId('close-pokedex').onclick=()=>dialog.close();byId('pokedex-more').onclick=()=>{dexState.limit+=60;render();};
 [['pokedex-search','query','input'],['pokedex-generation','generation','change'],['pokedex-type','type','change'],['pokedex-form','form','change']].forEach(([id,key,event])=>byId(id).addEventListener(event,e=>{dexState[key]=e.target.value;dexState.limit=60;render();}));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{if(dexState.gridPicker&&(dexState.returnToGrid||activeCell>=0)&&byId('grid-dialog')&&!byId('grid-dialog').open){byId('grid-dialog').showModal();byId('pokemon-answer').focus();if(dexState.returnToGrid)byId('pokemon-answer').dispatchEvent(new Event('input',{bubbles:true}));}dexState.gridPicker=false;});
 window.openPokedex=open;
 const originalOpenCell=openCell;
 openCell=function(index){originalOpenCell(index);const form=byId('grid-form');if(!form||byId('grid-pokedex-tools'))return;const tools=document.createElement('div');tools.id='grid-pokedex-tools';tools.className='grid-pokedex-tools';tools.innerHTML='<button type="button" id="consult-grid-pokedex">📖 Consultar Pokédex para este cruce</button><div id="grid-pokemon-preview"></div>';form.querySelector('.next').insertAdjacentElement('beforebegin',tools);byId('consult-grid-pokedex').onclick=()=>open({gridPicker:true});const input=byId('pokemon-answer'),preview=byId('grid-pokemon-preview');const paint=()=>{const mon=findPokemon(input.value);preview.innerHTML=mon?`<img src="${spriteUrl(mon.sprite)}" alt=""><span><b>${mon.name}</b>${typeBadges(mon)}<small>${mon.height/10} m · ${mon.weight/10} kg · Total ${mon.total}</small></span>`:'';};input.addEventListener('input',paint);input.addEventListener('change',paint);};
})();

'use strict';
(() => {
 const storage={profile:'poke-profile-v1',sound:'poke-sound-v1',contrast:'poke-contrast-v1'};
 const gameNames={guess:'¿Quién es?',quiz:'Quiz',grid:'Cuadrícula',top10:'Top 10',connections:'Conexiones',stats700:'Reto 700',impostor:'Impostor',pokedle:'Pokédle',speed:'Más rápido',evolution:'Evoluciones',battle:'Batalla'};
 const tutorials={guess:'Reconocé la silueta y elegí el nombre correcto.',quiz:'Respondé cinco preguntas. La cantidad de opciones depende de la dificultad.',grid:'Elegí una casilla y encontrá un Pokémon que tenga los dos tipos.',top10:'Completá el ranking diario. Los tipos de cada puesto funcionan como pista.',connections:'Seleccioná cuatro Pokémon que compartan una misma conexión.',stats700:'Asigná cada Pokémon aleatorio a una estadística y prepará el combate final.',impostor:'Encontrá al único Pokémon que no cumple la conexión del grupo.',pokedle:'Adiviná el Pokémon con pistas de color. Tenés intentos ilimitados.',speed:'Decidí cuál de los dos Pokémon tiene mayor Velocidad base.',evolution:'Completá cada etapa de la cadena evolutiva.',battle:'Elegí tu equipo, movimientos y habilidades para enfrentar a un líder.'};
 let profile={results:[],unlocked:[]};try{profile={...profile,...JSON.parse(localStorage.getItem(storage.profile))};}catch{}
 function saveProfile(){try{localStorage.setItem(storage.profile,JSON.stringify(profile));}catch{}}
 function lastSeven(){const today=new Date(`${dayKey()}T12:00:00Z`);return Array.from({length:7},(_,i)=>{const d=new Date(today);d.setUTCDate(d.getUTCDate()-i);return d.toISOString().slice(0,10);});}
 function achievements(){const wins=profile.results.filter(r=>r.won).length,games=new Set(profile.results.map(r=>r.game)),streak=Number(JSON.parse(localStorage.getItem('poke-daily-streak-v2')||'{}').count)||0;return[{id:'first',icon:'🥚',name:'Primer paso',ok:profile.results.length>=1},{id:'wins5',icon:'🏅',name:'Cinco victorias',ok:wins>=5},{id:'streak3',icon:'🔥',name:'Racha de 3 días',ok:streak>=3},{id:'explorer',icon:'🗺️',name:'Probaste 5 juegos',ok:games.size>=5},{id:'master',icon:'🏆',name:'Maestro diario',ok:wins>=15},{id:'collector',icon:'⭐',name:'Todos los desafíos',ok:games.size>=11}];}
 const panel=document.createElement('dialog');panel.id='trainer-panel';panel.innerHTML='<div class="trainer-panel-shell"><button id="close-trainer-panel" aria-label="Cerrar">×</button><div id="trainer-panel-content"></div></div>';document.body.append(panel);document.getElementById('close-trainer-panel').onclick=()=>panel.close();panel.onclick=e=>{if(e.target===panel)panel.close();};
 function showProfile(){const days=lastSeven(),week=profile.results.filter(r=>days.includes(r.date)),points=week.reduce((sum,r)=>sum+(r.won?100:25),0),medals=achievements();document.getElementById('trainer-panel-content').innerHTML=`<span class="eyebrow">PERFIL LOCAL</span><h2>Tu ficha de entrenador</h2><div class="profile-numbers"><div><b>${points}</b><span>Puntos semanales</span></div><div><b>${week.filter(r=>r.won).length}</b><span>Victorias en 7 días</span></div><div><b>${profile.results.length}</b><span>Partidas registradas</span></div></div><h3>Últimos siete días</h3><div class="week-track">${days.reverse().map(day=>{const games=profile.results.filter(r=>r.date===day);return `<div><b>${day.slice(5)}</b><span>${games.length?games.map(r=>r.won?'✓':'✕').join(''):'·'}</span></div>`;}).join('')}</div><h3>Medallas</h3><div class="medal-grid">${medals.map(m=>`<div class="${m.ok?'unlocked':'locked'}"><span>${m.icon}</span><b>${m.name}</b><small>${m.ok?'Conseguida':'Bloqueada'}</small></div>`).join('')}</div><p class="privacy-note">Este perfil se guarda solamente en este navegador. No necesitás crear una cuenta.</p>`;panel.showModal();}
 function showTutorial(){document.getElementById('trainer-panel-content').innerHTML=`<span class="eyebrow">CENTRO DE AYUDA</span><h2>Cómo jugar</h2><div class="tutorial-list">${Object.entries(tutorials).map(([id,text])=>`<details${id===current?' open':''}><summary>${gameNames[id]}</summary><p>${text}</p></details>`).join('')}</div>`;panel.showModal();}
 const toolbar=document.createElement('nav');toolbar.className='utility-toolbar';toolbar.setAttribute('aria-label','Herramientas de entrenador');toolbar.innerHTML='<button id="open-pokedex">📖 <span>Pokédex</span></button><button id="open-profile">🏅 <span>Perfil</span></button><button id="open-tutorial">? <span>Cómo jugar</span></button><button id="toggle-sound">♪ <span>Sonido</span></button><button id="toggle-contrast">◐ <span>Contraste</span></button>';document.querySelector('header').append(toolbar);
 document.getElementById('open-pokedex').onclick=()=>openPokedex();document.getElementById('open-profile').onclick=showProfile;document.getElementById('open-tutorial').onclick=showTutorial;
 let soundOn=localStorage.getItem(storage.sound)==='on';let audioContext=null;
 function paintSound(){document.getElementById('toggle-sound').classList.toggle('active',soundOn);document.getElementById('toggle-sound').setAttribute('aria-pressed',String(soundOn));}
 function blip(success=true){if(!soundOn)return;try{audioContext??=new AudioContext();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.frequency.value=success?660:220;gain.gain.setValueAtTime(.045,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.1);osc.connect(gain).connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.11);}catch{}}
 document.getElementById('toggle-sound').onclick=()=>{soundOn=!soundOn;localStorage.setItem(storage.sound,soundOn?'on':'off');paintSound();blip(true);};paintSound();
 let contrast=localStorage.getItem(storage.contrast)==='on';function paintContrast(){document.body.classList.toggle('high-contrast',contrast);document.getElementById('toggle-contrast').classList.toggle('active',contrast);document.getElementById('toggle-contrast').setAttribute('aria-pressed',String(contrast));}document.getElementById('toggle-contrast').onclick=()=>{contrast=!contrast;localStorage.setItem(storage.contrast,contrast?'on':'off');paintContrast();};paintContrast();
 document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#toggle-sound'))blip(!e.target.closest('.wrong'));});
 const how=document.createElement('button');how.type='button';how.id='window-how-to';how.textContent='? Cómo jugar';how.onclick=showTutorial;document.querySelector('.window-header').insertBefore(how,document.getElementById('close-game-window'));
 function shareText(game,won,score){const squares=won?'🟩🟩🟩🟩🟩':'🟩🟩🟨⬛⬛';return `PokéQuizz · ${gameNames[game]||game}\n${won?'Victoria':'Desafío completado'} · ${score} puntos\n${squares}\n${dayKey()}\nhttps://bautistaolocco-design.github.io/pokequizz/`;}
 function addSummary(game,won,score){const host=document.querySelector('#game .result')||document.getElementById('feedback')||document.getElementById('game');if(!host||document.getElementById('session-summary'))return;const summary=document.createElement('section');summary.id='session-summary';summary.className=`session-summary ${won?'won':'lost'}`;summary.innerHTML=`<span>${won?'✓ VICTORIA':'PARTIDA TERMINADA'}</span><h3>${score} puntos</h3><p>${won?'Superaste el objetivo del desafío.':'Mañana tenés una nueva oportunidad.'}</p><button type="button" id="share-result">Compartir resultado</button><small id="share-status"></small>`;host.append(summary);document.getElementById('share-result').onclick=async()=>{try{await navigator.clipboard.writeText(shareText(game,won,score));document.getElementById('share-status').textContent='Resultado copiado.';}catch{document.getElementById('share-status').textContent='No se pudo copiar automáticamente.';}};}
 const originalMark=markDailyPlayed;markDailyPlayed=function(game,won=true){const already=isDailyPlayed(game),scoreNow=Number(score)||0,result=originalMark(game,won);if(!infiniteMode&&!already){profile.results.push({date:dayKey(),game,won:!!won,score:scoreNow});profile.results=profile.results.slice(-120);saveProfile();}queueMicrotask(()=>addSummary(game,!!won,scoreNow));return result;};
})();

/* Daily Top 10 rotation kept in this self-contained feature bundle. */
(() => {
 const details={
  total:{title:'Los 10 Pokémon con mayor suma de estadísticas base',value:m=>m.total,label:m=>`${m.total} puntos`},
  weight:{title:'Los 10 Pokémon más pesados',value:m=>m.weight,label:m=>`${m.weight/10} kg`},
  height:{title:'Los 10 Pokémon más altos',value:m=>m.height,label:m=>`${m.height/10} m`},
  hp:{title:'Los 10 Pokémon con más PS base',value:m=>m.stats[0],label:m=>`${m.stats[0]} PS`},
  attack:{title:'Los 10 Pokémon con más Ataque base',value:m=>m.stats[1],label:m=>`${m.stats[1]} Ataque`},
  defense:{title:'Los 10 Pokémon con más Defensa base',value:m=>m.stats[2],label:m=>`${m.stats[2]} Defensa`},
  specialAttack:{title:'Los 10 Pokémon con más Ataque Especial base',value:m=>m.stats[3],label:m=>`${m.stats[3]} At. Esp.`},
  specialDefense:{title:'Los 10 Pokémon con más Defensa Especial base',value:m=>m.stats[4],label:m=>`${m.stats[4]} Def. Esp.`},
  speed:{title:'Los 10 Pokémon con más Velocidad base',value:m=>m.stats[5],label:m=>`${m.stats[5]} Velocidad`}
 };
 dailyTopSpec=function(){const pool=eligible(),keys=Object.keys(details),day=Math.floor(Date.parse(`${playingDay}T00:00:00Z`)/86400000),offset=generation==='all'?0:generation.split(',').reduce((sum,n)=>sum+Number(n),0),category=keys[(day+offset)%keys.length];return{category,pool,title:details[category].title};};
 rankedTop=function(pool,category){const value=(details[category]||details.total).value;return[...pool].sort((a,b)=>value(b)-value(a)||a.id-b.id).slice(0,10);};
 topValue=function(mon){return(details[topCategory]||details.total).label(mon);};
 document.addEventListener('click',event=>{if(event.target.closest?.('#pokemon-listbox button'))queueMicrotask(()=>document.getElementById('pokemon-answer')?.dispatchEvent(new Event('input',{bubbles:true})));});
})();
