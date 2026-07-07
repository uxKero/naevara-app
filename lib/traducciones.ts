// ════════════════════════════════════════════════════════════════
//  lib/traducciones.ts — Capa de traducción curada del contenido SRD
//  que se muestra en las hojas de combate. Nombres oficiales o de uso
//  común en las mesas hispanas; descripciones propias (sin texto con
//  copyright). Fallback: si falta una clave, se muestra el original.
// ════════════════════════════════════════════════════════════════

// ── Clases y razas ──────────────────────────────────────────────
export const CLASS_ES: Record<string, string> = {
  Barbarian: "Bárbaro", Bard: "Bardo", Cleric: "Clérigo", Druid: "Druida",
  Fighter: "Guerrero", Monk: "Monje", Paladin: "Paladín", Ranger: "Explorador",
  Rogue: "Pícaro", Sorcerer: "Hechicero", Warlock: "Brujo", Wizard: "Mago",
};
export const RACE_ES: Record<string, string> = {
  Dwarf: "Enano", Elf: "Elfo", Halfling: "Mediano", Human: "Humano",
  Dragonborn: "Dracónido", Gnome: "Gnomo", "Half-Elf": "Semielfo",
  "Half-Orc": "Semiorco", Tiefling: "Tiflin", "High Elf": "Alto Elfo",
  "Hill Dwarf": "Enano de las Colinas", "Lightfoot Halfling": "Mediano Piesligeros",
  "Rock Gnome": "Gnomo de las Rocas",
};
export const claseES = (n: string) => CLASS_ES[n] ?? n;
export const razaES = (n: string) => RACE_ES[n] ?? n;

// ── Armas ───────────────────────────────────────────────────────
export const WEAPON_ES: Record<string, string> = {
  club: "Garrote", dagger: "Daga", greatclub: "Gran garrote", handaxe: "Hacha de mano",
  javelin: "Jabalina", "light-hammer": "Martillo ligero", mace: "Maza",
  quarterstaff: "Bastón", sickle: "Hoz", spear: "Lanza",
  "crossbow-light": "Ballesta ligera", dart: "Dardo", shortbow: "Arco corto", sling: "Honda",
  battleaxe: "Hacha de batalla", flail: "Mangual", glaive: "Guja", greataxe: "Gran hacha",
  greatsword: "Mandoble", halberd: "Alabarda", lance: "Lanza de caballería",
  longsword: "Espada larga", maul: "Mazo de guerra", morningstar: "Lucero del alba",
  pike: "Pica", rapier: "Estoque", scimitar: "Cimitarra", shortsword: "Espada corta",
  trident: "Tridente", "war-pick": "Pico de guerra", warhammer: "Martillo de guerra",
  whip: "Látigo", blowgun: "Cerbatana", "crossbow-hand": "Ballesta de mano",
  "crossbow-heavy": "Ballesta pesada", longbow: "Arco largo", net: "Red",
};
export const armaES = (index: string, fallback: string) => WEAPON_ES[index] ?? fallback;

// ── Armaduras ───────────────────────────────────────────────────
export const ARMOR_ES: Record<string, string> = {
  "padded-armor": "Armadura acolchada", "leather-armor": "Armadura de cuero",
  "studded-leather-armor": "Cuero tachonado", "hide-armor": "Armadura de pieles",
  "chain-shirt": "Camisa de mallas", "scale-mail": "Cota de escamas",
  breastplate: "Coraza", "half-plate-armor": "Media placa", "ring-mail": "Cota de anillas",
  "chain-mail": "Cota de mallas", "splint-armor": "Armadura de bandas",
  "plate-armor": "Armadura de placas", shield: "Escudo",
};
export const armaduraES = (index: string, fallback: string) => ARMOR_ES[index] ?? fallback;

