// Integra la Sesión 4 de Vaegrant a la semilla data/vaegrant.json:
//   - cronica[]     -> agrega la entrada "sesion-4"
//   - personajes[]  -> suma a Haddrek (semiorco) y Brina Argentea (druida humana)
//   - mundo.lugares[] y mundo.ganchos[] -> canon nuevo (islas de Baal, el Claro
//     Lunar, las Nueve Rosas, las siete piedras, el Socavón) y actualiza los
//     ganchos del cryptex y la habitación tapiada, que esta sesión resolvió
//   - mapa -> pines de las islas de Baal y el Claro Lunar, ruta planeada de la
//     Sesión 4 (Moray -> Baal), sesiones nuevas en pines viejos y party
//   - galeria.prompts[] -> tres escenas de la sesión
// Idempotente: si ya existe cronica "sesion-4", no hace nada.
//
// Uso: node scripts/patch-vaegrant-sesion4.mjs
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-4")) {
  console.log("La crónica ya tiene 'sesion-4'. Nada que hacer.");
  process.exit(0);
}

// ── Crónica ──────────────────────────────────────────────────────
const sesion4 = {
  id: "sesion-4",
  numero: 4,
  titulo: "El gnomo que hablaba demasiado",
  fecha: "2026-07-28",
  resumen:
    "Moray se prepara para el festival de la luna nueva y el puerto está lleno de guardia de Iron Keep. Mientras hacen tiempo y compras, el grupo interroga a un semiorco enorme sentado en un banquito contra la puerta del Socavón: es Haddrek, cobrador de impuestos de Iron Keep, que lleva tres días esperando que Zarif aparezca a pagar. Zarif aparece disfrazado con un capote de cuero, cruza la calle, se compra una testigo por una pieza de plata la hora —Brina Argentea, druida y comerciante de los pueblos arbóreos— y recién ahí se sienta a hablar. Lo que suelta cambia el encargo entero: Ámbar fue tomada por alcazas de bandera negra que están robando objetos de poder bajo la excusa de auditar linajes; Durin está preso y se lo van a llevar a que le quiebren la voluntad; el cryptex de Durin no lo abre él, solo lo puede abrir un ser faérico; y la llave que Iscandar consiguió en Ioma abre la puerta tapiada del alcázar del Albatros. Zarif no va a ir a Ámbar: los contrata. El trabajo es navegar al norte, a las islas de Baal, llegar al Claro Lunar —el ojo por donde se habla con el pueblo faérico—, abrir el cryptex y juntar las siete piedras primigenias antes que los velas negras, para terminar lo que la familia de las Nueve Rosas empezó y no pudo sostener. La sesión cierra con el reparto de oficios del barco, el día de la luna aprovechado para el kit inicial y dos cabillas nuevas cargadas por trolls hasta la cubierta.",
  capitulos: [
    {
      titulo: "Día de luna nueva en Moray",
      texto: `Moray estaba a horas del festival de la luna nueva y el puerto tenía más acero del que un mercado necesita. El grupo preguntó lo obvio: si tanta seguridad era por el volumen de comercio o porque el lugar es realmente inseguro. Las dos cosas. Va a haber un caudal enorme de dinero moviéndose y están en el medio del tránsito de las islas piratas, sobre el Mar de las Espadas: siempre se espera algo malo, a veces pasa y a veces no. Desde Iron Keep mandan mucha guardia para estas fechas, igual que la mandan a las otras islas en sus propias festividades. La luna nueva no es una fiesta menor: es importante para ambos reinos.\n\nCon la reunión recién a la noche, el día se fue en pasear y comprar. El Albatros venía disfrazado de urca mercante y ellos de comerciantes, así que se movieron con eso puesto: preguntas de mostrador, precios, mercadería, y nombres que no eran los suyos cuando alguien preguntaba de más. Vaegrant hizo cuentas de qué convenía cargar y qué se podía conseguir en la isla misma.`,
      dialogo: [
        {
          quien: "Vaegrant",
          texto:
            "¿Entendemos que la seguridad es por el comercio, o realmente es inseguro el lugar?",
        },
        {
          quien: "El Master",
          texto:
            "Va a haber un gran caudal de dinero moviéndose. Están en el medio del tránsito de las islas piratas, del Mar de las Espadas. Siempre se espera algo malo. A veces pasa, a veces no.",
        },
        {
          quien: "El Master",
          texto:
            "De Iron Keep mandan mucha guardia para estos lugares. La luna nueva es muy importante para ambos reinos.",
        },
      ],
    },
    {
      titulo: "El semiorco de la puerta",
      texto: `Ya lo habían cruzado antes, con el bolsito: un semiorco enorme, robusto, con uniforme de cobrador de Iron Keep. Ahora había agarrado un banquito, lo había puesto contra la puerta y estaba ahí sentado, estirado, mirando para enfrente, con la pipa encendida y cara de cansado. Jeremy quiso ir a preguntarle cosas, porque no hay muchos como él: los semiorcos fueron usados por los humanos como guerreros en las Guerras de los Magos, por su fuerza y su fortaleza, y en esas guerras casi se extinguen. Quedan muy pocos en el mundo.\n\nEl interrogatorio salió sorprendentemente bien, porque el semiorco estaba aburridísimo y le vino bien la charla; si no, ya los hubiese mandado a la mierda. Contó que antiguamente su gente era mucho más salvaje y sus ancestros bastante hambrientos, pero que con el tiempo se amoldaron a un carácter más caballeresco y a rituales más normales. Las decisiones grandes se siguen tomando por justas o por combate cuerpo a cuerpo —juicio por espada—, porque resulta más sencillo que una votación de mucha gente que puede tener intereses propios. Sobre la descendencia, lo recomendable para los suyos es tener más de una pareja para criar. Y sobre el futuro de la raza: acá en la isla crece; el problema son los que salen, que no tienen mucha suerte, más que nada por las costumbres.\n\nDel oficio se entendió el resto. Los cobradores de Iron Keep andan prácticamente solos en barcazas chicas y son los que llevan el oro de la recaudación, así que tienen que tener aguante: camisa de malla corta y encima cuero tachonado, todo bien apretujado. Y este en particular estaba clavado en esa puerta por una razón concreta: hacía tres días que esperaba a que apareciera Zarif a pagar sus impuestos.`,
      dialogo: [
        {
          quien: "El Master",
          texto:
            "Los semiorcos fueron utilizados por los humanos como guerreros, por su fuerza y su fortaleza, en las guerras de los magos, y ahí casi se extinguen. Hay muy pocos en el mundo.",
        },
        {
          quien: "Jeremy",
          texto:
            "¿Y cómo son las costumbres en su raza? ¿Algún ritual, alguna celebración particular?",
        },
        {
          quien: "Haddrek",
          texto:
            "Muchas decisiones se toman mediante combate, por justas o cuerpo a cuerpo. Suele ser más sencillo decidirlo así que por una votación de mucha gente que puede tener intereses en su propuesta.",
        },
        { quien: "Jeremy", texto: "Juicio por espada." },
        {
          quien: "Haddrek",
          texto:
            "Acá en la isla sí crece. El tema es que los que salen no tienen mucha suerte, más que nada por las costumbres.",
        },
      ],
    },
    {
      titulo: "Sharif, por fin apareciste",
      texto: `Un hombre con capote de cuero se acercó al semiorco, disimulado. No le dejó verle la cara: se puso al lado, silbó bajo, y Haddrek siguió la conversación mirándolo de reojo, como los caballos. El tipo le hizo una seña hacia adentro. El cobrador cortó la charla con excusas —tengo algo pendiente, gracias por tanta información— y entró.\n\nAdentro, cuando se sacó el capote, era Zarif. Tres días de espera y la misma excusa de siempre, porque el gnomo siempre tarda más de lo requerido, pero también siempre paga lo que debe. Esta vez traía la deuda del fisco, la compensación por la demora y una razón de peso: sus hermanos del sur están teniendo problemas graves. Ámbar está siendo sumergida. Acá todavía no se enteraron, y Zarif teme que a estas islas les pase lo mismo, una por una. Le duele el mote: un punto de comercio de toda la vida, y ahora el hazmerreír de medio mundo.\n\nLos presentó con el viejo Gal, el tabernero: un humano entrado en kilos y también en altura, un metro noventa, gordo, prácticamente un ogro pero humano, con un ojo de vidrio mecánico y la mano izquierda mecánica. Faltaban veinte minutos para abrir, así que lo que tuvieran que arreglar, que lo apuraran. Gal les puso un barrilito de cinco litros sobre la mesa y jarros chicos de madera, y ahí Zarif soltó lo que nadie sabía todavía: Ámbar fue tomada. Alcazas con banderas negras, sin saber a qué intereses representan, y están buscando algo. Hace mucho tiempo él tuvo tres amigos, y entre todos guardaron ciertas reliquias repartidas por el mundo. Cree que es eso lo que vienen a buscar las carabelas de velas oscuras. La gran información, dijo, la tiene al sur una bibliotecaria.`,
      dialogo: [
        {
          quien: "Haddrek",
          texto: "Sharif, por fin apareciste. Hace tres días que te estoy esperando.",
        },
        { quien: "Zarif", texto: "Yo siempre pago lo que debo." },
        {
          quien: "Zarif",
          texto:
            "En Ámbar están pasando cosas. Están siendo sumergidos. Acá todavía no saben, pero quizás pase lo mismo con esta maldita isla, con cada una de estas malditas islas.",
        },
        {
          quien: "Zarif",
          texto:
            "Ámbar fue tomada. Alcazas con banderas negras. Todavía no sabemos a qué intereses representan. Y están buscando algo.",
        },
        {
          quien: "Zarif",
          texto:
            "Yo tuve tres amigos hace mucho tiempo y guardamos ciertas reliquias alrededor del mundo. Creo que es eso lo que tienen de interés estas carabelas de banderas oscuras.",
        },
      ],
    },
    {
      titulo: "Una testigo comprada en la calle",
      texto: `Antes de sentarse a hablar, Zarif salió, cruzó la calle y la eligió a ella. El grupo se dio cuenta en el momento de que de imparcial no tenía nada, porque fue directo, sin dudar. Le pidió una hora de sus servicios como testigo. Ella le puso precio de oficio, una pieza de plata por hora, y el gnomo aceptó y de paso ató el cabo de la media hora de más. Trato hecho.\n\nAsí entró Brina Argentea: humana, druida, comerciante de los pueblos arbóreos del sur, esas islas de vestigios de mundos antiguos donde todavía hay biomas de ents. Viene todos los años al festival por trabajo y todos los años la agarran para algo. Es fiel creyente de Alistair, el minotauro blanco colosal, el líder faérico del que Kyro les había hablado en Magraje; sus tierras son el verde del sur, y acercarse a Ámbar es estar a un cruce de su dios.\n\nZarif entró después, estirándose los tirantes, se sacó la capa, hizo el gesto de colgarla y se le cayó al piso. Vino caminando hasta la mesa. Estaban los tres sentados —Vaegrant, Jeremy e Iscandar—, más Haddrek con su barrilito y Brina de testigo. Seis alrededor de una mesa, veinte minutos antes de que la taberna abriera.`,
      dialogo: [
        {
          quien: "El Master",
          texto:
            "Se cruza la calle y la elige a ella. Ustedes se dan cuenta en el momento de que de imparcial no tiene nada, porque fue directo.",
        },
        {
          quien: "Zarif",
          texto:
            "Necesito sus servicios. Una reunión durará no más de una hora, pero necesito un testigo.",
        },
        { quien: "Brina", texto: "Una pieza de plata por hora." },
        { quien: "Zarif", texto: "¿Y si me paso una hora y media? Tenemos un trato." },
        {
          quien: "Zarif",
          texto:
            "Lo que yo diga va a ser determinado por ustedes, escuchado por el señor que me viene a cobrar los impuestos y legalizado por la señorita.",
        },
      ],
    },
    {
      titulo: "El cryptex y las Nueve Rosas",
      texto: `Zarif arrancó midiendo. Tomó a Iscandar por guardaespaldas de Vaegrant y el paladín lo corrigió: no es su guardaespaldas, es su compañero de viaje. Después puso la regla de la charla: necesitaba saber cuánto sabían ellos, porque lo que sepan determina lo que él diga.\n\nVaegrant fue de frente: Durin y Torve los mandaron, y la misión es llevarlo a Ámbar. Zarif cortó eso de raíz. Si Durin ya está preso, eso no va a suceder, y el que esté preso cambia las cosas. No lo agarraron por hacer cosas por su cuenta: lo agarraron porque el enano fue lento, como siempre; el jefe del puerto de Ámbar no está preso justamente porque es más rápido. Y remató con algo que dejó a todos incómodos: Durin les dio la orden porque no tenía el libro con él.\n\nIscandar sacó unos papeles mojados y sucios con un nombre garabateado, Babruk. Zarif lo reconoció y eso terminó de convencerlo de que él no tiene que ir a Ámbar. Entonces Vaegrant puso el tubo sobre la mesa. El gnomo lo miró y dijo que eso no debería estar ahí. Después vio la llave. La llave abre un compartimiento en el alcázar, y la necesita en su arco el que se encargue de las bodegas. El cryptex es otra cosa: solo lo puede abrir un ser faérico o un representante del orden faérico. Ni siquiera él sabe qué tiene adentro; sabe qué debería tener, el mapa que necesitan y los mapas de transición entre planos, entre los portales artificiales y los naturales.\n\nY explicó la trampa de Ámbar. La auditoría de la biblioteca no era de números: la bibliotecaria le contó que estaban buscando los libros de historia de la nobleza, los linajes. Lo que está naciendo en Ámbar es un saqueo sistemático. Están robando los objetos de poder.\n\nDe ahí salió la historia vieja. Antes de las Guerras de los Magos y durante ellas hubo una familia sin títulos nobiliarios pero con el nombre sonando en todos lados: la familia de las Nueve Rosas. Se dedicaban a sacar objetos de poder de las manos de quienes no los merecían. Tuvieron que escapar y fueron aniquilados sistemáticamente, y esos objetos se perdieron. Hoy sobreviven como mitos y leyendas chicos. Zarif lo cuenta de memoria y no de libro: más allá de que lo vean como un gnomo joven y apuesto, tiene más de seiscientos años.\n\nTambién quedó claro por qué no está en Ámbar. Dicen que sus dedos ligeros se meten donde no deben. Él lo pone al revés: ladrón te convertís cuando te atrapan. Sacó los libros bancarios mucho antes de que todo esto pasara, y avisó siete años atrás, cuando era simplemente el raro que actuaba raro. Se metió con artículos que Durin no quería que tocara, y jura que fue curiosidad, no traición.\n\nLo último fue lo peor. Si a Durin ya lo agarraron, ni siquiera lo van a retener en Ámbar: se lo llevan a ser sometido. Le van a quebrar la voluntad para sacarle lo que tiene en la cabeza y lo van a dejar como una cáscara vacía. Existen métodos científicos para eso, y otros mágicos que son mucho más crueles.`,
      dialogo: [
        {
          quien: "Zarif",
          texto: "Calculo que usted debe ser una especie de guardaespaldas.",
        },
        {
          quien: "Iscandar",
          texto: "No soy su guardaespaldas, soy su compañero de viaje.",
        },
        {
          quien: "Zarif",
          texto:
            "Necesito saber qué tanto saben ustedes. Qué tanto saben ustedes va a determinar lo que yo diga.",
        },
        { quien: "Vaegrant", texto: "Durin nos mandó a buscarte." },
        {
          quien: "Zarif",
          texto:
            "Eso no va a suceder si Durin ya está preso. Está preso porque lo atraparon, porque el enano fue lento, como siempre.",
        },
        { quien: "Zarif", texto: "El cryptex. Eso no debería estar acá." },
        {
          quien: "Zarif",
          texto:
            "Escuchen claramente: el cryptex solamente lo pueden abrir seres faéricos. Tiene el mapa de lo que ustedes necesitan y los mapas de transición entre planos.",
        },
        {
          quien: "Zarif",
          texto:
            "La auditoría no era de números. Estaban buscando los libros de historia de la nobleza. Lo que está naciendo en Ámbar es un saqueo sistemático: están robando los objetos de poder.",
        },
        {
          quien: "Zarif",
          texto:
            "Más allá de que me vean como un gnomo joven y apuesto, la verdad es que tengo más de seiscientos años.",
        },
        {
          quien: "Zarif",
          texto:
            "Van a quebrar su voluntad para sacar lo que tiene en su cabeza y lo van a dejar como una cáscara vacía.",
        },
      ],
    },
    {
      titulo: "Las siete piedras",
      texto: `A mitad de charla Zarif dejó de hacerse el gran señor y el payaso, y cambió la voz. El viejo Durin tiene razón, admitió: a él lo sacaron de Ámbar porque hablaba demasiado, pero le encargaron armar una sucursal de Ámbar por si todo se pudría. Y todo se pudrió.\n\nEl encargo quedó así. Deben navegar al norte, a las islas de Baal. Ahí hay una formación rocosa primigenia que fue el hogar original de aquello que Haddrek conoce como la isla Tortuga: no una isla llamada Tortuga, sino una isla que salió de una tortuga, lo que ató un cabo directo con Magraje. En Baal está la piedra y está la púrpura, y hay un lugar llamado el Claro Lunar, que es el ojo por donde se puede comunicar con el pueblo faérico. Van a necesitar contexto faérico y, sobre todo, a las hordas: los humanos, lamenta informar, ya no son muy confiables.\n\nEl trabajo concreto: abrir el cryptex, recolectar las piezas primigenias —siete piedras en total, una por cada día de la semana— y después terminar lo que los de las Nueve Rosas iniciaron y no pudieron mantener en secreto, esconderlas en un lugar donde los magos no las encuentren. Porque si los portales están activos, los magos ya las están buscando; Zarif no dijo que las hayan encontrado, dijo que sabrían buscarlas.\n\nY hay una razón que no es de tesoro sino de tablero. Si los pacificadores se enteran de que los velas negras están siguiendo el designio de los nueve magos, van a venir a liberarlos. Hay que probar la inocencia, o ante el mundo son ladrones de reliquias. Vaegrant le retrucó si acaso no lo son, y el gnomo contestó con la única defensa que tiene: si escondés una reliquia para que un mago poderoso no destruya una aldea entera, sos un ladrón igual.\n\nEl reparto que hizo fue de oficinista. La señorita sabrá cómo arreglar lo del otro tiempo. La llave la necesita el que se encargue de las bodegas, da lo mismo quién sea. Y Haddrek es su llave en los ministerios y en los asuntos exteriores. Ya no están asumiendo que tienen que contratarlo: están asumiendo que ahora van a ser contratados por él. Trabajan para Zarif y Zarif les paga el sueldo. La deuda con Omán la va a ir a pagar él en persona, que Omán va a entender.\n\nIscandar hizo la cuenta en voz alta, cansado: primero eran tres, después con usted cuatro, después cinco, ahora seis, mañana siete. Zarif le devolvió una que pesa más de lo que parece: se van a enterar tarde o temprano de que eran quince en total. Tarde o temprano caen presos todos; cuando vengan por Omán, estas tierras se van a defender, y hay que prepararse para la guerra. Los corsarios del norte serán los primeros en atacar y los velas negras van a estar ya diseminados por todos lados.\n\nVaegrant sumó lo suyo: si van al norte tiene que pasar por Waterdeep a buscar a Gonagal Crestarroja, el encargo personal de Durin, y decirle que se prepare. Zarif entendió al toque lo que eso significa. Durin está alertando a los clanes. Y cerró: tomará una de sus barcazas, y ellos navegarán al norte.`,
      dialogo: [
        {
          quien: "Zarif",
          texto:
            "Me sacaron de Ámbar porque hablaba demasiado. Pero me dijeron que tenía que armar una sucursal de Ámbar por si todo se pudría.",
        },
        {
          quien: "Zarif",
          texto:
            "Deberán dirigirse a las islas de Baal, al norte. Ahí hay una formación rocosa. Es primigenia.",
        },
        {
          quien: "Zarif",
          texto:
            "Ahí hay un lugar llamado el Claro Lunar. El Claro Lunar es el ojo por donde se puede comunicar con el pueblo faérico.",
        },
        {
          quien: "Zarif",
          texto:
            "Abrirán el cryptex y tendrán que recolectar ustedes las piezas primigenias. Siete piedras en total. Una por cada día de la semana.",
        },
        {
          quien: "Zarif",
          texto:
            "Y después terminar lo que los de las Nueve Rosas iniciaron y no pudieron mantener en secreto: esconder las piedras en un lugar donde no sean encontradas por los magos.",
        },
        { quien: "Vaegrant", texto: "¿Y no lo son? Ladrones de reliquias, digo." },
        {
          quien: "Zarif",
          texto:
            "Si yo te digo que tenés que esconder una reliquia para que un mago poderoso no destruya toda una aldea, y vos la escondés, sos un ladrón.",
        },
        { quien: "Zarif", texto: "Trabajarán para mí. Yo les pagaré su sueldo." },
        {
          quien: "Iscandar",
          texto:
            "Juro que cada charla son más. Primero eran tres, después con usted eran cuatro, después me hicieron cinco. ¿Ahora son seis? ¿Mañana van a ser siete?",
        },
        {
          quien: "Zarif",
          texto: "Se enterará tarde o temprano que éramos quince en total.",
        },
        { quien: "Vaegrant", texto: "Durin me dijo que le diga que se prepare." },
        { quien: "Zarif", texto: "Eso quiere decir que Durin está alertando a los clanes." },
      ],
    },
    {
      titulo: "El Albatros como oficio",
      texto: `Con el trato cerrado, la mesa se puso a ordenar el barco, porque esta campaña tiene una faceta de economía. El Albatros es enteramente suyo y funciona como una aldea chica: hay un dinero común, aparte del de cada uno, y también hay gastos, porque el combustible se compra, las roturas se arreglan y el casco se limpia. El barco es la base, y es totalmente mejorable. Eligieron en su momento una nave de velocidad y sigilo: no está muy artillada y un cañonazo de costado la hace pedazos, pero está mejorada, vuela, y tiene una nube de sigilo que levanta nubes sobre el mar para que no la vean. En los registros tiene unos doce años de navegación, casi todos del Mar de las Espadas y el mar interior.\n\nCada uno tomó un oficio, con bonificadores en todo lo que se relacione con él. Iscandar al timón, capitán y navegante. Jeremy en el depósito, con la cartografía y la historia, que le anuda directo la economía: hay que saber de eso para saber con quién comerciar y con quién no. Vaegrant como oficial diplomático en puertos, con comercio en tierra y conocimiento de rutas marinas. Brina de encargada de comercio y tesorería, aprendiendo a tasar y a vender, con bonificación a la diplomacia con los órdenes faéricos. Haddrek al mantenimiento del barco y la artillería, con la mano metida en los bajos fondos cuando haya que averiguar algo. El método quedó fijado en mesa: al llegar a un lugar, cada uno tira por lo suyo y saca su porción de información, y entre todos arman la información completa.\n\nEn el medio se filtró algo que Vaegrant pensaba llevarse a la tumba: la puerta tapiada del fondo de la bodega, esos dos metros de madera maciza que nadie pudo abrir, es el compartimiento del alcázar del que habló Zarif. La llave que Iscandar consiguió en Ioma es la que la abre.\n\nHubo también una clase de comercio con el gnomo de conejillo de indias. Vaegrant le sacó precio al vino ámbar de la bodega —uno de los tres mejores del mundo— y Zarif se lo fue bajando a una pieza de oro, después dos, después tres, hasta dejarle el punto claro: Ámbar hace mucho que no comercia, y si ellos sacaron eso de ahí, son contrabandistas. Ese vino sirve más de diplomacia que de venta. En la bodega quedaron los vinos lujosos, los cueros finos y las especias, raciones para medio mes, herramientas de mantenimiento y el hierro forjado. Del oro del barco quedaban unas cuatrocientas monedas y bajaron treinta por cabeza; el alojamiento y la comida los cubre Río.\n\nEl Master abrió la puerta a que inventen: en plena era industrial, si a un personaje se le ocurre una receta o un artefacto con contexto, se gestiona el plano y queda hecho. Avisó también que los barriles de pólvora contra una puerta son lo primero que se le ocurre a todo el mundo y tienen daño colateral de metralla. Y con Njröun a bordo, el kit de herboristería puede montarse como laboratorio en el barco; Brina se ofreció a averiguar si el brote toma agua dulce o salada, porque si el árbol se muere, algo malo pasa.\n\nAprovecharon el día de la luna para el kit inicial. En unas bodegas grandes, con cava enorme y gente armando cajas y preparando armas de fuego, cerraron dos cabillas y veinticuatro balas por noventa monedas de oro. Vaegrant pagó con diez de platino y la armera devolvió una: lo justo es justo, a menos que esté queriendo sobornarme. Al guardar el dinero en la bandolera se le vio el arma, y valía la pena verla: parece un trabuco, pero en vez de boca tiene un cristal en la punta. Piedra lunar fusionada directamente con un arma, no solo con magia; ninguno de los dos había visto eso antes, ni siquiera en Sambar. Dos trolls salieron de las sombras, levantaron las cajas y las llevaron hasta el Albatros —la mano de obra barata que en ese puerto ya conocen— y de yapa vino la carta de recomendación, que era parte del trato.`,
      dialogo: [
        {
          quien: "El Master",
          texto:
            "El barco funciona como una pequeña aldea. Tienen un dinero común, pero también gastos. El barco en sí es la base, pero es totalmente mejorable.",
        },
        {
          quien: "El Master",
          texto:
            "De esa manera cada uno tiene una porción de la información, y entre todos tienen la información completa.",
        },
        {
          quien: "Vaegrant",
          texto: "Si no lo decía el gnomo, me lo iba a guardar hasta la tumba.",
        },
        {
          quien: "La armera",
          texto: "Lo justo es justo. A menos que esté queriendo sobornarme.",
        },
        {
          quien: "El Master",
          texto:
            "Es la primera vez que ven que están fusionando las piedras lunares con armas directamente. No solamente magia.",
        },
        {
          quien: "Brina",
          texto:
            "No sabemos si el brote consume agua dulce o salada. Eso me lo puedo fijar yo.",
        },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Zarif",
      rol: "El gnomo que Durin mandó a buscar. Más de seiscientos años, dedos ligeros y verborragia de payaso que usa como escudo. Fue sacado de Ámbar por hablar demasiado, con el encargo de armar una sucursal por si todo se pudría. Es uno de los que escondieron las reliquias, sacó los libros bancarios de Ámbar antes del saqueo y avisó siete años antes de que pasara. No va a ir a Ámbar: contrata al grupo y les paga sueldo.",
    },
    {
      nombre: "Gal",
      rol: "Tabernero del Socavón, en Moray. Humano de un metro noventa, gordo, prácticamente un ogro pero humano, con un ojo de vidrio mecánico y la mano izquierda mecánica. Le cobra impuestos a todo el mundo y a él también.",
    },
    {
      nombre: "La familia de las Nueve Rosas",
      rol: "Familia sin títulos nobiliarios pero de nombre sonante, anterior y contemporánea a las Guerras de los Magos. Se dedicaban a sacar objetos de poder de las manos de quienes no los merecían. Tuvieron que escapar y fueron aniquilados sistemáticamente; los objetos se perdieron. Hoy son mitos y leyendas chicos. El encargo del grupo es terminar lo que ellos empezaron.",
    },
    {
      nombre: "Babruk",
      rol: "El nombre que aparece en los papeles mojados que trae Iscandar, asociado al señor de la oscuridad detrás de los velas negras. Zarif lo reconoció al instante, y reconocerlo fue lo que terminó de convencerlo de no volver a Ámbar.",
    },
    {
      nombre: "Las siete piedras primigenias",
      rol: "Las piezas que hay que recolectar, una por cada día de la semana. Están ligadas a los objetos de poder que perdieron las Nueve Rosas. Si los portales están activos, los magos ya saben buscarlas. El trabajo no termina al juntarlas: hay que esconderlas donde no las encuentren.",
    },
    {
      nombre: "Las islas de Baal y el Claro Lunar",
      rol: "El destino al norte, a unos seis días de Moray. Una formación rocosa primigenia que fue el hogar original de la isla que salió de una tortuga. Ahí está la piedra y está la púrpura, y el Claro Lunar es el ojo por donde se habla con el pueblo faérico. Hace mucho que la gente del sur no sube; antes convivían humanos, orcos y enanos casi en forma igualitaria.",
    },
    {
      nombre: "El designio de los nueve magos",
      rol: "Lo que los velas negras estarían siguiendo, según Zarif. Si los pacificadores se enteran, vendrán a liberarlos. Por eso el grupo tiene que probar la inocencia: si no, ante el mundo son ladrones de reliquias.",
    },
    {
      nombre: "La armera de las bodegas",
      rol: "Vendedora de armas en Moray, con trolls de carga a sueldo. Cobró noventa monedas por dos cabillas y veinticuatro balas y devolvió el vuelto sin que se lo pidieran. Lleva un arma como un trabuco pero con un cristal en la punta: piedra lunar fusionada directamente con el arma, cosa que el grupo no había visto ni en Sambar.",
    },
  ],
  dudas: [
    "La fecha se asumió 2026-07-28 por la cadencia semanal de las sesiones 2 y 3; los transcripts de esta sesión llegaron sin nombre de archivo con fecha.",
    "La grafía del gnomo varía en los audios entre Zarif, Zerif, Sharif y Sarif. El canon mantiene Zarif, que es como quedó desde la Sesión 1.",
    "El nombre de las islas del norte se escuchó como Baal, Val, Valar y Glenor Blar. Falta confirmar si son el mismo lugar y cuál es la grafía buena.",
    "El nombre de la armera se escuchó una sola vez como Alara, y puede ser el origen de los trolls y no su nombre. Queda como 'la armera' hasta confirmar.",
    "La grafía de Babruk está sin confirmar.",
    "El archipiélago de origen de Brina se escuchó como Colín; falta la grafía correcta.",
    "Al cobrador se lo nombra una vez como Edgar; puede ser el nombre del jugador y no del personaje.",
    "Alguien llamado Willy le había pasado la descripción de Zarif a los que llegaron al Socavón. No quedó claro si es Río u otra persona.",
    "En una charla de puesto de pescado se usa el alias James. No quedó claro si es la coartada acordada del grupo o un chiste de mesa.",
    "Las medidas de Haddrek se dijeron entre risas como 2,90 m y 190 kg, y también 2,70 m y 50 kg. Quedó como semiorco robusto de 95 kg.",
    "La duración exacta del viaje Moray-Baal quedó entre 'un día más de lo que tardamos en llegar' y 'seis días'.",
    "La deuda con Omán: se entendió que es de Zarif y que él la va a pagar en persona, pero en mesa también se le habla de deudas a Haddrek.",
  ],
};

data.cronica = [...(data.cronica || []), sesion4];

// ── Personajes nuevos ────────────────────────────────────────────
const personajesNuevos = [
  {
    id: "haddrek",
    nombre: "Haddrek",
    arquetipo: "Semiorco · Cobrador de Iron Keep",
    linea:
      "Recaudador de impuestos de Iron Keep. Banquito contra la puerta, pipa encendida y cara de cansado, esperando que le paguen.",
    imagen: "",
    rasgos: [
      {
        label: "Oficio",
        texto:
          "Cobrador de Iron Keep. Los de su oficio andan casi solos en barcazas chicas llevando el oro de la recaudación, así que viajan con malla corta y cuero tachonado encima. Tienen que tener aguante.",
      },
      {
        label: "Raza",
        texto:
          "Semiorco robusto, de los pocos que quedan. Los humanos usaron a los suyos como guerreros en las Guerras de los Magos, por su fuerza y su fortaleza, y ahí casi se extinguen.",
      },
      {
        label: "Costumbres",
        texto:
          "Su gente pasó de salvaje a caballeresca. Las decisiones grandes se toman por justas o cuerpo a cuerpo, juicio por espada, porque sale más limpio que una votación de gente con intereses. Y se recomienda más de una pareja para criar.",
      },
      {
        label: "En el barco",
        texto:
          "Mantenimiento y artillería del Albatros, con la mano metida en los bajos fondos cuando hay que averiguar algo. Escudo, espada larga y jabalina.",
      },
    ],
    descripcion: [
      "El grupo lo vio antes de saber quién era: un semiorco enorme sentado en un banquito contra la puerta del Socavón, estirado, mirando para enfrente, con la pipa encendida y el bolsito del cobro al lado. Llevaba tres días ahí, aburrido y de mal humor, esperando que Zarif apareciera a pagar sus impuestos. Fue Jeremy el que se acercó a interrogarlo, y le vino bien la charla: si no, ya los hubiese mandado a la mierda.",
      "Cuando Zarif por fin llegó, disfrazado con un capote de cuero, fue a buscarlo a él primero. Haddrek quedó dentro de la reunión como la parte que escucha y da fe del cobro, y salió con un puesto que no pidió: Zarif lo nombró su llave en los ministerios y en los asuntos exteriores.",
    ],
  },
  {
    id: "brina",
    nombre: "Brina Argentea",
    arquetipo: "Druida · Humana",
    linea:
      "Comerciante de los pueblos arbóreos y fiel de Alistair. Entró a la reunión como testigo alquilada por una pieza de plata la hora.",
    imagen: "",
    rasgos: [
      {
        label: "De dónde",
        texto:
          "De los pueblos arbóreos del sur, islas donde todavía hay biomas de ents y vestigios de mundos antiguos. Es nativa de este plano y vive de esos vestigios.",
      },
      {
        label: "Fe",
        texto:
          "Fiel creyente de Alistair, el minotauro blanco colosal, líder faérico. Sus tierras son el verde del sur del mapa: acercarse a Ámbar es estar a un cruce de su dios.",
      },
      {
        label: "Oficio",
        texto:
          "Comerciante. La mandan todos los años al festival de la luna nueva y todos los años la agarran para algo. En el Albatros lleva comercio y tesorería, con tasación y bonificación a la diplomacia con los órdenes faéricos.",
      },
      {
        label: "Equipo",
        texto:
          "Bastón y armadura de cuero, clase de armadura 11. Trae kit de herboristería, que a bordo puede montarse como laboratorio: es la que se va a ocupar de mantener vivo a Njröun.",
      },
    ],
    descripcion: [
      "Zarif la eligió de la calle. Cruzó, fue directo a ella y le pidió una hora de sus servicios como testigo, y el grupo se dio cuenta en el acto de que de imparcial no tenía nada. Ella le puso precio de oficio, una pieza de plata por hora, y el gnomo aceptó y hasta ató el cabo de la media hora de más.",
      "Quedó adentro de la reunión legalizando lo que se decía, y salió de ahí con trabajo. No fue casualidad: el cryptex solo lo puede abrir un faérico o un representante del orden faérico, y Zarif confía en los pueblos arbóreos. Como él mismo admitió a mitad de charla, fue mucha casualidad haber llamado justo a la señorita que puede comerciar con eso.",
    ],
  },
];

data.personajes = [...(data.personajes || []), ...personajesNuevos];

// ── Mapa ─────────────────────────────────────────────────────────
data.mapa.marcadores.push(
  {
    id: "islas-baal",
    nombre: "Islas de Baal",
    x: 4.3,
    y: 21.8,
    tipo: "isla",
    sesiones: [4],
    nota: "El destino que fija Zarif: al norte, a unos seis días de Moray, a la misma altura que Waterdeep pero mar adentro. Hay una formación rocosa primigenia que fue el hogar original de aquello que en estas islas llaman la isla Tortuga: no una isla llamada Tortuga, sino una isla que salió de una tortuga. Ahí está la piedra y está la púrpura. Hace mucho que la gente del sur no sube; antes convivían humanos, orcos y enanos casi en forma igualitaria, y hoy no se sabe nada del lugar.",
    estado: "aproximado",
  },
  {
    id: "claro-lunar",
    nombre: "El Claro Lunar",
    x: 5.9,
    y: 23.6,
    tipo: "hito",
    sesiones: [4],
    nota: "Dentro de las islas de Baal. Zarif lo llamó el ojo por donde se puede comunicar con el pueblo faérico. Es el primer paso del encargo: sin contexto faérico no hay forma de abrir el cryptex.",
    estado: "aproximado",
  },
);

for (const id of ["moray", "waterdeep", "ambar", "iron-keep", "luskan", "mar-espadas"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(4)) m.sesiones.push(4);
}

const wd = data.mapa.marcadores.find((m) => m.id === "waterdeep");
wd.nota +=
  " En la Sesión 4, Zarif leyó el encargo al vuelo: si Durin manda a decirle a Crestarroja que se prepare, es que Durin está alertando a los clanes.";

const ironKeep = data.mapa.marcadores.find((m) => m.id === "iron-keep");
ironKeep.nota +=
  " De ahí sale Haddrek, el cobrador de impuestos que se suma al grupo en la Sesión 4, y de ahí manda Omán la guardia que cubre el festival de la luna nueva en Moray.";

data.mapa.rutas.push({
  sesion: 4,
  estado: "planeado",
  puntos: ["moray", "islas-baal"],
  via: [
    { x: 3.9, y: 41.5 },
    { x: 3.2, y: 34 },
    { x: 3.4, y: 27.5 },
  ],
});

data.mapa.party = {
  marcadorId: "moray",
  texto:
    "Fin de la Sesión 4: el Albatros sigue amarrado en Moray y ahora son cinco a bordo, con Haddrek y Brina sumados. Zarif no va a ir a Ámbar: los contrató a ellos y les paga sueldo. El encargo es navegar al norte, a las islas de Baal, llegar al Claro Lunar, abrir ahí el cryptex y juntar las siete piedras primigenias antes que los velas negras. Durin está preso y camino a que le quiebren la voluntad. La sesión cierra con el día de la luna nueva gastado en el kit inicial: dos cabillas, veinticuatro balas y una carta de recomendación.",
};

// ── Mundo ────────────────────────────────────────────────────────
data.mundo.lugares.push(
  {
    nombre: "Las islas de Baal (Sesión 4)",
    tipo: "Islas · el destino del encargo · al norte",
    texto:
      "El norte al que los manda Zarif, a unos seis días de Moray y a la altura de Waterdeep pero mar adentro. Hay una formación rocosa primigenia que fue el hogar original de la isla que salió de una tortuga, lo que la ata directo a Magraje. Ahí está la piedra y está la púrpura. Hace mucho que la gente del sur no sube a esas islas: antes tenían mucha incidencia de humanos, orcos y enanos casi en forma igualitaria, y hoy no se sabe nada del lugar.",
    destacado: true,
  },
  {
    nombre: "El Claro Lunar (Sesión 4)",
    tipo: "Hito · el ojo faérico · dentro de Baal",
    texto:
      "El lugar por donde se puede comunicar con el pueblo faérico, según Zarif. Es el primer paso del encargo, porque el cryptex de Durin solo lo abre un ser faérico o un representante del orden faérico. Sin pasar por ahí, el resto no arranca.",
    destacado: true,
  },
  {
    nombre: "Las Nueve Rosas (Sesión 4)",
    tipo: "Historia · una familia aniquilada · mito y leyenda",
    texto:
      "Familia sin títulos nobiliarios pero de nombre sonante, anterior y contemporánea a las Guerras de los Magos. Se dedicaban a sacar objetos de poder de las manos de quienes no los merecían. Tuvieron que escapar y fueron aniquilados sistemáticamente, y con ellos se perdieron los objetos. Hoy sobreviven como mitos y leyendas chicos. El encargo del grupo es literalmente terminar lo que ellos empezaron y no pudieron mantener en secreto.",
    destacado: true,
  },
  {
    nombre: "El Socavón (Sesión 4)",
    tipo: "Posada · Moray · la mesa de la reunión",
    texto:
      "La posada de Moray donde Río citó al grupo con Zarif. La atiende el viejo Gal, humano de un metro noventa y entrado en kilos, con un ojo de vidrio mecánico y la mano izquierda mecánica. En su puerta esperó Haddrek tres días con un banquito y una pipa, y adentro se cerró el trato que reorienta toda la campaña.",
    destacado: false,
  },
);

// Ganchos que esta sesión resolvió o movió
const gTubo = data.mundo.ganchos.find((g) => g.label === "El tubo y la llave");
if (gTubo) {
  gTubo.texto =
    "Resuelto a medias en la Sesión 4. Zarif no puede abrir el cryptex: solo lo abre un ser faérico o un representante del orden faérico, y por eso metió a Brina en la mesa. Adentro debería estar el mapa que necesitan y los mapas de transición entre planos, entre portales artificiales y naturales. La llave era otra cosa distinta: abre el compartimiento del alcázar del Albatros.";
}

const gTapiada = data.mundo.ganchos.find((g) => g.label === "La habitación tapiada");
if (gTapiada) {
  gTapiada.texto =
    "Dos metros de madera maciza al fondo de la bodega del Albatros. En la Sesión 4 Zarif lo dijo al pasar y se armó: la llave que Iscandar consiguió en Ioma es la que abre ese compartimiento del alcázar. Falta abrirlo.";
}

data.mundo.ganchos.push(
  {
    label: "Las siete piedras primigenias",
    texto:
      "Siete piezas, una por cada día de la semana, ligadas a los objetos de poder que perdieron las Nueve Rosas. Hay que juntarlas y después esconderlas donde los magos no las encuentren. Si los portales están activos, los magos ya saben buscarlas; Zarif no dijo que las hayan encontrado.",
  },
  {
    label: "Probar la inocencia",
    texto:
      "Si los pacificadores se enteran de que los velas negras siguen el designio de los nueve magos, van a venir a liberarlos. Hasta entonces, ante el mundo, los que esconden reliquias son ladrones de reliquias. El grupo tiene que probar lo contrario, y Zarif admite que la diferencia es fina.",
  },
  {
    label: "Durin, sometido",
    texto:
      "A Durin no lo van a retener en Ámbar. Se lo llevan a que le quiebren la voluntad y le saquen lo que tiene en la cabeza, hasta dejarlo como una cáscara vacía. Hay métodos científicos para eso y otros mágicos, mucho más crueles. La cuenta regresiva ya empezó.",
  },
  {
    label: "Los quince",
    texto:
      "El grupo creía que eran tres los del pacto viejo, después cuatro, después cinco, después seis. Zarif dejó caer que eran quince en total. Faltan nueve nombres y ninguno apareció todavía.",
  },
  {
    label: "Piedra lunar en las armas",
    texto:
      "La armera de Moray lleva un trabuco con un cristal en la punta en vez de boca: piedra lunar fusionada directamente con el arma, no solo con magia. Ni Vaegrant ni Iscandar habían visto eso, ni siquiera en Sambar. Si es legal o no, dijo ella, depende de quién pregunte.",
  },
);

// ── Galería ──────────────────────────────────────────────────────
data.galeria.prompts.push(
  {
    titulo: "Sesión 4 · El cobrador en la puerta",
    prompt:
      "Formato horizontal 3:2. Calle de puerto en fiesta previa a la luna nueva, casas de barro y teja, guirnaldas y puestos al fondo. Contra la puerta de una posada, un semiorco enorme y robusto sentado en un banquito demasiado chico, estirado, mirando al frente, pipa encendida, uniforme de cobrador y un bolsito de recaudación al lado. Cara de tres días de espera. Vaegrant, de pie a un costado, lo observa sin acercarse del todo.",
  },
  {
    titulo: "Sesión 4 · El trato del Socavón",
    prompt:
      "Formato horizontal 3:2. Interior de taberna todavía cerrada, luz baja de velas, sillas sobre las mesas menos una. Alrededor de esa mesa: un gnomo de tirantes gesticulando de pie sobre el banco, un barrilito chico de cerveza y jarros de madera, un tubo metálico cerrado y una llave sobre la madera. Vaegrant escucha con la mano en el tubo, un paladín cruzado de brazos, una mujer joven de ropa de viaje tomando nota como testigo y un semiorco enorme en la punta. Tensión contenida, nadie levanta la voz.",
  },
  {
    titulo: "Sesión 4 · El Claro Lunar",
    prompt:
      "Formato vertical 2:3. Islas del norte, frías y sin gente: una formación rocosa primigenia, negra y gastada, abriéndose en un claro circular. En el centro, un espejo de agua quieta que refleja una luna que no está en el cielo. Vegetación vieja, líquenes, niebla baja. Escala grande y silenciosa, sin figuras humanas o con una silueta mínima al borde para dar tamaño.",
  },
);

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(
  "Sesión 4 integrada: crónica, 2 personajes, 2 pines, 1 ruta, 4 lugares, 5 ganchos nuevos y 3 prompts.",
);
