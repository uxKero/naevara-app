// Suma la Sesión 13 de Silvapor al canon: data/vaegrant.json → cronica[],
// con la batalla paso a paso (el carro adentro de la mina y la explanada
// afuera), la sala de los botones como lugar y la posición del grupo.
//
// Fuente: sources/Vaegrant/Sesion 13 (13 audios, 2 h 26 min, transcriptos
// con ElevenLabs) y las tres fotos de la posición inicial que mandó Alan.
//
// Confirmado con Alan antes de escribir:
//   · Jeremy no estuvo al principio: Alan manejó el carro solo hasta que
//     llegó PK, que es el que juega a Jeremy. En la ficción, Jeremy se golpeó
//     al caer el ascensor y viajó desmayado;
//   · muere Gorko, que iba en la tropa de Haddrek. Morko iba en la de
//     Iscandar. Al final los dos pelean sin tropa;
//   · lo que el Master contó fuera de personaje va aparte y marcado;
//   · la sesión no cierra la pelea en mesa: Gera la da por ganada, era
//     cuestión de pegarle un par de veces más al grandote. Vaegrant sale de
//     las cuevas y Jeremy se queda adentro.
//
// Uso: node scripts/patch-vaegrant-sesion13.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-13")) {
  console.log("La crónica ya tiene 'sesion-13'. Nada que hacer.");
  process.exit(0);
}