// ── Duraciones ──────────────────────────────────────────────────
export function duracionES(d: string): string {
  if (!d) return d;
  let out = d
    .replace(/^Concentration,?\s*up to\s*/i, "Concentración, hasta ")
    .replace(/^Up to\s*/i, "Hasta ")
    .replace(/^Instantaneous$/i, "Instantánea")
    .replace(/^Until dispelled or triggered$/i, "Hasta que se disipe o se active")
    .replace(/^Until dispelled$/i, "Hasta que se disipe")
    .replace(/^Special$/i, "Especial");
  out = out
    .replace(/(\d+)\s*rounds?/i, "$1 rondas").replace(/^1 rondas/, "1 ronda")
    .replace(/(\d+)\s*minutes?/i, "$1 minutos").replace(/^(Concentración, hasta |Hasta )?1 minutos/, "$11 minuto")
    .replace(/(\d+)\s*hours?/i, "$1 horas").replace(/1 horas/, "1 hora")
    .replace(/(\d+)\s*days?/i, "$1 días").replace(/1 días/, "1 día");
  return out;
}

// ── Hechizos: nombres en español ────────────────────────────────
export const SPELL_ES: Record<string, string> = {
  // Trucos
  "acid-splash": "Salpicadura de ácido", "chill-touch": "Toque gélido",
  "dancing-lights": "Luces danzantes", "druidcraft": "Druidismo",
  "eldritch-blast": "Explosión sobrenatural", "fire-bolt": "Rayo de fuego",
  guidance: "Orientación", light: "Luz", "mage-hand": "Mano de mago",
  mending: "Remendar", message: "Mensaje", "minor-illusion": "Ilusión menor",
  "poison-spray": "Rociada de veneno", prestidigitation: "Prestidigitación",
  "produce-flame": "Producir llama", "ray-of-frost": "Rayo de escarcha",
  resistance: "Resistencia", "sacred-flame": "Llama sagrada",
  shillelagh: "Garrote mágico", "shocking-grasp": "Toque electrizante",
  "spare-the-dying": "Perdonar a los moribundos", thaumaturgy: "Taumaturgia",
  "true-strike": "Golpe certero", "vicious-mockery": "Burla dañina",
  // Nivel 1
  alarm: "Alarma", "animal-friendship": "Amistad con los animales",
  bane: "Perdición", bless: "Bendición", "burning-hands": "Manos ardientes",
  "charm-person": "Hechizar persona", command: "Orden imperiosa",
  "comprehend-languages": "Comprensión idiomática", "create-or-destroy-water": "Crear o destruir agua",
  "cure-wounds": "Curar heridas", "detect-evil-and-good": "Detectar el bien y el mal",
  "detect-magic": "Detectar magia", "detect-poison-and-disease": "Detectar venenos y enfermedades",
  "disguise-self": "Disfrazarse", "divine-favor": "Favor divino",
  "entangle": "Enmarañar", "expeditious-retreat": "Retirada expeditiva",
  "faerie-fire": "Fuego feérico", "false-life": "Vida falsa",
  "feather-fall": "Caída de pluma", "find-familiar": "Encontrar familiar",
  "floating-disk": "Disco flotante", "fog-cloud": "Nube de niebla",
  "goodberry": "Buenas bayas", grease: "Grasa", "guiding-bolt": "Proyectil guiado",
  "healing-word": "Palabra de curación", "heroism": "Heroísmo",
  "hellish-rebuke": "Reprensión infernal", "hex": "Maleficio",
  "hideous-laughter": "Risa horrible", "hunters-mark": "Marca del cazador",
  identify: "Identificar", "illusory-script": "Escritura ilusoria",
  "inflict-wounds": "Infligir heridas", jump: "Salto", longstrider: "Zancada prodigiosa",
  "mage-armor": "Armadura de mago", "magic-missile": "Proyectil mágico",
  "protection-from-evil-and-good": "Protección contra el bien y el mal",
  "purify-food-and-drink": "Purificar comida y bebida", sanctuary: "Santuario",
  shield: "Escudo mágico", "shield-of-faith": "Escudo de la fe",
  "silent-image": "Imagen silenciosa", sleep: "Dormir", "speak-with-animals": "Hablar con los animales",
  "thunderwave": "Onda atronadora", "unseen-servant": "Sirviente invisible",
  // Nivel 2
  aid: "Ayuda", "acid-arrow": "Flecha ácida", "alter-self": "Alterarse",
  "animal-messenger": "Mensajero animal", "arcane-lock": "Cerradura arcana",
  augury: "Augurio", barkskin: "Piel robliza",
  "blindness-deafness": "Ceguera/Sordera", blur: "Desdibujar",
  "branding-smite": "Castigo marcador", "calm-emotions": "Calmar emociones",
  darkness: "Oscuridad", darkvision: "Visión en la oscuridad",
  "detect-thoughts": "Detectar pensamientos", "enhance-ability": "Potenciar característica",
  "enlarge-reduce": "Agrandar/Reducir",
  "find-traps": "Encontrar trampas", "flame-blade": "Hoja flamígera",
  "flaming-sphere": "Esfera flamígera", "gentle-repose": "Reposo apacible",
  "gust-of-wind": "Ráfaga de viento", "heat-metal": "Calentar metal",
  "hold-person": "Inmovilizar persona", invisibility: "Invisibilidad",
  knock: "Llamada", "lesser-restoration": "Restablecimiento menor",
  levitate: "Levitar", "locate-object": "Localizar objeto",
  "magic-mouth": "Boca mágica", "magic-weapon": "Arma mágica",
  "mirror-image": "Imagen múltiple", "misty-step": "Paso brumoso",
  "moonbeam": "Rayo de luna", "pass-without-trace": "Pasar sin rastro",
  "prayer-of-healing": "Plegaria de curación", "protection-from-poison": "Protección contra venenos",
  "ray-of-enfeeblement": "Rayo de debilitamiento", "scorching-ray": "Rayo abrasador",
  shatter: "Destrozar", silence: "Silencio", "spider-climb": "Trepar cual arácnido",
  "spike-growth": "Crecimiento de púas", "spiritual-weapon": "Arma espiritual",
  suggestion: "Sugestión", "warding-bond": "Vínculo protector", web: "Telaraña",
  "zone-of-truth": "Zona de la verdad",
  // Nivel 3 y comunes superiores
  "animate-dead": "Animar muertos", "beacon-of-hope": "Faro de esperanza",
  blink: "Parpadeo", "call-lightning": "Invocar relámpagos", counterspell: "Contraconjuro",
  daylight: "Luz del día", "dispel-magic": "Disipar magia", fear: "Miedo",
  fireball: "Bola de fuego", fly: "Volar", haste: "Celeridad",
  "hypnotic-pattern": "Patrón hipnótico", "lightning-bolt": "Relámpago",
  "magic-circle": "Círculo mágico", "major-image": "Imagen mayor",
  "mass-healing-word": "Palabra de curación en masa", "protection-from-energy": "Protección contra energía",
  "remove-curse": "Levantar maldición", revivify: "Revivificar", slow: "Ralentizar",
  "speak-with-dead": "Hablar con los muertos", "spirit-guardians": "Espíritus guardianes",
  "stinking-cloud": "Nube apestosa", tongues: "Lenguas", "vampiric-touch": "Toque vampírico",
  "water-breathing": "Respirar bajo el agua", "wind-wall": "Muro de viento",
  banishment: "Destierro", blight: "Marchitar", confusion: "Confusión",
  "dimension-door": "Puerta dimensional", "freedom-of-movement": "Libertad de movimiento",
  "greater-invisibility": "Invisibilidad mejorada", "ice-storm": "Tormenta de hielo",
  "phantasmal-killer": "Asesino fantasmal", polymorph: "Polimorfar",
  "wall-of-fire": "Muro de fuego", "cone-of-cold": "Cono de frío",
  "dominate-person": "Dominar persona", "hold-monster": "Inmovilizar monstruo",
  "raise-dead": "Alzar a los muertos", scrying: "Escudriñar",
  "chain-lightning": "Cadena de relámpagos", disintegrate: "Desintegrar",
  "globe-of-invulnerability": "Esfera de invulnerabilidad", "true-seeing": "Visión veraz",
};
export const hechizoES = (index: string, fallback: string) => SPELL_ES[index] ?? fallback;

