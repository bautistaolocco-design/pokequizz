'use strict';

document.body.classList.add('halloween-season');

function installHalloweenDecor(){
 const sky=document.createElement('div');sky.className='halloween-sky';sky.setAttribute('aria-hidden','true');
 sky.innerHTML='<i class="halloween-moon"></i><span class="bat bat-one">⌁</span><span class="bat bat-two">⌁</span><span class="bat bat-three">⌁</span><span class="fog fog-one"></span><span class="fog fog-two"></span>';
 document.body.prepend(sky);

 const intro=document.querySelector('.intro');
 if(intro){
  const eyebrow=intro.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='🎃 TEMPORADA DE HALLOWEEN';
  const parade=document.createElement('div');parade.className='halloween-parade';parade.setAttribute('aria-hidden','true');
  parade.innerHTML='<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png" alt="" width="76" height="76"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/710.png" alt="" width="82" height="82"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/778.png" alt="" width="88" height="88"><span>NOCHE DE<br><b>DESAFÍOS</b></span>';
  (intro.querySelector(':scope > div:first-child')||intro).append(parade);
 }

 const brand=document.querySelector('.brand-copy small');if(brand)brand.textContent='CLUB NOCTURNO DE PSYDUCK';
 const menuHeading=document.querySelector('.console-menu-head .eyebrow');if(menuHeading)menuHeading.textContent='DESAFÍOS DE LA NOCHE';
}

function animateContentSwap(element){
 if(!element)return;let timer=0;
 const observer=new MutationObserver(records=>{
  if(!records.some(record=>record.type==='childList'))return;
  element.classList.remove('content-swap');void element.offsetWidth;element.classList.add('content-swap');
  clearTimeout(timer);timer=setTimeout(()=>element.classList.remove('content-swap'),420);
 });
 observer.observe(element,{childList:true,subtree:false});
}

function installFluidSelections(){
 document.addEventListener('pointerdown',event=>{
  const control=event.target.closest('button,label,.battle-pick,.connection-card,.impostor-card,.stat700-slot');if(!control)return;
  control.classList.remove('selection-tap');void control.offsetWidth;control.classList.add('selection-tap');
  setTimeout(()=>control.classList.remove('selection-tap'),380);
 });
 document.addEventListener('change',event=>{
  const choice=event.target.closest('label');if(!choice)return;
  choice.classList.remove('choice-confirmed');void choice.offsetWidth;choice.classList.add('choice-confirmed');
  setTimeout(()=>choice.classList.remove('choice-confirmed'),440);
 });
 document.addEventListener('click',event=>{
  const launcher=event.target.closest('[data-game],[data-infinite]');if(!launcher)return;
  launcher.classList.add('is-launching');setTimeout(()=>launcher.classList.remove('is-launching'),520);
 });
}

function installWindowFlow(){
 const dialog=document.getElementById('game-window'),fact=document.getElementById('daily-fact-panel'),play=document.getElementById('window-play-area');
 if(!dialog)return;
 const reveal=element=>{if(!element||element.hidden)return;element.classList.remove('panel-reveal');void element.offsetWidth;element.classList.add('panel-reveal');};
 const observer=new MutationObserver(records=>records.forEach(record=>reveal(record.target)));
 if(fact)observer.observe(fact,{attributes:true,attributeFilter:['hidden']});
 if(play)observer.observe(play,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('close',()=>{fact?.classList.remove('panel-reveal');play?.classList.remove('panel-reveal');});
 animateContentSwap(document.getElementById('game'));
 animateContentSwap(document.getElementById('feedback'));
}

installHalloweenDecor();
installFluidSelections();
installWindowFlow();
