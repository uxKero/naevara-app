// Suma la Sesión 7 de Silvapor al canon: data/vaegrant.json → cronica[],
// más los lugares, marcadores y la posición del grupo que salieron de mesa.
//
// Fuente: sources/Vaegrant/Sesion 7 (30 audios transcriptos con ElevenLabs).
// Idempotente: si ya existe la crónica "sesion-7", no hace nada.
//
// Uso: node scripts/patch-vaegrant-sesion7.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// Supabase y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-7")) {
  console.log("La crónica ya tiene 'sesion-7'. Nada que hacer.");
  process.exit(0);
}

// ── 0. El alma de la Tortuga Veloz se escribe Pyros ──────────────
// En la sesión 6 quedó "Piros" de oído. En la 7 el Master lo dice y lo
// confirma dos veces: "Mi nombre es Pyros, exactamente".
{
  const antes = JSON.stringify(data);
  const despues = antes.replace(/Piros/g, "Pyros");
  if (antes !== despues) {
    Object.assign(data, JSON.parse(despues));
    console.log("Rename: Piros -> Pyros");
  }
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion7 = {
  id: "sesion-7",
  numero: 7,
  titulo: "Fuego y agua",
  fecha: "2026-08-18",
  resumen:
    "Una noche en Puerto Corona que le cambia la escala a la campaña. Primero una reclutadora de coliseos que deja una moneda de media luna. Después el alma de la Tortuga Veloz cruza al Albatros y cuenta lo que nadie había preguntado: son cinco hermanos elementales bajo el dominio de Alistair, y el del vacío está en los bajos fondos de Waterdeep esperando un barco que le están reconstruyendo. A la mañana el grupo se parte en dos: dos negocian arriba, dos cruzan el muro.",
  capitulos: [
    {
      titulo: "La cena en el reservado",
      texto:
        "Benetton se retira y recién ahí se ve lo que había: dos que estaban sentados en el salón se levantan y lo acompañan afuera. Nunca estuvo solo.\n\nEl reservado queda para el grupo. Los tratan como gente distinguida y eso, más que sospecha, genera duda: quiénes son estos que llegan con chapa sin haber pisado nunca Puerto Corona. Comen sin hablar de nada privado, y a medida que la cena se estira los murmullos crecen alrededor de la mesa.\n\nLo que se termina de entender de la ciudad es la escala. Puerto Corona es más grande que Ámbar y está mejor defendida y mejor tecnologizada, pero Ámbar no cayó por las armas: cayó por política, y Waterdeep está copiando el patrón para que el puerto se derrumbe solo. No es un capricho del vecino. Hay un drow de los velas negras juntando poder del otro lado del muro, y lo que quiere es el Mar de las Espadas entero, de norte a sur: con el paso seguro asegurado, el resto viene regalado. Y no lo va a hacer por aire, todavía. Los barcos voladores siguen siendo tecnología experimental, y los globos no sirven para pelear: son paseo y ostentación.\n\nEntonces se acerca a la mesa una criatura de sesenta centímetros, rostro angelical y capa corta. Mira a Haddrek y le dice que lo conoce, que estuvo bajo la superficie el mismo día que él —apostó fuerte y perdió— y que lo vio con una compañera. Arrastra una silla, se sube y apenas llega al mantel.\n\nSe llama Aspid, viene de las lejanas tierras de Chult y anda buscando jóvenes promesas: recluta combatientes para los coliseos. Aclara enseguida la diferencia que le importa, que es la única parte del discurso donde deja de sonar amable. La mayoría de los gladiadores son esclavos; los suyos no. Haddrek le dice que sí, que le interesa, pero que no es el momento. Ella no insiste: le deja una tarjeta de presentación, una moneda en forma de media luna hecha con un hierro oscuro extraño, y se va.",
      dialogo: [
        {
          quien: "Aspid",
          texto:
            "Vi su interés en participar. Escuché, y no casualmente, sino que me dediqué a escuchar su charla. Quizás fui un poco osada y hasta maleducada, pero ando buscando jóvenes promesas.",
        },
        {
          quien: "Aspid",
          texto:
            "Muchos gladiadores son esclavos. Yo, por el contrario, los contrato. El que lucha bajo mi bandera o mi mecenazgo lucha por el dinero, por lo que quiere, no porque esté obligado.",
        },
        {
          quien: "Aspid",
          texto:
            "Donde haya un coliseo, mi nombre se conoce. Si no estoy yo en persona, alguno de mis allegados seguro está.",
        },
        {
          quien: "Haddrek",
          texto:
            "Mi sangre orca me llama a ese tipo de eventos. Por lo general no lo hago por entrenamiento, pero a veces es más fuerte el sentimiento de adentro.",
        },
      ],
    },
    {
      titulo: "Lo que trajo la noche al barco",
      texto:
        "Vuelven al Albatros a dormir: llamaron demasiado la atención en la taberna y el barco es más seguro que la posada. Iscandar baja al camarote escondido.\n\nLa sala del motor está irreconocible. Gunnlod la decoró entera en madera —estatuillas, candelabros, juguetes, una figura de la Tortuga tallada de una sola pieza, sin un corte— y Njröun sigue creciendo sano, cuidado por Caja. Lo que Caja tiene para reportar no es un intruso: es una sensación. Sintió una presencia que elude, algo que se mece entre las sombras, y lo dejó paranoico. Los barriles no vieron nada ni olieron nada.\n\nLa orden del capitán es camuflar el barco: que el Albatros no parezca el Albatros, que parezca una nave repostando que se va a quedar un tiempo. Gunnlod entiende el concepto y pide una semilla de durazno. Se la traen, la encaja en una hendija de la madera, sale de la burbuja y se pone a alimentarla con su propia energía hasta que su brillo baja y tiene que volver, débil.\n\nDespués cada uno a lo suyo. Iscandar a su camarote, Jeremy abajo a jugar al ajedrez con Caja, Vaegrant a la cocina con su vela, Haddrek de guardia en cubierta con los barriles.",
      dialogo: [
        {
          quien: "Caja",
          texto:
            "No vino nadie. Sentí una presencia, pero no vino nadie. Algo que elude, como algo que se mece entre las sombras. Me dejó un poco paranoico.",
        },
        {
          quien: "Gunnlod",
          texto: "Quiere algo más simple, capitán. Algo no tan ostentoso como lo que venimos teniendo.",
        },
      ],
    },
    {
      titulo: "El hermano de fuego",
      texto:
        "Haddrek, de guardia, mira hacia la Tortuga Veloz y ve el carajo prendido fuego. Parado en lo alto hay algo con forma de tiefling que no es un tiefling: un elemental de fuego de unos seis metros por encima de él. Lo saluda con la mano. La criatura se dibuja un tricornio de llama en la cabeza, se lo saca para saludar y lo deja consumirse.\n\nDesde el carajo del Albatros sale un destello celeste, un pulso, como un radiofaro. Es Gunnlod llamando. El elemental toma forma de sierpe dragón, envuelve su barco y pasa de proa a proa. Se acerca sin mover la boca.\n\nSe llama Pyros. Es el alma de la Tortuga Veloz y el hermano de Gunnlod, y a Haddrek lo mide por la sangre antes que por el nombre: pieles verdes, buena raza, viscerales como ellos pero más controlados. Le pregunta si alguna vez sintió que la sangre le arde de forma impetuosa.\n\nCuenta cómo funciona su lado del trato. El padre lo deja crear; a cambio él obedece sin condiciones. Una vez quemaron una isla entera para sacar a un traficante de adentro, y lo dice sin ningún énfasis. Después cuenta lo otro, lo que le enseñó Benetton: que el fuego no sirve solo para destruir, que los enanos lo usan para darle forma a las armas y las armaduras, y que su padre lo ayuda a controlar la fuerza y el mal carácter.\n\nY ahí suelta la estructura. Son cinco hermanos, uno por elemento. El del gorro rojo es el vacío. El del viento anda cerca, girando, sin intención de llegar hasta ellos: es la oveja negra de la familia. Lo peligroso no es ninguno por separado. Fuego y agua juntos hacen vapor. Viento y agua hacen las trombas marinas. Tres juntos, solamente caos.\n\nAbajo del barco pasa lo que tenía que pasar: donde están los dos hermanos casi juntos, el Albatros entero empieza a llenarse de niebla. Vaegrant sale, pega un chiflido y le pide a Gunnlod que les avise que no están siendo sutiles y que el problema es de ellos, no suyo. Gunnlod discute —a ella le enseñaron que espiar es de mala educación— pero va: se forma un charco de agua en cubierta y del charco sale humo. Pyros pregunta si conviene bajar la intensidad y se reduce a una esfera flamígera del tamaño de una rodilla. Siguen la conversación en la cocina.",
      dialogo: [
        { quien: "Pyros", texto: "Tengo entendido que sos parte de los padres de mi hermana." },
        {
          quien: "Pyros",
          texto:
            "Padre me deja crear. A cambio, yo le hago caso incondicionalmente. Siempre hay tiempo para la guerra, ¿no?",
        },
        {
          quien: "Pyros",
          texto: "Una vez quemamos una isla pequeña entera solamente para sacar a un traficante de adentro.",
        },
        {
          quien: "Pyros",
          texto:
            "Si juntamos fuego y agua, se genera vapor. Si juntamos viento y agua, se forman las famosas trombas marinas. Elementos indómitos, en donde hasta nosotros perdemos el control.",
        },
        { quien: "Vaegrant", texto: "¿Y si se juntan tres?" },
        { quien: "Pyros", texto: "Solamente puede haber caos." },
        {
          quien: "Gunnlod",
          texto: "A mí me enseñaron que no es de buena educación y de buenos modales hacer eso a una persona.",
        },
      ],
    },
    {
      titulo: "Los cinco de Alistair",
      texto:
        "En la cocina había una sola llama encendida, la vela de Vaegrant. Cuando entra Pyros la cocina entera arde sin quemar: la madera no se chamusca, nada prende. Él se sienta cómodo arriba del fuego.\n\nDe ahí sale casi todo. El hermano del viento se llama Illevor, y lo deletrea. No está cerca del puerto: se está moviendo, girando hacia el norte o hacia el sur, y no tiene interés en ellos. Entre hermanos no hay palabras, solo sensación: si uno está en peligro, los otros lo sienten. Nadie puede avisarle nada a nadie.\n\nLe preguntan la edad y no la tiene. Pasan de una recámara a otra a través de los eones, a veces anudados a la historia de una montaña —él sobre todo a los volcanes—, y de vez en cuando les dan un cuerpo. Hoy le toca la Tortuga. Vio razas empezar y vio a esas mismas razas extinguirse; para ellos la existencia de cualquiera de este mundo no es más que un suspiro. Y después la frase que reordena todo lo demás: son los cinco elementos que tiene bajo control y dominio Alistair. El mismo nombre ante el que Benetton se arrodilló.\n\nVaegrant no afloja con lo otro. No le molesta que esté a bordo, le molesta cómo: si el padre de Gunnlod no está enterado, alguien va a pagar el precio, y no va a ser el que se ríe. Pyros no discute la parte del castigo —lo va a aceptar, es el costo de la noche— pero sí la lógica. Nunca dijo que hubiera hecho nada malo. Lo invitaron.\n\nAbajo, mientras tanto, Caja le gana a Jeremy al ajedrez. Gunnlod pasa por atrás, le canta el resultado cuatro movimientos antes y sigue caminando. Cerca del alba Pyros vuelve a su barco, esta vez sin fénix.",
      dialogo: [
        {
          quien: "Pyros",
          texto:
            "Nosotros vivimos a través de los eones, pasamos de una recámara a otra. De vez en cuando nos dan un cuerpo y hoy me toca el Tortuga. No vemos el tiempo como ustedes, no cumplimos años.",
        },
        {
          quien: "Pyros",
          texto:
            "Yo fui uno de los primeros en nacer, cuando todavía la tierra no era más que masa de piedra fundida, volcanes en erupción y formación primigenia.",
        },
        { quien: "Pyros", texto: "Somos los cinco elementos que tiene como control y dominio Alistair." },
        {
          quien: "Pyros",
          texto: "La diferencia entre Gunnlod y yo es que yo voy a aceptar el castigo que me dé padre.",
        },
        { quien: "Gunnlod", texto: "En cuatro movimientos te gana." },
      ],
    },
    {
      titulo: "Un barco viejo y con flores",
      texto:
        "Amanece con movimiento portuario antes del alba: campanas anunciando los pesqueros, aves sobre la pesca nueva. Cuando se despiertan, el Albatros está otro. Los herrajes de hierro oscuro tienen óxido y descascarado, la pintura agrietada, percebes por todos lados, algas colgando de la proa. Y en cada hendija de la cubierta, brotes de manzanilla. El barco está desmejorado y huele a flor de durazno.\n\nHaddrek, con el tricornio puesto, siente lo que siente ella: incomodidad. A Gunnlod no le gusta vestirse mal, aunque entienda para qué.\n\nSuena un cuerno desde los barcos: la Tortuga Veloz parte al alba, como estaba dicho. Y con el cuerno se va también el único aliado que los podía cubrir en alta mar.\n\nRecién ahí Iscandar se entera de la noche. La conversación es larga y termina en una sola regla, que es la que se lleva la mesa: arriba del barco, cualquier acción se para cinco segundos y se piensa de nuevo. No es una discusión sobre culpas —el punto que insiste es que las cosas no pasan porque uno las permita o deje de permitirlas: pasan— y de ahí sale lo que a él le importa, que una mala decisión termina siempre en alguien que sufre.\n\nY entonces aparece lo que la noche había traído de verdad. El hermano del vacío, Cinnungaga, está en los bajos fondos de Waterdeep. No está su barco: está él, el núcleo, guardado. Su galeón fue destruido hace más de seiscientos años y del otro lado del muro están juntando los pedazos y reponiendo con magia oscura lo que falta, en un astillero escondido. Cinnungaga fue el primero de los cinco en nacer, antes que la tierra, que el fuego, que el viento y que el agua. No tiene el concepto de bien y de mal que tienen ellos. Es caprichoso y es voraz.\n\nEl plan no cambia, solo se pone más caro: siguen yendo a Waterdeep, y de acá en adelante hay que extremar la cautela.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "Cada vez que estén arriba del barco, cualquier acción que tomen van a parar cinco segundos y la van a volver a pensar una segunda vez.",
        },
        {
          quien: "Iscandar",
          texto:
            "Las cosas no suceden porque uno las permite. Si no, los líderes del mundo que hoy está siendo colonizado por una cofradía hubiesen dicho: «No, yo decido que no me invadan». Las cosas suceden. Y tomar malas decisiones lleva a que la gente sufra.",
        },
        {
          quien: "Gunnlod",
          texto:
            "Cinnungaga no tiene el concepto de bien y mal como tienen ustedes. Es de carácter caprichoso y es voraz.",
        },
        {
          quien: "Iscandar",
          texto:
            "Si la cofradía se hizo con tu hermano, que tiene el poder del vacío, ¿qué tan poderoso podría ser un barco de guerra con ese poder?",
        },
      ],
    },
    {
      titulo: "El enano del reloj de arena",
      texto:
        "Se dividen en dos parejas: es más fácil juntarse de a dos que de a cuatro. Iscandar y Jeremy se quedan en Puerto Corona; Vaegrant y Haddrek cruzan el muro. Se citan a la caída del sol, siete u ocho de la tarde, en el pasaje.\n\nIscandar pasa primero por la talabartería de la zona media a buscar el pendón encargado. El trabajo es delicado y de muy buena calidad, y el elfo, curioso, pregunta por qué tanta gala. La respuesta es la doctrina entera del personaje: los ricos responden a una sola cosa, el buen gobierno, y si alguien que parece noble les muestra respeto, sueltan. Lo sabe porque su padre se pasó la vida haciendo exactamente eso.\n\nEl elfo le devuelve el favor con un nombre. Nadie tiene más información en una ciudad que la gente que la maneja: si van a hacer negocios en la zona alta, que hablen con Korvon, un hombre acaudalado que hizo su fortuna con las perlas y tiene el favor de los comerciantes finos. Que vaya de su parte.\n\nArriba, la parte alta está sobre una meseta y no hay bloqueo, pero los guardias reales memorizan caras. Un capitán de placa plateada con un león en el pecho los frena para darles la bienvenida y las tres reglas: no faltar el respeto, no delinquir y no armar alboroto. Las reglas del puerto y de la parte baja, aclara, no son las mismas de acá.\n\nLa casa de Korvon se reconoce desde lejos por la torre: un reloj de arena gigantesco, más grande que la casa, con un mecanismo que lo gira solo. En el patio hay fuentes, animales exóticos y salamandras del tamaño de ponis. Adentro, un taller de máquinas de vapor trabajando todas a la vez y decenas de gnomos operándolas: en esta ciudad el gnomo es mano de obra barata y nadie lo disimula.\n\nKorvon es el único enano de todo Faerûn vestido de forma ostentosa: anillos de piedra y plata, chaquetilla azul de botones dorados, pipa de marfil. Discuten sin ponerse de acuerdo sobre si lo bello y lo bien hecho son la misma cosa —para él, de dos barcos que flotan igual se vende primero el más bello— y pasan a la oficina, que es la única habitación austera de la casa.\n\nEl negocio que Iscandar le propone es una línea de comercio a lo largo del Mar de las Espadas hasta las Puertas de Baldur, con dos niveles: mercancías —telas, especias y gemas del sur— e información. Un correo marítimo, que no existe en la zona. Korvon le señala el agujero enseguida: para eso hace falta una flota, no uno o dos barcos. Iscandar le contesta con la pregunta que cierra el trato —cuánto pagaría por tener en una semana la información que su competencia va a tener en un mes y medio— y le promete el barco más rápido que vio el mar. Cuando el enano supone que habla de la Santa María y le dicen que no, el semblante le cambia.\n\nLa segunda mitad la cobra Korvon: quiere saber qué está pasando con Waterdeep, y sobre todo qué tan metida está ahí la cofradía de las velas negras. Iscandar le paga con el drow —veinte años atrás era un nadie en los gremios y hoy tiene poder— y el enano sabe de quién le hablan sin que le den el nombre.\n\nLo que devuelve vale más. El drow es perspicaz, huele el peligro y por eso va siempre adelante; y se dice que tiene un consejero al que nadie vio nunca, un oráculo capaz de profetizar una traición, llamado Anton de Lake. Que traten de eludirlo y de no transitar los mismos lugares. Y que no bajen jamás a los bajos mundos de Waterdeep, donde las leyes están dadas vuelta: eso lo maneja un solo jefe de gremio, un hombre esquivo que muchos dicen que no es un hombre, y el que le ve la cara verdadera ve el cielo por última vez.\n\nDe ahí sale el salvoconducto. Un nombre para tocar puertas del otro lado: José Antonio de Castel, de una pequeña sociedad llamada las Hojas de la Noche, cuyo emblema es una daga con una media luna encima. Que vaya de su parte, que va a entender.",
      dialogo: [
        {
          quien: "Iscandar",
          texto:
            "Los ricos solo responden a una cuestión, que es el buen gobierno. Si alguien que parece noble les muestra respeto, van a soltar siempre. Lo sé porque mi padre pasó mucho tiempo haciendo eso.",
        },
        { quien: "Korvon", texto: "Cualquier barco es igual de eficiente, ambos flotan. Ahora, el más bello se va a vender primero." },
        {
          quien: "Iscandar",
          texto:
            "¿Cuánto pagaría usted por tener en una semana la información que sus competidores tendrían en un mes y medio?",
        },
        { quien: "Iscandar", texto: "Si veo las calles manchadas de sangre, compro propiedades." },
        {
          quien: "Korvon",
          texto:
            "Se dice que tiene un consejero, nadie lo vio. Alguien que puede profetizar una traición. Anton de Lake. Es un oráculo.",
        },
        {
          quien: "Korvon",
          texto:
            "Nunca vaya a los bajos mundos. Ahí las leyes cambian y están de cabeza. Aquellos que ven su verdadero rostro son leales a él, o es la última vez que ven el cielo con sus propios ojos.",
        },
        {
          quien: "Korvon",
          texto:
            "El nombre del sujeto es José Antonio de Castel. Pertenece a una pequeña sociedad llamada Hojas de la Noche y su emblema es una daga con una media luna arriba.",
        },
      ],
    },
    {
      titulo: "La trenza de Ungor",
      texto:
        "El pasaje no está donde se lo imaginaban. Está entre las afueras y la muralla, en un sitio viejo donde en algún momento tumbaron los muros y después los rearmaron: quedó una grieta medio escondida pero habilitada, detrás de un par de estercoleros. Se llega desde cualquier lado si se sabe.\n\nDel otro lado, después del tercer correo, Vaegrant y Haddrek llegan al bosque. El pueblo está literalmente cortado por la ruta comercial, abrazándola como si fuera un peaje, salvo que no cobran peaje. La población es noventa y ocho por ciento orcos, y el dos restante, semiorcos. Es una fortaleza de hecho y de derecho —palizadas listas, patio de armas, todo preparado para cerrarse— pero las puertas están abiertas las veinticuatro horas. Entran algunas carretas: no muchos se animan a comerciar con orcos, y a los que se animan les va bien.\n\nLos guardias de la puerta son orcos puros y tratan al elfo con respeto, aunque uno pregunte primero cuánto piden por él. Antes de dejarlos pasar le dan a Vaegrant la única advertencia que importa: pase lo que pase adentro, que no reaccione. Algunos ahí tienen respeto por todas las razas; adentro es otra cosa, y los elfos no suelen ser bienvenidos. Cuando escuchan que vienen de Iron Keep, la puerta se abre sola: Iron Keep les dio cobijo en su momento.\n\nA mitad de camino, pasando la plaza de armas, dos orcos de ropa común y pelo trenzado se le paran adelante a Vaegrant y le ofrecen un combate por diez piezas de oro. Él lo rechaza con cuidado: no es cuestión de animarse, es cuestión de prioridades, y en otro momento lo aceptaría con gusto. Se presentan igual, Argol y su hermano Ungor, y deciden que eso alcanza como aceptación.\n\nUngor, que no había hablado, se corta una de sus trenzas con una daga y se la pone a Vaegrant en la mano. Es la parte del ritual: cuando esté dispuesto a enfrentarse, que traiga la trenza y el pacto se honra. Si gana el elfo, mil piezas de oro; si gana el orco, cien. Haddrek, que es semiorco, entiende lo que el otro no: un reto pendiente marca a quien lo tiene y evita que otro orco lo lastime antes, para que el combate sea pleno.",
      dialogo: [
        { quien: "Guardia orco", texto: "No importa lo que escuche ahí adentro, no reaccione. Algunos tenemos respeto con todas las razas, pero adentro es otra cosa." },
        {
          quien: "Ungor",
          texto:
            "Esto forma parte del ritual del reto. Cuando esté dispuesto a enfrentarse, tráigame la trenza y se honrará el pacto. Si usted gana, le pagaré mil piezas de oro. Si yo gano, solo cien.",
        },
        { quien: "Vaegrant", texto: "Espero verlo pronto. Quizá no por un combate, pero sí para unas cervezas." },
        { quien: "Argol", texto: "¿Cerveza? Prefiero el combate." },
      ],
    },
    {
      titulo: "La guerra vieja",
      texto:
        "En la casa principal los espera un orco entrado en años, trenzas largas ya canosas y un moño alto en la cabeza, más samurái que jefe de horda. Es el chamán de los Grandes Fauces.\n\nHaddrek se presenta como Erlak, dice que viene de Iron Keep, que lo manda Omán y saca el estandarte. No le hace falta explicar mucho más: el viejo ya sabe que Omán está en peligro. La fortaleza del volcán extinto cayó y él viene a juntar las hordas para recuperarla. Los Grandes Fauces estarán. La razón la dice sin adornos: son incondicionales ante Omán, que les regaló la libertad. No ante Iron Keep.\n\nY ahí se abre la historia que faltaba. Hellgate fue una ciudad élfica muy prominente hasta que la gente de Iron Keep empezó a tomar posiciones en el High Forest y en el Mar de las Espadas: así se formó Iron Keep. Al darles la libertad a los orcos se ganó la lealtad de los orcos, pero los elfos quedaron en contra —para ellos los orcos eran mano de obra barata y nada más—. Los orcos los estaban aplastando, así que los elfos cruzaron su conocimiento con el de los humanos y aparecieron con tecnología: empezaron a arrasar aldeas y clanes enteros hasta que se formó la resistencia de Krenko, que hizo guerra de guerrillas y les fue robando la tecnología a los propios elfos. Iron Keep, mientras tanto, se desarrolló sola en el mar y dejó todo eso como tierra de nadie. De ahí que haya muchos orcos a favor de Omán y muy pocos a favor de Iron Keep.\n\nLa guerra sigue abierta y ahora es peor. Hellgate está tomada por una raza de constructos que está conquistando el High Forest de a pedazos, y Krenko está resistiendo. Por eso el clan que Haddrek necesita no está en condiciones de responder a ningún llamado: son los Garrahierro, orcos, goblins, hobgoblins y trolls, y viven al noreste de los Picos Perdidos, junto al gran árbol sabio, el Gran Árbol Padre. Krenko nació en libertad, así que la historia de Omán le queda lejos.\n\nEl chamán también tiene el mapa completo de la cofradía. Los velas negras empezaron siendo simples barcazas de comercio y su punto fuerte es el hierro frío. Quieren Waterdeep; necesitan Puerto Corona por los yacimientos de sus minas; quieren Iron Keep por el control de los mares; y necesitan un puerto fuerte en el sur para poder llegar tranquilos a Chult y destruir Chult. Por aire todavía no pueden: no controlan los pasos voladores. Solo tienen al Barón Rojo, que está en manos de las brujas, y de las brujas se dice que están controladas por algo más. Los jefes de cabecera de medio mundo están enterados de todo esto y no se mueve nadie: están esperando a que otro haga el primer movimiento.\n\nY entonces le pone precio a Krenko. Que le muevan el piso al elfo que está tramando todo en Waterdeep, que lo saquen del escondite y le hagan perder su poder de ocultación; que logren que los orcos de adentro tengan más peso que él. Si eso pasa, Krenko va a empezar a confiar.\n\nLes presta un par de soldados con monturas para volver rápido a Puerto Corona antes de que caiga el sol. Antes de irse, Vaegrant pide recorrer la fortaleza: le interesa el chamanismo orco, que es magia salvaje canalizada como la de un clérigo, y es la primera vez en su vida que está dentro de una fortaleza.",
      dialogo: [
        { quien: "El chamán", texto: "Nosotros somos incondicionales ante Omán. Nos regalaron la libertad." },
        {
          quien: "El chamán",
          texto:
            "Es una guerra muy antigua la que se está peleando. Al regalarle la libertad a los orcos lograron la lealtad de los orcos, pero los elfos estaban en contra. Decían que éramos solamente buena mano de obra barata.",
        },
        { quien: "El chamán", texto: "Iron Keep se desarrolló sola en el mar, dejando que acá sea tierra de nadie." },
        {
          quien: "El chamán",
          texto:
            "El interés de los velas negras está en Waterdeep, pero también necesitan tomar Puerto Corona por los yacimientos de minerales. Y el interés sobre Iron Keep es el control de los mares. También necesitan algún puerto fuerte en el sur para poder llegar tranquilamente a Chult y destruir Chult.",
        },
        {
          quien: "El chamán",
          texto:
            "Todos están a la espera de que alguien mueva la primera pieza. Nadie quiere pisar en falso, nada más.",
        },
        {
          quien: "El chamán",
          texto:
            "Muevan el piso al elfo que está tramando todo. Háganlo salir de su escondite, pónganlo al descubierto. Y Krenko seguro va a aceptar algún trato.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Aspid",
      rol: "Gnoma de sesenta centímetros, rostro angelical y capa corta, de las lejanas tierras de Chult. Reclutadora de gladiadores para los coliseos: no compra esclavos, contrata. Reconoció a Haddrek de las peleas del bajo mundo de Puerto Corona y le dejó como tarjeta una moneda en forma de media luna hecha de un hierro oscuro extraño.",
    },
    {
      nombre: "Pyros",
      rol: "El alma de la Tortuga Veloz y hermano de Gunnlod. Uno de los primeros en nacer, cuando la tierra todavía era piedra fundida. Cruzó al Albatros de noche convertido en sierpe dragón. Impetuoso y de mal carácter, pero criado por Benetton, que le enseñó que el fuego también sirve para crear. Acepta el castigo del padre como parte del costo.",
    },
    {
      nombre: "Illevor",
      rol: "El hermano del viento, la oveja negra de los cinco. Anda girando en alta mar, hacia el norte o hacia el sur, sin interés en acercarse. Entre hermanos no hay palabras: solo se sienten.",
    },
    {
      nombre: "Cinnungaga",
      rol: "El hermano del vacío y el primero de los cinco en nacer. No tiene el concepto de bien y de mal; es caprichoso y voraz. Su galeón fue destruido hace más de seiscientos años y en un astillero escondido de Waterdeep están juntando los pedazos y reponiendo con magia oscura lo que falta. Él, el núcleo, está guardado en los bajos fondos de la ciudad.",
    },
    {
      nombre: "Alistair",
      rol: "El nombre bajo el que están los cinco elementos: los tiene bajo control y dominio. Es el mismo ante el que Benetton se arrodilló para prometer que iba a terminar el trabajo.",
    },
    {
      nombre: "Korvon",
      rol: "El enano más ostentoso de Faerûn: anillos de piedra y plata, chaquetilla azul de botones dorados y pipa de marfil. Hizo fortuna con las perlas y tiene el favor de los comerciantes finos de la parte alta de Puerto Corona. Su casa se reconoce por una torre con un reloj de arena más grande que la casa. Socio de Iscandar en una línea de comercio de mercancías e información.",
    },
    {
      nombre: "Anton de Lake",
      rol: "El consejero del drow de Waterdeep. Nadie lo vio nunca. Un oráculo capaz de profetizar una traición, y la razón por la que el drow siempre va un paso adelante.",
    },
    {
      nombre: "José Antonio de Castel · Hojas de la Noche",
      rol: "El contacto que dio Korvon para moverse en Waterdeep, de una pequeña sociedad llamada las Hojas de la Noche, cuyo emblema es una daga con una media luna encima. Es el salvoconducto para transitar, no una garantía de buenos negocios.",
    },
    {
      nombre: "Argol y Ungor",
      rol: "Dos hermanos orcos del pueblo de los Grandes Fauces. Retaron a Vaegrant a un combate por diez piezas de oro y, al quedar postergado, Ungor se cortó una trenza y se la entregó: mientras la tenga, el reto está pendiente y ningún otro orco puede lastimarlo antes. Si gana el elfo, mil piezas de oro; si gana el orco, cien.",
    },
    {
      nombre: "El chamán de los Grandes Fauces",
      rol: "Orco entrado en años, trenzas canosas y moño alto, más samurái que jefe de horda. Dirige el pueblo orco del bosque y otorga los permisos. Responde al llamado de Omán sin dudarlo, pero deja clara la diferencia: son incondicionales ante Omán, no ante Iron Keep. Es quien pone precio a la alianza con Krenko.",
    },
    {
      nombre: "Krenko y los Garrahierro",
      rol: "El clan del noreste de los Picos Perdidos, junto al Gran Árbol Padre, en el High Forest: orcos, goblins, hobgoblins y trolls. Krenko nació en libertad y no le debe nada a Omán. Levantó la resistencia contra los elfos con guerra de guerrillas y les fue robando la tecnología. Hoy está en guerra y no puede responder a ningún llamado.",
    },
    {
      nombre: "Hellgate y los constructos",
      rol: "Hellgate fue una ciudad élfica muy prominente hasta que la gente de Iron Keep empezó a tomar posiciones en el High Forest y en el Mar de las Espadas. Hoy está tomada por una raza de constructos que conquista el High Forest de a pedazos, y Krenko es el que la está frenando.",
    },
  ],
  dudas: [
    "El nombre del hermano del vacío se escuchó como «Cinnungaga» y también como «Quinungaga»: queda escrito de la primera forma hasta confirmarlo en mesa. El nombre de su galeón destruido tampoco quedó claro (sonó como «la Virgen Manchita»). Y del quinto hermano, el de tierra, todavía no se dijo el nombre.",
    "Sobre el hermano del viento hubo dos versiones en la misma noche: el Master deletreó «Illevor», pero antes se había mencionado «Hildebrand». Puede ser el nombre del hermano y el de su barco, o una confusión de mesa.",
    "El talabartero elfo de la zona media viene anotado como «Aldo» desde la sesión 6, pero en la sesión 7 el Master lo llama «Aldor» de punta a punta. Igual el enano de la parte alta: primero suena «Corben» y después «Korvon» toda la escena. Hace falta fijar las dos grafías.",
    "No quedó claro si Anton de Lake es el nombre del oráculo consejero o el del propio drow de Waterdeep. Y el jefe del bajo mundo de Waterdeep aparece dos veces sin cerrar: Korvon habla de un jefe de gremio esquivo «que muchos dicen que no es un hombre», y por otro lado da a José Antonio de Castel de las Hojas de la Noche. Puede ser la misma persona o dos distintas.",
    "Al chamán de los Grandes Fauces no se le escuchó bien el nombre. En la sesión 6 quedó anotado «Grun» como el líder de ese clan, así que podría ser él mismo.",
    "El clan del High Forest quedó como «Garra de Hierro» en la sesión 4 y como «Garrahierro» en la 7, cuando el Master corrigió la pronunciación en mesa. Igual con el pasaje de la muralla: «pasaje de bribón» en la sesión 6, «pasaje del hurón» en la 7.",
    "Haddrek sigue dando nombres distintos según con quién habla: «Erlac, puede decirme Ed» en la sesión 6, «Herbert, puede decirme Herb» a Pyros, y «Erlak» al chamán. Falta saber cuál es el real y cuáles son coartada. Iscandar, por su lado, presentó a Jeremy como «James» ante Korvon, que es el alias que se había bajado del canon en la sesión 4 por ser joda de mesa: acá se usó en personaje.",
    "En la presentación ante Korvon, Iscandar nombró su ciudad de origen, su familia y su dios, y las tres cosas sonaron distinto a lo registrado (se escuchó «Irpunta», «los Serith» y «el culto a Dron», contra la casa Selindar y la Fetron del canon). Puede ser coartada o transcripción.",
  ],
};

data.cronica.push(sesion7);
data.cronica.sort((a, b) => a.numero - b.numero);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "Los cinco hermanos elementales (Sesión 7)",
    tipo: "Sesión 7 · cosmología contada por Pyros",
    texto:
      "Cada corazón de montaña produce naves de a tres, pero las almas que las habitan son cinco y son hermanos, uno por elemento: vacío, tierra, fuego, viento y agua, en ese orden de nacimiento. No cumplen años. Pasan de una recámara a otra a través de los eones, a veces anudados a la historia de una montaña, y de vez en cuando les dan un cuerpo. Vieron razas empezar y extinguirse. Los cinco están bajo el control y el dominio de Alistair. Y lo peligroso no es ninguno por separado: fuego y agua hacen vapor, viento y agua hacen trombas marinas, y tres juntos, solamente caos.",
    destacado: true,
  },
  {
    nombre: "El pueblo de los Grandes Fauces (Sesión 7)",
    tipo: "Sesión 7 · del otro lado del muro, en el bosque",
    texto:
      "Cruzando el pasaje de la muralla, el pueblo orco está literalmente cortado por la ruta comercial: la abraza como si fuera un peaje, salvo que no cobran peaje. Noventa y ocho por ciento orcos y el resto semiorcos. Es una fortaleza completa —patio de armas, palizadas listas para cerrarse— con las puertas abiertas las veinticuatro horas. Comercian con las pocas carretas que se animan, y a esas les va bien. Son incondicionales ante Omán, que les regaló la libertad, y no ante Iron Keep, que se desarrolló sola en el mar y dejó el bosque como tierra de nadie.",
    destacado: false,
  },
  {
    nombre: "Hellgate y la guerra vieja (Sesión 7)",
    tipo: "Sesión 7 · High Forest · el origen de Iron Keep",
    texto:
      "Hellgate fue una ciudad élfica muy prominente hasta que la gente de Iron Keep empezó a tomar posiciones en el High Forest y en el Mar de las Espadas: de ahí salió Iron Keep. Darles la libertad a los orcos le ganó la lealtad de los orcos y el odio de los elfos, que los querían como mano de obra barata. Los orcos los estaban aplastando, así que los elfos cruzaron conocimiento con los humanos, aparecieron con tecnología y arrasaron aldeas enteras, hasta que Krenko levantó la resistencia y les fue robando esa misma tecnología. Hoy Hellgate está tomada por una raza de constructos que avanza sobre el bosque, y Krenko es el único que la frena.",
    destacado: false,
  },
  {
    nombre: "El Gran Árbol Padre y los Garrahierro (Sesión 7)",
    tipo: "Sesión 7 · al noreste de los Picos Perdidos",
    texto:
      "Junto al gran árbol sabio del High Forest vive el clan de los Garrahierro: orcos, goblins, hobgoblins y trolls, bajo el mando de Krenko. Krenko nació en libertad, así que no le debe nada a Omán y desconoce su historia. Está en guerra con los constructos de Hellgate y no está en condiciones de responder a ningún llamado. El precio para que empiece a confiar lo puso el chamán de los Grandes Fauces: que en Waterdeep los orcos pesen más que el elfo que trama todo, y que a ese elfo lo saquen del escondite.",
    destacado: false,
  },
  {
    nombre: "Puerto Corona por arriba (Sesión 7)",
    tipo: "Sesión 7 · la meseta de los que no se mezclan",
    texto:
      "La parte alta está sobre una meseta y no tiene bloqueo, pero los guardias reales memorizan las caras de los que suben. Las reglas son tres —no faltar el respeto, no delinquir, no armar alboroto— y no son las mismas que rigen en el puerto. Arriba se ostenta: fuentes, animales exóticos, salamandras del tamaño de ponis, y talleres de máquinas de vapor operados por decenas de gnomos, que en esta ciudad son mano de obra barata sin que nadie lo disimule. Es el nivel donde vive Korvon y donde la información se negocia con refrigerios y no con monedas.",
    destacado: false,
  },
  {
    nombre: "Waterdeep por debajo (Sesión 7)",
    tipo: "Sesión 7 · lo que hay que evitar y a quién hay que buscar",
    texto:
      "Los bajos mundos de Waterdeep están dados vuelta: las leyes cambian y las maneja un solo jefe de gremio, un hombre esquivo del que muchos dicen que no es un hombre, y el que le ve la cara verdadera o le es leal o no vuelve a ver el cielo. Ahí abajo está guardado Cinnungaga, el alma del vacío, y en un astillero escondido le están rearmando el galeón con magia oscura. El único nombre que sirve para moverse es José Antonio de Castel, de las Hojas de la Noche, cuyo emblema es una daga con una media luna encima.",
    destacado: true,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
const marcadores = [
  {
    id: "bosque-grandes-fauces",
    nombre: "Bosque de los Grandes Fauces",
    x: 16.3,
    y: 23.2,
    tipo: "hito",
    sesiones: [7],
    estado: "aproximado",
    nota:
      "El pueblo-fortaleza orco del otro lado del muro, cortado por la ruta comercial y con las puertas abiertas las veinticuatro horas. Noventa y ocho por ciento orcos. Responden al llamado de Omán para retomar el volcán extinto.",
  },
  {
    id: "gran-arbol-padre",
    nombre: "El Gran Árbol Padre",
    x: 21.98,
    y: 12.39,
    tipo: "hito",
    sesiones: [7],
    estado: "confirmado",
    nota:
      "El gran árbol sabio del High Forest, al noreste de los Picos Perdidos. Ahí viven los Garrahierro de Krenko: orcos, goblins, hobgoblins y trolls. Están en guerra con los constructos de Hellgate.",
  },
  {
    id: "hellgate",
    nombre: "Hellgate",
    x: 26.33,
    y: 9.3,
    tipo: "ciudad",
    sesiones: [7],
    estado: "confirmado",
    nota:
      "Fue una ciudad élfica muy prominente, y su caída explica el origen de Iron Keep y la guerra vieja entre orcos y elfos. Hoy está tomada por una raza de constructos que avanza de a poco sobre todo el High Forest.",
  },
];
data.mapa.marcadores.push(...marcadores);

for (const id of ["waterdeep", "puerto-corona"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(7)) m.sesiones.push(7);
}

data.mapa.rutas.push({
  sesion: 7,
  estado: "recorrido",
  puntos: ["puerto-corona", "bosque-grandes-fauces"],
});

data.mapa.party = {
  marcadorId: "puerto-corona",
  texto:
    "Fin de la Sesión 7: el Albatros sigue en Puerto Corona, camuflado de barco viejo —óxido, percebes, algas y manzanillas— y con Caja y los barriles armados por si hay que defenderlo. La Tortuga Veloz partió al alba. Los Grandes Fauces ya están comprometidos con la leva; los Garrahierro de Krenko no, y su precio es que en Waterdeep los orcos pesen más que el drow. Pendiente: cruzar por el pasaje, entregarle a Gonagal Crestarroja la carta de Bragan y el mensaje de Durin, buscar a José Antonio de Castel de las Hojas de la Noche, y no acercarse a los bajos fondos, donde está guardado Cinnungaga mientras le rearman el barco.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 7 agregada al canon:");
console.log(`  capítulos : ${sesion7.capitulos.length}`);
console.log(`  diálogo   : ${sesion7.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres   : ${sesion7.nombres.length}`);
console.log(`  dudas     : ${sesion7.dudas.length}`);
console.log(`  lugares   : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log(`  marcadores: +${marcadores.length} (total ${data.mapa.marcadores.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
