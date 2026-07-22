// Integra la Sesión 3 de Vaegrant a la semilla data/vaegrant.json:
//   - cronica[]  -> agrega la entrada "sesion-3"
//   - mundo.lugares[] y mundo.ganchos[] -> canon nuevo (isla Magraje, Kyro,
//     los titanes y los tres portales, Moray ampliado, el juicio de Njröun)
//   - mapa -> party, ruta de la Sesión 3 (Ioma -> Moray) y pin de Magraje
// Idempotente: si ya existe cronica "sesion-3", no hace nada.
//
// Uso: node scripts/patch-vaegrant-sesion3.mjs
// Después, para persistir a Supabase: node --env-file=.env.local scripts/patch-vaegrant-sesion1.mjs
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-3")) {
  console.log("La crónica ya tiene 'sesion-3'. Nada que hacer.");
  process.exit(0);
}

const sesion3 = {
  id: "sesion-3",
  numero: 3,
  titulo: "La semilla de los sueños",
  fecha: "2026-07-21",
  resumen:
    "Rumbo a Moray, el Albatros cruza un mar plagado de barcos de bandera negra y encuentra a mitad de camino un islote volcánico que no figura en las cartas. Vaegrant y Jeremy bajan a explorarlo, atados con una soga, y descubren que la isla es más grande por dentro que por fuera: es el sueño de Kyro, un titán primigenio dormido que despierta y les habla del albor del mundo, de la guerra de los magos, de los cuatro titanes y de los tres portales que comunican los planos. Como juicio, Kyro les entrega Njröun, la semilla de los sueños: si la mantienen viva serán dignos de los portales y de su ayuda, pero antes deben averiguar por qué Ámbar cayó y probar que la balanza está torcida. De vuelta al mar, Hakon y los tripulantes bajan en el Ojo de Arena llevándose el armamento para meter mano por Ámbar, y el barco queda para el grupo. En Moray los recibe Río, el del muelle, formado bajo Trobe y leal a Zarif, que les confía una noticia fea: hay gente de Luskan revisando la biblioteca. La sesión cierra con la reunión con Zarif preparada y pendiente.",
  capitulos: [
    {
      titulo: "Banderas negras y una isla que no existe",
      texto:
        "El Albatros venía subiendo desde Ioma rumbo a Moray, por el Mar de las Espadas, con tres días de plazo por delante. El mar estaba raro: atestado de barcos sin identidad que no eran de piratería, con banderas literalmente negras. Nadie sabe si son un orden nuevo, un círculo o gente que decidió no pertenecer a nadie. Las guardias costeras de Ioma los habían tenido a raya antes de dejarlos pasar, y en algún punto del norte había un bloqueo, no se sabe si militar o comercial, al que alguien les abrió una brecha para que la nave pasara.\n\nAl amanecer del segundo día divisaron una isla que no debería estar ahí: un islote volcánico chico, tapado de vegetación densa, tan menor que no figura en las cartas marinas modernas. Solo vive en los mitos: la leyenda de una tortuga colosal de la sabiduría que murió de vieja, echó raíces en el fondo del mar y sobre su caparazón creció una montaña. Jeremy, que se traga los libros del barco, manejaba las dos versiones, la fábula y la que dan los geógrafos, que hablan de pura actividad volcánica y cenizas que fertilizaron un suelo imposible. El capitán decidió echar anclas cerca para aprovechar un cardumen de sardinas y llenar bodegas, y con eso Vaegrant y Jeremy tomaron una chalupa y remaron a la costa.",
      dialogo: [
        {
          quien: "El Master",
          texto:
            "El mar está atestado de barcos sin identidad, con banderas negras. Que no son de piratería, son literalmente banderas negras.",
        },
        {
          quien: "El Master",
          texto:
            "En las cartas marinas modernas no figura, pero sí en los mitos y leyendas de viejas bestias: una tortuga gigante que murió de vieja y echó raíces en el fondo del mar.",
        },
      ],
    },
    {
      titulo: "La isla que no debería existir",
      texto:
        "La playa era de postal: arena blanca finísima, como la de los relojes de arena, y ni un rastro humano, ni basura, ni una mancha de aceite. Un manglar joven, todavía mal enraizado, separaba agua dulce de agua salada en medio del océano, cosa que no cierra por ningún lado. Había árboles de flores rojas y aves de plumaje largo, biomas que naturalmente no coexisten conviviendo en un pedazo de tierra del tamaño de nada. El Master fue claro: no hace falta tirar Naturaleza, es una anomalía, punto.\n\nLes vino a la memoria la espina que le sacaron a Marcus del corazón: aquel veneno no era sintético ni de comercio, era natural, de recetas antiguas perdidas, algo chamánico que solo se consigue buscándolo, nunca en una urbe. Con esa idea encima entraron con respeto, sin tocar ni romper nada. Vaegrant avanzó primero, atado a quince metros de soga que sostenía Jeremy, que prefirió quedarse dibujando el ambiente y juntando caracolas. Adentro el aire era tan puro que casi hiperventila; había ídolos de piedra rudimentarios, menhires y dólmenes ya comidos por la naturaleza, y del centro de la isla bajaban hilos de agua desde un volcán. Bebieron de un manantial y el agua era la más limpia que probaron en la vida.",
      dialogo: [
        {
          quien: "Jeremy",
          texto:
            "Antes de que entres, tomá la soga. A mí me gusta llevar el registro de esto, actualizar, conseguir la historia real.",
        },
        {
          quien: "Vaegrant",
          texto:
            "Ese sorbo se siente como tener quince años y volver a meter la boca en la canilla. Amo el agua, es mi mejor recuerdo.",
        },
      ],
    },
    {
      titulo: "El que dormía en la piedra",
      texto:
        "Descansaban sobre lo que creían una muralla de piedra cuando una voz les dijo bienvenidos. La pared era un titán dormido, y ellos estaban acostados casi contra su nariz. Se levantó con cuidado de no lastimarlos y los recibió amable. No sabía su nombre: cada visitante lo llamó distinto, y la última visita había sido hace trescientos o cuatrocientos inviernos. Jeremy, fiel a lo suyo, insistió en saber cómo se llamaba. En su momento lo nombraron Kyro, un titán, un dios primigenio, y la isla se llama Magraje.\n\nKyro les abrió el mundo. La isla no es ninguna tortuga: una lanza cayó del cielo, atravesó los mantos marinos hasta el magma y varios planos a la vez, desató el volcán y mezcló lo que no debería mezclarse. De esa cicatriz sale el agua que da vida. Los titanes duermen y sus sueños se materializan alrededor; sus pesadillas se escapan y pueblan el mundo. Kyro quiso dormir en un paraíso, y así se gestó Magraje: por fuera un pastizal, por dentro una expansión de planos, más grande adentro que afuera. Contó que hubo cuatro titanes repartidos por el mundo, cada uno con una función que no es buena ni mala; la suya es regular las sociedades y cerrar las brechas entre ellas. Otro se encarga de tachar los errores con tormentas y maremotos, que es limpieza, no maldad.\n\nDel pasado dijo lo que nadie cuenta: cuando proliferó el hombre rivalizó con los magos, derecho divino contra derecho heredable, y al no ponerse de acuerdo olvidaron las viejas órdenes. Echaron a los faéricos al sur, a las junglas de Chult, y durmieron a los titanes. Mencionó a Alistair, el gran toro blanco, líder faérico que porta la chispa de la magia y la vida, atrapado defendiendo un semiplano de los magos que quieren extraérsela.",
      dialogo: [
        { quien: "Kyro", texto: "Bienvenidos." },
        { quien: "Jeremy", texto: "Quiero saber tu nombre. El de verdad." },
        {
          quien: "Kyro",
          texto:
            "Cada uno que llegó me llamó distinto. En su momento me nombraron Kyro. Esta isla se llama Magraje.",
        },
      ],
    },
    {
      titulo: "Los tres portales",
      texto:
        "En el cráter del volcán extinto hay un portal, vertical, en forma de A, que comunica todos los planos. Kyro fue rotundo: hay solo tres portales verdaderos en todo Faerûn, muy separados entre sí por el poder que manejan. Uno está acá, en Magraje. Otro está al norte, un poco arriba de Vaasa y Delhalls. El tercero, arriba de Veldorn, en las planicies, sin llegar al desierto.\n\nLo que abunda hoy no son estos: el hombre replicó el portal por todo el mundo, algunas veces con éxito y otras con consecuencias desastrosas. Los PJ cruzaron a Silvapor, hace más o menos un año, por una de esas réplicas humanas hechas desde Ámbar, no por un portal original. Kyro les dejó claro que ellos son parte de algo que empezó mucho antes de que llegaran, y que despertarlo no fue casualidad. No existen las casualidades: si lo despertaron, hay un presagio.",
      dialogo: [
        {
          quien: "Kyro",
          texto:
            "Solo hay tres portales verdaderos en todo Faerûn. Uno está acá. Los otros dos, al norte de Vaasa y Delhalls, y arriba de Veldorn, en las planicies.",
        },
        {
          quien: "Kyro",
          texto:
            "Lo que ustedes cruzaron no fue uno de estos. El hombre los replicó, y por una de esas réplicas llegaron.",
        },
      ],
    },
    {
      titulo: "El juicio de Njröun",
      texto:
        "La charla se puso íntima. Hablaron del hogar, y para Kyro el hogar no es piedra ni madera, es donde están los que uno quiere. Contaron su último recuerdo de Ámbar: huir de la ciudad tomada mientras gente daba la vida para dejarlos escapar. El titán los llamó heraldos de la nueva vida.\n\nLa oferta fue una balanza. Si logran probar que alguien tuerce injustamente la suerte de Ámbar, Kyro tomará partido y pondrá fuerzas mayores del otro lado para devolver el equilibrio. Pero no intercede por nadie a ciegas: primero tienen que averiguar qué pasa de verdad en sus tierras y hacerle una petición justa. Como prueba de que son dignos, les entregó un brote llamado Njröun, la semilla de los sueños, de orden faérico. Los PJ sintieron un vínculo instantáneo con ella; Kyro queda atado a esa semilla y sabe si sufre. La llamó también el árbol de Freya. Si la mantienen viva y fuerte, serán dignos de los portales y de su ayuda a través de ellos. Prometieron plantarla en Ámbar si prospera.\n\nSe despidieron. La tripulación seguía pescando sin haberse enterado de nada: para el barco fue como si en la isla se levantara una montaña, un elemental de piedra que se paró y caminó. Guardaron el brote en una maceta en el camarote. Los PJ acordaron guardar el secreto de Magraje y escribirla como cuento basado en hechos reales, para que solo se acerque gente pura, y contarle todo al Paladín en privado cuando lo vuelvan a ver.",
      dialogo: [
        {
          quien: "Kyro",
          texto:
            "El hogar no es la piedra ni la madera. Es donde están los tuyos. Ustedes son heraldos de la nueva vida.",
        },
        {
          quien: "Kyro",
          texto:
            "Averigüen qué pasa de verdad en sus tierras y tráiganme una petición justa. Si la balanza está torcida, yo pongo peso del otro lado.",
        },
        {
          quien: "El Master",
          texto:
            "El nombre de la planta es Njröun, la semilla de los sueños. Parte del juicio es mantenerla viva.",
        },
      ],
    },
    {
      titulo: "El reparto del Albatros",
      texto:
        "Navegaron un día más. En el Ojo de Arena, un islote de pura arena pegado a Moray, bajaron los tripulantes con Hakon a la cabeza: se iban a meter mano por Ámbar, a hacer contrabando, y se llevaron el armamento del barco, las armas, las lanzas y los cañones que estaban disfrazados de coles en la bodega. Dejaron comida, bebida, mercancía y el oro de la nave, cerca de cuatrocientas treinta monedas, y el Albatros entero al mando de los tres PJ, reconvertido en urca mercante.\n\nSin capitán de oficio, se repartieron el barco. Vaegrant, por su oreja de mensajero y su labia, quedó de oficial diplomático, la voz hacia afuera. Jeremy tomó la bodega y la carga, la contabilidad y la cartografía, y como tiene kit de herborista se hizo cargo de la semilla. El Paladín, Iscandar, ausente esta sesión, queda de navegante y capitán nominal del barco: es el que sabe de mar, rutas y tripulaciones, y a él le contarán lo de la isla y el brote la próxima vez. Hubo un regateo largo de mesa sobre cuánto oro bajar; quedaron en llevar alrededor de ciento treinta en una bolsa común y dejar el resto bajo llave.",
      dialogo: [
        {
          quien: "Jeremy",
          texto:
            "Era una caja que decía coles y estaba llena de armas. Todo eso se lo llevan ellos.",
        },
        {
          quien: "Vaegrant",
          texto:
            "No es momento de ahorrar. La misión es urgente, bajemos lo que haga falta.",
        },
      ],
    },
    {
      titulo: "Moray",
      texto:
        "Moray es una de las islas Moonshae, y son dos en una: la de la montaña y la del llano. La ciudad parece Turquía medieval, casas de barro y teja, tecnológicamente atrasada por elección propia: una sociedad que prefiere estancarse antes que acelerar como el hombre, que valora los escritos y la cultura por encima de la máquina. Es una teocracia, se venera a Moradin en las montañas y a Freya en la base, y una monarquía: un rey justo gobierna el archipiélago desde Caer Callidyr, con Iron Keep para las leyes y lo militar. Hay muchos gnomos y enanos entre los humanos, y la ciudad entera funciona como una feria enorme. Punto clave de mesa: Moray existe gracias a Ámbar, sería el Ámbar de sus principios, y por eso mismo, si los de bandera negra no consiguen lo que buscan allá, podrían venir por acá, que no tiene con qué defenderse.\n\nEn el muelle los recibió Río, un humano flaco de unos sesenta años, sobretodo negro y boina, el encargado de los amarres. Vaegrant se presentó con su nombre y cerró el trato: una pieza de oro por día con patrullaje y peones de carga. Río resultó ser mucho más que un portuario: se formó en los puertos de Ámbar bajo Trobe, el capitán del gremio, conoce a Durin y su Posada Tres Dientes, y se preocupó cuando supo que Durin cerró la taberna y que el gobernador de Ámbar, Marcus, está muerto. Es leal a Zarif, el gnomo que el grupo busca de parte de Durin. Les dio cobertura para hacerse pasar por comerciantes hasta hablar con él, mandó duplicar la guardia sobre el Albatros y los invitó al Socavón, la posada del lugar, donde va a mandar a Zarif esa noche. De paso soltó lo que pesa: vio gente de Luskan en la biblioteca, revisando libros e informes. Luskan movió primero. Planearon llevarle a Zarif una caja de vino ámbar, uno de los tres mejores del mundo junto a la sangre del cuervo y el gato negro, y la sesión cerró con la reunión preparada y pendiente.",
      dialogo: [
        {
          quien: "Vaegrant",
          texto: "Me presento, soy Vaegrant. Venimos del sur, por comercio.",
        },
        {
          quien: "Río",
          texto:
            "Mi nombre es Río, encargado de los muelles. Hay muchas máscaras en este mundo, y ninguna tan peligrosa como la de la confianza y la virtud.",
        },
        {
          quien: "Río",
          texto:
            "Vi gente de Luskan en la biblioteca, revisando los libros y los informes. Luskan hizo la primera jugada. El tablero está en movimiento.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Kyro",
      rol: "Titán primigenio dormido en la isla Magraje. Uno de cuatro repartidos por el mundo; el suyo regula las sociedades y cierra las brechas entre ellas. Su sueño se materializa a su alrededor, y de esos sueños nació la isla. Amable, antiquísimo, sin capricho.",
    },
    {
      nombre: "Magraje, la isla",
      rol: "Islote volcánico sin cartografiar, a mitad de camino entre Ioma y Moray. Biomas imposibles conviviendo, agua dulce en medio del mar, ídolos de piedra y árboles con rostros de los que entraron y trascendieron. Más grande por dentro que por fuera. El grupo acordó guardar el secreto.",
    },
    {
      nombre: "Njröun, la semilla de los sueños",
      rol: "Brote faérico que Kyro entrega como juicio. Los PJ sienten un vínculo instantáneo con él; el titán sabe si sufre. También lo llama el árbol de Freya. Mantenerlo vivo los vuelve dignos de los portales y de la ayuda del titán.",
    },
    {
      nombre: "Los tres portales primigenios",
      rol: "Los únicos tres portales verdaderos de Faerûn, que comunican todos los planos: uno en Magraje, otro al norte de Vaasa y Delhalls, y otro arriba de Veldorn, en las planicies. Los que abundan hoy son réplicas humanas hechas desde Ámbar, como la que cruzó el grupo.",
    },
    {
      nombre: "Río",
      rol: "Encargado del muelle de Moray, humano de unos sesenta años. Se formó en los puertos de Ámbar bajo Trobe, conoce a Durin y es leal a Zarif. Sincero en el trato. Les dio cobertura, dobló la guardia del barco y les pasó la pista de Luskan.",
    },
    {
      nombre: "Christian",
      rol: "Uno de los tripulantes del Albatros que baja en el Ojo de Arena, con Hakon, para meter mano por Ámbar llevándose el armamento del barco.",
    },
  ],
  dudas: [
    "El nombre de personaje del Historiador (Jeremy) sonó una vez como 'Aidacel' en el audio (19.02.49). Sin confirmar; puede ser mala transcripción.",
    "Las grafías y ubicaciones exactas de Vaasa, Delhalls y Veldorn en el mapa de campaña quedan por cotejar (los portales están un poco por encima de esos nombres).",
    "La cuenta de días del tramo Ioma-Moray quedó difusa en mesa (se habló de tres, de cinco y de nueve a once días); el Master admitió un salto de tiempo.",
  ],
};

data.cronica.push(sesion3);

// --- mundo.lugares nuevos ---
const lugaresNuevos = [
  {
    nombre: "Magraje, la isla que no está en las cartas",
    tipo: "Sesión 3 · el sueño de un titán",
    texto:
      "Islote volcánico a mitad de camino entre Ioma y Moray, tan chico que no figura en las cartas marinas modernas; solo vive en la leyenda de la tortuga de la sabiduría. En realidad es el sueño materializado del titán Kyro: por fuera un pastizal, por dentro una expansión de planos, con biomas que no deberían coexistir, agua dulce en medio del mar y árboles con rostros de los visitantes que entraron, fueron dignos y trascendieron. En el cráter del volcán hay uno de los tres portales verdaderos de Faerûn. El grupo acordó guardar el secreto y contarlo solo como un cuento, para que se acerque gente pura.",
    destacado: true,
  },
  {
    nombre: "Los titanes y los tres portales",
    tipo: "Sesión 3 · cosmología contada por Kyro",
    texto:
      "Hubo cuatro titanes primigenios repartidos por el mundo, cada uno con una función que no es buena ni mala: Kyro regula las sociedades y cierra brechas; otro tacha los errores con tormentas y maremotos. Duermen, y sus sueños se materializan mientras sus pesadillas se escapan y pueblan el mundo. Cuando el hombre rivalizó con los magos y no hubo acuerdo, se olvidaron las viejas órdenes: echaron a los faéricos al sur, a Chult, y durmieron a los titanes. Hay solo tres portales verdaderos que comunican todos los planos: en Magraje, al norte de Vaasa y Delhalls, y arriba de Veldorn en las planicies. Lo demás son réplicas humanas hechas desde Ámbar; por una de esas cruzó el grupo a Silvapor.",
    destacado: true,
  },
  {
    nombre: "Moray, la ciudad-feria (Sesión 3)",
    tipo: "Sesión 3 · islas Moonshae",
    texto:
      "Una de las dos Moray, la del llano, con estilo de Turquía medieval: barro, teja y una sociedad que eligió estancar su tecnología para no acelerar como el hombre, valorando escritos y cultura. Teocracia de Moradin en las montañas y Freya en la base, y monarquía de un rey justo que gobierna el archipiélago desde Caer Callidyr, con Iron Keep para leyes y milicia. Muchos gnomos y enanos entre humanos, y toda la ciudad funciona como una feria. Existe gracias a Ámbar y sería su espejo de origen: si los de bandera negra no consiguen lo suyo en Ámbar, podrían venir por Moray, que no tiene con qué defenderse.",
    destacado: true,
  },
];
data.mundo.lugares.push(...lugaresNuevos);

// --- mundo.ganchos nuevos ---
const ganchosNuevos = [
  {
    label: "El juicio de Njröun",
    texto:
      "El brote que dio Kyro es una prueba: si el grupo lo mantiene vivo y fuerte, es digno de los portales y de la ayuda del titán. Njröun está atada al titán, que sabe si sufre. Prometieron plantarla en Ámbar si prospera.",
  },
  {
    label: "La balanza de Kyro",
    texto:
      "El titán tomará partido por Ámbar solo si el grupo prueba que alguien tuerce injustamente su suerte. Primero tienen que averiguar qué pasa de verdad en sus tierras y traerle una petición justa; recién ahí pone fuerzas mayores del otro lado.",
  },
  {
    label: "Luskan movió primero",
    texto:
      "Río, de parte de Zarif, filtró que hay gente de Luskan revisando libros e informes en la biblioteca de Moray. El tablero está en movimiento, y confirma la sospecha de Durin sobre el norte.",
  },
  {
    label: "Moray en la mira",
    texto:
      "Moray existe gracias a Ámbar y no tiene sociedad belicosa para defenderse. Si los de bandera negra no consiguen lo que buscan en Ámbar, el próximo objetivo lógico es Moray.",
  },
];
data.mundo.ganchos.push(...ganchosNuevos);

// --- mapa: party, ruta de la Sesión 3 y pin de Magraje ---
data.mapa.party = {
  marcadorId: "moray",
  texto:
    "Fin de la Sesión 3: el Albatros está amarrado en Moray, al mando de los tres PJ. Hakon y los tripulantes bajaron en el Ojo de Arena con el armamento del barco para meter mano por Ámbar. El grupo lleva a Njröun, la semilla que les dio el titán Kyro en la isla de Magraje, y una condición: averiguar qué pasa de verdad en Ámbar. Río los cubre en el muelle y esa noche los espera Zarif en el Socavón.",
};

data.mapa.rutas.push({
  sesion: 3,
  estado: "recorrido",
  puntos: ["ioma", "moray"],
  via: [
    { x: 11, y: 55 },
    { x: 9.3, y: 52.5 },
    { x: 6.8, y: 49.5 },
  ],
});

data.mapa.marcadores.push({
  id: "magraje",
  nombre: "Magraje",
  x: 9.3,
  y: 52.5,
  estado: "aproximado",
  descripcion:
    "La isla que no está en las cartas: el sueño del titán Kyro, con uno de los tres portales primigenios en su cráter. Ubicación tentativa a mitad de la ruta Ioma-Moray. Secreto del grupo.",
});

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(
  `OK - Sesión 3 integrada a la semilla:\n` +
    `  cronica: +1 (sesion-3, ${sesion3.capitulos.length} capítulos)\n` +
    `  mundo.lugares: +${lugaresNuevos.length}\n` +
    `  mundo.ganchos: +${ganchosNuevos.length}\n` +
    `  mapa: party actualizado, ruta sesión 3, pin de Magraje\n` +
    `Para persistir a Supabase: node --env-file=.env.local scripts/patch-vaegrant-sesion1.mjs`
);