// ── Hechizos: descripciones propias en español (resumen fiel) ───
export const SPELL_DESC_ES: Record<string, string> = {
  "eldritch-blast": "Un rayo de energía crepitante sale disparado hacia una criatura a 36 m. Es una tirada de ataque de conjuro: si impacta, hace 1d10 de daño de fuerza. A niveles altos del personaje se generan rayos adicionales (2 a nivel 5, 3 a nivel 11, 4 a nivel 17), cada uno con su propia tirada y su propio objetivo posible.",
  "minor-illusion": "Creás un sonido o una imagen de un objeto (no más grande que un cubo de 1,5 m) que dura 1 minuto. La imagen no produce sonido, luz ni olor; una criatura que use su acción para examinarla puede descubrir el engaño con una prueba de Investigación contra tu CD.",
  prestidigitation: "Trucos mágicos menores e inofensivos: una chispa, limpiar o ensuciar un objeto, entibiar o enfriar comida, encender o apagar una vela, crear una marca o un pequeño objeto ilusorio en tu mano. Hasta tres efectos simultáneos.",
  "charm-person": "Intentás hechizar a un humanoide a 9 m. Hace una salvación de Sabiduría (con ventaja si vos o tus aliados están peleando con él); si falla, te considera un conocido amistoso durante 1 hora o hasta que lo dañes. Cuando el efecto termina, SABE que lo hechizaste.",
  hex: "Maldecís a una criatura a 27 m (acción adicional). Mientras dure, cada vez que la golpeás con un ataque sumás 1d6 de daño necrótico, y elegís una característica: el objetivo tiene desventaja en las pruebas (no salvaciones) de esa característica. Si cae a 0 PV, podés mover la maldición a otra criatura con una acción adicional. Concentración, hasta 1 hora.",
  "faerie-fire": "Un resplandor azul, verde o violeta delinea todo lo que haya en un cubo de 6 m (salvación de Destreza para evitarlo). Lo delineado no puede beneficiarse de ser invisible y los ataques contra ello tienen ventaja. Concentración, hasta 1 minuto.",
  sleep: "Tirás 5d8: esa cantidad de PV de criaturas caen dormidas en una esfera de 6 m, empezando por las de menos PV actuales. El sueño dura 1 minuto o hasta que reciban daño o alguien las despierte. No afecta a inmunes a ser hechizados ni a quienes no duermen (como los elfos).",
  "mage-hand": "Una mano espectral flotante aparece a 9 m. Podés usarla para manipular objetos, abrir puertas, o llevar hasta 5 kg. No puede atacar ni activar objetos mágicos. Dura 1 minuto.",
  "chill-touch": "Una mano esquelética fantasmal ataca a una criatura a 36 m (ataque de conjuro): 1d8 necrótico y el objetivo no puede recuperar puntos de golpe hasta tu próximo turno. Contra muertos vivientes, además, tiene desventaja para atacarte.",
  "poison-spray": "Lanzás una bocanada de gas venenoso a una criatura a 3 m: salvación de Constitución o recibe 1d12 de daño de veneno.",
  "true-strike": "Apuntás a una criatura y leés sus defensas: en TU PRÓXIMO turno, tu primer ataque contra ella tiene ventaja. Concentración.",
  "comprehend-languages": "Durante 1 hora entendés el significado literal de cualquier idioma hablado que escuches y de cualquier texto que toques. No te permite hablarlo ni escribirlo. Se puede lanzar como ritual.",
  "expeditious-retreat": "Tu velocidad se dispara: al lanzarlo y como acción adicional en cada turno posterior podés usar la acción de Correr. Concentración, hasta 10 minutos.",
  "hellish-rebuke": "REACCIÓN cuando una criatura a 18 m te daña: queda envuelta en llamas y hace salvación de Destreza; recibe 2d10 de fuego si falla, la mitad si acierta.",
  "illusory-script": "Escribís un mensaje que solo pueden leer quienes vos designes; para el resto (durante 10 días) parece otra cosa o resulta ilegible. Ritual.",
  "protection-from-evil-and-good": "Tocás a una criatura: aberraciones, celestiales, elementales, feéricos, infernales y muertos vivientes tienen desventaja para atacarla, y no pueden hechizarla, asustarla ni poseerla. Concentración, hasta 10 minutos.",
  "unseen-servant": "Creás una fuerza invisible y sin mente que hace tareas simples: llevar, limpiar, sostener, servir. Fuerza 2, no puede atacar. Dura 1 hora. Ritual.",
  "hold-person": "Un humanoide a 18 m hace salvación de Sabiduría o queda PARALIZADO (no actúa, los ataques cuerpo a cuerpo que le acierten son crítico automático). Repite la salvación al final de cada uno de sus turnos. Concentración, hasta 1 minuto.",
  invisibility: "Una criatura que toques se vuelve invisible hasta 1 hora (concentración). Todo lo que lleve puesto o cargue también. Termina si ataca o lanza un conjuro.",
  "misty-step": "Acción adicional: te teletransportás en una neblina plateada hasta 9 m a un punto que puedas ver.",
  darkness: "Oscuridad mágica llena una esfera de 4,5 m durante 10 minutos (concentración). Ni la visión en la oscuridad la atraviesa; la luz no mágica no la ilumina.",
  suggestion: "Sugerís una acción razonable (una o dos frases) a una criatura que pueda oírte y entenderte: salvación de Sabiduría o la cumple. Dura hasta 8 horas (concentración) o hasta completar la sugerencia.",
  counterspell: "REACCIÓN cuando ves a una criatura a 18 m lanzando un conjuro: si es de nivel 3 o menos, se anula automáticamente; si es mayor, hacés una prueba de tu característica de lanzamiento (CD 10 + nivel del conjuro) para anularlo.",
  fireball: "Una esfera de fuego de 6 m de radio explota en un punto a 45 m: salvación de Destreza; 8d6 de daño de fuego si falla, la mitad si acierta. Incendia objetos inflamables.",
  fly: "Una criatura que toques gana velocidad de vuelo de 18 m durante 10 minutos (concentración). Si el conjuro termina en el aire, cae.",
  "dispel-magic": "Elegís una criatura, objeto o efecto mágico a 36 m: los conjuros de nivel 3 o menos sobre él terminan. Para los de nivel superior, prueba de tu característica de lanzamiento (CD 10 + nivel).",
  "detect-magic": "Durante 10 minutos (concentración) percibís la presencia de magia a 9 m y podés ver un aura tenue alrededor de lo que la tenga, y conocer su escuela. Ritual.",
  "cure-wounds": "Una criatura que toques recupera 1d8 + tu modificador de lanzamiento en puntos de golpe. No afecta a muertos vivientes ni constructos.",
  "magic-missile": "Tres dardos de luz impactan automáticamente (sin tirada) a criaturas que veas a 36 m: 1d4+1 de fuerza cada uno, repartidos como quieras.",
};
export const hechizoDescES = (index: string): string | undefined => SPELL_DESC_ES[index];

