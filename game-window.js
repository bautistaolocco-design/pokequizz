'use strict';
const windowGames=['guess','quiz','grid','top10','connections','stats700','impostor','pokedle','speed','evolution','battle'];
const windowTitles={guess:'¿Quién es ese Pokémon?',quiz:'Quiz Pokémon',grid:'Cuadrícula',top10:'Top 10',connections:'Conexiones',stats700:'Reto 700',impostor:'El impostor',pokedle:'Pokédle',speed:'¿Quién es más rápido?',evolution:'Cadena evolutiva',battle:'Batalla de Gimnasio'};
const triviaStats=['PS','Ataque','Defensa','Ataque Especial','Defensa Especial','Velocidad'];
// Lore, anime e inspiraciones. Cuando una inspiración no fue confirmada oficialmente,
// el texto la presenta como una semejanza visual y no como un origen definitivo.
const curatedFacts=[
 {id:'bulbasaur-design',mon:1,title:'Bulbasaur',kind:'INSPIRACIÓN',text:'Su diseño mezcla rasgos de un pequeño animal cuadrúpedo con un bulbo vegetal que crece junto a él desde que nace.'},
 {id:'pikachu-cheeks',mon:25,title:'Pikachu',kind:'POKÉDEX',text:'Almacena electricidad en las bolsas de sus mejillas. Cuando varios se reúnen, sus descargas pueden provocar tormentas eléctricas.'},
 {id:'arcanine-legendary',mon:59,title:'Arcanine',kind:'HISTORIA',text:'Aunque no pertenece al grupo de los Pokémon legendarios, su categoría oficial en la Pokédex es “Pokémon Legendario”, una rareza que conserva desde Kanto.'},
 {id:'farfetchd-idiom',mon:83,title:"Farfetch'd",kind:'INSPIRACIÓN',text:'El pato con un puerro alude a una expresión japonesa sobre algo sorprendentemente conveniente: que un pato llegue trayendo incluso el ingrediente para cocinarlo.'},
 {id:'ditto-transform',mon:132,title:'Ditto',kind:'POKÉDEX',text:'Reorganiza toda su estructura celular para transformarse. Si intenta copiar algo de memoria, puede equivocarse en algunos detalles.'},
 {id:'mew-secret',mon:151,title:'Mew',kind:'VIDEOJUEGOS',text:'Fue incorporado a los primeros juegos cuando el desarrollo ya estaba muy avanzado y se convirtió en uno de los grandes secretos de la primera generación.'},
 {id:'hooh-anime',mon:250,title:'Ho-Oh',kind:'ANIME',text:'Apareció ante Ash y Pikachu al final del primer episodio del anime, antes de que la segunda generación y el propio Ho-Oh fueran presentados oficialmente en los videojuegos.',source:'https://www.pokemon.com/us/animation/movies/pokemon-the-movie-i-choose-you',sourceLabel:'Pokémon · I Choose You!'},
 {id:'unown-alphabet',mon:201,title:'Unown',kind:'INSPIRACIÓN',text:'Sus formas imitan las letras del alfabeto latino; además existen dos signos inspirados en la exclamación y la interrogación.'},
 {id:'sudowoodo-fake',mon:185,title:'Sudowoodo',kind:'POKÉDEX',text:'Parece un árbol, pero es de tipo Roca. Su nombre combina la idea de “pseudo” con “wood”, madera en inglés: literalmente, una madera falsa.'},
 {id:'smeargle-paint',mon:235,title:'Smeargle',kind:'DISEÑO',text:'La punta de su cola funciona como un pincel y deja una marca de pintura única para cada ejemplar.'},
 {id:'delibird-sack',mon:225,title:'Delibird',kind:'DISEÑO',text:'La bolsa que lleva no es un objeto separado: es su propia cola, que usa para transportar comida y compartirla con viajeros perdidos.'},
 {id:'shuckle-juice',mon:213,title:'Shuckle',kind:'POKÉDEX',text:'Guarda bayas dentro de su caparazón. Con el tiempo se mezclan con sus fluidos corporales y se convierten en un jugo especial.'},
 {id:'treecko-gecko',mon:252,title:'Treecko',kind:'INSPIRACIÓN',text:'Su cuerpo, sus dedos adherentes y su habilidad para trepar recuerdan a los geckos, lagartos capaces de aferrarse a superficies verticales.'},
 {id:'ludicolo-kappa',mon:272,title:'Ludicolo',kind:'INSPIRACIÓN',text:'Combina una planta acuática y un ave con rasgos que recuerdan al kappa del folclore japonés; su silueta también parece llevar un sombrero festivo.'},
 {id:'shedinja-shell',mon:292,title:'Shedinja',kind:'NATURALEZA',text:'Representa la cáscara vacía que deja una cigarra al mudar. Por eso aparece de forma especial cuando Nincada evoluciona y queda un espacio libre en el equipo.'},
 {id:'sableye-gems',mon:302,title:'Sableye',kind:'DISEÑO',text:'Vive en cuevas y come minerales; los cristales que consume terminan apareciendo en su cuerpo y explican sus ojos con forma de gema.'},
 {id:'castform-weather',mon:351,title:'Castform',kind:'VIDEOJUEGOS',text:'Fue creado por el Instituto Meteorológico de Hoenn y cambia de forma según haya sol intenso, lluvia o granizo.'},
 {id:'rayquaza-ozone',mon:384,title:'Rayquaza',kind:'POKÉDEX',text:'La Pokédex cuenta que vive durante cientos de millones de años en la capa de ozono, alimentándose de meteoritos.'},
 {id:'drifloon-balloon',mon:425,title:'Drifloon',kind:'POKÉDEX',text:'Parece un globo, pero su historia es bastante inquietante: la Pokédex dice que intenta llevarse a los niños que lo confunden con uno de verdad.'},
 {id:'spiritomb-108',mon:442,title:'Spiritomb',kind:'LEYENDA',text:'Está formado por 108 espíritus encerrados en una Piedra Espíritu. Incluso su peso oficial es 108 kg, repitiendo ese número simbólico.',source:'https://www.pokemon.com/it/pokedex/spiritomb',sourceLabel:'Pokédex oficial · Spiritomb'},
 {id:'rotom-appliances',mon:479,title:'Rotom',kind:'VIDEOJUEGOS',text:'Puede introducirse en electrodomésticos y cambiar de forma. Cada aparato modifica también uno de sus tipos y le da un movimiento característico.'},
 {id:'chingling-bell',mon:433,title:'Chingling',kind:'INSPIRACIÓN',text:'Su cuerpo recuerda a un suzu, una campanilla japonesa. Al saltar, la esfera de su garganta produce un sonido agudo.'},
 {id:'froslass-yukionna',mon:478,title:'Froslass',kind:'INSPIRACIÓN',text:'Su apariencia recuerda a la yuki-onna, el espíritu femenino de la nieve del folclore japonés, vestido con un kimono blanco.'},
 {id:'bronzong-dotaku',mon:437,title:'Bronzong',kind:'INSPIRACIÓN',text:'Su forma se parece a una dōtaku, antigua campana japonesa de bronce vinculada a rituales agrícolas.'},
 {id:'darumaka-daruma',mon:554,title:'Darumaka',kind:'INSPIRACIÓN',text:'Su cuerpo redondo y su rostro recuerdan a los muñecos daruma japoneses, símbolos de perseverancia y buena fortuna.'},
 {id:'sigilyph-nazca',mon:561,title:'Sigilyph',kind:'INSPIRACIÓN',text:'Su diseño geométrico y su papel como guardián de una antigua ciudad recuerdan a los enormes geoglifos de Nazca.'},
 {id:'cofagrigus-sarcophagus',mon:563,title:'Cofagrigus',kind:'INSPIRACIÓN',text:'Combina un sarcófago egipcio con un espíritu. La Pokédex afirma que castiga a los saqueadores que se acercan buscando tesoros.'},
 {id:'vanillite-snow',mon:582,title:'Vanillite',kind:'DISEÑO',text:'Parece un helado, pero su parte blanca es nieve: su cuerpo verdadero es el carámbano azul que queda debajo.'},
 {id:'trubbish-trash',mon:568,title:'Trubbish',kind:'DISEÑO',text:'Nació de una bolsa de basura y residuos industriales. Las puntas de su cabeza representan el nudo de la bolsa.'},
 {id:'klink-gears',mon:599,title:'Klink',kind:'DISEÑO',text:'Está formado por dos engranajes que encajan entre sí. Cada pareja tiene dientes diseñados para su compañero y no encaja bien con otra.'},
 {id:'chespin-chestnut',mon:650,title:'Chespin',kind:'INSPIRACIÓN',text:'Su nombre y su caparazón vegetal recuerdan a una castaña dentro de su erizo, combinada con rasgos de un pequeño mamífero.'},
 {id:'fennekin-fox',mon:653,title:'Fennekin',kind:'INSPIRACIÓN',text:'Sus enormes orejas recuerdan al fénec, un zorro del desierto que usa sus orejas para liberar calor y detectar sonidos.'},
 {id:'froakie-foam',mon:656,title:'Froakie',kind:'DISEÑO',text:'La espuma que lleva alrededor del cuello y la espalda se llama Frubbles; puede usarla como protección o lanzarla para inmovilizar rivales.'},
 {id:'hawlucha-wrestling',mon:701,title:'Hawlucha',kind:'INSPIRACIÓN',text:'Combina un ave de presa con la lucha libre mexicana: su máscara, sus poses y sus movimientos imitan a un luchador aéreo.'},
 {id:'aegislash-royal',mon:681,title:'Aegislash',kind:'LEYENDA',text:'Es una espada y un escudo embrujados. La Pokédex dice que puede reconocer cualidades de liderazgo y que, en el pasado, ayudó a elegir reyes.'},
 {id:'klefki-keys',mon:707,title:'Klefki',kind:'DISEÑO',text:'Colecciona llaves que le gustan y las protege durante toda su vida. El aro central es parte de su cuerpo; las demás llaves son objetos reunidos.'},
 {id:'rowlet-bowtie',mon:722,title:'Rowlet',kind:'DISEÑO',text:'Es un pequeño búho cuya hoja frontal parece al mismo tiempo una pajarita. Puede girar la cabeza casi por completo para vigilar detrás de él.'},
 {id:'oricorio-dances',mon:741,title:'Oricorio',kind:'CULTURA',text:'Sus cuatro estilos representan bailes distintos. El Animado recuerda a una animadora, el Plácido al hula, el Apasionado al flamenco y el Refinado al baile japonés.'},
 {id:'wishiwashi-school',mon:746,title:'Wishiwashi',kind:'NATURALEZA',text:'Un ejemplar parece indefenso, pero muchos se reúnen para formar una criatura gigantesca: su Forma Banco.'},
 {id:'mimikyu-costume',mon:778,title:'Mimikyu',kind:'HISTORIA',text:'Usa un disfraz hecho a mano para parecerse a Pikachu porque desea recibir el mismo cariño que él.'},
 {id:'sandygast-castle',mon:769,title:'Sandygast',kind:'POKÉDEX',text:'Surge cuando el rencor de una criatura caída posee un montículo de arena. La pala clavada en su cabeza funciona como una especie de radar.'},
 {id:'komala-log',mon:775,title:'Komala',kind:'POKÉDEX',text:'Pasa toda su vida dormido y se aferra a un tronco desde que nace. Sus movimientos en combate son simples gestos que hace mientras sueña.'},
 {id:'grookey-drum',mon:810,title:'Grookey',kind:'DISEÑO',text:'Golpea objetos con su baqueta; el ritmo transmite energía a las plantas y puede devolverles color y vitalidad.'},
 {id:'sobble-chameleon',mon:816,title:'Sobble',kind:'INSPIRACIÓN',text:'Recuerda a un camaleón: cambia el color de su cuerpo para mezclarse con el entorno y puede volverse casi invisible dentro del agua.'},
 {id:'corviknight-taxi',mon:823,title:'Corviknight',kind:'MUNDO POKÉMON',text:'En Galar trabaja como taxi volador y transporta personas entre ciudades dentro de una cabina.'},
 {id:'cursola-coral',mon:864,title:'Cursola',kind:'INSPIRACIÓN',text:'Su cuerpo blanco y fantasmal recuerda al blanqueamiento de los corales, un fenómeno en el que pierden sus algas y su color.'},
 {id:'falinks-formation',mon:870,title:'Falinks',kind:'INSPIRACIÓN',text:'No es una sola criatura: está formado por seis individuos que marchan juntos como una pequeña formación militar.'},
 {id:'polteageist-tea',mon:855,title:'Polteageist',kind:'DISEÑO',text:'Es un espíritu que habita una tetera antigua. Algunas teteras llevan una marca de autenticidad, detalle que crea formas raras dentro del juego.'},
 {id:'sprigatito-catnip',mon:906,title:'Sprigatito',kind:'POKÉDEX',text:'El aroma dulce de su pelaje puede fascinar a quienes lo rodean. Al amasar con sus patas libera ese olor, como un gato jugando con hierba aromática.'},
 {id:'fuecoco-pepper',mon:909,title:'Fuecoco',kind:'INSPIRACIÓN',text:'Su silueta combina un cocodrilo joven con la forma y el color de un pimiento rojo.'},
 {id:'quaxly-duck',mon:912,title:'Quaxly',kind:'DISEÑO',text:'La crema que produce su plumaje repele el agua y la suciedad. Por eso mantiene impecable el copete que parece un sombrero de marinero.'},
 {id:'smoliv-olive',mon:928,title:'Smoliv',kind:'INSPIRACIÓN',text:'Está inspirado en una aceituna. El aceite de su cabeza es tan amargo que lo lanza para frenar a sus enemigos y escapar.'},
 {id:'fidough-dough',mon:926,title:'Fidough',kind:'DISEÑO',text:'Su piel húmeda y elástica recuerda a la masa de pan. La levadura de su aliento puede fermentar lo que encuentra alrededor.'},
 {id:'gimmighoul-coins',mon:999,title:'Gimmighoul',kind:'VIDEOJUEGOS',text:'Guarda monedas dentro de un cofre y necesita reunir 999 para evolucionar en Gholdengo, el Pokémon número 1000 de la Pokédex Nacional.'},
 {id:'psyduck-headache',mon:54,title:'Psyduck',kind:'POKÉDEX',text:'Sufre dolores de cabeza constantes. Cuando el dolor se vuelve muy intenso libera poderes psíquicos que después no recuerda haber usado.'},
 {id:'cubone-skull',mon:104,title:'Cubone',kind:'HISTORIA',text:'Lleva el cráneo de su madre como casco. Sus historias de Pokédex cuentan que sus lágrimas producen un sonido triste al resonar dentro de él.'},
 {id:'eevee-genes',mon:133,title:'Eevee',kind:'EVOLUCIÓN',text:'Su estructura genética es especialmente inestable y puede adaptarse a distintos entornos, razón que explica su gran cantidad de evoluciones.'},
 {id:'porygon-digital',mon:137,title:'Porygon',kind:'TECNOLOGÍA',text:'Fue creado por programación informática y puede entrar en el ciberespacio, algo excepcional incluso dentro del mundo Pokémon.'},
 {id:'deoxys-virus',mon:386,title:'Deoxys',kind:'ORIGEN',text:'Nació cuando un virus extraterrestre sufrió una mutación al ser alcanzado por un rayo láser. El cristal de su pecho funciona como su cerebro.'},
 {id:'regigigas-continents',mon:486,title:'Regigigas',kind:'LEYENDA',text:'Las leyendas de Sinnoh dicen que arrastró continentes usando enormes cuerdas y que creó Pokémon a partir de distintos materiales.'},
 {id:'golurk-purpose',mon:623,title:'Golurk',kind:'HISTORIA',text:'Una antigua civilización lo construyó para proteger personas y Pokémon. Puede volar a gran velocidad cuando guarda sus piernas dentro del cuerpo.'},
 {id:'chatot-voice',mon:441,title:'Chatot',kind:'SONIDO',text:'Su lengua tiene una forma parecida a una lengua humana y puede imitar palabras. Su cabeza también recuerda a una corchea musical.'},
 {id:'munna-dreams',mon:517,title:'Munna',kind:'POKÉDEX',text:'Se alimenta de sueños. Si consume una pesadilla, expulsa una neblina cuyo color cambia según el contenido del sueño.'},
 {id:'applin-apple',mon:840,title:'Applin',kind:'DISEÑO',text:'Se esconde dentro de una manzana desde que nace. La fruta le sirve como alimento, refugio y parte de su camuflaje.'},
 {id:'tinkaton-corviknight',mon:959,title:'Tinkaton',kind:'COMPORTAMIENTO',text:'Usa su enorme martillo para lanzar rocas hacia el cielo e intentar derribar a Corviknight, motivo por el que ambos aparecen relacionados en sus historias.'},
 {id:'palafin-hero',mon:964,title:'Palafin',kind:'DISEÑO',text:'Su Forma Ingenua parece casi idéntica a Finizen, pero al retirarse y regresar al combate adopta su poderosa Forma Heroica.'},
 {id:'region-kanto',mon:25,title:'Kanto',kind:'REGIÓN',text:'Comparte su nombre con la región real japonesa donde se encuentra Tokio. Fue el escenario de los primeros videojuegos y de los primeros pasos de Ash.'},
 {id:'region-johto',mon:250,title:'Johto',kind:'REGIÓN',text:'Profundizó la historia del mundo Pokémon con las Ruinas Alfa, las torres de Ciudad Iris y leyendas como la de Ho-Oh y las tres bestias.'},
 {id:'region-hoenn',mon:384,title:'Hoenn',kind:'REGIÓN',text:'Está marcada por el contraste entre tierra y mar. Ese conflicto se refleja en Groudon y Kyogre, mientras Rayquaza mantiene el equilibrio.'},
 {id:'region-sinnoh',mon:493,title:'Sinnoh',kind:'REGIÓN',text:'Sus leyendas explican el origen del universo Pokémon mediante Arceus y los seres relacionados con el tiempo, el espacio y la antimateria.'},
 {id:'region-unova',mon:643,title:'Teselia',kind:'REGIÓN',text:'Fue la primera región principal situada lejos de las regiones inspiradas en Japón y comenzó su Pokédex regional únicamente con Pokémon nuevos.'},
 {id:'region-kalos',mon:716,title:'Kalos',kind:'REGIÓN',text:'Toma inspiración de Francia: Ciudad Luminalia recuerda a París y su torre central evoca a la Torre Eiffel.',source:'https://www.pokemon.com/es/noticias/celebra-25-anos-de-pokemon-con-los-mejores-momentos-de-la-region-de-kalos',sourceLabel:'Pokémon · Especial de Kalos'},
 {id:'region-alola',mon:785,title:'Alola',kind:'REGIÓN',text:'Sustituyó los gimnasios tradicionales por el recorrido insular, con pruebas, capitanes y grandes kahunas repartidos entre cuatro islas principales.'},
 {id:'region-galar',mon:890,title:'Galar',kind:'REGIÓN',text:'Convirtió los combates en un espectáculo de estadio. Parte de su paisaje y del fenómeno Dynamax se inspiró en lugares y relatos del Reino Unido.',source:'https://assets.pokemon.com/assets/cms2-fr-fr/pdf/video-game/sword-shield/Galar_Tour_Brochure_FR.pdf',sourceLabel:'Pokémon · Guía de inspiración de Galar'},
 {id:'region-paldea',mon:1007,title:'Paldea',kind:'REGIÓN',text:'Fue la primera región principal diseñada alrededor de una aventura de mundo abierto con tres rutas que pueden recorrerse en el orden que el jugador elija.',source:'https://www.pokemon.com/es/videojuegos-pokemon/pokemon-escarlata-y-pokemon-purpura',sourceLabel:'Pokémon Escarlata y Púrpura'}
];
const factEntries=mons.map(m=>{
 const children=mons.filter(c=>c.parent===m.id),max=Math.max(...m.stats),best=m.stats.map((v,i)=>v===max?triviaStats[i]:null).filter(Boolean).join(' y ');
 let text=`La estadística base más alta de ${m.name} es ${best}, con ${max} puntos.`;
 if(children.length>1)text=`${m.name} tiene ${children.length} evoluciones directas de especies distintas: ${children.map(c=>c.name).join(', ')}. La evolución disponible depende de sus condiciones y, en algunos casos, de su forma.`;
 else if(m.id%4===0)text=`${m.name} mide ${m.height/10} m y pesa ${m.weight/10} kg en su forma base. Debutó en la generación ${m.gen}.`;
 else if(m.id%4===1&&m.abilities.length)text=`${m.name} puede tener ${m.abilities.map(a=>POKE_DATA.abilityNames[a]).join(' o ')} como habilidad en su forma base, contando también las habilidades ocultas.`;
 else if(m.id%4===2&&m.parent){const parent=mons.find(p=>p.id===m.parent);if(parent)text=`${m.name} evoluciona de ${parent.name}. ${parent.gen!==m.gen?`Su preevolución debutó en la generación ${parent.gen}, pero ${m.name} llegó en la ${m.gen}.`:`Ambos debutaron en la generación ${m.gen}.`}`;}
 return{id:`pokemon-${m.id}`,title:m.name,text,sprite:m.sprite,kind:'POKÉMON'};
});
regionNames.forEach((region,i)=>{const group=mons.filter(m=>m.gen===i+1&&m.id<=1025);factEntries.push({id:`region-${i+1}`,title:`${region} · Generación ${i+1}`,text:`La generación ${i+1} incorporó ${group.length} especies nuevas: la numeración de la Pokédex Nacional va desde ${group[0].name} (#${group[0].id}) hasta ${group[group.length-1].name} (#${group[group.length-1].id}).`,sprite:group[0].sprite,kind:'GENERACIÓN'});});
const curatedFactEntries=curatedFacts.map(f=>{const mon=mons.find(m=>m.id===f.mon);return{...f,sprite:mon?.sprite||54,source:f.source||`https://www.pokemon.com/us/pokedex/${mon?.name.toLowerCase().replaceAll(' ','-').replaceAll("'",'')||'psyduck'}`,sourceLabel:f.sourceLabel||'Pokédex oficial de Pokémon'};});
const dailyFactOrder=seededShuffle(curatedFactEntries,seededRandom('poke-curiosities-v3'));
function dailyFactSlot(game,date=dayKey()){const index=windowGames.indexOf(game);if(index<0)throw new Error('Juego no válido');const day=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);return((day*windowGames.length+index)%dailyFactOrder.length+dailyFactOrder.length)%dailyFactOrder.length;}
function gameFact(game,date=dayKey()){const slot=dailyFactSlot(game,date),fact=dailyFactOrder[slot],previous=dailyFactOrder[dailyFactSlot(game,priorDayKey(date))];return fact.id===previous.id?dailyFactOrder[(slot+1)%dailyFactOrder.length]:fact;}
const gameWindow=document.createElement('dialog');gameWindow.id='game-window';gameWindow.setAttribute('aria-labelledby','window-game-title');
gameWindow.innerHTML='<div class="window-header"><span id="window-game-title"></span><span class="modal-streak" aria-label="Racha diaria">🔥 <b data-streak-count>0</b></span><button type="button" id="close-game-window" aria-label="Cerrar juego y volver al menú">× <span>Menú</span></button></div><section id="daily-fact-panel" aria-labelledby="daily-fact-title"></section><div id="window-play-area"></div>';
document.body.append(gameWindow);
const playScreen=document.querySelector('.screen'),generationControl=document.querySelector('.generation-control'),generationHome=document.createElement('div');generationControl.insertAdjacentElement('beforebegin',generationHome);$('window-play-area').append(playScreen);
const difficultyBar=document.createElement('fieldset');difficultyBar.className='game-difficulty';difficultyBar.innerHTML='<legend>Dificultad</legend><label><input type="radio" name="game-difficulty" value="easy"> Fácil</label><label><input type="radio" name="game-difficulty" value="medium"> Medio</label><label><input type="radio" name="game-difficulty" value="expert"> Experto</label><small id="difficulty-description"></small>';playScreen.insertAdjacentElement('beforebegin',difficultyBar);
const difficultyDescriptions={easy:'Más pistas y opciones más claras.',medium:'La experiencia equilibrada.',expert:'Menos pistas y decisiones más difíciles.'};
function configureDifficulty(game){difficultyBar.hidden=game==='stats700';if(game==='stats700')return;try{gameDifficulty=localStorage.getItem(`poke-difficulty:${game}`)||'medium';}catch{gameDifficulty='medium';}if(!['easy','medium','expert'].includes(gameDifficulty))gameDifficulty='medium';connectionMode={easy:'easy',medium:'normal',expert:'hard'}[gameDifficulty];difficultyBar.querySelectorAll('input').forEach(input=>input.checked=input.value===gameDifficulty);$('difficulty-description').textContent=difficultyDescriptions[gameDifficulty];}
let pendingWindowGame=null,windowEntry=true,windowOpener=null,factShownDate='',infiniteMode=false;
const DAILY_PLAY_PREFIX='poke-played-v2';
const DAILY_STREAK_KEY='poke-daily-streak-v2',DAILY_RECORD_KEY='poke-daily-record-v2';
let dailyRecord={wins:0,losses:0};
try{const saved=JSON.parse(localStorage.getItem(DAILY_RECORD_KEY));if(Number.isInteger(saved?.wins)&&Number.isInteger(saved?.losses))dailyRecord=saved;}catch{}
function updateStreakUI(){let count=0;try{count=Number(JSON.parse(localStorage.getItem(DAILY_STREAK_KEY))?.count)||0;}catch{}document.querySelectorAll('[data-streak-count]').forEach(e=>e.textContent=String(count));}
function previousDay(date){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}
function registerDailyStreak(){const today=dayKey();try{const old=JSON.parse(localStorage.getItem(DAILY_STREAK_KEY)),count=old?.date===today?(Number(old.count)||1):old?.date===previousDay(today)?(Number(old.count)||0)+1:1;localStorage.setItem(DAILY_STREAK_KEY,JSON.stringify({date:today,count}));}catch{}updateStreakUI();}
function updateDailyRecordUI(){if($('record-correct'))$('record-correct').textContent=String(dailyRecord.wins);if($('record-wrong'))$('record-wrong').textContent=String(dailyRecord.losses);}
function recordDailyResult(won){if(won)dailyRecord.wins++;else dailyRecord.losses++;try{localStorage.setItem(DAILY_RECORD_KEY,JSON.stringify(dailyRecord));}catch{}updateDailyRecordUI();}
updateStreakUI();updateDailyRecordUI();
function dailyPlayKey(game,date=dayKey()){return `${DAILY_PLAY_PREFIX}:${date}:${game}`;}
function isDailyPlayed(game){try{return localStorage.getItem(dailyPlayKey(game))==='done';}catch{return false;}}
function unlockInfiniteControls(){
 document.querySelectorAll('.play-again,#new700,#extra-again').forEach(button=>button.disabled=false);
 if($('restart')&&!(current==='stats700'&&typeof active700==='function'&&active700())){$('restart').disabled=false;$('restart').textContent='↻ Nueva partida';}
}
function lockReplayControls(){
 const selectors=['.play-again','#new700','#impostor-again','#pokedle-next','#extra-again','#give-up'];
 document.querySelectorAll(selectors.join(',')).forEach(button=>{button.disabled=true;button.textContent='Disponible a las 09:00';});
 if($('restart')){$('restart').disabled=true;$('restart').textContent='✓ Partida de hoy completada';}
}
function addReturnToMenuButton(){
 if(!gameWindow.open||$('return-to-main-menu'))return;
 const button=document.createElement('button');button.type='button';button.id='return-to-main-menu';button.className='next return-menu';button.textContent='← Volver al menú';button.onclick=closeGameWindow;
 const result=document.querySelector('#game .result');(result||$('feedback')||$('game')).append(button);
}
function addInfiniteReplayButton(game){
 if(!gameWindow.open||$('infinite-play-again')||document.querySelector('#game .play-again,#game #new700,#game #extra-again'))return;
 const button=document.createElement('button');button.type='button';button.id='infinite-play-again';button.className='next';button.textContent='↻ Otra partida infinita';button.onclick=()=>start(game);
 const result=document.querySelector('#game .result');(result||$('feedback')||$('game')).append(button);
}
function markDailyPlayed(game,won=true){
 if(infiniteMode){queueMicrotask(()=>{unlockInfiniteControls();addInfiniteReplayButton(game);addReturnToMenuButton();});return;}
 const already=isDailyPlayed(game);try{localStorage.setItem(dailyPlayKey(game),'done');}catch{}if(!already){registerDailyStreak();recordDailyResult(won);}
 queueMicrotask(()=>{lockReplayControls();addReturnToMenuButton();});
}
function showDailyLock(game){
 clearTimeout(timeout);clearInterval(clock);current=game;$('feedback').replaceChildren();
 $('game-label').textContent='DESAFÍO DIARIO COMPLETADO';$('game-title').textContent=windowTitles[game];
 $('game').innerHTML='<div class="result daily-lock"><span class="eyebrow">UNA PARTIDA POR DÍA</span><h3>¡Ya jugaste hoy!</h3><p>El próximo desafío estará disponible a las 09:00 de Argentina.</p></div>';
 $('progress').textContent='VOLVÉ MAÑANA';lockReplayControls();addReturnToMenuButton();
}
const startBeforeWindow=start;
function paintGameFact(){factShownDate=dayKey();const fact=gameFact(pendingWindowGame,factShownDate),played=isDailyPlayed(pendingWindowGame);$('daily-fact-panel').innerHTML=`<div class="fact-art"><img src="${spriteUrl(fact.sprite)}" alt="${fact.title}" width="144" height="144"><span>DATO DIARIO</span></div><div class="fact-copy"><span class="eyebrow">DATO DEL DÍA · ${windowTitles[pendingWindowGame].toUpperCase()} · ${fact.kind}</span><h2 id="daily-fact-title">¿Sabías que…?</h2><h3>${fact.title}</h3><p>${fact.text}</p><small>${factShownDate.split('-').reverse().join('/')} · Mañana habrá uno nuevo desde las 09:00 de Argentina</small><a class="fact-source" href="${fact.source}" target="_blank" rel="noopener">Fuente: ${fact.sourceLabel}</a>${played?'<p class="daily-lock-note">✓ Ya completaste esta partida. Volvé después del reinicio de las 09:00.</p>':''}<button type="button" id="enter-window-game" class="next"${played?' disabled':''}>${played?'Ya jugaste hoy':'Jugar el desafío compartido'}</button></div>`;$('enter-window-game').onclick=()=>{if(isDailyPlayed(pendingWindowGame))return;windowEntry=false;$('window-play-area').prepend(generationControl);$('daily-fact-panel').hidden=true;$('window-play-area').hidden=false;startBeforeWindow(pendingWindowGame);$('game-title').setAttribute('tabindex','-1');$('game-title').focus();};}
start=function(game){
 if(!windowGames.includes(game))return startBeforeWindow(game);
 configureDifficulty(game);
 activeRandom=game==='stats700'?Math.random:seededRandom(dailyChallengeSeed(game));
 if(gameWindow.open&&!windowEntry){pendingWindowGame=game;$('window-game-title').textContent=infiniteMode?`${windowTitles[game]} · Infinito`:windowTitles[game];if(infiniteMode){activeRandom=Math.random;const started=startBeforeWindow(game);queueMicrotask(unlockInfiniteControls);return started;}if(isDailyPlayed(game)){showDailyLock(game);return;}return startBeforeWindow(game);}
 if(!gameWindow.open){clearTimeout(timeout);clearInterval(clock);current=game;windowOpener=document.activeElement;pendingWindowGame=game;windowEntry=true;$('window-play-area').hidden=true;$('daily-fact-panel').hidden=false;gameWindow.showModal();document.body.classList.add('game-window-open');}
 pendingWindowGame=game;$('window-game-title').textContent=windowTitles[game];paintGameFact();$('enter-window-game').focus();
};
difficultyBar.querySelectorAll('input').forEach(input=>input.onchange=()=>{gameDifficulty=input.value;connectionMode={easy:'easy',medium:'normal',expert:'hard'}[gameDifficulty];try{localStorage.setItem(`poke-difficulty:${pendingWindowGame}`,gameDifficulty);}catch{}$('difficulty-description').textContent=difficultyDescriptions[gameDifficulty];if(gameWindow.open&&!windowEntry)start(pendingWindowGame);});
function startInfinite(game){
 if(!['stats700','grid','speed'].includes(game))return;
 clearTimeout(timeout);clearInterval(clock);if($('grid-dialog').open)$('grid-dialog').close();
 infiniteMode=true;windowEntry=false;windowOpener=document.activeElement;pendingWindowGame=game;configureDifficulty(game);activeRandom=Math.random;
 if(game==='stats700')statsGame=null;
 if(!gameWindow.open){gameWindow.showModal();document.body.classList.add('game-window-open');}
 $('window-game-title').textContent=`${windowTitles[game]} · Infinito`;$('daily-fact-panel').hidden=true;$('window-play-area').hidden=false;$('window-play-area').prepend(generationControl);
 startBeforeWindow(game);queueMicrotask(unlockInfiniteControls);$('game-title').setAttribute('tabindex','-1');$('game-title').focus();
}
document.querySelectorAll('[data-infinite]').forEach(button=>button.onclick=()=>startInfinite(button.dataset.infinite));
function closeGameWindow(){if($('grid-dialog').open)$('grid-dialog').close();gameWindow.close();}
$('close-game-window').onclick=closeGameWindow;
gameWindow.addEventListener('close',()=>{clearTimeout(timeout);clearInterval(clock);if(infiniteMode&&current==='stats700')statsGame=null;infiniteMode=false;document.body.classList.remove('game-window-open');generationHome.append(generationControl);genPanel.disabled=false;$('generation').disabled=false;windowOpener?.focus();});
gameWindow.addEventListener('click',e=>{if(e.target!==gameWindow)return;const r=gameWindow.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeGameWindow();});
// Changing generations on the menu updates the pool without opening a game.
function updateHomeGenerations(){syncGenerations();genPanel.disabled=false;$('generation').disabled=false;$('pool-count').textContent=`${eligible().length} Pokémon disponibles`;}
genPanel.querySelectorAll('input').forEach(input=>{input.onchange=()=>{const selected=[...genPanel.querySelectorAll('input:checked')].map(e=>e.value);if(!selected.length){input.checked=true;return;}setGenerationGamesAvailable(true);generation=selected.length===9?'all':selected.join(',');if(gameWindow.open)start(current);else updateHomeGenerations();};});
$('all-generations').onclick=()=>{setGenerationGamesAvailable(true);generation='all';if(gameWindow.open)start(current);else updateHomeGenerations();};
$('no-generations').onclick=()=>{if(gameWindow.open)closeGameWindow();clearGenerationSelection();};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&gameWindow.open&&windowEntry&&factShownDate!==dayKey())paintGameFact();});
// The menu opens with no daily game preselected; a card turns green only after the player chooses it.
if(!gameWindow.open)document.querySelectorAll('[data-game]').forEach(button=>button.setAttribute('aria-pressed','false'));
