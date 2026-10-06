'use strict';

const POKEQUIZZ_GAME_CARDS={
 guess:{sprite:25,title:'¿Quién es?',desc:'Reconocé la silueta',tag:'SILUETAS'},
 quiz:{sprite:1,title:'Quiz Pokémon',desc:'Tipos y conocimiento',tag:'PREGUNTAS'},
 grid:{sprite:138,title:'Cuadrícula',desc:'Cruzá dos tipos',tag:'ESTRATEGIA'},
 top10:{sprite:150,title:'Top 10',desc:'Completá el ranking',tag:'RANKING'},
 connections:{sprite:133,title:'Conexiones',desc:'Armá cuatro grupos',tag:'GRUPOS'},
 stats700:{sprite:149,title:'Reto 700',desc:'Creá tu campeón',tag:'ESTADÍSTICAS'},
 impostor:{sprite:54,title:'El impostor',desc:'Encontrá al diferente',tag:'DEDUCCIÓN'},
 pokedle:{sprite:132,title:'Pokédle',desc:'Adiviná el Pokémon',tag:'ILIMITADO'},
 speed:{sprite:135,title:'Más rápido',desc:'Compará Velocidad',tag:'DUELO'},
 evolution:{sprite:4,title:'Evoluciones',desc:'Completá la cadena',tag:'EVOLUCIÓN'},
 battle:{sprite:448,title:'Batalla de Gimnasio',desc:'Elegí tu equipo y combatí',tag:'COMBATE'}
};

function decorateGameCards(){
 document.querySelectorAll('.console>.game-tabs [data-game]').forEach((button,index)=>{
  const game=button.dataset.game,meta=POKEQUIZZ_GAME_CARDS[game];if(!meta)return;
  button.classList.toggle('is-battle-card',game==='battle');
  button.innerHTML=`<span class="game-number">${String(index+1).padStart(2,'0')}</span><img class="game-card-sprite" src="${spriteUrl(meta.sprite)}" alt="" width="76" height="76"><span class="game-card-copy"><small>${meta.tag}</small><strong>${meta.title}</strong><em>${meta.desc}</em></span><span class="game-card-action">JUGAR <b>▶</b></span><span class="game-card-done" aria-hidden="true">✓</span>`;
  button.setAttribute('aria-label',`${meta.title}. ${meta.desc}`);
 });
 paintDailyCards();
}

function paintDailyCards(){
 document.querySelectorAll('.console>.game-tabs [data-game]').forEach(button=>{
  let done=false;try{done=typeof isDailyPlayed==='function'&&isDailyPlayed(button.dataset.game);}catch{}
  button.classList.toggle('is-complete',done);
  const marker=button.querySelector('.game-card-done');if(marker)marker.setAttribute('aria-hidden',String(!done));
 });
}

function selectedGenerationSummary(){
 const selected=[...document.querySelectorAll('.multi-generation input:checked')].map(input=>input.parentElement.textContent.trim());
 return selected.length===9?'Todas las regiones':selected.length?selected.join(' · '):'Ninguna región';
}

function updateGenerationSummary(){
 const summary=document.querySelector('.generation-summary strong'),count=document.getElementById('pool-count');
 if(summary)summary.textContent=selectedGenerationSummary();
 const counter=document.querySelector('.generation-summary small:last-child');if(counter&&count)counter.textContent=count.textContent;
 const selected=[...document.querySelectorAll('.multi-generation input:checked')];document.body.dataset.regionTheme=selected.length===1?selected[0].value:selected.length?'all':'none';
}

function installSectionTracking(modeDock,consolePanel,infinite){
 const setActive=target=>modeDock.querySelectorAll('[data-home-target]').forEach(button=>button.classList.toggle('is-active',button.dataset.homeTarget===target));
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target===infinite?'infinite':'daily');},{rootMargin:'-20% 0px -55%',threshold:[.05,.25,.5]});observer.observe(consolePanel);observer.observe(infinite);}
 document.getElementById('game-window')?.addEventListener('close',()=>setTimeout(()=>{const box=infinite.getBoundingClientRect();setActive(box.top<innerHeight*.55&&box.bottom>innerHeight*.25?'infinite':'daily');}));return setActive;
}

function buildDsShell(intro,modeDock,generationToggle,generationControl,consolePanel){
 const shell=document.createElement('section');shell.className='home-ds';shell.setAttribute('aria-label','Consola PokéQuizz');intro.insertAdjacentElement('beforebegin',shell);
 const top=document.createElement('div');top.className='ds-screen ds-top-screen';const bottom=document.createElement('div');bottom.className='ds-screen ds-bottom-screen';const homeSlot=generationToggle.previousElementSibling;homeSlot?.classList.add('generation-home-slot');
 shell.append(top,modeDock,bottom);top.append(intro);if(homeSlot)bottom.append(homeSlot);bottom.append(generationToggle,generationControl,consolePanel);
}

