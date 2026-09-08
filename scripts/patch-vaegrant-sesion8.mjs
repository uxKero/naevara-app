// Suma la Sesión 8 de Silvapor al canon: data/vaegrant.json → cronica[],
// más los lugares, marcadores y la posición del grupo que salieron de mesa.
//
// Fuente: sources/Vaegrant/Sesion 8 (32 audios transcriptos con ElevenLabs).
// Idempotente: si ya existe la crónica "sesion-8", no hace nada.
//
// Uso: node scripts/patch-vaegrant-sesion8.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// Supabase y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-8")) {
  console.log("La crónica ya tiene 'sesion-8'. Nada que hacer.");
  process.exit(0);
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion8 = {
  id: "sesion-8",
  numero: 8,
  titulo: "El sacerdote mudo",
  fecha: "2026-08-25",
  resumen:
    "El grupo cruza a Waterdeep por el pasaje y descubre que del otro lado no hay caos: hay una ciudad que funciona demasiado bien. Registro de tránsito, precios controlados, policía deseosa de aplicar la ley y una posada donde hay que saber la contraseña. Para moverse improvisan una tapadera —Iscandar de sacerdote con voto de silencio— y la sostienen un día entero. Termina en la arena de Morko, con los cuatro peleando y un trato cerrado: cincuenta orcos y cinco barcos.",
  capitulos: [
    {
      titulo: "La hora antes de cruzar",
      texto:
        "Se juntan los cuatro en la grieta de la muralla, a la caída del sol de un martes. Los que esperaban esperan; los que volvían llegan justo. Tienen una hora antes de cruzar y la usan para ponerse al día.\n\nDe la parte alta de Puerto Corona vienen los nombres: José Antonio de Castel, de las Hojas de la Noche, con su daga y su media luna, y el aviso de que ese nombre es un salvoconducto para transitar y no un seguro de vida. Corben fue claro en lo que importa: los bajos fondos de Waterdeep no son un cubil de ratas y peleadores, ahí abajo hay gente con influencia política y militar, y el que se vuelve un problema deja de serlo rápido. Del otro lado del bosque vienen los Grandes Fauces comprometidos con la leva y el precio que puso Grun: moverle el piso al elfo de Waterdeep hasta sacarlo del escondite, para que Krenko empiece a confiar.\n\nEl plan que arman es deliberadamente chico. Entrar, hacer lo que hay que hacer, sacar algo de información y salir vivos: eso es el negocio mínimo. Si además se puede hacer un ruidito que le retrase los planes al drow, mejor. Lo demás lo dejan abierto a propósito, para no atarse a un plan.\n\nHasta el día de la semana lo discuten, porque no es lo mismo entrar a un bajo fondo un martes que un viernes. El fin de semana cobran los marinos y el lugar se llena; a principio de semana el ánimo es laborable y bajoneador. Calientan las raciones en una fogata chica, comen, y esperan a que haya luz de luna.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "Lo que mejor nos puede salir es entrar, hacer lo que tenemos que hacer, sacar algo de información y salir vivos. Ese es el negocio mínimo.",
        },
        {
          quien: "Vaegrant",
          texto:
            "Este plan mínimo nos sirve. Nos deja la libertad de decidir sobre el plan y no atarnos a un plan.",
        },
        {
          quien: "Iscandar",
          texto:
            "Me dijo claramente que no nos va a salvar nadie. Acá fingen todos demencia: sos un problema, cuatro puñaladas, al río, y ya no sos un problema.",
        },
        {
          quien: "Vaegrant",
          texto: "La idea general es pasar a Waterdeep y volver sanos. O vivos, al menos.",
        },
      ],
    },
    {
      titulo: "El pasaje de bribón",
      texto:
        "El pasaje no es una puerta escondida en la pared: es un tubo de doscientos metros que atraviesa una muralla de veinte metros de ancho, con una boca de cada lado. Un camino viejo de contrabandistas, iluminado con lámparas de aceite y sin un solo guardia.\n\nAdentro hay basurales, gente muy pobre pidiendo, algunos locos diciendo incoherencias. Iscandar viene de gala —no se le ocurrió traer otra ropa— y decide jugarla de noble extraño de una tierra lejana, que es lo más lejos que se puede tirar de la soga sin que se corte. Una persona sale reptando de las sombras con un cántaro en las manos y le pide una moneda. Se la da y lo bendice. Cuando el hombre levanta la cabeza se le ve un tumor en la frente.\n\nEse es el único aviso de todo el cruce, y viene con un gesto: señala un grafiti en la pared y dice que él lo ve todo, que tenga cuidado. No dice quién es él.\n\nDespués pasan dos hombres de turbante y capas extrañas, erguidos, hablando un idioma que ninguno de los cuatro reconoce. El mendigo los ve y recula a su caja. Ellos saludan al noble como se saluda a alguien que mejor no preguntar qué hace ahí. Vaegrant, que aguanta las ganas de pararlos y preguntarles, se queda con el pensamiento por las dudas: la regla del capitán es parar cinco segundos antes de hacer cualquier cosa.",
      dialogo: [
        {
          quien: "Mendigo",
          texto: "Dios lo bendiga, señor. No es un buen lugar para un noble.",
        },
        { quien: "Iscandar", texto: "No es un buen lugar para nadie, por lo que veo." },
        {
          quien: "Mendigo",
          texto:
            "Agradezco el que me dé la oportunidad de comer un día más. Pero ten cuidado, viajero: él lo ve todo.",
        },
        {
          quien: "Iscandar",
          texto:
            "Yo no sé cuánto podemos tirar de la soga con este chiste de noble. Podemos tirar. Si se corta, pues pelear. Pero si nos agarran en falta, nos cocinan: somos cuatro don nadies.",
        },
      ],
    },
    {
      titulo: "La Ciudad de los Muertos",
      texto:
        "Salen de una cripta falsa, ya de noche. El lugar donde desemboca el pasaje no es un distrito de Waterdeep sino un barrio propio con su propia administración y sus propias murallas: la Ciudadela, o la Ciudad de los Muertos. Es el cementerio central y el único sitio donde legalmente se puede enterrar a alguien.\n\nFunciona como un negocio ordenado. Se paga una mensualidad y se tiene derecho a un nicho por diez años; pasados los diez, los familiares se llevan los huesos a donde sea, menos ahí. De día se llena de gente que limpia lápidas, las renueva o retira restos para hacerle lugar a otros muertos. Está atestado de enterradores, tanatólogos y carpinteros: toda la industria alrededor de lo mismo. Las plazas están reemplazadas por extensiones de nichos y criptas, y las pocas casas y comercios que hay están construidos entre las tumbas. El aire es denso, húmedo, con olor a moho y a cosas viejas. Las puertas se cierran de noche.\n\nAhí improvisan la tapadera que van a sostener el resto de la sesión. Iscandar, que ya venía de gala, pasa a ser un sacerdote de Tromm con voto de silencio, enviado a bendecir tumbas de la ciudadela. Vaegrant habla por él, Haddrek también, y el sacerdote no abre la boca. Nadie planea nada más allá de eso.\n\nLo que sí queda claro es cómo se gobierna la ciudad: Waterdeep la administran los lores, y el gobernador es un monigote al que le pagan por no saber dónde está parado.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "Cuando pregunten quién soy, soy un sacerdote que vino a bendecir una zona del cementerio. Yo la voy a jugar en silencio: si preguntan, tengo un voto.",
        },
        {
          quien: "Vaegrant",
          texto: "Okey. Hablo yo, habla el orco, y él no habla.",
        },
        {
          quien: "Master",
          texto:
            "Pagando una mensualidad uno tiene derecho a ser enterrado en la Ciudad de los Muertos, pero solamente con un máximo de diez años. Después de diez años, tus familiares tienen que llevar tus huesos a donde sea, menos acá.",
        },
      ],
    },
    {
      titulo: "El sargento Ducat",
      texto:
        "En vez de dormir entre las tumbas deciden cruzar a la ciudad de verdad esa misma noche. Se desvían hacia la reja: cinco metros de alto, durmientes de madera y goznes de metal, dos caballos para abrirla, torres con arqueros y fogones.\n\nUn guardia los frena y los ilumina con una lámpara de aceite. Le mira el símbolo del pecho al sacerdote y no lo reconoce, pero no insiste: dice que perdió la fe hace mucho y que terminó ahí, en la gloriosa Waterdeep. Igual pregunta dos veces qué asuntos los traen y hacia dónde van, y recién después les hace un favor que no le pedían: si andan con un hombre de fe bien vestido, esa no es hora para pavonearse por las calles. Los acompaña él mismo hasta la puerta central.\n\nAdentro de la torre hay una guarnición chica, una puerta de entrada, una de salida y un escritorio en el medio. El sargento Ducat da vuelta su libro de registro, pone tinta y pluma, y les hace anotar la hora exacta del traspaso. Al sacerdote no le pide el nombre dos veces: si no habla, se hacen las cosas sin hablar. Un jovenzuelo con el uniforme grande los lleva a la puerta del otro lado.\n\nDe paso les dan la geografía: la calle Almirante Steel desemboca en el Gran Mercado, y ahí hay dos lugares para dormir. La Posada del Tridente, que atiende Mariel, con precios justos y no módicos. O The Black Market, mucho más barata, con una atención ecuánime a lo que cobra.",
      dialogo: [
        {
          quien: "Guardia de la reja",
          texto:
            "Es un sacerdote, un hombre de fe. Yo perdí la mía hace mucho tiempo. Y termina acá, en la gloriosa Waterdeep.",
        },
        {
          quien: "Guardia de la reja",
          texto:
            "Si tiene un hombre de fe y con buenas vestimentas, Waterdeep no es el lugar más óptimo para pavonearse por las calles a esta hora.",
        },
        {
          quien: "Sargento Ducat",
          texto:
            "Soy uno de los que puede llegar a hacer que su estadía en Waterdeep sea buena o mala, depende de sus intenciones.",
        },
        {
          quien: "Sargento Ducat",
          texto:
            "Tengo que registrar a las personas que cruzan, tanto de allá para acá como de acá para allá. Ese es mi trabajo.",
        },
      ],
    },
    {
      titulo: "A todos lados me atrevo a entrar",
      texto:
        "Cruzan la avenida Catay y llegan al Gran Mercado, que de noche es un gran óvalo de tierra vacío rodeado de construcciones. La Posada del Tridente es enorme, de dos pisos, y tiene las puertas abiertas.\n\nEntran y una chica los mira y les pregunta si a todos lados pasan sin permiso. Casi arman lío por nada. Es una costumbre muy vieja de Waterdeep: cuando alguien pregunta eso, está dando la bienvenida, y lo que hay que contestar es «a todos lados me atrevo a entrar». Se los explican gratis, como parte de la información que van a necesitar.\n\nMariel es una mujer de cincuenta y pico, canosa, de buen porte, que camina con elegancia hasta el mostrador. Por dos piezas de oro les da una habitación para cuatro en la planta alta, con comida, bebida y baño con agua caliente. La número diecisiete: cuatro camas, mesas de luz, un farol de aceite para leer, un cántaro con lavamanos y un piletón al fondo. Y un ventanal con un vitral de un cazador que deja ver hacia afuera y no hacia adentro. Es un lujo, y la seguridad del lugar es tan rara para el barrio que la única explicación posible es que alguien la paga.\n\nQuien mira por ese vitral ve al hombre del turbante otra vez, a esa hora, hablando con dos malvivientes de capote negro. Uno discute y al moverse deja ver una cimitarra que brilla. El del turbante hace una reverencia y se va; los otros dos debaten un poco y salen caminando en la misma dirección. Después la esquina se los come.\n\nA las tres de la mañana hay un grito afuera. Cuatro o cinco policías se juntan y salen corriendo en todas direcciones, la gente cierra ventanas y apaga luces. Adentro no se mueve nada. Corren las cortinas pesadas y se vuelven a dormir.",
      dialogo: [
        { quien: "Recepción del Tridente", texto: "¿A todos lados entran sin permiso?" },
        {
          quien: "Recepción del Tridente",
          texto:
            "Uno debe contestar: «me atrevo a entrar». Y nada más. Son costumbres muy viejas en Waterdeep.",
        },
        {
          quien: "Vaegrant",
          texto: "Venimos de caminar un cementerio y me dan una pieza con baño. Y comida.",
        },
      ],
    },
    {
      titulo: "La ley se cumple en todo el territorio",
      texto:
        "A la mañana golpean la puerta y una voz extraña avisa que el desayuno está ahí. La que lo trae es un autómata, muy steampunk, y no sabe contestar otra cosa. Bajan igual: son los únicos comensales del salón. El desayuno es completo, con jugo de naranja fresco, que es un lujo que solo se permite la clase alta.\n\nPreguntan por el grito de la madrugada y Mariel les contesta con la doctrina de la casa. Muertos hay todos los días, la delincuencia avanza, las rebeliones avanzan; ella aprendió que si no gritan adentro de su establecimiento, afuera que se encargue la policía. Para eso cobra.\n\nAfuera, el Gran Mercado a las diez de la mañana es otra cosa: humo, gritos, empujones, mercancía de tierras muy lejanas y chicos que se acercan de a poco a los bolsillos. Y sin embargo está increíblemente ordenado. Los puestos están alineados, hay gremios que organizan y hay mediadores de comercio que sancionan al que cobra de más o de menos. Ven a uno trabajar: chaqueta azul, dos gorilas atrás, se abre paso hasta un puesto, saca de una valija unas pesas de bronce y le controla la balanza a una vendedora. La balanza está trucada. Suena un silbato, la policía se la lleva y confiscan la mercadería. El hombre sigue puesto por puesto y la gente se apura a acomodar las cosas.\n\nEs un modelo muy parecido al de Iron Keep, y no es casualidad que funcione: hace mucho que funciona así y el movimiento ya se conoce. Afuera del mercado el barrio se afloja, chicos jugando en la calle, y la policía apaleando y llevándose a dos que pedían limosna, porque limosnear también es ilegal. La ley del lugar es estricta en todo sentido y la policía está deseosa de impartirla.\n\nHasta los sueldos son públicos: quince piezas de oro por mes en el Distrito del Castillo, que son guardias reales, pocos y muy capacitados; ocho en el mercantil, siete en el norte, cinco en la Ciudad de los Muertos y cinco en el de campo. En el marítimo, variable.",
      dialogo: [
        {
          quien: "Mariel",
          texto:
            "Waterdeep no es un jardín de rosas. Muertos hay todos los días. Yo aprendí con el tiempo que si no gritan adentro de mi establecimiento, afuera que se encargue la policía. Para eso cobra.",
        },
        {
          quien: "Mariel",
          texto:
            "A la noche tienen que cuidar sus corazones de las dagas afiladas. A la mañana, con cuidar sus bolsas es más que suficiente.",
        },
        {
          quien: "Iscandar",
          texto:
            "Esto está vigilado por todos lados. Donde se entere uno de que estamos mintiendo, se entera todo.",
        },
      ],
    },
    {
      titulo: "Field of Triumph",
      texto:
        "Sin un plan mejor, eligen el coliseo: es el lugar donde un semiorco con un estandarte de Omán no llama la atención. Es legal, así que se puede preguntar. Haddrek para a un policía que está apoyado contra una pared prendiéndose un cigarrillo y le pregunta dónde queda, y el hombre lo mide de arriba abajo y le ofrece un trato mejor: si pelea, él va y apuesta por él, porque anda escaso de plata y sabe que los semiorcos no son tan grandes como los de acá. Aclara lo otro también: los grandes luchadores vienen los domingos, y hoy es martes.\n\nEl Field of Triumph está al noroeste, resguardado por murallas, a quince minutos hacia el norte. Y son dos coliseos, uno al lado del otro, uno al norte y otro al sur, en disputa: no comparten nada. En los postes de la entrada hay dos estatuas, Gorko y Morko, una por hermano. Eligen el de la izquierda.\n\nA esa hora no hay bulla. Están reponiendo el alcohol y la comida para la noche, entrando cajas con desprolijidad de carga y descarga. Los guardias son orcos puros y el carro del que descargan no tiene caballos: lo trajeron a pulso.\n\nHaddrek levanta el estandarte para no tener que dar explicaciones y le sale mal a medias: un orco se lo arrebata al vuelo, lo hace un bollo y se lo esconde en el escudo, mientras los que llevan cajas los miran de reojo y siguen con la mejor cara de nada. Los hacen pasar por un pasillo hasta la arena, con la excusa de que esa noche va a haber una gran pelea. Y les cierran la puerta.",
      dialogo: [
        {
          quien: "Policía de Waterdeep",
          texto:
            "Si va, yo voy. Y apuesto por usted. He visto los orcos de acá y he visto los semiorcos: los semiorcos no son tan grandes. Y yo ando un poco escaso de guita. ¿Bajo qué firma va a pelear?",
        },
        {
          quien: "Policía de Waterdeep",
          texto:
            "Hoy no creo que haya nadie reconocido. Los grandes luchadores vienen solamente los domingos.",
        },
        { quien: "Haddrek", texto: "Estoy más perdido que caga un burro." },
      ],
    },
    {
      titulo: "Seis contra cuatro",
      texto:
        "Se prenden un par de luces y en el palco principal aparece un orco enorme. Se ríe, dice que hay sangre fresca, agarra el hacha y le saca la cabeza al mango: se queda con el palo, lo blande dos veces y salta al medio de la arena.\n\nLa primera pregunta es por qué mostraron el estandarte así, sin más. La respuesta —que parecía la forma más sencilla de llegar a él sin dar explicaciones— le alcanza para lo que quiere, que es probarlos. Los cuenta: uno, dos, tres, cuatro. Le parece un combate injusto y llama a dos orcos más para su lado. A los dos que llama les tiemblan las rodillas.\n\nAhí Iscandar se desabrocha la capa y rompe el voto de silencio, con la única pregunta que le importaba de todo el día: qué fue lo que les dijo sobre pensar las cosas antes de hacerlas. Haddrek, mientras tanto, le saca la cabeza al hacha que se trajo del campamento de los Grandes Fauces y se queda con el palo, igual que el otro. Sin armas de verdad: manos, palos, tierra y piedra. Uñas y dientes.\n\nPelean los cuatro. Cuando termina, hay sangre y dientes flojos, y uno de los orcos sigue tirado en el piso abriendo un ojo cada tanto para seguir haciéndose el muerto. Es una técnica que Morko elogia. Y el resultado es el único que importa en una arena: los desafiaron, perdieron, y ahora tienen que obedecer.",
      dialogo: [
        { quien: "Morko", texto: "Sangre fresca, sangre nueva." },
        { quien: "Morko", texto: "El estandarte. ¿Por qué lo mostraste así, simple?" },
        {
          quien: "Haddrek",
          texto:
            "Porque me pareció que iba a ser una forma más sencilla de llegar a usted sin dar muchas explicaciones.",
        },
        { quien: "Morko", texto: "Uno, dos, tres, cuatro. Es un combate injusto." },
        {
          quien: "Iscandar",
          texto: "¿Qué mierda les dije de pensar las cosas antes?",
        },
        { quien: "Morko", texto: "Me ganaron el desafío. Tengo que obedecer." },
      ],
    },
    {
      titulo: "Cincuenta hombres y cinco barcos",
      texto:
        "Con el desafío ganado, la negociación es corta. La horda de Morko cuenta con unas quinientas cabezas y la de su hermano con más. Le piden entre cincuenta y cien, y cierran en cincuenta, buenos, de una misma bandera, porque hay que dejar guarnición y no se puede mezclar clanes que se maten entre ellos. Morko pone cinco barcos en el puerto: sus galeras están listas.\n\nLo único que pide a cambio es acceso al saqueo. Y aclara de dónde no: de Iron Keep no le corresponde nada más que el respeto de su gente. De futuras guerras, sí. Le pregunta al grupo cuántas guerras tienen que pelear, más por diversión que por geopolítica, y calcula que en lo que va del año le da el tiempo para cinco.\n\nRecién ahí sale por qué hace falta tanta gente. La fortaleza del volcán no cayó por asedio: la tomaron por sorpresa, desde adentro, capturando a la guardia civil. Nadie sabe cuántos enemigos hay ahora ahí dentro, pero sí se sabe que gran parte del ejército de Iron Keep está adentro como prisionero, y casi toda su flota también.\n\nCon el hermano va a ser distinto. A Gorko no se lo gana por combate: es un negociador fino, y los suyos son astutos pero crueles. Y quedan cuentas abiertas que Morko escucha sin entender del todo —el elfo oscuro, el enano, Omán— y que resume como puede: el señor habló claro, cincuenta orcos en sus botes, tomar una fortaleza.\n\nLo último que suelta vale el día entero. Conoce a Crestarroja. Está vivo y peleando, en el distrito mercantil, a cinco minutos a pie de donde están parados.\n\nLo que queda es logística: que los barcos esperen cerca de Puerto Corona, que ellos vuelvan con el Albatros porque es más rápido, y después la parte difícil, que es meterse en el High Forest a buscar a los Garradehierro con una guerra de por medio.",
      dialogo: [
        {
          quien: "Morko",
          texto:
            "La horda en este momento cuenta con alrededor de quinientas cabezas. De mi lado. Mi hermano tiene más.",
        },
        {
          quien: "Morko",
          texto:
            "Lo único que pido es acceso al botín, al saqueo. No de Iron Keep: no merecemos nada de Iron Keep, más que el respeto de su gente. Pero sí de futuras guerras.",
        },
        {
          quien: "Morko",
          texto: "En lo que va del año puedo librar hasta cinco guerras y me alcanza el tiempo.",
        },
        {
          quien: "Morko",
          texto:
            "Con mi hermano va a ser diferente. No va a ser un combate: arreglaron las cosas con un diplomático. Es mucho más difícil de convencer.",
        },
        { quien: "Morko", texto: "Vivo está. Vivo y peleando. En el distrito mercantil." },
        {
          quien: "Morko",
          texto:
            "La mayoría de las palabras que me dice se me escapan. El señor habló claro: cincuenta orcos en sus botes, tomar una fortaleza.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Morko",
      rol:
        "Uno de los dos hermanos orcos que manejan el espectáculo legal de Waterdeep, dueño de uno de los dos coliseos del Field of Triumph. Enorme, ruidoso, le saca la cabeza al hacha para pelear con el palo. Perdió el desafío contra el grupo y por eso obedece: pone cincuenta orcos y cinco barcos para recuperar la fortaleza de Omán. Lo único que cobra es acceso al saqueo de guerras futuras, nunca de Iron Keep.",
    },
    {
      nombre: "Gorko",
      rol:
        "El otro hermano, el del coliseo de al lado. Los dos están en disputa y no comparten nada. A él no se lo gana por combate: es un negociador fino, y los suyos son astutos pero crueles. Tiene más orcos que Morko. Queda pendiente.",
    },
    {
      nombre: "Tromm",
      rol:
        "El dios que Iscandar se inventó en la puerta de la Ciudad de los Muertos para explicar por qué no habla. Un sacerdote con voto de silencio, de gala, con un símbolo de cuero en el pecho que ningún guardia de Waterdeep reconoció. La tapadera aguantó un día entero y se rompió sola dentro de la arena de Morko.",
    },
    {
      nombre: "Sargento Ducat",
      rol:
        "El que maneja el registro de la torre de la Ciudad de los Muertos. Anota la hora exacta de todos los que cruzan, en los dos sentidos, y lo dice sin vueltas: puede hacer que la estadía en Waterdeep sea buena o mala. Con el sacerdote mudo no discutió: si no habla, se hacen las cosas sin hablar.",
    },
    {
      nombre: "Mariel · Posada del Tridente",
      rol:
        "Dueña de la mejor posada del Gran Mercado: dos piezas de oro por una habitación para cuatro con comida, baño y agua caliente. Cincuenta y pico, canosa, de buen porte. El servicio lo hace un autómata. Su regla es sencilla: si no gritan adentro de su establecimiento, afuera que se encargue la policía. La casa es tan segura para el barrio que alguien la debe estar pagando.",
    },
    {
      nombre: "Los hombres de los turbantes",
      rol:
        "Dos sujetos erguidos, de capas extrañas, que hablan un idioma que nadie del grupo reconoce. Se los cruzaron tres veces: en el pasaje, en la Ciudad de los Muertos y de noche frente a la posada, donde uno negoció algo con dos malvivientes de cimitarra, hizo una reverencia y se fue. Los malvivientes salieron atrás de él. Una hora después hubo un grito y la policía salió a correr.",
    },
  ],
  dudas: [
    "El grafiti del pasaje y la advertencia del mendigo quedaron sin explicar: «él lo ve todo», y nadie preguntó quién es él.",
    "De los hombres de los turbantes no se sabe nada: ni quiénes son, ni qué idioma hablan, ni si el grito de las tres de la mañana tuvo que ver con ellos. Nadie bajó a averiguarlo.",
    "Bragan había ubicado a los enanos en la Orden del Guantelete, en el distrito de manufacturas pasando el puerto. Morko ubica a Crestarroja peleando en el distrito mercantil, a cinco minutos del coliseo. No quedó claro si es el mismo lugar.",
    "Los nombres de las calles quedaron de oído: la Almirante Steel que sale de la Ciudad de los Muertos, la gran avenida Catay, y las dos que salen de ahí, Keylogar y el Gran Ducado.",
    "No se decidió quién queda al mando de la guarnición ni cómo se juntan las tres facciones de orcos sin que se maten entre ellas. Tampoco cuánto tarda el grupo en llegar al High Forest, que queda tierra adentro y en guerra.",
  ],
};