// ── 1. La batalla paso a paso ────────────────────────────────────
// Posiciones tomadas de las fotos de la mesa: los orcos bajan desde arriba,
// el grandote en el medio, las falanges de necrones a los costados y la boca
// de la cueva abajo. Es un esquema, no la escala de la grilla.
const combate = {
  titulo: "Dos frentes",
  campo: { nombre: "La explanada de las máquinas", boca: { x: 50, y: 58 } },
  piezas: [
    { id: "tropa-tercera", nombre: "La tercera tropa orca", bando: "grupo", x: 20, y: 9, r: 4.2, forma: "tropa" },
    { id: "tropa-iscandar", nombre: "Iscandar y la tropa de Morko", bando: "grupo", x: 47, y: 10, r: 4.6, forma: "tropa" },
    { id: "tropa-haddrek", nombre: "Haddrek y la tropa de Gorko", bando: "grupo", x: 74, y: 15, r: 4.6, forma: "tropa" },
    { id: "necrones-oeste", nombre: "Falange de necrones", bando: "enemigo", x: 16, y: 38, r: 4.2, forma: "tropa" },
    { id: "necrones-este", nombre: "Falange de necrones", bando: "enemigo", x: 86, y: 36, r: 4.2, forma: "tropa" },
    { id: "grandote", nombre: "El grandote", bando: "enemigo", x: 58, y: 33, r: 7, forma: "gigante" },
    { id: "tirasobras", nombre: "Tirasobras", bando: "neutral", x: 33, y: 25, r: 3.2, forma: "artefacto" },
    { id: "golem", nombre: "El gólem", bando: "grupo", x: 30, y: 44, r: 4.4, forma: "gigante" },
    { id: "fantasma", nombre: "El fantasma", bando: "enemigo", x: 72, y: 49, r: 3, forma: "artefacto" },
    { id: "vortice", nombre: "La prisión fantasmal", bando: "neutral", x: 82, y: 40, r: 8.5, forma: "vortice" },
    { id: "iscandar", nombre: "Iscandar", bando: "grupo", x: 40, y: 22, r: 2.2 },
    { id: "haddrek", nombre: "Haddrek", bando: "grupo", x: 84, y: 27, r: 2.2 },
  ],
  recorrido: [
    { id: "ascensor", nombre: "El ascensor de Krenko", x: 8, y: 8 },
    { id: "puente", nombre: "El puente roto", x: 24, y: 8 },
    { id: "portones", nombre: "Define tu destino", x: 40, y: 10 },
    { id: "topetazo", nombre: "El topetazo", x: 56, y: 8 },
    { id: "palancas", nombre: "Las seis palancas", x: 74, y: 10 },
    { id: "rueda", nombre: "La rueda", x: 90, y: 18 },
    { id: "espolones", nombre: "Los espolones", x: 80, y: 28 },
    { id: "brecha", nombre: "La brecha volcánica", x: 62, y: 28 },
    { id: "desvio", nombre: "El desvío cinco", x: 44, y: 26 },
    { id: "bajada", nombre: "La curva y la bajada", x: 26, y: 30 },
    { id: "pit", nombre: "El pit", x: 10, y: 40 },
    { id: "salon", nombre: "El salón de los enanos", x: 24, y: 50 },
    { id: "botones", nombre: "La sala de los botones", x: 44, y: 52 },
    { id: "constructos", nombre: "El muro de constructos", x: 66, y: 50 },
    { id: "salida", nombre: "Salida no muy segura", x: 90, y: 54 },
  ],
  pasos: [
    {
      titulo: "La carga",
      adentro:
        "El carro sale del ascensor de la sala de Krenko. Vaegrant va solo al freno: Jeremy se golpeó la cabeza al caer y viaja desmayado.",
      afuera:
        "Los orcos cargan cuesta abajo en tropas. Iscandar va con la de Morko y Haddrek con la de Gorko, y cada uno tiene que ganarle el mando a su cabecilla en cada acción. Enfrente, falanges de necrones que disparan en andanadas y, en el medio, el grandote.",
      tramo: "ascensor",
      carro: 20,
      carroMax: 20,
      gigante: 100,
      presentes: ["tropa-tercera", "tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "iscandar", "haddrek"],
    },
    {
      titulo: "Define tu destino",
      adentro:
        "Vaegrant salta el puente roto con el carro y cae bien sobre las vías. Ve focos de pelea entre constructos y goblins, y los goblins pierden. El Eldritch Blast se estrella contra la pared de la caverna. Elige uno de los tres portones cerrados, el que tiene el cartel, y en algún lado se activa un mecanismo oxidado.",
      afuera:
        "Las andanadas de los necrones le pegan a la tropa de Iscandar con fuerza de varias filas juntas. Un frío pesado de magia oscura pasa entre los orcos: los que están al lado de Iscandar se tapan la cara y les crece barba.",
      tramo: "portones",
      carro: 20,
      carroMax: 20,
      gigante: 100,
      presentes: ["tropa-tercera", "tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "iscandar", "haddrek"],
    },
    {
      titulo: "El topetazo",
      adentro:
        "Dos constructos tapan la salida del pasillo. Vaegrant falla la tirada de reflejos y pasa por encima de ellos: el golpe se lo come la Armadura de Agathys, que se rompe entera, y él sigue de largo.",
      afuera:
        "Haddrek le gana el mando a Gorko y la tropa le clava jabalinas a una de las falanges. Iscandar pierde la disputa y su tropa avanza de frente, donde quiere Morko.",
      tramo: "topetazo",
      carro: 20,
      carroMax: 20,
      gigante: 100,
      presentes: ["tropa-tercera", "tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "iscandar", "haddrek"],
    },
    {
      titulo: "La palanca seis",
      adentro:
        "Seis palancas: una buena y cinco malas. Pensando como goblin, Vaegrant descarta tres y elige la seis por pura suerte. Las vías se ondulan, saltan tornillos y el carro sigue con dos puntos menos.",
      afuera:
        "De la loma salen los tirasobras, artefactos goblin de madera enrejada, raíces y metal retorcido, y disparan contra todo lo que se mueva. Le meten dos críticos a una falange y al grandote, y una lluvia de piedras a la tercera tropa orca.",
      enlace: "La palanca que bajó Vaegrant adentro despertó las defensas goblin de afuera.",
      tramo: "palancas",
      carro: 18,
      carroMax: 20,
      gigante: 90,
      presentes: ["tropa-tercera", "tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "tirasobras", "iscandar", "haddrek"],
    },
    {
      titulo: "Tres ruedas",
      adentro:
        "Se rompe algo de la transmisión y el carro pierde la rueda delantera. Jeremy se despierta en medio del lío. Desde ahí, cada vuelta los dos hacen fuerza para nivelar el carro, y cada vez que fallan el carro se rompe un poco más. Entran a un pasillo que se angosta, con espolones de piedra, y aceleran.",
      afuera:
        "Iscandar saca un crítico y le suma el castigo divino: cuarenta y ocho de daño, y la falange se hunde. Haddrek le tira un barrido al grandote.",
      tramo: "espolones",
      carro: 13,
      carroMax: 20,
      gigante: 85,
      presentes: ["tropa-tercera", "tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "tirasobras", "iscandar", "haddrek"],
    },
    {
      titulo: "La brecha",
      adentro:
        "Salen a una explanada con un riel que se deshace de mirarlo, sobre una brecha de lava que hierve y escupe bolas de fuego. Al final hay cinco puertas y una palanca de desvío: dos son buenas y tres son malas, y ninguna tiene cinta. Vaegrant elige la cinco. Las buenas eran la uno y la tres.",
      afuera:
        "La tercera tropa orca no aguanta: entre los tirasobras y los necrones queda un río de sangre. Haddrek le pega un cachetazo al cabecilla para que le haga caso.",
      tramo: "desvio",
      carro: 10,
      carroMax: 20,
      gigante: 73,
      presentes: ["tropa-iscandar", "tropa-haddrek", "necrones-oeste", "necrones-este", "grandote", "tirasobras", "iscandar", "haddrek"],
      caidas: ["tropa-tercera"],
    },
    {
      titulo: "Gorko",
      adentro:
        "El carril cinco baja a oscuras y toma una curva cerrada. Aceleran en la bajada. Más adelante se escucha una pelea chica y aparece un cartel que dice pit.",
      afuera:
        "La tropa de Haddrek se desarma bajo tres ataques seguidos. Gorko se para delante del golpe que iba para Haddrek y lo parten al medio. Haddrek queda solo y le mete un crítico al grandote. Los tirasobras se apagan.",
      tramo: "bajada",
      carro: 10,
      carroMax: 20,
      gigante: 68,
      presentes: ["tropa-iscandar", "necrones-oeste", "necrones-este", "grandote", "iscandar", "haddrek"],
      caidas: ["tropa-haddrek", "tirasobras"],
    },
    {
      titulo: "El pit",
      adentro:
        "Jeremy le tira una antorcha a los constructos de un foco de pelea, los goblins festejan y el carro se estrella contra un muro de resortes. El carro queda destruido. Es el pit, el lugar donde se reparten los carros: treinta y seis puertas, y los goblins salen hacia todos lados. Toman la dos y pasan por un salón de estatuas de enanos hecho por goblins.",
      afuera:
        "Iscandar y Haddrek pelean ya sueltos, sin tropa que los siga. Los necrones aprietan a lo que queda de la tropa de Morko.",
      tramo: "salon",
      carro: null,
      carroMax: 20,
      gigante: 68,
      presentes: ["tropa-iscandar", "necrones-oeste", "necrones-este", "grandote", "iscandar", "haddrek"],
    },
    {
      titulo: "Los botones",
      adentro:
        "Una sala que imita maquinaria de gnomos, llena de palancas y botones, y en un espejo de agua se ve la pelea de afuera. Es el control de las defensas de la entrada. Vaegrant aprieta el botón del gólem y Jeremy el del fantasma. Hay un solo carro: Vaegrant se va y Jeremy se queda en la sala.",
      afuera:
        "La tierra se abre con un alarido. El gólem sale del piso y hace pedazos a una falange de necrones. El fantasma aparece del otro lado y se suma a la tropa enemiga.",
      enlace: "Los dos botones de la sala de adentro meten dos piezas nuevas en la batalla de afuera.",
      tramo: "botones",
      carro: 20,
      carroMax: 20,
      gigante: 68,
      presentes: ["tropa-iscandar", "necrones-este", "grandote", "golem", "fantasma", "iscandar", "haddrek"],
      caidas: ["necrones-oeste"],
    },
    {
      titulo: "Salida no muy segura",
      adentro:
        "Vaegrant va solo, en subida y con brisa fresca. Atropella un muro de cinco o seis constructos y el carro pierde cinco. Con lo justo alcanza a leer un cartel en la oscuridad: salida no muy segura. Sigue.",
      afuera:
        "Desde la sala, Jeremy convence al fantasma de que se equivocó de grupo y le ordena inmolarse: un vórtice de vacío se traga todo en quince pies y lo deja encerrado en una prisión fantasmal. Iscandar y Haddrek quedan afuera por una casilla. Haddrek le mete otro crítico al grandote, que ya pierde fuerza. Gera la da por ganada.",
      enlace: "Jeremy maneja al fantasma desde adentro y cierra la pelea de afuera.",
      tramo: "salida",
      carro: 15,
      carroMax: 20,
      gigante: 56,
      presentes: ["tropa-iscandar", "grandote", "golem", "vortice", "iscandar", "haddrek"],
      caidas: ["necrones-este", "fantasma"],
    },
  ],
};

// ── 2. Crónica ───────────────────────────────────────────────────
const sesion13 = {
  id: "sesion-13",
  numero: 13,
  titulo: "Define tu destino",
  fecha: "2026-10-06",
  resumen:
    "La pinza de Krenko se cierra y la sesión es una sola pelea en dos frentes. Afuera, Iscandar y Haddrek cargan metidos en las tropas de Morko y de Gorko, peleándoles el mando a cada paso, contra falanges de necrones y un gigante de metal. Adentro, Vaegrant baja por las vías de las minas en un carro que pierde una rueda, con Jeremy desmayado al lado, y cada palanca que baja cambia la batalla de afuera. Gorko muere cubriendo a Haddrek. En una sala de botones goblin, Vaegrant le da un gólem a la batalla y Jeremy un fantasma que termina inmolándose. Vaegrant sale solo hacia una salida no muy segura y Jeremy se queda adentro.",
  combate,
  capitulos: [
    {
      titulo: "La carga",
      texto:
        "Los orcos bajan como dijeron que iban a bajar: rápido, en bloque y sin plan B. No pelean de a uno. Pelean en tropas, como las máquinas, y cada tropa tiene su cabecilla. Iscandar carga metido en la de Morko y Haddrek en la de Gorko, y los dos hermanos están, como dice la mesa, en su hora. Ninguno de los dos manda tranquilo: en cada acción el orco de turno grita que el que manda es él, y hay que ganarle. El que gana dirige la tropa. El que pierde la ve avanzar hacia donde se le ocurre a ella, de frente, de costado o quedándose quieta.\n\nEnfrente tienen falanges de constructos, que la mesa termina llamando necrones, y en el medio el más grande de todos, un gigante de metal que se mueve solo y no en tropa. Las falanges disparan en andanadas, y cada andanada pega con la fuerza de todas las filas juntas: lo que para uno sería un golpe, para una tropa son doscientos y pico puntos de daño.\n\nCuando el grandote se da vuelta y descarga cerca de Iscandar, lo que se siente no es frío de invierno. Es un frío de magia oscura y pesada, como entrar a un subsuelo. Los orcos que tiene al lado se tapan la cara y les crece barba. No pasa nada más. Es lo que hacen las almas de estas cosas.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Vos tenés el mando, así que tu tropa mueve como vos digas, excepto si fallás o tirás menos que yo. Obviamente, el líder de los orcos va a decir: yo estoy mandando.",
        },
        {
          quien: "Master",
          texto:
            "Ves a unos orcos que están al lado tuyo que automáticamente se cubren la cara y les crece barba.",
        },
        { quien: "Haddrek", texto: "¡Avancen, carajo!" },
      ],
    },
    {
      titulo: "Define tu destino",
      texto:
        "Adentro de la montaña, el carro minero que salió del ascensor de Krenko toma velocidad, y Vaegrant va solo al freno. Jeremy se golpeó la cabeza cuando cayó el ascensor y viaja desmayado al lado de él.\n\nLo primero es un puente roto. A la izquierda una caverna, a la derecha una explanada, y Vaegrant tiene el presentimiento de que la salida es el puente. Suelta el freno, el carro pega un salto y cae justo sobre las vías del otro lado. Desde arriba ve focos de pelea entre constructos y grupos de goblins, y los goblins van perdiendo. Le tira un Eldritch Blast a uno de los grupos desde el carro en movimiento y le da a la pared de la caverna. Los constructos lo ven y le contestan con unos dardos plateados que rebotan contra el carro.\n\nDespués vienen tres portones cerrados y un cartel: cuidado adelante, define tu destino. Elige el del cartel. La puerta se abre, y en algún lado se activa un mecanismo de engranajes oxidados que él no llega a ver. Ahí empieza a pensar como goblin: los goblins en retirada bajan palancas para demorar a los que los invaden, y lo que quede atrás, sea de quien sea, puede ser barrido.\n\nA la salida del pasillo, dos constructos le tapan el paso. Falla la tirada de reflejos y los atropella. El golpe se lo come entero la Armadura de Agathys, que salta en pedazos de metal y hielo, y el carro sigue.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Enfrente tenés un puente que parece estar roto. Del lado de la izquierda vas a una caverna y del lado de la derecha a una explanada. Y tenés el presentimiento de que el puente roto es la salida.",
        },
        { quien: "Master", texto: "Pasás por un cartel que dice: cuidado adelante, define tu destino." },
        {
          quien: "Master",
          texto:
            "Los goblins en retirada suelen activar una serie de palancas para retrasar a la gente que los viene invadiendo. No importa lo que quede atrás: lo que quede atrás puede ser barrido.",
        },
      ],
    },
    {
      titulo: "La palanca seis",
      texto:
        "Seis palancas en la pared, una buena y cinco malas. Vaegrant tira Historia, descarta tres, y entre las que quedan elige la seis. Ahí no hay conocimiento que valga: es suerte. Las vías empiezan a resonar y a ondularse, la tierra se descarrila por debajo, saltan un par de tornillos, y el carro aguanta.\n\nLo que no sabe es lo que pasa afuera. De la loma de la cueva salen unos artefactos primitivos de madera enrejada, raíces y metal retorcido, parientes lejanos de Caja, y empiezan a disparar andanadas contra todo lo que se mueve. Son los tirasobras de los goblins, y no distinguen bando. Le meten un crítico a una falange de necrones y otro al grandote, y también le tiran una lluvia de piedras a la tercera tropa orca, que nunca se recupera. La palanca que bajó Vaegrant fue la primera trampa de la batalla de afuera.\n\nAdentro, Vaegrant empieza a ver el patrón: las palancas que parecen no hacer daño llevan un listón rojo. Y siente un olor mezclado, entre azufre y algo dulce, que le avisa que hay una brecha volcánica cerca.",
      dialogo: [
        { quien: "Master", texto: "Una buena, cinco malas. Si superás la tirada de historia, eliminás tres de las malas." },
        { quien: "Master", texto: "Acá es suerte pura." },
        {
          quien: "Master",
          texto:
            "Algunos artefactos primitivos, hechos de una enrejada de madera, raíces y metal retorcido, salen de la tierra y disparan una andanada de cosas. A todos, indiscriminadamente. Son los tirasobras goblin.",
        },
        {
          quien: "Master",
          texto: "Alan se guió por conocimiento, activó una palanca y activó las defensas de afuera.",
        },
      ],
    },
    {
      titulo: "Tres ruedas",
      texto:
        "Se rompe algo que en un carro goblin no debería romperse, el carro se recalienta y una rueda delantera hace clin y se va. Mano de obra goblin. Siguen andando en tres ruedas, y en ese momento se despierta Jeremy, con un chichón en la cabeza y todo el mundo yéndose al demonio alrededor.\n\nDesde ahí, cada vuelta los dos tienen que hacer fuerza y peso para nivelar el carro, y cada vez que fallan el carro se rompe un poco más. Jeremy tira Historia y saca algo en limpio: al principio y al final de cada ruta se puede cambiar de carro, y los cambios están separados por kilómetros. Con suerte, en unas cuatro vueltas aparece uno.\n\nEl pasillo se angosta y unas rocas afiladas raspan los costados del carro. Hay que elegir entre frenar o acelerar, y aceleran: con algo clavado en el cuerpo, si frenás, empeora. Saltan chispas y astillas, y al fondo se ve una puerta con una luz amarilla y anaranjada.\n\nAfuera, Iscandar le gana el mando a Morko, saca un crítico y lo carga con un castigo divino: cuarenta y ocho de daño, y la falange que tenía enfrente se hunde. Haddrek, con su tropa, le tira un barrido al grandote. Del lado de los orcos, la tropa de Haddrek empieza a quedarse corta.",
      dialogo: [
        { quien: "Master", texto: "Desperfecto. Pérdida de rueda. Van en el carrito y ves que una rueda hace clin y se va." },
        { quien: "Vaegrant", texto: "Mano de obra de goblin." },
        { quien: "Jeremy", texto: "Estamos medio lejos, pero si aguantamos un poco más podríamos intentar cambiar de carro." },
        { quien: "Haddrek", texto: "¡Apúntenle a la cabeza, manga de inútiles!" },
      ],
    },
    {
      titulo: "La brecha",
      texto:
        "La puerta da a una explanada con un riel que parece desarmarse con solo mirarlo, colgado sobre una brecha volcánica. Abajo, la lava hierve y unas bolas de fuego saltan contra las paredes. Vaegrant quiere saber si eso puede reventar con ellos encima. No: esa brecha funciona desde el principio de los tiempos, y los goblins la tienen controlada a su manera y aprovechan el magma para sus cosas. Jeremy intenta atar con soga los tablones del carro que se están aflojando, y no le sale.\n\nAl final hay cinco puertas y una palanca de desvío, y el carro viene demasiado rápido como para pensarlo mucho. Dos caminos son buenos y tres son malos, y esta vez ninguna palanca tiene cinta. Vaegrant elige la cinco. Llega a bajarla y el carro pega un latigazo hacia el pasillo cinco. Las buenas eran la uno y la tres.\n\nEl carril cinco entra a oscuras, toma una curva cerrada y empieza a bajar. Aceleran. Vaegrant, que en la mesa ya se declaró Verstappen, mide la bajada y calcula que, aunque descienden, no bajan tanto.\n\nAfuera, la tercera tropa orca termina de deshacerse. Entre las piedras de los tirasobras y los necrones no queda nada: un río de sangre, y la marabunta de esqueletos metálicos encima. Haddrek agarra al cabecilla de su tropa de un cachetazo para que le haga caso.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Esta brecha está funcionando desde los albores del tiempo. Los goblins lo tienen controlado a su manera. Sigue siendo caótico por el carácter goblin, pero están aprovechando justamente el magma para hacer sus cosas.",
        },
        { quien: "Master", texto: "Lamentablemente, es elegir un número. Tres son malas, dos son buenas." },
        { quien: "Vaegrant", texto: "Ya no soy Vaegrant, soy Verstappen." },
        { quien: "Haddrek", texto: "Me hacés caso o morimos todos." },
      ],
    },
    {
      titulo: "Gorko",
      texto:
        "La tropa de Haddrek se queda sin aire. Los necrones le encadenan tres ataques y cada uno le saca un pedazo. En el último, la pelea está encarnizada, Haddrek se prepara para aguantar el golpe, y el que lo aguanta es Gorko: el capitán de los orcos se le para delante, se come el topetazo que iba para Haddrek y lo parten al medio. Haddrek queda solo en la batalla, sin tropa y con el que le salvó la vida tirado al lado.\n\nNo se queda quieto. Se cura con lo que le queda y va directo al grandote: un barrido, después un crítico que le saca cuarenta y cinco, después otro. El gigante va perdiendo fuerza cada diez puntos que pierde. Los tirasobras, que tiraron hasta el final contra todos por igual, se apagan.\n\nMorko sigue vivo, con su tropa maltrecha. Al final, Iscandar también se desprende de ella, y los dos pelean sueltos.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Está la lucha encarnizada, vos estás así por soportar el golpe, el capitán de los orcos se pega el topetazo, quiere soportarlo, lo parte a la mitad y quedás solo en la batalla.",
        },
        { quien: "Haddrek", texto: "Y me salvó de ahí. Dios lo tenga en su gloria." },
        { quien: "Master", texto: "Este baja más rápido porque es un solo titán. No son tropas." },
      ],
    },
    {
      titulo: "El pit",
      texto:
        "La puerta del cartel da a un segundo carril, y a la izquierda ven el mismo pasillo por el que acaban de pasar. Adelante hay un foco de pelea, y desde el carro cada uno tiene un ataque gratis. Jeremy, que no lleva arma, agarra una antorcha del carro y la revolea contra los constructos. Algunos caen, los goblins se dan vuelta y festejan, y el carro frena de golpe contra un muro de resortes. El carro queda destruido y ellos salen revolcados.\n\nLos goblins los ayudan a levantarse. No los conocen, pero por lo que acaban de hacer entienden que están de su lado. Ninguno de los dos habla goblin y ningún goblin habla común. Están en el pit, un lugar de distribución: treinta y seis puertas, carros que salen hacia todos lados y goblins que se suben sin rumbo, porque llegues adonde llegues sos una mano más peleando. Vaegrant tira a la suerte, le señala la puerta dos a un goblin, le hace un gesto, recibe otro que no entiende, y toman la dos.\n\nEl pasillo dos empieza como una cava rudimentaria y de a poco se vuelve prolijo, con las paredes revestidas. Termina en un salón enorme que el carro cruza a cuarenta pies de altura, cerca del techo: un gran salón de los recuerdos enanos, con estatuas de enanos y todo hecho a mano por goblins. Los goblins saben que los enanos son buenos cavadores y siempre hacen lo correcto, y desde ese salón salen los caminos hacia sus lugares más importantes. No necesariamente los que van al frente.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Los goblins comienzan a preparar carros para todos lados, y son carros que van en diferentes direcciones.",
        },
        { quien: "Master", texto: "Hablar no es la única forma de comunicación." },
        {
          quien: "Master",
          texto:
            "Los goblins saben que los enanos son buenos cavadores y siempre hacen lo correcto. Todo lo que vaya a partir del salón del enano son lugares icónicos.",
        },
        { quien: "Vaegrant", texto: "Estoy dispuesto a morir acá, pero no a quedarme en la mina." },
      ],
    },
    {
      titulo: "La sala de los botones",
      texto:
        "El carro afloja hasta ir de paseo y les sopla una brisa fresca en la cara. Llegan a un salón que imita una maquinaria de gnomos, una defensa que solo los gnomos sabrían entender, hecha por goblins que la copiaron como pudieron. Hay palancas y botones por todos lados, y luces prendidas. Frenan, ponen el freno de mano y le calzan una piedra a la rueda por las dudas.\n\nLos dos tiran Historia y los dos pasan. En un artilugio con un espejo de agua se ve la batalla de afuera, con Iscandar y Haddrek peleando: la sala controla las defensas de la entrada de la caverna. Hay botones con figuras: un constructo, un gólem, fuego, agua y un fantasma. Uno por persona. Pensando como goblin, Vaegrant aprieta el del gólem, que es lo más primitivo que pueden manejar bien. Jeremy aprieta el del fantasma.\n\nAfuera, en lo más encarnizado de la pelea, la tierra se abre y algo pega un alarido. El gólem sale del piso, no tiene límite de movimiento, y se lleva puesta a una falange de necrones. El fantasma aparece del otro lado y, como buena mecánica goblin, se une a la tropa enemiga.\n\nEn la sala hay un solo carro. Vaegrant quiere salir de la mina ya. Jeremy quiere quedarse a ver los controles. Se separan.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Hay un extraño artilugio que tiene una pantalla, como un claro de agua, y desde ahí ustedes pueden ver a ellos dos peleando. Ese receptáculo trabaja sobre las defensas exteriores de la entrada de la caverna.",
        },
        {
          quien: "Master",
          texto: "Hay botones con constructos, botones con un símbolo de fuego, con un símbolo de agua, con un fantasma.",
        },
        { quien: "Master", texto: "De repente se abre la tierra, se siente eso, pega un alarido." },
        { quien: "Vaegrant", texto: "Yo me quiero ir. Me voy a ir en el carro." },
        { quien: "Jeremy", texto: "Yo me quedo acá. Después me buscás. Yo no voy a salir de esta sala." },
      ],
    },
    {
      titulo: "Salida no muy segura",
      texto:
        "Jeremy se queda solo frente a los controles y le habla al fantasma, como a cualquiera que se haya equivocado de bando. Le sale: el fantasma le hace caso, y le da tres opciones, retirada, ataque o inmolación. Jeremy elige la tercera. El fantasma explota en una cuenca de vacío, se forma un vórtice oscuro que se traga todo lo que hay a quince pies, y lo que estaba ahí queda encerrado en una prisión fantasmal. Iscandar y Haddrek quedan afuera por una casilla.\n\nAdelante, Vaegrant elige entre dos caminos con la misma brisa fresca y toma el segundo. El carro empieza a subir, y a lo lejos, al final de un pasillo oscuro, se ve una abertura de salida. Le mete todo lo que tiene. Enfrente aparece un muro de cinco o seis constructos y no frena: pasa por encima. El carro pierde cinco y él no se lastima. Con la visión en la oscuridad alcanza a leer un cartel: salida no muy segura. Sigue igual.\n\nLa sesión termina ahí, con la pelea abierta. El grandote está a poco más de la mitad y perdiendo fuerza, y Gera lo da por ganado: era cuestión de pegarle un par de veces más. Vaegrant está saliendo de las cuevas, solo. Jeremy se quedó adentro, en la sala de los botones, esperando que lo vayan a buscar.",
      dialogo: [
        { quien: "Jeremy", texto: "Querido, te equivocaste de grupo. Es el grupo de enfrente." },
        { quien: "Master", texto: "Las opciones son retirada, ataque o inmolación." },
        {
          quien: "Master",
          texto:
            "Explota en una cuenca de vacío. Un vórtice oscuro se forma alrededor y absorbe todo lo que esté a quince pies. Es una prisión fantasmal.",
        },
        {
          quien: "Master",
          texto: "Muy a duras penas alcanzás a ver en la oscuridad un cartel que dice: salida no muy segura.",
        },
        {
          quien: "Vaegrant",
          texto: "Sigo. Prefiero morir afuera cayendo por un barranco que seguir un minuto más en la mina.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Gorko",
      rol:
        "Uno de los dos hermanos caudillos de los Grandes Fauces, el que apostó en la Sesión 12. Iba al frente de la tropa de Haddrek, le disputó el mando en cada acción y murió cubriéndolo: se comió el golpe que iba para él y lo partieron al medio.",
    },
    {
      nombre: "Morko",
      rol: "El otro hermano. Iba al frente de la tropa de Iscandar. Sobrevivió, con su tropa maltrecha.",
    },
    {
      nombre: "Los necrones",
      rol:
        "Así llama la mesa a las falanges de constructos de la explanada: bloques que disparan en andanadas y pegan con la fuerza de todas sus filas. Un gólem goblin hizo pedazos a una y el vórtice del fantasma se tragó a la otra.",
    },
    {
      nombre: "El grandote",
      rol:
        "Un gigante de metal, de los que Spinel vio desde el aire, que pelea solo y no en tropa. Lo que dispara se siente como magia oscura y fría, y a los orcos que estaban cerca les creció barba. Pierde fuerza cada diez puntos de daño. Quedó a poco más de la mitad.",
    },
    {
      nombre: "Los tirasobras",
      rol:
        "Defensas goblin de madera enrejada, raíces y metal retorcido que salen de la loma y disparan a todo lo que se mueve, sin distinguir bando. Los despertó la palanca seis que bajó Vaegrant.",
    },
    {
      nombre: "El gólem y el fantasma",
      rol:
        "Las dos defensas que salieron de la sala de los botones. El gólem, que eligió Vaegrant, sale de la tierra y destroza una falange de necrones. El fantasma, que eligió Jeremy, se pasa al bando enemigo hasta que Jeremy lo convence y lo hace inmolarse.",
    },
  ],
  dudas: [
    "No queda claro qué se tragó la prisión fantasmal, más allá de la segunda falange de necrones, ni si se puede abrir.",
    "Morko sigue vivo y su tropa quedó maltrecha cuando Iscandar se separó. No se sabe cuántos orcos le quedan.",
    "Jeremy se quedó en la sala de los botones esperando que lo vayan a buscar, y en esa sala había un solo carro.",
    "El cartel dice salida no muy segura. Vaegrant sigue igual y no sabe adónde da.",
    "La batalla no se cerró en mesa: el Master la dio por ganada porque al grandote le faltaban un par de golpes.",
    "Spinel viaja con Vaegrant en el carro. Las tropas de Krenko, las de Crestarroja y las tres máquinas gigantes pelean en otro sector de la explanada.",
  ],
  fueraDePersonaje: [
    "La sombra que les trajo tablones y le limpió el casco al Albatros es el espíritu de una de las tres brujas: el tercer espíritu del vacío, que anda suelto y se junta con los de su clase. Cuando están sueltos son así, cosas que hacen cosas.",
    "El drow quiere el barco de las tres brujas, mucho más poderoso que el del vampiro, y para eso necesita tres núcleos. Tiene uno solo. Controlaba otro, el de la botella del vacío, y lo perdió con el lío que armó el grupo en Waterdeep.",
    "Esos espíritus llega un momento en que quedan obsoletos frente a la tecnología, y si molestan, se eliminan. Pueden volverse fuerzas de destrucción masiva, como Gunnlod o Pyros.",
  ],
};

