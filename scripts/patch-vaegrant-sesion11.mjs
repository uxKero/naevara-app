// Suma la Sesión 11 de Silvapor al canon: data/vaegrant.json → cronica[],
// más el Recodo como lugar y como marcador, la ruta y la posición del grupo.
//
// Fuente: sources/Vaegrant/Sesion 11 (11 audios, 44 minutos, transcriptos con
// ElevenLabs). La sesión fue casi entera combate aéreo y falta mucho audio:
// lo que no se escuchó no se inventa, queda dicho como hueco.
//
// Confirmado con Alan antes de escribir:
//   · los puestos: Iscandar capitán, Haddrek artillero, Jeremy bodega y
//     Vaegrant diplomático, que es el que le pide los escudos a Gunnlod;
//   · la embestida del Albatros hundió uno de los barcos de velas negras;
//   · lo que derribó el barco fue un cañón prisma;
//   · el berserker de Haddrek lo desató el combate, no el tricornio;
//   · a Gunnlod la estabilizó Iscandar.
//
// Uso: node scripts/patch-vaegrant-sesion11.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-11")) {
  console.log("La crónica ya tiene 'sesion-11'. Nada que hacer.");
  process.exit(0);
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion11 = {
  id: "sesion-11",
  numero: 11,
  titulo: "El Recodo",
  fecha: "2026-09-22",
  resumen:
    "La batalla de la Nidada, peleada desde el aire. El Albatros entra en combate por primera vez con los cuatro en sus puestos: Iscandar al timón, Haddrek en las cabillas, Jeremy en la bodega y Vaegrant pidiéndole los escudos a Gunnlod. Enfrente hay barcos chicos de velas negras, más rápidos que ellos, y abajo las máquinas toman posiciones de artillería sobre un campo donde alguien llegó a pelear antes. Hunden un velas negras de una embestida. Después un cañón prisma les abre el barco de punta a punta, Gunnlod cae inconsciente y el Albatros se viene abajo. Vaegrant lo lleva a mano hasta el Recodo, a menos de un kilómetro de la batalla, y ahí quedan: encallados, con Gunnlod convaleciente, Haddrek recién sacado del berserker y más enemigos en camino.",
  capitulos: [
    {
      titulo: "Cuatro puestos",
      texto:
        "Antes del primer disparo el Master reparte el barco. En combate naval no hay iniciativa: hay una posición atacante y una defensora, actúan ellos y después actúa él, y toda la ronda de los cuatro cuenta como un solo turno. Adentro de ese turno las acciones van en un orden fijo, lo resuelvan como lo resuelvan: primero los escudos, después el movimiento, después la recarga y al final la artillería.\n\nIscandar es el capitán. Maneja el timón y da las órdenes, y la orden de mando le ocupa la acción de movimiento. El barco no se puede estacionar en combate: tiene que avanzar cinco pies como mínimo, gira por las esquinas de cada casillero, y cada maniobra es un giro inicial, un avance y un giro de posicionamiento, hasta treinta pies. Parece poco, y sumado da casi ciento ochenta grados de ángulo. El control de Gunnlod lo tiene él por ser capitán; si alguien más quiere darle una orden, se lo disputa con carisma enfrentado.\n\nHaddrek es el artillero. Las cabillas se sirven un turno cargando y un turno disparando, sin atajos, con sesenta pies de alcance pleno y noventa con penalizador, y le puede tirar un disparo a cada barco que tenga en ángulo. La gran balista es aparte, es una sola y solo tira de frente. Jeremy es la bodega: si le sale mal una tirada, las municiones se atrasan y el artillero se queda sin balas. Y Vaegrant, que es el diplomático, es el que tiene que convencer a la nena de proteger un lado: frontal, babor, estribor o popa. Los otros lados no quedan desnudos, pero la reducción de daño va a uno solo.\n\nY Gunnlod tiene su propia tirada al inicio de cada turno. Se puede descontrolar.",
      dialogo: [
        {
          quien: "Master",
          texto: "No podés estacionar el barco en combate. Sí o sí tiene que avanzar cinco pies, mínimo.",
        },
        {
          quien: "Master",
          texto:
            "En un ataque naval no hay iniciativas. Hay posición defensora y posición atacante. Actúan ustedes, actúo yo, actúan ustedes, actúo yo.",
        },
        {
          quien: "Master",
          texto:
            "Vos que sos el diplomático sos el que se va a encargar, porque tenés que convencerla a la nena de que proteja ciertos lados.",
        },
        {
          quien: "Master",
          texto:
            "Lo primero es posicionar los escudos. Segundo, hacer movimiento. Tercero, recarga. Cuarto, descarga de artillería. Ese es el orden de las cosas.",
        },
      ],
    },
    {
      titulo: "Velas negras",
      texto:
        "Los primeros navíos se acercan tomando posición, y son lo que se temían: barcos chicos de velas negras, mucho más rápidos que el Albatros. Abajo, la tierra no está quieta. Las cosas que se desentierran empiezan a tomar posiciones de artillería, todavía sin disparar, como si esperaran un evento específico para hacerlo. Y hay un campo de batalla entero debajo de ellos: goblins peleando contra máquinas. Alguien llegó antes que ellos con la misma idea.\n\nDetrás del Albatros, el vampiro se ríe. Una bola de fuego empieza a girar alrededor de la Tortuga Veloz como un átomo suelto, y Benetton se queda cubriendo uno de los flancos con su propia estrategia de batalla.\n\nHaddrek, con el tricornio puesto, pasa la tirada de voluntad con un veinte y siente lo que siente Gunnlod: una exacerbación del carácter, una calma impasible y unas ganas enormes de entrar en el juego. Porque para ella es eso, un juego.\n\nEn cubierta, Iscandar ve venir rodando una avalancha de barriles chicos directo a sus pies. Por un momento piensa que lo van a atropellar. En el último instante sacan las extremidades, frenan y se cuadran delante de él. No dicen nada. Están esperando órdenes.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Estas cosas que se desentierran comienzan a tomar posiciones de artillería. Todavía no están posicionadas, porque van a posicionarse cuando se desate un evento específico.",
        },
        { quien: "Master", texto: "Hay un campo de batalla complejo abajo." },
        {
          quien: "Master",
          texto: "Así que sí, claramente alguien ha llegado antes que ustedes con la misma premisa.",
        },
        {
          quien: "Master",
          texto:
            "Detrás de ustedes, el maldito vampiro comienza a reírse, y una bola de fuego va rodeando el barco como si fuese un átomo libre.",
        },
        {
          quien: "Master",
          texto:
            "Sentís en este momento una exacerbación de tu carácter. Te sentís impasible y con ganas de entrar en este juego. Pero también lo sentís como un juego.",
        },
      ],
    },
    {
      titulo: "La primera andanada",
      texto:
        "Iscandar pone el barco en diagonal para darle ángulo a estribor y lo maneja prolijo, con un dieciocho. El barco igual se sacude, y todos pasan la salvación para no irse al piso. Los escudos quedan de frente, donde ya estaban, y la persuasión de Vaegrant para que Gunnlod los mueva sale en cinco. Ella no se mueve.\n\nLa primera andanada es un estreno sin suerte. Haddrek apunta la cabilla al más cercano y saca trece; el segundo disparo, trece otra vez. Iscandar le ordena a Gunnlod que apunte la balista y tira: catorce. Nada pega.\n\nEl enemigo sí. Dos de los barcos de velas negras usan la sinapsis que los une para disparar juntos, seis dados de seis, y la bola le pega de lleno al Albatros: veintitrés de daño. Los escudos absorben veintiuno, pasan dos, y se deshacen. El turno que viene el Albatros pelea sin escudo.",
      dialogo: [
        { quien: "Master", texto: "Bueno, dos cabillazos, nada." },
        {
          quien: "Master",
          texto: "Utilizo la sinapsis entre los dos hermanos para poder disparar.",
        },
        {
          quien: "Master",
          texto:
            "Absorbe, te hace mierda los escudos, y pasan dos puntos de daño. El turno que viene no tiene escudo.",
        },
      ],
    },
    {
      titulo: "Lo agarró en el aire",
      texto:
        "El viraje siguiente es más brusco y Jeremy, que estaba corriendo a la bodega, sale volando por la borda. La tirada de fuerza no le alcanza. Haddrek suelta todo, lo agarra en el aire como quien agarra un trapo de piso que se cae, lo sube de vuelta a cubierta de un tirón y le grita en la cara.\n\nEse rescate le cuesta la acción, así que las cabillas no escupen fuego ese turno. Jeremy, con el susto encima, recarga el lado que había intentado cargar antes.\n\nIscandar gira cinco, avanza y le tira el Albatros encima al flanco de la Tortuga Veloz para darle cobertura. Benetton, al timón, abre los ojos enormes y tiene que acelerar para no chocar. Y con eso el capitán queda con un velas negras de frente y sin nada en el medio. Lo embiste. Catorce para pegar, seis dados de diez, veintiún puntos directo al casco, y contra una embestida no hay esquive. El barco chico se parte y se cae.",
      dialogo: [
        { quien: "Haddrek", texto: "¡Municiones!" },
        { quien: "Haddrek", texto: "¡Mis cañones no están escupiendo fuego!" },
        {
          quien: "Master",
          texto:
            "Sentís la mano del orco que te agarra y te levanta otra vez a la cubierta del barco.",
        },
        {
          quien: "Master",
          texto:
            "Vos ves que Benetton está en el timón y abre los ojos así con tu maniobra. Le estás tirando el barco encima.",
        },
        {
          quien: "Master",
          texto: "Contra una embestida de un barco no hay esquivo. Es simplemente reflejo.",
        },
      ],
    },
    {
      titulo: "El cañón prisma",
      texto:
        "De lo que pasa después hay muy poco audio. La batalla sigue un buen rato y en algún momento un cañón prisma les acierta: el rayo atraviesa el Albatros de punta a punta, por la ventilación, y alcanza a Gunnlod en la sala de máquinas.\n\nIscandar llega hasta ella. Tiene un latido débil y la respiración entrecortada; le aprieta la mano con fuerza, intenta decir algo y pierde el conocimiento. Él empieza el ritual ahí mismo, con calma. Necesita un turno para estabilizarla y otro para curarla.\n\nEl barco, sin alma, es madera. Se inclina hacia abajo y empieza a acelerar.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Un débil latido de corazón y su respiración entrecortada. Se aferra fuertemente a tu mano, intenta decir algo, pero pierde el conocimiento.",
        },
        {
          quien: "Master",
          texto: "Empezás a sentir la inercia del barco, cómo acelera.",
        },
      ],
    },
    {
      titulo: "El elfo al timón",
      texto:
        "El que agarra el timón es Vaegrant. Cada paso que da en cubierta el barco se va para un lado o para el otro, y quien mira para atrás ve al elfo aferrado a la rueda haciendo una fuerza que no tiene.\n\nHay tres lugares posibles donde bajar. El Recodo, donde dos colinas se juntan y forman un paso con una meseta chica, un par de árboles gigantes y nada más. El pantano, un poco alejado de la batalla, lleno de plantas silvestres y sin un solo árbol. O el campo de batalla mismo. Vaegrant elige el Recodo. El pantano le parece muy sucio para ella.\n\nApunta el barco y hace fuerza para entrar. El Albatros se ladea de un lado y del otro y en un momento el timón deja de responder. Con lo último que le queda intenta la maniobra que menos lo lastime: no tiene nada que sirva para navegar, así que es fuerza pura, y la inspiración la empuja a dieciocho. El timón le destroza las manos. La cadena se corta a último momento, la panza del barco toca tierra y el Albatros queda encallado en el Recodo.\n\nAdentro sienten el cimbronazo, pero Iscandar no pierde la concentración del ritual, porque Haddrek lo está sosteniendo. La batalla queda a menos de un kilómetro. Y los de enfrente vieron la caída: no tiene nada de raro que vengan.\n\nHaddrek sale a cubierta y reparte la defensa. Las cabillas van ancladas a la popa, a todo lo que venga se le dispara, y él baja a tierra a encargarse del cuerpo a cuerpo. La enredadera que había tomado la sala de máquinas no responde: en este momento se ve reseca.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Mirás para atrás y ves al elfo que está aferrado al timón, haciendo una fuerza inusitada para mantener el barco.",
        },
        { quien: "Vaegrant", texto: "El pantano me parecía muy sucio para ella." },
        {
          quien: "Master",
          texto:
            "Te lastima las manos el timón. La cadena se corta a último momento, la panza del barco toca tierra y quedás encallado en el Recodo.",
        },
        {
          quien: "Master",
          texto:
            "Los enemigos obviamente vieron su caída. No es nada descabellado que vengan hacia ustedes.",
        },
        {
          quien: "Haddrek",
          texto: "Anclá las cabillas ahí. A lo que venga, le sacudís. Yo bajo y me encargo del cuerpo a cuerpo.",
        },
      ],
    },
    {
      titulo: "Berserker",
      texto:
        "Vienen, y la pelea en tierra tampoco quedó grabada. Lo que queda es el final: Haddrek, que se fue metiendo en el combate hasta perderse, entra en berserker y ya no distingue amigos de enemigos.\n\nEl berserker no se va solo. Se termina con un calmar emociones, cuando la vida le llega a cero o cuando alguien lo controla. Iscandar le entra con el escudo, no para lastimarlo sino para tirarlo al piso, y lo voltea. Después intenta sujetarlo con fuerza enfrentada y falla, y Haddrek se lo saca de encima y le pega a Benetton. El vampiro no le devuelve el golpe, porque sabe que con eso lo vuelve un monstruo. Después de un rato de forcejeo es el vampiro el que termina levantándolo y sujetándolo hasta que se le pasa.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "El estado de berserker no se pasa. No reconoce a nadie: el que tenga que ser enemigo sigue siendo enemigo, con los amigos también.",
        },
        {
          quien: "Master",
          texto:
            "Se acaba con un calmar emociones, cuando su vida llega a cero, cuando queda inconsciente, o cuando lo controlás.",
        },
        { quien: "Iscandar", texto: "¡Calmate!" },
      ],
    },
    {
      titulo: "Acá peleamos",
      texto:
        "Gunnlod está viva. Por ahora. La acuestan en el tanquecito de agua de la sala de máquinas, que es donde se recupera. La Tortuga Veloz sobrevuela el Recodo lastimada, pero en el aire.\n\nBenetton baja a verlos y les dice lo que puede decir: que él no sabe curar, que por lo general sabe hacer lo contrario, que armen una base ahí mismo porque esas cosas están muy cerca, y que él se va hasta el frente a ver qué está pasando con los Garra de Hielo.\n\nCaja se queda reparando el Albatros, que está tirado y ladeado, con un agujero de punta a punta. Para la reparación hacen falta materiales, así que los barriles bajan del barco con herramientas y empiezan a talar los pocos árboles del Recodo para sacar madera. Arman campamento para un descanso largo.\n\nIscandar va a hablar con Gunnlod. Ella le contesta adolorida: para hacer volar el barco otra vez tiene que estar al cien por ciento de su fuerza, y ahora no le alcanza ni para maniobrarlo ni para levantar un escudo. Entonces no hay otra: acá se enfrenta y acá se pelea. Reparan las armas y se plantan.\n\nY mientras tanto, en la sala de máquinas, las enredaderas empiezan a florecer de a poco, como si fuera el comienzo de la primavera. Rebrotan, y las campanillas chiquitas que iluminan el lugar se vuelven a encender.\n\nLa sesión corta ahí: el barco en el piso, Gunnlod en el agua, Haddrek de vuelta en sí y los cuatro esperando lo que viene.",
      dialogo: [
        { quien: "Benetton", texto: "Yo no sé curar. Sé hacer lo contrario, por lo general." },
        {
          quien: "Benetton",
          texto:
            "Encárguense ustedes de hacer una base en este lugar, porque estas cosas están bastante cerca. Voy hasta el frente a ver qué pasa con los Garra de Hielo.",
        },
        {
          quien: "Gunnlod",
          texto: "Necesito estar al cien por ciento de mi fuerza para poder hacer volar el barco otra vez.",
        },
        {
          quien: "Gunnlod",
          texto: "No puedo ni siquiera maniobrar el barco. No me alcanzan las fuerzas.",
        },
        { quien: "Iscandar", texto: "Acá enfrentamos y acá peleamos. Reparemos las armas y vamos a plantar batalla acá." },
        {
          quien: "Master",
          texto:
            "Las amplias enredaderas de la sala de máquinas comienzan a florecer de a poco, como si se tratase del inicio de la primavera. Y otra vez las pequeñas campanillas que iluminan el lugar comienzan a florecer.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Los barcos de velas negras",
      rol:
        "Barcos chicos y mucho más rápidos que el Albatros, que llegaron a la Nidada del lado de las máquinas. Dos de ellos dispararon unidos por una sinapsis, seis dados de seis en un solo golpe, y le rompieron los escudos al Albatros en la primera ronda. Uno cayó partido por la embestida de Iscandar.",
    },
    {
      nombre: "El cañón prisma",
      rol:
        "El arma que derribó al Albatros. El rayo atravesó el barco de punta a punta por la ventilación y alcanzó a Gunnlod en la sala de máquinas, que quedó inconsciente, y sin ella el barco es madera.",
    },
    {
      nombre: "El Recodo",
      rol:
        "Donde dos colinas se juntan y forman un paso con una meseta chica y un par de árboles gigantes. Vaegrant eligió bajar ahí antes que en el pantano o en el campo de batalla, y ahí quedó encallado el Albatros, a menos de un kilómetro de la pelea.",
    },
  ],
  dudas: [
    "Falta la mayor parte del audio de la batalla: todo lo que pasó entre la embestida y el cañón prisma, y la pelea en tierra hasta el berserker de Haddrek, está resumido en una línea porque no se escuchó.",
    "No quedó claro de qué lado vino el cañón prisma: si de los barcos de velas negras o de la artillería que las máquinas estaban posicionando en tierra.",
    "Las máquinas esperaban un evento específico para ponerse en posición de artillería. Nadie dijo cuál era.",
    "Alguien llegó a la Nidada antes que ellos, con la misma idea. Había goblins peleando contra las máquinas, y Benetton se fue al frente a ver qué pasa con los Garra de Hielo. La carta de tregua de Caltor para Krenko sigue sin entregar.",
    "Al final del descenso se cortó una cadena y la crónica no sabe cuál: puede ser la del ancla o algo del mecanismo del timón.",
    "Gunnlod necesita estar al cien por ciento para volar. Hasta entonces el Albatros no maniobra ni levanta escudos, y está en el piso.",
  ],
};

