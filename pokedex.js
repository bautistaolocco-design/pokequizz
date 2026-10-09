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