// ── Features de clase (nombres) ─────────────────────────────────
export const FEATURE_ES: Record<string, string> = {
  "Ability Score Improvement": "Mejora de Características",
  "Spellcasting": "Lanzamiento de Conjuros", "Ritual Casting": "Lanzamiento Ritual",
  "Otherworldly Patron": "Patrón de Otro Mundo", "Pact Magic": "Magia de Pacto",
  "Eldritch Invocations": "Invocaciones Sobrenaturales", "Pact Boon": "Don del Pacto",
  "Mystic Arcanum": "Arcanum Místico", "Eldritch Master": "Maestro Sobrenatural",
  "Rage": "Furia", "Unarmored Defense": "Defensa sin Armadura",
  "Reckless Attack": "Ataque Temerario", "Danger Sense": "Sentido del Peligro",
  "Primal Path": "Senda Primaria", "Extra Attack": "Ataque Adicional",
  "Fast Movement": "Movimiento Rápido", "Feral Instinct": "Instinto Salvaje",
  "Brutal Critical": "Crítico Brutal", "Relentless Rage": "Furia Incansable",
  "Bardic Inspiration": "Inspiración de Bardo", "Jack of All Trades": "Aprendiz de Mucho",
  "Song of Rest": "Canción de Descanso", "Bard College": "Colegio de Bardo",
  "Expertise": "Pericia", "Font of Inspiration": "Fuente de Inspiración",
  "Countercharm": "Contraencanto", "Magical Secrets": "Secretos Mágicos",
  "Divine Domain": "Dominio Divino", "Channel Divinity": "Canalizar Divinidad",
  "Destroy Undead": "Destruir Muertos Vivientes", "Divine Intervention": "Intervención Divina",
  "Druidic": "Druídico", "Wild Shape": "Forma Salvaje", "Druid Circle": "Círculo Druídico",
  "Timeless Body": "Cuerpo Atemporal", "Beast Spells": "Conjuros Bestiales",
  "Archdruid": "Archidruida", "Fighting Style": "Estilo de Combate",
  "Second Wind": "Nuevas Energías", "Action Surge": "Oleada de Acción",
  "Martial Archetype": "Arquetipo Marcial", "Indomitable": "Indomable",
  "Martial Arts": "Artes Marciales", "Ki": "Ki", "Unarmored Movement": "Movimiento sin Armadura",
  "Monastic Tradition": "Tradición Monástica", "Deflect Missiles": "Desviar Proyectiles",
  "Slow Fall": "Caída Lenta", "Stunning Strike": "Golpe Aturdidor",
  "Ki-Empowered Strikes": "Golpes Potenciados por Ki", "Evasion": "Evasión",
  "Stillness of Mind": "Quietud Mental", "Purity of Body": "Pureza Corporal",
  "Tongue of the Sun and Moon": "Lengua del Sol y la Luna", "Diamond Soul": "Alma de Diamante",
  "Empty Body": "Cuerpo Vacío", "Perfect Self": "Ser Perfecto",
  "Divine Sense": "Sentido Divino", "Lay on Hands": "Imposición de Manos",
  "Divine Smite": "Castigo Divino", "Divine Health": "Salud Divina",
  "Sacred Oath": "Juramento Sagrado", "Aura of Protection": "Aura de Protección",
  "Aura of Courage": "Aura de Coraje", "Improved Divine Smite": "Castigo Divino Mejorado",
  "Cleansing Touch": "Toque Purificador", "Favored Enemy": "Enemigo Predilecto",
  "Natural Explorer": "Explorador Nato", "Ranger Archetype": "Arquetipo de Explorador",
  "Primeval Awareness": "Consciencia Primigenia", "Land's Stride": "Zancada Salvaje",
  "Hide in Plain Sight": "Esconderse a Plena Vista", "Vanish": "Esfumarse",
  "Feral Senses": "Sentidos Salvajes", "Foe Slayer": "Mataenemigos",
  "Sneak Attack": "Ataque Furtivo", "Thieves' Cant": "Jerga de Ladrones",
  "Cunning Action": "Acción Astuta", "Roguish Archetype": "Arquetipo de Pícaro",
  "Uncanny Dodge": "Esquiva Asombrosa", "Reliable Talent": "Talento Confiable",
  "Blindsense": "Sentir sin Ver", "Slippery Mind": "Mente Escurridiza",
  "Elusive": "Elusivo", "Stroke of Luck": "Golpe de Suerte",
  "Sorcerous Origin": "Origen de Hechicería", "Font of Magic": "Fuente de Magia",
  "Metamagic": "Metamagia", "Sorcerous Restoration": "Restauración de Hechicería",
  "Arcane Recovery": "Recuperación Arcana", "Arcane Tradition": "Tradición Arcana",
  "Spell Mastery": "Maestría de Conjuros", "Signature Spells": "Conjuros Distintivos",
};
export const featureES = (n: string) => FEATURE_ES[n] ?? n;