function installGameTransitions(){
 const gameWindow=document.getElementById('game-window');if(!gameWindow)return;const observer=new MutationObserver(()=>{if(!gameWindow.open)return;let game='guess';try{game=typeof pendingWindowGame==='string'?pendingWindowGame:current;}catch{game=current;}const meta=POKEQUIZZ_GAME_CARDS[game]||POKEQUIZZ_GAME_CARDS.guess;gameWindow.querySelector('.game-entry-transition')?.remove();const transition=document.createElement('div');transition.className='game-entry-transition';transition.innerHTML=`<span>INICIANDO DESAFÍO</span><img src="${spriteUrl(meta.sprite)}" alt="" width="112" height="112"><strong>${meta.title}</strong><i></i>`;gameWindow.append(transition);setTimeout(()=>transition.remove(),850);});observer.observe(gameWindow,{attributes:true,attributeFilter:['open']});
}

function buildHomeNavigation(){
 const intro=document.querySelector('.intro'),generationControl=document.querySelector('.generation-control'),consolePanel=document.querySelector('.console'),infinite=document.querySelector('.infinite-zone');
 if(!intro||!generationControl||!consolePanel||!infinite)return;
 const modeDock=document.createElement('nav');modeDock.className='mode-dock';modeDock.setAttribute('aria-label','Modos de juego');
 modeDock.innerHTML='<button type="button" class="is-active" data-home-target="daily"><span>◉</span><b>Diarios</b><small>11 desafíos</small></button><button type="button" data-home-target="infinite"><span>∞</span><b>Infinito</b><small>Sin límites</small></button><button type="button" data-home-target="battle"><span>⚔</span><b>Batalla</b><small>Contra líderes</small></button>';
 intro.insertAdjacentElement('afterend',modeDock);

 const generationToggle=document.createElement('button');generationToggle.type='button';generationToggle.className='generation-toggle';generationToggle.setAttribute('aria-expanded','false');
 generationToggle.innerHTML='<span class="generation-toggle-icon">▣</span><span class="generation-summary"><small>GENERACIONES ELEGIDAS</small><strong>Todas las regiones</strong><small></small></span><span class="generation-toggle-action">CAMBIAR <b>⌄</b></span>';
 generationControl.insertAdjacentElement('beforebegin',generationToggle);generationControl.classList.add('home-collapsed');
 generationToggle.onclick=()=>{const open=generationControl.classList.toggle('home-expanded');generationToggle.setAttribute('aria-expanded',String(open));generationToggle.querySelector('.generation-toggle-action').innerHTML=`${open?'CERRAR':'CAMBIAR'} <b>${open?'⌃':'⌄'}</b>`;};

 const menuHead=document.createElement('div');menuHead.className='console-menu-head';menuHead.innerHTML='<div><span class="eyebrow">DESAFÍOS DEL DÍA</span><h2>Elegí tu juego</h2></div><div class="menu-head-hint"><span>◀</span> SELECCIONÁ UNA TARJETA <span>▶</span></div>';
 consolePanel.querySelector('.game-tabs').insertAdjacentElement('beforebegin',menuHead);

 const setActive=installSectionTracking(modeDock,consolePanel,infinite);
 modeDock.onclick=event=>{const button=event.target.closest('[data-home-target]');if(!button)return;const target=button.dataset.homeTarget;setActive(target);if(target==='battle'){document.querySelector('[data-game="battle"]')?.click();return;}(target==='infinite'?infinite:consolePanel).scrollIntoView({behavior:'smooth',block:'start'});};
 document.querySelector('.multi-generation')?.addEventListener('change',()=>setTimeout(updateGenerationSummary));
 document.getElementById('all-generations')?.addEventListener('click',()=>setTimeout(updateGenerationSummary));
 document.getElementById('no-generations')?.addEventListener('click',()=>setTimeout(updateGenerationSummary));
 setTimeout(updateGenerationSummary);
 buildDsShell(intro,modeDock,generationToggle,generationControl,consolePanel);
}

decorateGameCards();
buildHomeNavigation();
installGameTransitions();

try{
 const originalMarkDailyPlayed=markDailyPlayed;
 markDailyPlayed=function(...args){const result=originalMarkDailyPlayed(...args);paintDailyCards();return result;};
}catch{}
