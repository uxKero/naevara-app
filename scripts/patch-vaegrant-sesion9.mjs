// Suma la Sesión 9 de Silvapor al canon: data/vaegrant.json → cronica[],
// más los lugares, marcadores, la ruta planeada y la posición del grupo.
//
// Fuente: sources/Vaegrant/Sesion 9 (22 audios transcriptos con ElevenLabs).
// Idempotente: si ya existe la crónica "sesion-9", no hace nada.
//
// Antes de esto tiene que haber corrido fix-vaegrant-hermanos-orcos.mjs:
// desde esta sesión, Gorko es el de la arena y Morko el negociador.
//
// Uso: node scripts/patch-vaegrant-sesion9.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-9")) {
  console.log("La crónica ya tiene 'sesion-9'. Nada que hacer.");
  process.exit(0);
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion9 = {
  id: "sesion-9",
  numero: 9,
  titulo: "Once a uno",
  fecha: "2026-09-08",
  resumen:
    "Un día entero en Waterdeep sin desenvainar una sola vez. Se bañan, comen y salen a hacer las dos visitas que faltaban. Con el hermano astuto no cierran nada: Morko no quiere plata, quiere una nación orca en Hellgate, y les deja la puerta abierta a cambio de un ofrecimiento que no tienen. Con el enano cierran todo: Gonagal Crestarroja se suma a la guerra contra los Velas Negras sin pedir nada, y de paso les explica qué duerme debajo del volcán de Iron Keep, por qué Charice era una farsa y quién dibuja el pez en las paredes. Termina en el coliseo, con una apuesta a once a uno que nadie más vio venir.",
  capitulos: [
    {
      titulo: "Dos horas de descanso",
      texto:
        "Salen del coliseo cerca del mediodía con la lista de pendientes corta y cercana: el hermano de Gorko, a quien no se gana peleando, y el enano Crestarroja, que está a cinco minutos a pie. Y con el cuerpo hecho pedazos del día anterior.\n\nLa discusión es breve y sensata. No es lo mismo entrar a una negociación con el diplomático de la familia recién salidos de una paliza que entrar descansados, así que deciden parar. Un descanso largo son ocho horas y no las tienen; un descanso corto son dos y sí. Almuerzo, baño y a seguir.\n\nAhí el Master deja caer su regla de mesa, que es también una regla de vida: hay grupos que encadenan un lugar con otro sin acordarse nunca de comer, de tomar agua ni de bañarse, y él les va poniendo palos en la rueda a propósito para que se acuerden. Estos se acuerdan solos.\n\nEl barrio ayuda. La zona de los dos coliseos no es el bajo mundo que imaginaban: tiene un coliseo a la izquierda y otro a la derecha, dos atracciones fuertes que traen gente con plata, y por eso prospera. Hay tabernas, comercios y una posada chica llamada Tres Vasos, a cuatro casas de un baño romano con sauna. Waterdeep también tiene su burguesía.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "Un mini descanso, por si acaso lo diplomático no es tan diplomático.",
        },
        {
          quien: "Vaegrant",
          texto:
            "Somos un grupo que respeta las comidas del día, y ahora nos toca almorzar.",
        },
        {
          quien: "Master",
          texto:
            "Hay mesas a las que yo siempre les voy agregando palos en la rueda, porque dicen: terminamos acá, vamos a tal lugar; terminamos acá, vamos a tal lugar. Nadie se acuerda de comer, de tomar un poco de agua, de bañarse.",
        },
      ],
    },
    {
      titulo: "El Chapoteadero",
      texto:
        "El Chapoteadero es un baño romano con piletón de agua tibia, una escalerita a un sauna de piedras calientes y aceites esenciales, música suave saliendo de unos altoparlantes sencillos y muebles de roble claro ribeteados en dorado. Lo atiende Malva, una enana demasiado alta y poco robusta para ser enana, de pelo rojizo oscuro, brazos tatuados y ropa ceñida, que los trata de viajeros y los saluda con una cortesía perfecta. El baño para los cuatro sale una pieza de plata por cabeza. Jeremy paga una segunda por el masaje, y con eso desaparece hasta la tarde.\n\nAdentro hay cuatro hombres que ni se inmutan cuando entran un semiorco de dos metros noventa y un humano de uno noventa. Uno de ellos, delgado, de bigote fino y rizado hacia arriba y aires de gran señor, se corre a un costado del piletón para hacerles lugar y les da conversación. Es la conversación más rentable de toda la sesión y no les cuesta una moneda.\n\nEsa noche hay duelo grande: Grimor contra Goldarin, dos artificieros con sus battle suits, con apuestas de hasta quinientas piezas de oro y el coliseo lleno a cinco mil personas y dos piezas de oro la entrada. Y hay un dato que corrió como reguero: el Crestarroja le metió la uña al aparato de Goldarin. El enano nunca se mete en reparaciones, solamente va, mira y se ríe; que esta vez haya tocado una armadura le da que pensar a todo el mundo. Las apuestas se fueron a once a uno a favor de Goldarin, y eso que recién empieza el día.\n\nDel enano también sacan la ficha entera: prodigio, doscientos años de oficio empezado por curiosidad, uno de los artificieros más respetados del ancho mundo, con cosas descubiertas que nadie debería descubrir. Tiene un hermano al sur que también es bueno, pero no tanto. Y tiene taller propio en la Isla de la Guardia, al norte, antes de las murallas.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "La menos conversación posible. Sería rarísimo que en cada lugar al que vayamos nos pongamos a hablar de información con todo el mundo. Vamos a terminar apareciendo degollados.",
        },
        {
          quien: "Malva",
          texto:
            "Buenas tardes, señores. ¿En qué podría ayudar? ¿Cuál sería el servicio que se dispone?",
        },
        {
          quien: "El señor del bigote",
          texto:
            "Veo que hay visitantes que también conocen el buen gusto de estos lugares. Acérquense.",
        },
        {
          quien: "El señor del bigote",
          texto: "¿Cómo están las apuestas? Once a uno a favor de Goldarin. Y eso que recién empezó el día.",
        },
        {
          quien: "El señor del bigote",
          texto:
            "Crestarroja es un enano prodigio. Hace más de doscientos años empezó a aprender el oficio por curiosidad, y hoy es uno de los artificieros más respetados del ancho mundo. Descubrió cosas que nadie debería descubrir.",
        },
        {
          quien: "El señor del bigote",
          texto:
            "No se trata de fuerza. Dentro de uno de estos trajes la fuerza ya no importa. Importan la perspicacia, las estrategias, cómo se mueve uno, la lectura del campo.",
        },
        {
          quien: "Master",
          texto:
            "Pese a las guerras que hay afuera, Waterdeep tiene su propia realidad. Están convencidos de que las guerras en algún momento van a llegar y que ya verán qué hacen. Mientras tanto, el show tiene que continuar.",
        },
        { quien: "Vaegrant", texto: "Celebramos la inevitabilidad." },
      ],
    },
    {
      titulo: "La oficina del balde",
      texto:
        "Salen limpios y con túnicas blancas que absorben el agua, le dejan a Malva el recado para Jeremy y caminan hasta el coliseo de al lado. Está todo cerrado menos una puerta de servicio con carretas descargando y, en la puerta central, un orco sentado.\n\nEse orco es Morko. Recibe a la gente de Iron Keep en lo que él llama su oficina, que es la azotea de la entrada: una reposera, dos baldecitos dados vuelta de asiento y la mejor vista de Waterdeep. No hace falta que se presente. Cuando Vaegrant le pregunta el nombre por cortesía, le contesta que sí, que puede saberlo, pero que ya lo sabe.\n\nAlcanza que Haddrek diga que viene por algo oficial de parte de Omán para que el orco pliegue la reposera y los haga pasar. Cruzan un pasillo hasta las arenas, y ahí ven el nombre del lugar: arenas Iron Keep. Nadie hace el chiste.\n\nAdentro, la oficina de verdad: una puerta oscura, alta y pulida que se abre sola, cuadros, piezas de arte, todos los lujos que el hermano no tiene. Los invita a sentarse donde gusten, cierra la puerta y le da una vuelta de llave.",
      dialogo: [
        { quien: "Morko", texto: "Pasemos a mi oficina, si es posible. Tome asiento, por favor." },
        { quien: "Vaegrant", texto: "Me presento. Soy Vaegrant. ¿Podríamos saber su nombre?" },
        { quien: "Morko", texto: "Sí. Pueden saberlo. Pero ya lo saben." },
        { quien: "Vaegrant", texto: "¿Se ven los baños desde acá?" },
        { quien: "Morko", texto: "Veo que mi hermano ya se divirtió con ustedes. Ya no tiene chiste." },
        {
          quien: "Morko",
          texto: "Ahora que estamos en un lugar más privado, díganme cómo el viejo Omán perdió Iron Keep.",
        },
      ],
    },
    {
      titulo: "¿Qué ganan mis hombres por sangrar?",
      texto:
        "La conversación empieza torcida a propósito. Le cuentan lo de la fortaleza tomada desde adentro, la guarnición prisionera y la sospecha de los Velas Negras, y él les devuelve la pregunta que no esperaban: por qué vienen a él con eso. No vinieron a comerciar información, así que qué buscan.\n\nCuando sale la palabra que faltaba, apoyo militar, queda claro de entrada por dónde no va la cosa. Plata no puede pedir: sus arcas son más abundantes que cualquier cosa que ellos puedan ofrecer, y con el volcán perdido se anima a decir que tiene más dinero que Iron Keep. Tampoco le sirve el argumento de la amenaza compartida: entiende que tarde o temprano los Velas Negras van a ser problema suyo también, pero hoy importa el bando por el que sangran sus hombres.\n\nLe ofrecen lo único que tienen, que es una parte de la administración de la fortaleza cuando la recuperen. Él escucha, pregunta qué garantías hay de que eso pase y se contesta solo: la palabra no alcanza. Y de paso deja en claro cuánto sabe de ellos. Sabe que vinieron en un barco muy especial y sabe que ese barco fue tomado por un motín. Las historias vuelan, dice, y alguien del puerto se la vendió.\n\nLo que no sabe es lo único que importa: que en la fortaleza hay gente encerrada. Ellos tampoco se lo dicen.",
      dialogo: [
        {
          quien: "Morko",
          texto:
            "Como verás, en mi oficio yo me puedo dar ciertos lujos. Como la información. ¿Qué saben ustedes de los Velas Negras?",
        },
        {
          quien: "Morko",
          texto:
            "Mi hermano acepta cualquier trato con tal de irse a trabar a las trompadas con alguien. No le importa el pago. Yo soy un poquito diferente.",
        },
        { quien: "Morko", texto: "¿Qué ganan mis hombres por sangrar en su campo de batalla?" },
        { quien: "Haddrek", texto: "Mi misión es recuperar la fortaleza y administrarla." },
        {
          quien: "Iscandar",
          texto:
            "Hablamos de un porcentaje de administración o de la ganancia posible de la fortaleza. Eso le daría un buen punto estratégico saliendo de Waterdeep.",
        },
        { quien: "Morko", texto: "¿Y qué garantías tengo yo de que eso pase? La palabra no alcanza." },
        {
          quien: "Morko",
          texto:
            "Mi hermano va a ir y va a poner su cara, literalmente. Va a recibir los golpes que tenga y va a repartir los que tenga que repartir. Después va a cargar sus barcos con lo que quede de su gente y va a volver contento al coliseo.",
        },
        {
          quien: "Morko",
          texto:
            "Y tengo entendido que vinieron en un barco muy especial. Y que ese barco muy especial fue tomado por motín. Las historias vuelan.",
        },
      ],
    },
    {
      titulo: "La contrapropuesta de Hellgate",
      texto:
        "Cuando ve que por ahí no hay negocio, se acomoda y hace la única oferta que le interesa de verdad. Que se pongan cómodos, dice.\n\nEn el High Forest hay un lugar llamado Hellgate: una gran fortaleza abandonada y arruinada, llena de riquezas, que domina la parte de las montañas y que quedó vacía por guerras viejas. El trato sería al revés de lo que vinieron a buscar. Ellos van, pelean y recuperan el volcán de Iron Keep, que se quedan. Y él deja de administrar un volcán extinto para manejar las hordas desde Hellgate. El problema del High Forest son los Barbahierro, los goblins y los trolls conquistándolo todo, y ahí suelta la frase que le da forma a toda la sesión: si quieren que los estandartes se unan, hay que saber cuáles estandartes hay que apagar.\n\nSu argumento no es codicia, es ideología. Iron Keep no es un territorio ni un clan: es un gran banco donde se guarda el tesoro de la Hermandad de la Espada, y lo único que serviría de ahí es usarlo como punto estratégico para controlar el Mar de las Espadas. Lo que un orco necesita es otra cosa: confrontación, expansión, territorio propio. Una nación orca de verdad, con todos los clanes bajo un mismo estandarte, en vez de ir a lo loco como el hermano.\n\nDe paso les regala el dato que vinieron buscando sin pedirlo. Los Velas Negras se originaron en Anauroch, los grandes desiertos del norte, en un lugar que abarca muchos territorios en las arenas y se llama el Imperio de las Sombras. De ahí salieron y de ahí se repartieron por el ancho mundo, con bases fuertes en todos lados.\n\nEl grupo no acepta, y por una razón sencilla: no es de ellos lo que él pide. La administración de la fortaleza la decide Omán, no ellos. Pero el plan les queda dando vueltas.",
      dialogo: [
        { quien: "Morko", texto: "Contrapropuesta. Se ponen comoditos. ¿Conocen The High Forest, los grandes bosques?" },
        {
          quien: "Morko",
          texto:
            "Si ustedes quieren que los estandartes se unan, hay que saber cuáles estandartes hay que apagar. Si no, nos enfrentamos a lo de siempre: un posible motín desde adentro.",
        },
        {
          quien: "Morko",
          texto:
            "Iron Keep no es más que un gran banco y nada más. No estamos hablando de clanes ni de territorios ni de fortalezas: es un lugar donde se guarda el tesoro de la Hermandad de la Espada.",
        },
        {
          quien: "Morko",
          texto:
            "Él más que nadie sabe cómo es la ideología de un orco. Nosotros necesitamos de esas confrontaciones, del expansionismo, de saber cuáles son nuestros territorios.",
        },
        {
          quien: "Morko",
          texto:
            "Los Velas Negras se originaron en Anauroch, los grandes desiertos del norte. Hay un lugar que abarca muchos territorios en las arenas llamado el Imperio de las Sombras. De ahí salen.",
        },
        {
          quien: "Iscandar",
          texto:
            "Me salgo fuera de la conversación, porque no creo que seamos capaces de decidir qué se va a hacer con esa fortaleza.",
        },
      ],
    },
    {
      titulo: "Háganme un ofrecimiento sólido",
      texto:
        "La despedida es cortés y no cierra nada. Que le hagan un ofrecimiento sólido y tendrá a sus hombres. No hace falta que contesten ahora.\n\nAfuera, la lectura del grupo es unánime y poco amable. Es un chanta bárbaro, dicen, la contracara del hermano: el otro es un idealista aunque sea un idiota, este te arruina, y si en medio del quilombo alguien de adentro de la fortaleza le ofrece más, se da vuelta y los mata. Darle una fortaleza y una horda a alguien así no está en discusión.\n\nPero el plan sí. Haddrek se lo apropia completo y en voz alta: si Hellgate está abandonada, que la tomen ellos. Ayudar a los Garradehierro, que están peleando esa guerra hace años, quedarse con la fortaleza, juntar ahí a los tres clanes que ya consiguió y armar una horda propia con un punto fijo adonde volver. Un segundo Iron Keep, pero tribal, sin banco. Y recién después ir a ayudar a Omán, si Omán aguanta.\n\nJeremy aparece en ese momento, flotando, recién levantado de la camilla y evidentemente mejor que todos los demás.",
      dialogo: [
        {
          quien: "Morko",
          texto: "Háganme un ofrecimiento sólido y tendrán mis hombres. No hace falta que contesten ahora. Nos vemos.",
        },
        {
          quien: "Haddrek",
          texto:
            "Hay algo del plan de él que me gustó y me lo voy a apropiar totalmente: conquistar Hellgate. Un segundo Iron Keep, pero bien tribal, sin manejar plata.",
        },
        {
          quien: "Iscandar",
          texto:
            "La diferencia con el hermano es que el hermano es un idealista, aunque sea un idiota. Este es un chanta bárbaro: si le conviene, se da vuelta y te mata.",
        },
        { quien: "Vaegrant", texto: "¿Cómo estuvo? Se te ve rejuvenecido." },
        { quien: "Jeremy", texto: "Me siento como nuevo." },
      ],
    },
    {
      titulo: "El deshuesadero",
      texto:
        "El taller de Crestarroja no es un taller: es el deshuesadero, un complejo industrial entero de su propiedad, con una chatarrería prolijísima en el frente y guardias que los dejan pasar porque no están haciendo nada malo. Adentro trabajan enanos y humanos; los humanos saludan con cordialidad y los enanos los miran con recelo antes de saludar.\n\nEl que se les acerca es él: enano fornido con delantal de cuero pesado, jardinero de tela gruesa, guantes negros enormes, una cresta roja en la cabeza y unos anteojos con varias lupas montadas. Dice «visitantes» con la batería social terminada. Lo único que hace falta es mostrarle la carta de su hermano.\n\nEl galpón es lo contrario del de Bragan. Acá no se esconde nada: battle suits terminados, battle suits a medio armar, gente trabajando en cubículos sobre cada armadura. Su explicación es de manual: mostrar lo que hace es la forma de demostrar que no hace nada ilegal, al menos en Waterdeep.\n\nSaca unos planos de la mesada, sirve una jarra de cerveza enana para cada uno y, con lo que sobra, le rompe la tapa al barril de un puñetazo para tomar directo. Y pregunta lo mismo que preguntó su hermano al empezar: qué hacen ellos acá.\n\nDe Bragan habla con el cariño áspero que corresponde: le ofreció un puesto respetable y el otro eligió su chatarrería en Puerto Corona antes que hacerse un nombre acá. De Durin, con resignación. De Ámbar, con incredulidad: un lugar tan tranquilo que atropellar un perro con una carreta es noticia grande. Y cuando le dicen que vieron volar gente por el aire con cañones de galeones de los Velas Negras, deja la cerveza y empieza a escuchar en serio.",
      dialogo: [
        { quien: "Crestarroja", texto: "Visitantes." },
        {
          quien: "Crestarroja",
          texto:
            "Acá se negocia de otra manera. Mi hermano es reacio a mostrar sus trabajos; yo prefiero mostrar lo que hago. Así demuestro que no estoy haciendo nada ilegal. Al menos acá, en Waterdeep.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Me extraña. Él se fue. Yo le ofrecí un lugar, un puesto de trabajo respetable, pero decidió quedarse con su chatarra antes que venir a hacerse un buen renombre.",
        },
        {
          quien: "Crestarroja",
          texto:
            "¿Ámbar? Ese lugar es tan tranquilo que aplastar un perro con una carreta se transforma en grandes noticias. Pero claro: donde esté Durin, la paz dura poco.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Durin es mucho más idealista: prefiere caer preso antes que torcer su propia palabra. Trobe es un poco más flexible. Viejo garca.",
        },
        { quien: "Crestarroja", texto: "El mundo se está yendo a la mierda." },
      ],
    },
    {
      titulo: "Lo que duerme debajo de la fortaleza",
      texto:
        "De ahí en adelante, la sesión entera es él hablando y ellos anotando.\n\nEl grupo viejo tenía cinco: Durin, Trobe, Zariff, Charice y Laril Silverhawk, una bruja obsesionada con un barco específico, con Omán de mecenas. Los Velas Negras no van detrás de oro ni de territorio: van detrás de la tecnología, y por eso caen los que caen. Durin protegía a los suyos con armaduras conseguidas entre gnomos y enanos (él mismo le fabricó una hace mucho), Trobe conocía las cartas marítimas como nadie y guardó la ubicación de ciertos portales naturales, y Charice tenía los planos y los libros. Los Velas Negras ya tienen los libros de Charice, y no les sirven de nada: Charice es una farsa y escribió mentiras a propósito. Las ubicaciones verdaderas y las cartas verdaderas las tiene Trobe, que escapó al norte. Y la exposición del grupo es obra del mismo Trobe, que necesitaba desviar la atención para poder escapar.\n\nDespués llega lo que nadie había preguntado en nueve sesiones. Debajo de la fortaleza del volcán, en una bóveda natural antiquísima, descubrieron un Claro Lunar: una superficie de plata líquida que es un portal, pero no hacia el pueblo faérico. Ese abre al Plano del Vacío, donde espera una horda de ilícidos con muchas ganas de cruzar. Eso es lo que los Velas Negras quieren desatar, y esa, y no el tesoro, es la razón por la que la fortaleza importa.\n\nHellgate tiene lo suyo: un portal natural chico que pasó desapercibido delante de las narices de los magos, adentro de una gran torre de reloj donde el tiempo y el espacio funcionan distinto cuando se activa. De ahí viene toda la tecnología que se está desparramando por el mundo. Los humanos hicieron un pacto, dejaron pasar a ciertos seres con el conocimiento necesario, recibieron tecnología a cambio y las cosas se les fueron de las manos. Por eso Hellgate cayó en desgracia, y por eso Morko la quiere: no le interesaba el volcán, les mintió, y no puede enfrentarse solo a lo que hay ahí adentro.\n\nEl pez pintado en los muros de Waterdeep, que venía sin explicar desde el pasaje, también tiene nombre. Se llama Goldfish y es la mascota del jefe de gremio de los bajos fondos: Xanatar, alguien a quien nadie vio nunca en persona, con mucho poder, y no del social ni del económico. Su única obsesión es mantener vivo a su pececito dorado. Y sin querer les está haciendo un favor a todos: mientras Xanatar controla los bajos fondos, Morko no puede dominar la parte norte de la ciudad.\n\nLa cuenta sale sola. Crestarroja pone su apoyo y pide una sola cosa a cambio: pelear las guerras contra los Velas Negras. Pide también que el trato sea igualitario, por si alguna vez necesita que le sostengan sus montañas. Y manda un recado para los Grandes Fauces del High Forest: que le recuerden a su caudillo que Crestarroja consideraría saldada la deuda si los recibe.\n\nEl resto son fichas sueltas que valen su peso. El drow de Waterdeep tiene nombre acá: el capitán Lanza de Plata, y si todavía no vino a buscarlos es porque no los considera peligrosos. José Antonio de Castel, el Pirata de los Cielos, es un mercenario cuya lealtad se compra, pero tiene una debilidad concreta: la minería de cristales. Denle autonomía sobre una mina y lo tienen por años. Krenko, jefe de los Garradehierro, es honorable y cumple lo que promete. Y en el mar hay un rumor nuevo: un pesquero de altura que explotó en una explosión gélida. Algunos hablan de un kraken, pero los kraken no congelan.",
      dialogo: [
        {
          quien: "Crestarroja",
          texto:
            "Los Velas Negras están detrás de la tecnología. Tienen poder, tienen influencia, tienen el número, pero la tecnología sigue siendo de punta en estos lares.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Charice es una farsa. Sí, los Velas Negras tienen sus libros. Charice escribió muchas mentiras a propósito. Las verdaderas ubicaciones las tiene Trobe. Las verdaderas cartas marítimas las tiene Trobe.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Lamento decirle, pero ustedes están expuestos justamente por Trobe. Trobe necesitaba desviar la atención para poder escapar.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Debajo de la fortaleza descubrieron algo llamado el Claro Lunar, en una bóveda natural muy antigua. Es una especie de espejo de plata, muy líquido. Es un portal hacia el Plano del Vacío, donde están los ilícidos, una horda deseosa de entrar para este lado.",
        },
        { quien: "Crestarroja", texto: "A mí lo que me importa es que no se abra ese portal." },
        {
          quien: "Crestarroja",
          texto:
            "Claramente les mintió. No le interesa el volcán: le interesa Hellgate, pero no puede enfrentarse a lo que hay en Hellgate.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Es una gran torre de reloj. Adentro, el tiempo y el espacio son diferentes cuando se activa. Y de ahí viene toda la tecnología que se está desparramando en este mundo.",
        },
        {
          quien: "Crestarroja",
          texto:
            "El pescadito se llama Goldfish. Es la mascota del jefe de gremio de los bajos fondos. Alguien llamado Xanatar. Nunca lo vi en persona, pero dicen que es un sujeto que tiene mucho poder. No hablo de poder social ni económico: hablo de poder de magia.",
        },
        { quien: "Crestarroja", texto: "No hay que darle poder a Morko." },
        {
          quien: "Crestarroja",
          texto:
            "Mucho de la paz que tengo se lo debo a mantener a los Velas Negras bajo la mugre de mis botas. Así que su guerra también me pertenece. Les voy a dar apoyo.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Si van a los Grandes Fauces, recuérdenle a su caudillo que Crestarroja consideraría saldada su deuda si los recibe.",
        },
        {
          quien: "Crestarroja",
          texto: "Si él no vino hasta ustedes, es porque no los considera peligrosos.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Consigan alguna mina y denle autonomía sobre una mina. Durante años van a tener su lealtad.",
        },
      ],
    },
    {
      titulo: "Arañas y Fat Boys",
      texto:
        "Antes de irse preguntan lo único práctico que les faltaba: cómo llegar rápido al High Forest sin llamar la atención y sin mover el Albatros, que está camuflado en Puerto Corona y es demasiado valioso para exponerlo.\n\nLe alcanza con verlos caminar para entender el problema. Les arma dos regalos.\n\nEl primero son los Fat Boys: ruedas motorizadas de una plaza, livianas, fáciles de cargar en una nave, con un huequito chico para llevar algo encima. Funcionan por fusión de gemas comunes, no lunares, y vienen con una cajita de seis cristales; después hay que comprarlos. Les toma medidas de espalda, altura y peso a cada uno, porque hay que adaptarlos, y avisa dos cosas: que para el amanecer los tiene listos, y que con nivel dos no los van a poder manejar, que van a tener que subir a tres. Son modificables, además, para el que tenga conocimientos de ingeniería o ganas de agregarles chatarra.\n\nEl segundo son las arañas mensajeras. Arañas de fase que entran en fase y se mueven por plano, llevan un mensaje con la voz de quien lo manda y tardan unos cinco minutos hasta Puerto Corona. Solo llevan, no traen. Y tienen un único requisito: hay que haber visto en persona al destinatario. Haddrek manda dos ahí mismo, a los clanes de Puerto Corona, avisando que el punto de encuentro cambió.",
      dialogo: [
        {
          quien: "Crestarroja",
          texto: "Veo que no tienen mucha eficacia al moverse por tierra.",
        },
        {
          quien: "Crestarroja",
          texto:
            "El único requerimiento que tienen las arañas es que usted tiene que haber visto personalmente a la persona a la que le envía el mensaje.",
        },
        {
          quien: "Crestarroja",
          texto: "Van a tener que subir a nivel tres. Si no, no pueden manejar las máquinas.",
        },
        { quien: "Crestarroja", texto: "Para el amanecer yo ya los voy a tener listos." },
        {
          quien: "Crestarroja",
          texto:
            "Si toman el High Forest le van a meter un dedo en el ojo a los Velas Negras. Eso significa que los van a empezar a considerar oponentes.",
        },
        { quien: "Iscandar", texto: "Ya nos persiguen para todos lados. ¿Qué le hace una raya más al tigre?" },
      ],
    },
    {
      titulo: "Once a uno",
      texto:
        "Antes de salir queda una pregunta y él la contesta sin adornos. Sí, le trabajó la armadura a Goldarin. No para que gane: para que pierda. Goldarin es el campeón de Morko y no tiene que ganar ese combate, porque si gana, Morko toma relevancia sobre los dos coliseos. Él prefiere que los hermanos sigan peleándose entre ellos. Él no apuesta; sus empleados sí. Y su reputación no se juega ahí: cualquiera que entre a su chatarrería se da cuenta solo de su manufactura.\n\nEsa noche el coliseo está lleno. Del otro lado está Grimor, un chico de doce años en su primera pelea. Goldarin entra excedido de confianza y lo castiga durísimo los primeros minutos, y ahí el grupo aprende algo que sirve para más adelante: adentro de un meca no sos invulnerable, sos la pelotita, y te la comés igual. El combate dura unos quince minutos. Después empieza a fallarle todo y gana el chico.\n\nEl Master les avisa una sola vez, antes de que apuesten, que ir a hablar con el enano que modificó la máquina y volver a poner toda la plata es muy sospechoso. Así que apuestan poco y mal a propósito: cinco, seis y siete piezas de oro, repartidas en mesas laterales y no en la principal, con cara de pasar por gente a la que le gusta la timba. Con once a uno, eso son sesenta y dos y sesenta y siete monedas de oro para los que apostaron. El señor del bigote del baño estaba por poner cien a la otra.\n\nDesde el palco, Morko mira sin moverse. Está rojo. Acaba de perder mucha plata en una noche, y con ella la posibilidad de pagarles bien a sus peleadores la semana que viene.\n\nHaddrek lo busca ahí mismo, entre cinco mil personas, para avisarle a Gorko que el plan cambió: primero el High Forest, primero ayudar a los Garradehierro y tomar Hellgate, y desde ahí organizarse todos juntos. Le promete dos peleas en vez de una. La idea de gobierno también queda dicha: un consejo con el líder de cada clan, con ellos cuatro adentro, para que el poder no quede en manos de uno solo.",
      dialogo: [
        { quien: "Vaegrant", texto: "¿Los hizo para que gane?" },
        { quien: "Crestarroja", texto: "No. Lo hice para que pierda. Goldarin no tiene que ganar ese combate." },
        {
          quien: "Crestarroja",
          texto:
            "Prefiero que los hermanos sigan discutiendo entre ellos antes de que tomen relevancia. Yo no apuesto. Mis empleados sí.",
        },
        {
          quien: "Crestarroja",
          texto:
            "Mi reputación se gana de otra manera. Cualquiera va a decir: ja, el enano le erró. Cualquiera que venga a mi chatarrería se da cuenta de mi manufactura.",
        },
        {
          quien: "Master",
          texto:
            "Ustedes fueron a hablar con el enano que modificó la máquina y después vienen y ponen toda la teca. Es muy sospechoso, muchachos. Esto se los aviso por única vez.",
        },
        {
          quien: "Master",
          texto:
            "Adentro de un meca no sos más que la pelotita. Te la comés igual. Cuando empieza a fallar todo, termina ganando Grimor.",
        },
        {
          quien: "Haddrek",
          texto:
            "El plan va a cambiar. Vamos a ir a ayudar a los Garradehierro, vamos a tomar Hellgate y nos vamos a quedar ahí para organizarnos todos juntos. Y de ahí partir.",
        },
        { quien: "Gorko", texto: "Me prometieron una batalla. Espero que cumplan." },
        { quien: "Haddrek", texto: "Y ahora te doy dos." },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Morko",
      rol:
        "El hermano astuto, dueño del otro coliseo. Recibe a la gente de Iron Keep en una azotea con una reposera y dos baldes dados vuelta, y negocia dentro de una oficina con cuadros y llave. Compra información y sabe del Albatros y del motín. No quiere plata: quiere una nación orca en Hellgate y que le entreguen el volcán. Quedó sin trato y con la puerta abierta, a la espera de un ofrecimiento sólido. Crestarroja fue tajante: a Morko no hay que darle poder.",
    },
    {
      nombre: "Gonagal Crestarroja",
      rol:
        "El enano prodigio, hermano de Bragan, dueño del deshuesadero de Waterdeep. Doscientos años de oficio empezados por curiosidad, uno de los artificieros más respetados del ancho mundo, y el único que muestra lo que hace para probar que no hace nada ilegal. Se sumó a la guerra contra los Velas Negras sin pedir nada a cambio más que pelearla y que el trato sea igualitario. Regaló Fat Boys, arañas mensajeras y la mitad del lore de la campaña.",
    },
    {
      nombre: "Malva",
      rol:
        "Dueña del Chapoteadero, el baño romano del barrio de los coliseos. Enana demasiado alta y poco robusta para ser enana, pelo rojizo oscuro, brazos tatuados, ropa ceñida y una cortesía impecable con los viajeros. Una pieza de plata el baño, dos con masaje. No tiene una sola mala reseña en su tablero y lo sabe.",
    },
    {
      nombre: "El señor del bigote",
      rol:
        "Un habitué del Chapoteadero, delgado, de bigote fino y rizado, con aires de gran señor. Les regaló gratis todo lo que valía la sesión: el duelo de la noche, el once a uno, que Crestarroja había tocado la armadura de Goldarin, la ficha completa del enano y dónde queda su taller. Iba a apostar cien piezas de oro al caballo equivocado.",
    },
    {
      nombre: "Xanatar",
      rol:
        "El jefe de gremio de los bajos fondos de Waterdeep, y la respuesta al grafiti del pasaje: el pez pintado en los muros se llama Goldfish y es su mascota. Nadie lo vio nunca en persona. Su poder no es social ni económico, es mágico, y su única obsesión es mantener vivo a su pececito dorado. Sin querer, es el que le impide a Morko dominar el norte de la ciudad.",
    },
    {
      nombre: "Charice",
      rol:
        "La bibliotecaria de Ámbar, por fin con nombre. Los Velas Negras se llevaron sus libros y no les sirven de nada: escribió mentiras a propósito. Las ubicaciones y las cartas marítimas verdaderas las tiene Trobe.",
    },
    {
      nombre: "Laril Silverhawk",
      rol:
        "La quinta del grupo viejo, junto a Durin, Trobe, Zariff y Charice. Una bruja pequeña obsesionada con un barco específico. Crestarroja no dijo cuál y nadie preguntó.",
    },
    {
      nombre: "Capitán Lanza de Plata",
      rol:
        "El nombre del drow de Waterdeep, el jefe del gremio de los magos enemistado con Bragan. Crestarroja lo dio al pasar y agregó lo único tranquilizador del día: si todavía no vino a buscarlos, es porque no los considera peligrosos.",
    },
    {
      nombre: "Grimor y Goldarin",
      rol:
        "Los dos artificieros del duelo de la noche. Goldarin, campeón de Morko, entró excedido de confianza y con la armadura tocada por Crestarroja. Grimor, doce años y primera pelea, aguantó quince minutos de castigo y ganó cuando al otro empezó a fallarle todo. Las apuestas estaban once a uno al revés.",
    },
  ],
  dudas: [
    "Morko quedó con la puerta abierta y sin trato. Nadie sabe qué ofrecerle que no sea una fortaleza ajena, y Crestarroja avisó que no hay que darle poder.",
    "Laril Silverhawk está obsesionada con un barco específico. Nadie preguntó cuál, y el grupo viaja en el Albatros.",
    "El Claro Lunar de debajo del volcán no es el de las Islas de Val: ese es el ojo hacia el pueblo faérico y este abre al Plano del Vacío. No se sabe si son dos cosas del mismo tipo o la misma cosa en dos lugares.",
    "De Charice y de Trobe no se sabe nada desde Ámbar. Los libros falsos ya están en manos de los Velas Negras; las cartas verdaderas viajan con un viejo zorro que escapó al norte y que, según el enano, los expuso a ellos para poder escapar.",
    "Xanatar no fue visto nunca por nadie, ni siquiera por Crestarroja. Tampoco quedó claro qué relación tiene con el capitán Lanza de Plata, si es que tiene alguna.",
    "Apostaron cinco, seis y siete piezas de oro con información de adentro y se llevaron más de sesenta cada uno. El Master avisó una sola vez que eso se nota.",
  ],
};