// ── Rasgos raciales (nombre + descripción propia) ───────────────
export const TRAIT_ES: Record<string, { n: string; d: string }> = {
  "Darkvision": { n: "Visión en la Oscuridad", d: "Ves en luz tenue a 18 m como si fuera luz brillante, y en la oscuridad como si fuera luz tenue (en grises, sin color)." },
  "Superior Darkvision": { n: "Visión en la Oscuridad Superior", d: "Como Visión en la Oscuridad, pero con 36 m de alcance." },
  "Fey Ancestry": { n: "Ascendencia Feérica", d: "Tenés ventaja en las salvaciones para no ser hechizado, y la magia no puede dormirte." },
  "Trance": { n: "Trance", d: "No dormís: meditás semiconsciente 4 horas por día y obtenés el mismo beneficio que un humano con 8 horas de sueño." },
  "Keen Senses": { n: "Sentidos Agudos", d: "Tenés competencia en la habilidad de Percepción." },
  "Dwarven Resilience": { n: "Resistencia Enana", d: "Ventaja en las salvaciones contra veneno y resistencia al daño de veneno." },
  "Dwarven Combat Training": { n: "Entrenamiento de Combate Enano", d: "Competencia con hachas de batalla, hachas de mano, martillos ligeros y martillos de guerra." },
  "Stonecunning": { n: "Afinidad con la Piedra", d: "En pruebas de Historia relacionadas con trabajos en piedra, se te considera competente y sumás el doble de tu bono de competencia." },
  "Dwarven Toughness": { n: "Dureza Enana", d: "Tus puntos de golpe máximos aumentan en 1, y en 1 adicional por cada nivel." },
  "Brave": { n: "Valiente", d: "Ventaja en las salvaciones para no quedar asustado." },
  "Halfling Nimbleness": { n: "Agilidad Mediana", d: "Podés moverte a través del espacio de cualquier criatura de tamaño mayor al tuyo." },
  "Lucky": { n: "Suerte", d: "Cuando sacás un 1 en una tirada de ataque, prueba de característica o salvación, repetís el dado y usás el nuevo resultado." },
  "Naturally Stealthy": { n: "Sigilo Natural", d: "Podés intentar esconderte incluso detrás de una criatura un tamaño mayor que vos." },
  "Draconic Ancestry": { n: "Ascendencia Dracónica", d: "Elegiste un tipo de dragón: define el elemento de tu aliento y tu resistencia." },
  "Breath Weapon": { n: "Arma de Aliento", d: "Con una acción exhalás energía destructiva (área y tipo según tu ascendencia). Salvación para mitad de daño; 2d6, sube con el nivel. Un uso por descanso." },
  "Damage Resistance": { n: "Resistencia al Daño", d: "Resistencia al tipo de daño asociado a tu ascendencia dracónica." },
  "Gnome Cunning": { n: "Astucia Gnoma", d: "Ventaja en las salvaciones de Inteligencia, Sabiduría y Carisma contra magia." },
  "Artificer's Lore": { n: "Saber de Artificiero", d: "En pruebas de Historia sobre objetos mágicos, alquímicos o tecnológicos, sumás el doble de tu bono de competencia." },
  "Tinker": { n: "Manitas", d: "Con herramientas de manitas podés construir pequeños aparatos mecánicos (juguete, encendedor, cajita de música)." },
  "Skill Versatility": { n: "Versatilidad de Habilidades", d: "Ganás competencia en dos habilidades a tu elección." },
  "Menacing": { n: "Amenazante", d: "Ganás competencia en la habilidad de Intimidación." },
  "Relentless Endurance": { n: "Resistencia Incansable", d: "Cuando caerías a 0 PV sin morir, quedás en 1 PV en su lugar. Un uso por descanso largo." },
  "Savage Attacks": { n: "Ataques Salvajes", d: "En un crítico con arma cuerpo a cuerpo, tirás un dado de daño extra del arma." },
  "Infernal Legacy": { n: "Legado Infernal", d: "Conocés el truco Taumaturgia; a nivel 3 lanzás Reprensión Infernal (nivel 2) y a nivel 5 Oscuridad, una vez por descanso largo, con Carisma." },
  "Hellish Resistance": { n: "Resistencia Infernal", d: "Tenés resistencia al daño de fuego." },
  "Extra Language": { n: "Idioma Adicional", d: "Hablás, leés y escribís un idioma adicional a tu elección." },
  "Cantrip": { n: "Truco Racial", d: "Conocés un truco adicional de la lista de mago; se lanza con Inteligencia." },
  "Elf Weapon Training": { n: "Entrenamiento Élfico con Armas", d: "Competencia con espadas largas, espadas cortas, arcos cortos y arcos largos." },
};
export const rasgoES = (n: string) => TRAIT_ES[n]?.n ?? n;
export const rasgoDescES = (n: string, fallback: string) => TRAIT_ES[n]?.d ?? fallback;