data.cronica.push(sesion13);

// ── 3. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "Las vías de las minas de Krenko (Sesión 13)",
    tipo: "Sesión 13 · adentro de la montaña",
    texto:
      "Una red de vías goblin pensada para que el que entra no salga: portones que dicen define tu destino, palancas que en retirada traban el paso a los invasores sin importar quién quede atrás, y las seguras marcadas con un listón rojo cuando lo tienen. Pasa por encima de una brecha volcánica activa desde el principio de los tiempos, que los goblins aprovechan para el magma. En el pit, un lugar de distribución con treinta y seis puertas, se cambia de carro, y por la puerta dos se llega a un salón de los recuerdos enanos hecho por goblins.",
    destacado: false,
  },
  {
    nombre: "La sala de los botones (Sesión 13)",
    tipo: "Sesión 13 · el control de las defensas",
    texto:
      "Una sala que imita maquinaria de gnomos, llena de palancas, luces y botones con figuras: constructo, gólem, fuego, agua y fantasma. En un espejo de agua se ve la entrada de la caverna, y cada botón saca una defensa en la explanada de afuera, sin garantía de bando. Tiene un solo carro. Jeremy se quedó ahí.",
    destacado: true,
  },
];
data.mundo.lugares.push(...lugares);

// ── 4. Mapa ──────────────────────────────────────────────────────
const bosque = data.mapa.marcadores.find((x) => x.id === "bosque-plano");
if (bosque && !bosque.sesiones.includes(13)) bosque.sesiones.push(13);

data.mapa.party = {
  marcadorId: "bosque-plano",
  texto:
    "Fin de la Sesión 13: la batalla de la explanada, al pie de Bosque Plano, queda prácticamente ganada, con el grandote a poco más de la mitad. Iscandar y Haddrek pelean sin tropa: Gorko murió y Morko quedó con la suya maltrecha. Vaegrant sale solo de las minas de Krenko por una salida no muy segura, y Jeremy se quedó adentro, en la sala que controla las defensas.",
};

// ── 5. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 13 agregada al canon:");
console.log(`  capítulos  : ${sesion13.capitulos.length}`);
console.log(`  diálogo    : ${sesion13.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres    : ${sesion13.nombres.length}`);
console.log(`  dudas      : ${sesion13.dudas.length}`);
console.log(`  off-role   : ${sesion13.fueraDePersonaje.length}`);
console.log(`  combate    : ${combate.pasos.length} pasos, ${combate.piezas.length} piezas`);
console.log(`  lugares    : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
