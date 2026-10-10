'use strict';
// Shared state and all-generation data extend the original three games.
let generation='all',gridRows=[],gridCols=[],gridCells=[],activeCell=-1;
let topCategory='total',topMode='normal',topStarted=false,topFinished=false,topAnswers=[],topFound=[],deadline=0,clock=null;
let gameDifficulty='medium';
const typeNames=POKE_DATA.types;
const validGeneration=g=>g==='all'||/^[1-9](,[1-9])*$/.test(g);
const inGeneration=(m,g=generation)=>g==='all'||g.split(',').includes(String(m.gen));
const eligible=()=>POKE_DATA.mons.filter(m=>inGeneration(m));
const typeLabel=m=>m.types.map(t=>typeNames[t]).join(' + ');
const typeBadge=t=>`<span class="type-badge" data-type="${t}">${typeNames[t]}</span>`;
const typeBadges=m=>`<span class="type-badges">${m.types.map(typeBadge).join('')}</span>`;
const typeBadgesFromLabel=label=>`<span class="type-badges">${String(label).split(' + ').map(name=>{const id=Object.keys(typeNames).find(t=>typeNames[t]===name);return id?typeBadge(id):`<span class="type-badge">${name}</span>`;}).join('')}</span>`;
const normalizeName=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'female').replace(/♂/g,'male').replace(/[^a-z0-9]/g,'');
function findPokemon(name){const key=normalizeName(String(name)),aliases={nidoranhembra:29,nidoranf:29,nidoranmacho:32,nidoranm:32};return eligible().find(m=>normalizeName(m.name)===key||m.id===aliases[key]);}
function populateList(id){$(id).replaceChildren();eligible().forEach(m=>{const o=document.createElement('option');o.value=m.name;$(id).append(o);});}
function makeQuiz(pool){
 const wrongCount=gameDifficulty==='easy'?2:gameDifficulty==='expert'?5:3,allLabels=[...new Set(mons.map(typeLabel))];
 const ordered=typeof dailyDistinctOrder==='function'&&!(typeof infiniteMode!=='undefined'&&infiniteMode)?dailyDistinctOrder(pool,'quiz'):shuffle(pool);
 return ordered.slice(0,5).map(m=>{const answer=typeLabel(m),arity=m.types.length;let candidates=[...new Set(pool.map(typeLabel))].filter(label=>label!==answer&&label.split(' + ').length===arity);if(candidates.length<wrongCount)candidates=[...new Set([...candidates,...allLabels.filter(label=>label!==answer&&label.split(' + ').length===arity)])];const wrong=shuffle(candidates).slice(0,wrongCount),options=shuffle([answer,...wrong]);return {q:`¿Cuál es la combinación de tipos de ${m.name}?`,options,answer:options.indexOf(answer),note:`${m.name} es de tipo ${answer}.`};});
}
function gridTypeIds(){
 const selected=generation==='all'?[1,2,3,4,5,6,7,8,9]:generation.split(',').map(Number),newest=Math.max(...selected),ids=Object.keys(typeNames).map(Number);
 return ids.filter(type=>newest>=6||type!==18).filter(type=>newest>=2||![9,17].includes(type));
}
function gridCriteria(pool){
 const criteria=[],add=(id,label,test,kind='special',type=0)=>{const candidates=pool.filter(test);if(candidates.length)criteria.push({id,label,test,kind,type,candidates});};
 const allowed=new Set(gridTypeIds()),available=[...new Set(pool.flatMap(m=>m.types))].filter(type=>allowed.has(type));
 available.forEach(type=>add(`type-${type}`,typeNames[type],m=>m.types.includes(type),'type',type));add('monotype','Monotipo',m=>m.types.length===1);
 const tags={friendship:'Evoluciona por amistad',stone:'Evoluciona con piedra',trade:'Evoluciona por intercambio',branch:'Evolución ramificada',starter:'Pokémon inicial',fossil:'Pokémon fósil',pseudo:'Pseudolegendario',regional:'Forma regional',mega:'Megaevolución',gmax:'Forma Gigamax',paradox:'Pokémon paradoja',ultra:'Ultraente',ash:'Pokémon de Ash'};
 const easy=['starter','fossil'],medium=['friendship','stone','trade','branch','pseudo','regional','ash'],expert=['mega','gmax','paradox','ultra'];
 [...easy,...gameDifficulty==='easy'?[]:medium,...gameDifficulty==='expert'?expert:[]].forEach(tag=>add(`tag-${tag}`,tags[tag],m=>tag==='ash'?m.ash:m.impostorTags?.includes(tag)));
 add('legendary','Pokémon legendario',m=>m.legendary);add('mythical','Pokémon singular',m=>m.mythical);add('final','Etapa evolutiva final',m=>m.final);add('evolved','Tiene preevolución',m=>m.evolved);
 if(gameDifficulty!=='easy'){add('fast','Velocidad base 100 o más',m=>m.stats[5]>=100);add('heavy','Pesa 100 kg o más',m=>m.weight>=1000);add('tall','Mide 2 m o más',m=>m.height>=20);}
 return criteria;
}
function gridCriterionBadge(criterion){return criterion.kind==='type'?typeBadge(criterion.type):`<span class="criterion-badge">${criterion.label}</span>`;}
function gridCriterionLabel(criterion){return criterion?.label||'Criterio';}
function buildGrid(pool){
 const criteria=gridCriteria(pool),rng=typeof activeRandom==='function'?activeRandom:Math.random,randomized=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;},shapes=[[3,3],[2,3],[3,2],[2,2]];
 for(const [rowCount,colCount] of shapes){
  const found=[],seen=new Set();
  for(let attempt=0;attempt<1800&&found.length<100;attempt++){
   const shuffled=randomized(criteria),rows=shuffled.slice(0,rowCount),cols=[];
   for(const candidate of shuffled.slice(rowCount)){
    if(rows.some(row=>row.id===candidate.id))continue;
    if(rows.every(row=>pool.some(mon=>row.test(mon)&&candidate.test(mon))))cols.push(candidate);
    if(cols.length===colCount)break;
   }
   if(cols.length<colCount)continue;
   const signature=`${rows.map(r=>r.id).sort().join(',')}|${cols.map(c=>c.id).sort().join(',')}`;if(seen.has(signature))continue;seen.add(signature);
   const cells=rows.flatMap((row,ri)=>cols.map((col,ci)=>({row:ri,col:ci,candidates:pool.filter(mon=>row.test(mon)&&col.test(mon)),answer:null,shiny:false})));
   if(cells.some(cell=>!cell.candidates.length))continue;
   const special=[...rows,...cols].filter(c=>c.kind!=='type').length;if(!special&&criteria.some(c=>c.kind!=='type'))continue;
   found.push({rows,cols,cells,density:cells.reduce((sum,cell)=>sum+cell.candidates.length,0),special});
  }
  if(found.length){found.sort((a,b)=>a.density-b.density||b.special-a.special);const band=Math.max(1,Math.ceil(found.length*.3)),choices=gameDifficulty==='easy'?found.slice(-band):gameDifficulty==='expert'?found.slice(0,band):found;return choices[Math.floor(rng()*choices.length)];}
 }
 throw new Error('No hay suficientes criterios compatibles para crear una cuadrícula con esas generaciones.');
}
function renderGrid(){
 $('game').innerHTML='<p class="grid-instructions">Elegí una casilla y nombrá un Pokémon que cumpla <b>los dos criterios</b> del cruce. En el desafío diario, cada acierto se suma a tu Pokédex y puede aparecer shiny.</p><div class="type-grid criteria-grid" role="group" aria-label="Cuadrícula de criterios Pokémon"></div><p class="grid-note">Puede combinar tipos, monotipo, métodos de evolución, formas, grupos especiales y estadísticas. Todos los cruces tienen al menos una respuesta válida.</p>';
 const board=document.querySelector('.type-grid');board.style.setProperty('--grid-cols',gridCols.length);const corner=document.createElement('div');corner.className='grid-corner';corner.textContent='CRITERIO × CRITERIO';board.append(corner);
 const header=criterion=>{const e=document.createElement('div');e.className='type-heading criterion-heading';e.innerHTML=gridCriterionBadge(criterion);board.append(e);};gridCols.forEach(header);
 gridRows.forEach((criterion,row)=>{header(criterion);gridCols.forEach((_,col)=>{const index=row*gridCols.length+col,cell=gridCells[index],b=document.createElement('button');b.className='grid-cell';b.disabled=!!cell.answer;b.setAttribute('aria-label',`${gridCriterionLabel(criterion)} y ${gridCriterionLabel(gridCols[col])}: ${cell.answer?`${cell.answer.name}${cell.newEntry?', nuevo registro en la Pokédex':''}`:'completar'}`);if(cell.answer){b.classList.add('solved');if(cell.shiny)b.classList.add('shiny');const url=cell.shiny&&typeof shinySpriteUrl==='function'?shinySpriteUrl(cell.answer.sprite):spriteUrl(cell.answer.sprite);b.innerHTML=`${cell.newEntry?'<em class="grid-new-badge">📖 NUEVO</em>':''}${cell.shiny?'<em class="grid-shiny-badge">✨ SHINY</em>':''}<img src="${url}" alt=""><span>${cell.answer.name}</span>`;}else b.textContent='+';b.onclick=()=>openCell(index);board.append(b);});});
 if(gridCells.every(c=>c.answer)){typeof markDailyPlayed==='function'&&markDailyPlayed('grid',true);$('feedback').textContent='¡Cuadrícula completa!';}update();
}
function openCell(index){const cell=gridCells[index];if(!cell||cell.answer||!cell.candidates.length)return;activeCell=index;$('cell-title').textContent=`${gridCriterionLabel(gridRows[cell.row])} + ${gridCriterionLabel(gridCols[cell.col])}`;$('pokemon-answer').value='';$('cell-feedback').textContent='';populateList('pokemon-list');$('grid-dialog').showModal();$('pokemon-answer').focus();}
function checkGridAnswer(index,name){const cell=gridCells[index];if(current!=='grid'||!cell||!cell.candidates.length||cell.answer)return{ok:false,message:'Elegí una casilla disponible.'};const mon=findPokemon(name);if(!mon)return{ok:false,message:'Ese Pokémon no pertenece a la generación elegida o el nombre no coincide. Elegí un nombre de la lista.'};if(!cell.candidates.some(m=>m.id===mon.id))return{ok:false,message:`${mon.name} no cumple ambos criterios: ${gridCriterionLabel(gridRows[cell.row])} + ${gridCriterionLabel(gridCols[cell.col])}.`};cell.answer=mon;score+=100;return{ok:true,message:`¡Correcto! ${mon.name}: +100 puntos.`,pokemon:mon};}
const categoryNames={total:'Mayor total de estadísticas base',weight:'Mayor peso',height:'Mayor altura'};
function rankedTop(pool,category){return [...pool].sort((a,b)=>b[category]-a[category]||a.id-b.id).slice(0,10);}
function renderTopSetup(){
 $('game').innerHTML='<div class="top-setup"><p>Completá los 10 Pokémon de la lista. Los tipos son tu pista inicial.</p><label for="top-category">Consigna</label><select id="top-category"><option value="total">Mayor total de estadísticas base</option><option value="weight">Mayor peso</option><option value="height">Mayor altura</option></select><fieldset><legend>Modo de juego</legend><label><input type="radio" name="top-mode" value="normal"> Normal</label><label><input type="radio" name="top-mode" value="timed"> 2 minutos</label></fieldset><p class="grid-note">Formas base, incluidos legendarios. En empates, va primero el menor número de Pokédex. Total base: suma de las seis estadísticas.</p><button id="begin-top" class="next">Empezar partida</button></div>';
 $('top-category').value=topCategory;document.querySelector(`input[name="top-mode"][value="${topMode}"]`).checked=true;$('begin-top').onclick=()=>{topCategory=$('top-category').value;topMode=document.querySelector('input[name="top-mode"]:checked').value;beginTop();};
}
function beginTop(){clearInterval(clock);topStarted=true;topFinished=false;score=0;topFound=[];topAnswers=rankedTop(dailyTopPool(),topCategory);deadline=Date.now()+120000;renderTop();if(topMode==='timed')clock=setInterval(()=>{if(current!=='top10'||topFinished){clearInterval(clock);return;}const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if($('top-timer'))$('top-timer').textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;if(remaining===0)finishTop('¡Se terminó el tiempo!');},250);}
function topValue(m){return topCategory==='total'?`${m.total} puntos`:topCategory==='weight'?`${m.weight/10} kg`:`${m.height/10} m`;}
function renderTop(){
 $('game').innerHTML='<div class="top-heading"><h3 id="top-heading"></h3><span id="top-timer"></span></div><ol class="top-list"></ol><form id="top-form" class="top-form"><label for="top-answer">Nombre del Pokémon</label><div><input id="top-answer" list="top-list-options" placeholder="Escribí un Pokémon" autocomplete="off" required><button class="next">Adivinar</button></div><datalist id="top-list-options"></datalist></form><p class="grid-note">Los tipos son tu pista inicial. Empates ordenados por número de Pokédex.</p><button id="give-up" class="subtle">Terminar y revelar lista</button>';
 $('top-heading').textContent=categoryNames[topCategory];$('top-timer').textContent=topMode==='timed'?`${Math.floor(Math.max(0,Math.ceil((deadline-Date.now())/1000))/60)}:${String(Math.max(0,Math.ceil((deadline-Date.now())/1000))%60).padStart(2,'0')}`:'SIN LÍMITE';
 topAnswers.forEach((m,i)=>{const found=topFound.includes(m.id),hint=gameDifficulty==='easy'&&!found?`${m.name[0]}${'·'.repeat(Math.max(1,m.name.length-1))}`:'???',types=gameDifficulty==='expert'&&!found?'':typeBadges(m);const li=document.createElement('li');li.className=found?'found':'';li.innerHTML=`<span class="rank">${i+1}</span><span class="top-type">${types}</span><span class="top-name">${found?m.name:hint}</span><span class="top-value">${found?topValue(m):''}</span>`;document.querySelector('.top-list').append(li);});
 populateList('top-list-options');$('top-form').onsubmit=e=>{e.preventDefault();const answer=checkTopAnswer($('top-answer').value);$('feedback').textContent=answer.message;if(answer.ok){renderTop();if(topFound.length===10)finishTop('¡Lista completa! Sos un maestro Pokémon.');else $('top-answer').focus();}};$('give-up').onclick=()=>finishTop('Lista revelada. ¡Probá otra consigna!');update();
}
function checkTopAnswer(name){if(current!=='top10'||!topStarted||topFinished)return{ok:false,message:'La partida no está activa.'};if(topMode==='timed'&&Date.now()>=deadline){finishTop('¡Se terminó el tiempo!');return{ok:false,message:'¡Se terminó el tiempo!'};}const mon=findPokemon(name);if(!mon)return{ok:false,message:'Elegí un Pokémon de la generación seleccionada.'};if(topFound.includes(mon.id))return{ok:false,message:`Ya encontraste a ${mon.name}.`};if(!topAnswers.some(m=>m.id===mon.id))return{ok:false,message:`${mon.name} no está en este Top 10. ¡Probá otro!`};topFound.push(mon.id);score+=100;return{ok:true,message:`¡${mon.name} está en la lista! +100 puntos.`};}
function finishTop(message){topFinished=true;typeof markDailyPlayed==='function'&&markDailyPlayed('top10',topFound.length/topAnswers.length>.65);clearInterval(clock);$('feedback').textContent=message;document.querySelectorAll('.top-list li').forEach((li,i)=>{const m=topAnswers[i];if(!topFound.includes(m.id))li.classList.add('revealed');li.querySelector('.top-name').textContent=m.name;li.querySelector('.top-value').textContent=topValue(m);});$('top-answer').disabled=true;document.querySelector('#top-form button').disabled=true;$('give-up').textContent='Otra partida';$('give-up').onclick=()=>start('top10');update();$('progress').textContent=`FINAL · ${topFound.length} / 10`;}
document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>start(b.dataset.game));
$('restart').onclick=()=>start(current);
$('generation').onchange=()=>{generation=$('generation').value;start(current);};
$('grid-form').onsubmit=e=>{e.preventDefault();const answer=checkGridAnswer(activeCell,$('pokemon-answer').value);if(!answer.ok){$('cell-feedback').textContent=answer.message;return;}$('grid-dialog').close();$('feedback').textContent=answer.message;renderGrid();};
$('close-dialog').onclick=()=>$('grid-dialog').close();