data.cronica.push(sesion8);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "El pasaje de bribón por dentro (Sesión 8)",
    tipo: "Sesión 8 · el cruce a Waterdeep",
    texto:
      "No es una puerta escondida: es un tubo de doscientos metros que atraviesa una muralla de veinte metros de ancho, con una boca de cada lado. Un camino viejo de contrabandistas, con lámparas de aceite, basurales, mendigos y locos, y sin un solo guardia. En la pared hay un grafiti, y el que pide monedas ahí abajo avisa lo mismo a todo el que pasa: él lo ve todo.",
    destacado: false,
  },
  {
    nombre: "La Ciudad de los Muertos (Sesión 8)",
    tipo: "Sesión 8 · Waterdeep · la Ciudadela",
    texto:
      "El barrio donde desemboca el pasaje, por una cripta falsa. No es un distrito: es una ciudadela amurallada con administración propia y el único lugar de Waterdeep donde legalmente se puede enterrar a alguien. Se paga una mensualidad por un nicho, con un máximo de diez años; después los huesos van a donde sea, menos ahí. Enterradores, tanatólogos y carpinteros; las plazas reemplazadas por criptas y las casas construidas entre las tumbas. Aire denso, húmedo, con olor a moho. Las puertas se cierran de noche y las torres dejan entrar y salir según el criterio de los guardias, que anotan a todos los que cruzan.",
    destacado: false,
  },
  {
    nombre: "La Posada del Tridente (Sesión 8)",
    tipo: "Sesión 8 · Gran Mercado de Waterdeep",
    texto:
      "Dos pisos frente al Gran Mercado, la mejor de la zona: dos piezas de oro por una habitación para cuatro con comida, bebida, baño y agua caliente, y ventanales con vitrales que dejan ver hacia afuera y no hacia adentro. La atiende Mariel y el servicio lo hace un autómata. Tiene una contraseña de costumbre vieja: si preguntan «¿a todos lados entran sin permiso?», hay que contestar «a todos lados me atrevo a entrar». Es tan segura para el barrio que la explicación más razonable es que alguien la esté pagando. La alternativa barata del Gran Mercado es The Black Market, más fácil de infiltrar.",
    destacado: false,
  },
  {
    nombre: "El Gran Mercado y la ley de Waterdeep (Sesión 8)",
    tipo: "Sesión 8 · cómo funciona la ciudad por dentro",
    texto:
      "Waterdeep no está gobernada por su gobernador, que es un monigote, sino por los lores. Y por debajo la ley se cumple con una prolijidad que sorprende a cualquiera que venga del sur. En el Gran Mercado los puestos están alineados por gremios y hay mediadores de comercio que van puesto por puesto con pesas de bronce controlando balanzas: la que estaba trucada terminó con la vendedora presa y la mercadería confiscada. Limosnear es ilegal y la policía lo aplica a palos. El modelo se parece mucho al de Iron Keep. Los sueldos de la guardia también son públicos: quince piezas de oro por mes en el Distrito del Castillo, ocho en el mercantil, siete en el norte, cinco en la Ciudad de los Muertos y cinco en el de campo; en el marítimo, variable.",
    destacado: true,
  },
  {
    nombre: "Field of Triumph (Sesión 8)",
    tipo: "Sesión 8 · al noroeste de Waterdeep",
    texto:
      "El coliseo de Waterdeep, resguardado por murallas, a quince minutos al norte del Gran Mercado. En realidad son dos, uno al lado del otro, uno al norte y otro al sur, en disputa entre los hermanos Gorko y Morko: no comparten nada, y en los postes de la entrada hay una estatua de cada uno. Es legal y es donde se juegan las apuestas grandes de la ciudad, pero los luchadores reconocidos pelean solamente los domingos. Los guardias son orcos puros.",
    destacado: false,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
for (const id of ["waterdeep", "puerto-corona"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(8)) m.sesiones.push(8);
}

data.mapa.rutas.push({
  sesion: 8,
  estado: "recorrido",
  puntos: ["puerto-corona", "waterdeep"],
});

data.mapa.party = {
  marcadorId: "waterdeep",
  texto:
    "Fin de la Sesión 8: los cuatro están dentro de Waterdeep, en el Field of Triumph, con el desafío ganado y la tapadera del sacerdote mudo ya rota. Morko puso cincuenta orcos y cinco barcos para recuperar la fortaleza de Omán, a cambio del saqueo de guerras futuras. Falta convencer a su hermano Gorko, que no se gana peleando. El Albatros sigue camuflado en Puerto Corona. Pendiente y cerca: Gonagal Crestarroja está vivo y peleando en el distrito mercantil, a cinco minutos, con la carta de Bragan y el mensaje de Durin sin entregar. Después, José Antonio de Castel, moverle el piso al drow, y el High Forest.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 8 agregada al canon:");
console.log(`  capítulos : ${sesion8.capitulos.length}`);
console.log(`  diálogo   : ${sesion8.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres   : ${sesion8.nombres.length}`);
console.log(`  dudas     : ${sesion8.dudas.length}`);
console.log(`  lugares   : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