data.cronica.push(sesion11);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "El Recodo (Sesión 11)",
    tipo: "Sesión 11 · a menos de un kilómetro de la Nidada",
    texto:
      "La unión de dos colinas que forma un paso, con una meseta chica en el medio y un par de árboles gigantes. Cerca hay un pantano sin árboles y lleno de plantas silvestres, y más allá el campo de batalla. Acá quedó encallado el Albatros, tirado y ladeado, después de que un cañón prisma lo atravesara de punta a punta. Los barriles talan los pocos árboles del lugar para sacar madera y el grupo arma base esperando la próxima oleada.",
    destacado: true,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
const marcadoresNuevos = [
  {
    id: "el-recodo",
    nombre: "El Recodo",
    x: 24.2,
    y: 14.5,
    tipo: "hito",
    sesiones: [11],
    estado: "aproximado",
    nota:
      "Donde encalló el Albatros, a menos de un kilómetro de la batalla de la Nidada. Dos colinas que forman un paso, una meseta chica y un par de árboles gigantes. Vaegrant lo bajó a mano después de que un cañón prisma dejara inconsciente a Gunnlod.",
  },
];

const idsExistentes = new Set(data.mapa.marcadores.map((m) => m.id));
const marcadoresAgregados = marcadoresNuevos.filter((m) => !idsExistentes.has(m.id));
data.mapa.marcadores.push(...marcadoresAgregados);

for (const id of ["la-nidada"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(11)) m.sesiones.push(11);
}

data.mapa.rutas.push({
  sesion: 11,
  estado: "recorrido",
  puntos: ["la-nidada", "el-recodo"],
});

data.mapa.party = {
  marcadorId: "el-recodo",
  texto:
    "Fin de la Sesión 11: encallados en el Recodo, a menos de un kilómetro de la batalla de la Nidada. El Albatros está tirado y ladeado con un agujero de punta a punta, Caja lo repara con la madera que talan los barriles y Gunnlod se recupera en el tanque de agua de la sala de máquinas, sin fuerza para volar ni para levantar escudos. Haddrek acaba de salir del berserker. Benetton se fue al frente a buscar a los Garra de Hielo, y los enemigos vieron la caída: vienen más.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 11 agregada al canon:");
console.log(`  capítulos  : ${sesion11.capitulos.length}`);
console.log(`  diálogo    : ${sesion11.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres    : ${sesion11.nombres.length}`);
console.log(`  dudas      : ${sesion11.dudas.length}`);
console.log(`  lugares    : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log(`  marcadores : +${marcadoresAgregados.length} (total ${data.mapa.marcadores.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