data.cronica.push(sesion9);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "El Chapoteadero (Sesión 9)",
    tipo: "Sesión 9 · Waterdeep · barrio de los coliseos",
    texto:
      "Un baño romano en la zona que prospera entre los dos coliseos: piletón de agua tibia, una escalerita a un sauna de piedras calientes con aceites esenciales, música suave de altoparlantes sencillos y muebles de roble claro ribeteados en dorado. Lo atiende Malva. Una pieza de plata el baño, dos con masaje, y un servicio de cortesanas aparte. Del barrio hay que saber dos cosas: que no es el bajo mundo que uno imagina, porque los dos coliseos traen gente con plata, y que la conversación de los bañistas vale más que el agua caliente.",
    destacado: false,
  },
  {
    nombre: "Las arenas Iron Keep (Sesión 9)",
    tipo: "Sesión 9 · el coliseo de Morko",
    texto:
      "El coliseo del hermano astuto, gemelo del de Gorko y en disputa con él, se llama arenas Iron Keep. Su oficina de todos los días es la azotea de la entrada, con una reposera plegable y baldes dados vuelta de asiento, y la mejor vista de Waterdeep. Adentro, pasando las arenas, tiene la oficina de verdad: puerta oscura alta y pulida, cuadros, piezas de arte y una vuelta de llave cuando la conversación se pone seria. Cinco mil personas de capacidad, dos piezas de oro la entrada, y las apuestas grandes de la ciudad como verdadero negocio.",
    destacado: false,
  },
  {
    nombre: "El deshuesadero (Sesión 9)",
    tipo: "Sesión 9 · Isla de la Guardia, al norte de Waterdeep",
    texto:
      "No es un taller: es un complejo industrial entero de Gonagal Crestarroja, con una parcela de tierra propia antes de las murallas. Chatarrería prolija en el frente, guardias que dejan pasar al que no está haciendo nada malo, y adentro enanos y humanos trabajando en cubículos sobre battle suits terminados y a medio armar. Es lo contrario del galpón de su hermano en Puerto Corona: acá no se esconde nada, y mostrarlo todo es la forma de probar que no hay nada ilegal. Se negocia sobre una bancada de trabajo, con planos corridos a un costado y cerveza enana servida de un barril que se abre de un puñetazo.",
    destacado: false,
  },
  {
    nombre: "Lo que hay debajo del volcán (Sesión 9)",
    tipo: "Sesión 9 · la verdad sobre Iron Keep",
    texto:
      "Debajo de la fortaleza del volcán extinto, en una bóveda natural antiquísima, hay un Claro Lunar: una superficie de plata líquida que funciona como portal. No abre hacia el pueblo faérico como el de las Islas de Val, sino hacia el Plano del Vacío, donde espera una horda de ilícidos con ganas de cruzar. Eso es lo que los Velas Negras quieren desatar, y esa es la razón real por la que la fortaleza importa, muy por encima del tesoro. Iron Keep, según Morko, no es un territorio ni un clan: es el gran banco donde se guarda el tesoro de la Hermandad de la Espada.",
    destacado: true,
  },
  {
    nombre: "Hellgate y la torre de reloj (Sesión 9)",
    tipo: "Sesión 9 · High Forest",
    texto:
      "Hellgate esconde un portal natural chico que pasó desapercibido delante de las narices de los magos: una gran torre de reloj donde el tiempo y el espacio funcionan distinto cuando se activa. De ahí viene toda la tecnología que se está desparramando por el mundo. Los humanos hicieron un pacto, dejaron pasar a ciertos seres con el conocimiento necesario y recibieron tecnología a cambio, hasta que las cosas se salieron de control y la fortaleza cayó en desgracia. Morko la quiere para fundar una nación orca y no puede enfrentarse solo a lo que hay adentro. El grupo decidió tomarla para sí, junto a los Garradehierro de Krenko.",
    destacado: true,
  },
  {
    nombre: "De dónde salen los Velas Negras (Sesión 9)",
    tipo: "Sesión 9 · el enemigo, por fin con origen",
    texto:
      "Se originaron en Anauroch, los grandes desiertos del norte, en un lugar que abarca muchos territorios en las arenas y se llama el Imperio de las Sombras. Desde ahí se repartieron por el ancho mundo y tienen bases fuertes en todos lados. La sociedad es mucho más antigua de lo que cualquiera supone: empezaron como un grupo chico dedicado a la magia y, cuando el hombre empezó a rivalizar, juraron venganza no contra el hombre sino contra todo lo que camina bajo el sol. No van detrás del oro ni del territorio: van detrás de la tecnología, y por eso avanzan tomando puestos en vez de dar una guerra a gran escala.",
    destacado: true,
  },
  {
    nombre: "Fat Boys y arañas mensajeras (Sesión 9)",
    tipo: "Sesión 9 · lo que regaló Crestarroja",
    texto:
      "Los Fat Boys son ruedas motorizadas de una plaza, livianas, fáciles de cargar en una nave y con un hueco chico para llevar carga. Andan por fusión de gemas comunes, no lunares, y vienen con una caja de seis cristales; después hay que comprarlos. Se adaptan a la espalda, la altura y el peso de cada uno, se pueden modificar con ingeniería o chatarra, y hacen falta tres niveles para manejarlos. Las arañas mensajeras son arañas de fase: entran en fase y se mueven por plano, llevan un mensaje con la voz del que lo manda y tardan unos cinco minutos hasta Puerto Corona. Solo llevan, no traen, y hay que haber visto en persona al destinatario.",
    destacado: false,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
for (const id of ["waterdeep", "hellgate"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(9)) m.sesiones.push(9);
}

data.mapa.rutas.push({
  sesion: 9,
  estado: "planeado",
  puntos: ["waterdeep", "hellgate"],
});

data.mapa.party = {
  marcadorId: "waterdeep",
  texto:
    "Fin de la Sesión 9: siguen en Waterdeep, en el coliseo de Morko, con las apuestas cobradas y el plan dado vuelta. Ya no van directo al volcán: primero el High Forest, ayudar a los Garradehierro de Krenko, tomar Hellgate y quedarse con ella como punto fijo para juntar ahí a todos los clanes. Gorko ya está avisado y los espera con dos batallas prometidas; Crestarroja se sumó sin pedir nada y les deja los Fat Boys listos al amanecer; Morko quedó sin trato y con la puerta abierta. El Albatros sigue camuflado en Puerto Corona y las arañas ya salieron con el cambio de punto de encuentro. Pendiente: lo que duerme debajo del volcán, Xanatar, el capitán Lanza de Plata y subir a nivel tres.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 9 agregada al canon:");
console.log(`  capítulos : ${sesion9.capitulos.length}`);
console.log(`  diálogo   : ${sesion9.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres   : ${sesion9.nombres.length}`);
console.log(`  dudas     : ${sesion9.dudas.length}`);
console.log(`  lugares   : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
