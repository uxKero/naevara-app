// Suma la Sesión 10 de Silvapor al canon: data/vaegrant.json → cronica[],
// más los lugares, los marcadores nuevos del camino al High Forest, la ruta
// recorrida y la posición del grupo.
//
// Fuente: sources/Vaegrant/Sesion 10 (24 audios transcriptos con ElevenLabs).
// Idempotente: si ya existe la crónica "sesion-10", no hace nada.
//
// Nombres confirmados con Alan antes de escribir:
//   · el caudillo de los Grandes Fauces es Caltor (así lo dijo el Master la
//     primera vez; en la mesa después le dijeron Kaldor y Caldor);
//   · el clan de Krenko pasa a llamarse Garra de Hielo desde esta sesión,
//     porque el Master adoptó el nombre con el que Alan lo venía anotando.
//     Las sesiones 1 a 9 quedan como están, con Garradehierro;
//   · el drow de Waterdeep sigue siendo Lanza de Plata, como en la Sesión 9.
//     Caltor lo llamó Danza de Plata y eso queda anotado como duda;
//   · el pseudodragón de Vaegrant es Spinel.
//
// Uso: node scripts/patch-vaegrant-sesion10.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-10")) {
  console.log("La crónica ya tiene 'sesion-10'. Nada que hacer.");
  process.exit(0);
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion10 = {
  id: "sesion-10",
  numero: 10,
  titulo: "Alguien tiene que mandar",
  fecha: "2026-09-15",
  resumen:
    "El viaje que va de Waterdeep al corazón del High Forest, con una sola pregunta repetida en cada parada: quién manda. Se la hace una aldea que le deja ofrendas a Vaegrant porque todavía honra la memoria de los elfos, se la hace un caudillo orco que no entiende un grupo sin capitán, y se la hace el barco, que llegó volando sin permiso y tiró una tormenta de latas de atún encima de un ejército aliado. Se enteran de lo que de verdad defiende Hellgate, y no son los muertos: son máquinas que salen de abajo de la tierra. Consiguen dos mil orcos, una carta de tregua para Krenko y un lugar de encuentro. Y en el último minuto, sobre la Nidada, las máquinas los encuentran primero.",
  capitulos: [
    {
      titulo: "Siete de la mañana en Waterdeep",
      texto:
        "Amanecen con la ciudad de vuelta en lo suyo. Los distritos comerciales abarrotados, los barcos que llegaron de noche durmiendo la resaca de las apuestas, y nadie hablando ya del duelo de ayer. Ellos tienen la plata cobrada y el día entero para salir.\n\nCrestarroja cumplió lo que prometió antes del amanecer. Los Fast Boy están adaptados a la espalda, la altura y el peso de cada uno, y vienen prestados, no regalados: lo demás va como señal de buena fe. Cada rueda tiene cuatro tubos donde se funden los cristales, y cada tubo es de un color distinto, celeste, rojo, violeta y amarillo. La mesa entera hace el mismo chiste al mismo tiempo y ya no hay vuelta atrás.\n\nLas arañas mensajeras resultan mejores de lo que parecían. Tardan un décimo de lo que tardaría una persona en hacer el mismo camino, así que de Waterdeep a Puerto Corona son minutos y no días. Hay una por cabeza, cada una obedece a una sola persona, y solo llevan. Las usan de entrada: un mensaje al Albatros para que salga y los siga, otro a Benetton para que lo custodie hasta que se encuentren.\n\nLa compra del día es de Haddrek. Un equipo de herrero portátil, cinco kilos, veinte piezas de oro: bigornia de un kilo, martillo ligero, martillo plano, puntas, asentadores y un brasero. No sirve para forjar nada de cero, sirve para mantener y para afilar, y un arma afilada baja un punto el crítico en sus dos primeros ataques. Lo otro que hay en el mostrador es una forja andante entera guardada en un eslabón de llavero que se arma a la orden en el lugar donde estés, y sale mil trescientas, así que queda para otra vida.\n\nEl resto de la mañana se va en detalles que no cambian nada y que todos consideran imprescindibles: anteojos antiviento, bufanda, guantes sin dedos y un casco que nadie se va a poner.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Tardan un décimo del tiempo que tardaría en llegar una persona. Un décimo del tiempo. Si tarda diez días, tarda un día.",
        },
        {
          quien: "Master",
          texto:
            "El único requerimiento que tienen las arañas es que cada persona puede tener solo una, y obedece solo a una.",
        },
        { quien: "Haddrek", texto: "Lo puedo poner en la moto." },
        {
          quien: "Master",
          texto:
            "Todo lo que trae es común. Esto no sirve para forjar herramientas de cero, sino para darle un cierto mantenimiento o mejorar en muy pocos aspectos las armas preexistentes.",
        },
        {
          quien: "Haddrek",
          texto:
            "En los descansos cortos o antes de los descansos largos me pongo y afilo. Como buen orco que soy.",
        },
      ],
    },
    {
      titulo: "La tribu que todavía honra a los elfos",
      texto:
        "Los lugares donde se puede parar saliendo de Waterdeep son cuatro: Goldenfields, Red Larch, Treebor y el Cryptic Garden. Eligen el bosque, porque el criterio es no cruzarse con nadie que pueda preguntar demasiado.\n\nEl Cryptic Garden es frondoso, con árboles enormes rodeados de árboles menores y charcos de agua pura, y nadie sabe explicar por qué sigue habiendo paz ahí adentro cuando en el resto del mundo no la hay. La tribu Forel es la más renombrada del lugar: ciento veinte habitantes, noventa por ciento humanos, paredes de barro y techos de paja, recolección y caza. Los reciben bien y les piden dos cosas: control con el fuego, porque los árboles son aceitosos y un descuido prende todo, y nada de abusar de la caza.\n\nAcampan en los Veinte Picos, unas formaciones rocosas afiladas en círculo que hace mucho fueron un templo de un dios que ya nadie recuerda. No es un lugar sagrado ni reservado, pero es donde para todo el mundo, porque está descampado, a ciento cincuenta pies del primer árbol, y tiene una vista linda.\n\nY ahí pasa lo único que el grupo no había previsto en todo el viaje. Los lugareños empiezan a bajarse de sus carretas, envueltos en sus trapos, y dejan ofrendas en el suelo frente a ellos. Vasijas, muñecas talladas en madera, pequeños ídolos de marfil. Se santiguan, no piden nada y no dicen una palabra. Iscandar se acerca a preguntar a quién le están dejando todo eso, y la respuesta es de una sola línea: al elfo. Acá todavía se honra la memoria de los elfos.\n\nDe esa misma conversación sale lo que importa. La guerra del High Forest no está pasando: pasó, y los elfos la perdieron hace mucho. Lo que queda son focos de resistencia sostenidos por un solo hombre, un elfo de túnica blanca y celeste que vive en los Picos Perdidos, que está enojado con todo y que sigue peleando por pura devoción a la guerra. Mientras ese elfo no caiga, nada va a cambiar.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Tiene árboles enormes, de gran porte, rodeado por árboles menores. Tiene pequeños charcos de agua pura y los lugareños viven en bastante armonía. Nadie sabe por qué, pero todavía existe la paz en este lugar. Paz que en el resto del mundo sabemos que no hay.",
        },
        {
          quien: "La mujer de la carreta",
          texto: "Buenas tardes, señor. Simplemente pasaba a dar mis respetos.",
        },
        { quien: "Iscandar", texto: "¿Puedo preguntar a quién?" },
        { quien: "La mujer de la carreta", texto: "Al elfo, claro está." },
        {
          quien: "La mujer de la carreta",
          texto: "Son antiguas costumbres. Acá todavía se honra la memoria de los elfos.",
        },
        {
          quien: "La mujer de la carreta",
          texto:
            "La verdad, no conozco su nombre. Sé que es un elfo. Anda con una túnica blanca y celeste. Es un hombre muy enojado. Está enojado con todo. Y sigue simplemente por su devoción a la guerra.",
        },
        {
          quien: "La mujer de la carreta",
          texto:
            "Nosotros no estamos de parte de la guerra. Queremos que se termine de una vez por todas. Pero hasta que no caiga el elfo loco, van a seguir iguales.",
        },
        {
          quien: "Iscandar",
          texto:
            "Vamos a tener que levantarnos o nos van a llenar de cosas que no vamos a poder terminar de usar para viajar. Te están dejando ofrendas a vos. Respetan mucho a los elfos.",
        },
      ],
    },
    {
      titulo: "Las torres gemelas",
      texto:
        "El único paso al otro lado, sin meterse al agua ni pagarle a una barcaza, es el puente de piedra. Es largo y tiene una torre en cada punta, las torres gemelas, con Red Larch en el medio, que ya no es un pueblo sino una fortaleza en ruinas donde descansan los guardias.\n\nLos guardias son coraceros y llevan mosquetes. No hay peaje. No revisan las carretas, no piden papeles, no preguntan nada. Levantan la barrera, los miran pasar y los dejan ir. Nadie en el camino sabe decir qué están cuidando.\n\nDel otro lado la tierra se pone agreste y la fauna más salva, pero sin peligro real. Después de un par de días de andar parejo, exigiéndoles a los motores todo lo que pueden dar, entran a las Montañas de las Estrellas, en el borde del High Forest. Al norte están los Picos Perdidos, con la fortaleza de los elfos. Al sur de los Picos, en la piedra, está el gran asentamiento de los Grandes Fauces.\n\nDe los Garra de Hielo de Krenko no tienen ni la menor idea de dónde están, y eso es un problema, porque son la mitad del plan. Los Grandes Fauces se llevan mal con ellos, pero son los únicos que con seguridad saben dónde buscarlos. Enfilan para ahí.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "El puente de piedra es bastante largo y tiene una torre de cada lado, a las que se llaman las torres gemelas.",
        },
        {
          quien: "Master",
          texto:
            "No se sabe bien qué buscan, ni se sabe tampoco qué cuidan, porque no es que están cuidando un peaje, ni les revisan el carro ni nada por el estilo. Simplemente están ahí.",
        },
        {
          quien: "Master",
          texto:
            "Dentro del High Forest, en las Montañas de las Estrellas, está el gran asentamiento de los Grandes Fauces, al sur de los Picos Perdidos. Y en los Picos Perdidos está la fortaleza de los elfos.",
        },
      ],
    },
    {
      titulo: "El orco de la trenza canosa",
      texto:
        "El asentamiento los sorprende antes de llegar: chozas bien fabricadas, todo más ordenado de lo que un orco suele permitirse. Dos jinetes les salen al cruce montados en jabalíes de combate acorazados y les cierran el paso con las lanzas en alto.\n\nHaddrek habla por todos y le sale el mejor tiro del día: un veinte en diplomacia. El orco que los frenó se queda un rato en silencio, mirándolo fijo, y después se larga a reír. Levanta la mano, el otro baja la guardia y pregunta lo que hace falta para anunciarlos. Cuando se saca el yelmo aparece un orco viejo, con una trenza canosa que le llega a la mitad de la espalda.\n\nLa media hora que pasan esperando es la más informativa del viaje. Hellgate no se puede tomar con un ejército, porque no se puede matar lo que ya está muerto: los elfos, en su codicia, quisieron armar un ejército mezclando muertos con magia pesada, y lo que hicieron sigue ahí, rindiéndole tributo al elfo loco de los Picos Perdidos. Del elfo dice lo peor: tendría que haber muerto de viejo hace rato, y hay quienes cuentan que lo apuñalaron, lo empalaron y lo decapitaron, y poco tiempo después volvieron a verlo en el campo de batalla.\n\nDe Krenko sale lo demás. Es un goblin muy astuto, tiene varios asentamientos en los bosques internos, hizo buenas migas con algunos pueblos feéricos y con eso hizo retroceder al elfo loco. No sería un problema si solo manejara goblins: el tema son los trols. Y odia a los Grandes Fauces porque dice que las montañas le pertenecen. Hace años le ofrecieron parte de las riquezas y de las montañas para calmar las Asperezas, y él quería todo.\n\nAhí también queda asentado el cambio de nombre. El clan de Krenko era Garra de Hierro, pero de acá en adelante son los Garra de Hielo, que es como los venía anotando Jeremy, y el nombre se quedó.",
      dialogo: [
        { quien: "El orco viejo", texto: "¿Cuáles son sus asuntos, viajeros?" },
        { quien: "Haddrek", texto: "Son mis compañeros. Son de confianza. No me considero orco puro." },
        {
          quien: "El orco viejo",
          texto: "¿Y por qué quieren ver a Caltor? Si es posible saber, tengo que anunciarlos antes.",
        },
        {
          quien: "Haddrek",
          texto:
            "Omán me mandó a reunir las hordas para recuperar la fortaleza del volcán, que fue tomada hace poco. Fue tomada desde adentro.",
        },
        {
          quien: "El orco viejo",
          texto:
            "Lamento escuchar eso. Necesitan más orcos dentro de esa fortaleza. Claramente los humanos no son lo suficiente. Menos si los hombres con tentáculos en las caras se despiertan.",
        },
        {
          quien: "El orco viejo",
          texto: "Si Omán está preocupado, el problema debe ser más grande de lo que dice. Si no, Omán se encargaría personalmente.",
        },
        {
          quien: "El orco viejo",
          texto: "Hellgate no puede ser tomado por un ejército. No podés matar lo que ya está muerto.",
        },
        {
          quien: "El orco viejo",
          texto:
            "Los elfos, en su codicia, quisieron armar un ejército. Mezclaron muertos con magia para hacer lo que mora en esos lugares. Y ahora rinden tributo al elfo loco de los Picos Perdidos.",
        },
        {
          quien: "El orco viejo",
          texto:
            "Se dice que ya tendría que haber muerto de viejo. Hay quienes dicen que a este incluso lo han apuñalado, lo han empalado y lo han decapitado. Y poco tiempo después lo han visto en el campo de batalla.",
        },
        {
          quien: "El orco viejo",
          texto: "No sería ningún problema si solamente fuesen goblins. El tema es que los trols que maneja son otra cuestión.",
        },
      ],
    },
    {
      titulo: "Un justiciero y un cobrador de impuestos",
      texto:
        "La entrada de la fortaleza son dos cabezas de orco enormes talladas en la roca a los costados de una gruta, con una explanada adelante y un gran brasero al que llaman el fuego eterno. Ahí los dejan esperando.\n\nMedia hora después sale el caudillo. Caltor es mucho más grande y más corpulento que el resto, lleva dos estandartes flameando en la espalda y viene arrastrando una espada ancha enorme, usándola de bastón como si fuera un viejo cualquiera.\n\nLa conversación empieza con la fortaleza del volcán y sigue con la propuesta grande: unir los clanes, recuperar Hellgate y asentar ahí a todos juntos como una nación, en vez de seguir dispersos. Y entonces Caltor hace la pregunta que va a atravesar la sesión entera. De ustedes cuatro, quién es el líder. Le contestan que no hay. Que están los cuatro en el mismo rango y que cada uno aporta lo mejor que tiene. A un orco eso no le entra: en batalla se necesita una voz, alguien lleva el estandarte, las órdenes las da uno solo y los demás obedecen.\n\nEntonces les pide a cada uno sus habilidades. Iscandar dice que es un buscador de justicia. Haddrek es el cobrador de impuestos y la fuerza. Jeremy dice que es el escriba, que es curioso y que su idea es empezar a llenar el mundo de historia. Vaegrant contesta con lo único que tiene, que es la palabra, y Caltor lo resume mejor que ninguno de ellos.\n\nLo que le hace cambiar la cara no es el discurso: es enterarse de que a ellos también les tomaron su casa. Y lo que termina de cerrarlo es el nombre de Gonagal Crestarroja, que le mandó a decir que consideraría saldada su deuda si los recibía.\n\nAntes de dar su palabra les cuenta lo que faltaba, que es lo peor. Los enanos de los Pasos de Fuego se juntaron con los gnomos de Anrok y fabricaron maquinaria. Esa maquinaria empezó a formar voluntades propias y se armó en ejércitos. Eso es lo que protege Hellgate hoy, además de los muertos: no comen, no duermen, no descansan y tienen una sola orden, matar a todos los elfos. Media horda de goblins de Krenko cayó en el primer escalón. A los Grandes Fauces los interceptaron a mitad de camino cuando iban a socorrerlos, y llegaron un día tarde, y por eso Krenko cree que lo abandonaron.\n\nCaltor da su palabra igual. Doscientos orcos bien armados adentro de la fortaleza, y a lo largo de la cadena montañosa, entre varios estandartes y varios clanes, unos dos mil. El punto de reunión es la Nidada, en el centro de los grandes bosques.\n\nY deja una advertencia de regalo, dicha como al pasar: hace mucho tiempo vino un hombre con las mismas intenciones que ellos, un marino de alta alcurnia que decía tener un ejército y quería tomar Hellgate para sí mismo y gobernar todo el High Forest. Se llamaba Trobe. No le creyó, ni a él ni a su carta.",
      dialogo: [
        { quien: "Caltor", texto: "Mis hombres dicen que me buscan. Y al que buscan encuentra, aquí estoy. ¿Quién es el que viene en nombre de Iron Keep?" },
        { quien: "Caltor", texto: "El viejo no supo mantener la paz en el volcán, por lo que entiendo. Y buscan juntar los clanes para que nos encarguemos de sus problemas." },
        { quien: "Caltor", texto: "Y de ustedes cuatro, ¿quién es el líder de su grupo? ¿Quién es su general o su capitán?" },
        { quien: "Haddrek", texto: "No hay un líder, no hay un capitán. Estamos los cuatro en el mismo rango. Aprovechamos lo mejor de cada uno." },
        { quien: "Caltor", texto: "En batalla se necesita un líder, una voz. Alguien siempre lleva un estandarte. Las órdenes las doy yo y ellos obedecen." },
        { quien: "Jeremy", texto: "Digamos que soy más que nada el escriba. Soy curioso y escribo de los lugares, de la gente. Mi idea es empezar a llenar el mundo de la historia." },
        { quien: "Vaegrant", texto: "¿Cuántos elfos llegan hasta acá con buenas intenciones?" },
        { quien: "Vaegrant", texto: "Yo me puedo encargar con mi palabra de que todo lo que le proponemos va a ser cumplido." },
        { quien: "Caltor", texto: "Un justiciero, un cobrador de impuestos y dos hombres que hablan y escriben. Parece el principio de un mal chiste." },
        { quien: "Caltor", texto: "Ese enano ama la cerveza y las máquinas como nada en la vida. Hay una sola cosa que ama más que la cerveza y las máquinas, y es aplastar elfos. ¿Por qué no lo lastimó a usted?" },
        { quien: "Caltor", texto: "Entre enanos y gnomos hicieron algunas maquinarias. Esas maquinarias comenzaron a formar ciertas voluntades y se formaron ejércitos." },
        { quien: "Caltor", texto: "No comen, no duermen, no descansan. Tienen una sola orden: matar a todos los elfos." },
        { quien: "Caltor", texto: "Surgieron desde abajo de la tierra. No teníamos forma de verlas. Se desenterraron, nos machacaron. Llegamos un día tarde." },
        { quien: "Caltor", texto: "Los Grandes Fauces marcharán a la guerra de Hellgate. De eso no cabe duda. Esa es mi palabra." },
        { quien: "Caltor", texto: "Hace mucho tiempo atrás vino un hombre con las mismas intenciones que ustedes. Pero tenía algo su palabra que me daba mala espina. Un marino de alta alcurnia. Trobe. No confié en él. Ni en su carta." },
      ],
    },
    {
      titulo: "Llueven latas de atún",
      texto:
        "Pasan la noche adentro de la montaña, viendo cómo la tropa se prepara: cada soldado ajustando sus armas, su armadura, su mantenimiento. A la madrugada suena un cuerno grande y los jinetes de jabalí empiezan a montar.\n\nY con los primeros rayos del sol aparece en el horizonte una bruma que no es bruma. Es una nube gris, centelleante, que va tirando rayos a los costados y que viene derecho hacia ellos. Es el Albatros, que llegó antes de tiempo y de la peor manera posible.\n\nLos orcos reaccionan como corresponde: en la explanada del fuego eterno ya hay diez balistas preparadas y arpones listos, y arriba hay una tormenta que no baja. Vaegrant sale afuera a tratar de razonar con Gunnlod y no le da resultado, porque Gunnlod tiene el cuerpo de una chica de dieciséis años y los modales que van con eso. Empieza a soplar una ventisca. Y después empiezan a caer latas de atún del cielo.\n\nVan a despertar a Iscandar, que estaba durmiendo en la cueva y que es el único al que ella le dice padre. Iscandar sale a la explanada de mal humor, dice una sola palabra, y el viento cesa enseguida. La tormenta se disipa de a poco y los orcos ven bajar un barco del cielo, que se estaciona suspendido a cinco pies del piso, con los barriles formados en la proa.\n\nCaltor mira eso y saca la única conclusión que le interesa. No es el barco lo que lo impresiona: es que el barco obedeció.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Lo que vos ves es una gran nube gris, centelleante, que va arrojando rayos a los costados.",
        },
        { quien: "Vaegrant", texto: "Los de acá abajo son nuestros aliados. No los asustes. Te están apuntando. Tranquila." },
        { quien: "Gunnlod", texto: "Tienen que ver lo que es el poder. Me están apuntando, que disparen." },
        { quien: "Master", texto: "Caen al menos un d6 de latas de atún." },
        { quien: "Iscandar", texto: "Basta." },
        { quien: "Master", texto: "Ante la palabra basta, el viento cesa enseguida." },
        { quien: "Caltor", texto: "Tienen mucho más poder del que yo pensaba." },
        { quien: "Caltor", texto: "Usted dijo basta. La tormenta cesó. El barco le obedece." },
        { quien: "Caltor", texto: "Es un magnífico poder el que tienen acá. Y así entiendo que usted es el capitán." },
        { quien: "Iscandar", texto: "Lo soy y no lo soy." },
        { quien: "Caltor", texto: "Se parecen a las máquinas que he visto en High Forest, pero esta es diferente. Y tiene un fantasma." },
      ],
    },
    {
      titulo: "Alguien tiene que mandar",
      texto:
        "Adentro del barco pasa la conversación que le da el nombre a la sesión. Iscandar le explica a Gunnlod lo que nadie le había dicho hasta ahora: que los otros tres no son sus hermanos. Que ella tiene que obedecerlos a ellos también, y que ellos van a tener que dejar de tratarla como a una amiga. Que a veces toman decisiones discutibles, pero que son buenas personas y son responsables, y que de ahora en adelante el poder se muestra cuando él lo diga y de la forma en que él lo diga.\n\nElla lo entiende a su manera. Un rato después, mientras Haddrek afila armas en cubierta, aparece a preguntarle por qué las afila si el padre dijo que no iban a combatir, se le apoya contra el costado porque no le llega a la cintura, y se va a buscarle un vaso de agua fresca. Cuando termina de tomarla siente el abrazo y siente el arrepentimiento: ella sola se dio cuenta de que se pasó.\n\nEl resto del barco sigue su propia vida. Spinel, el pseudodragón de Vaegrant, la tiene entretenida a media máquina: ella lo persigue por todo el barco preguntando qué come, qué le gusta y qué usa de cubierto. El retoño feérico se comió la sala de máquinas entera, enraizado en todo, con florcitas luminosas como una madreselva. Y Caja juega al ajedrez con Iscandar y sostiene con calma que la niña le dijo que estaba haciendo trampa.\n\nAntes de salir queda cerrado lo único que faltaba. Caltor no puede ir a hablar con Krenko, porque si aparece él no hay negociación posible: el odio es contra el jefe, no contra el clan. Así que escribe una carta de puño y letra, en caligrafía orca y en idioma goblin. No es una rendición: es un cese al fuego y el ofrecimiento de sentarse cara a cara, él y Krenko, sin generales de por medio, en un lugar totalmente neutral. El lugar neutral lo pone el grupo, y es su barco.",
      dialogo: [
        { quien: "Gunnlod", texto: "Mis hermanos me gritan." },
        { quien: "Iscandar", texto: "No son tus hermanos. Ellos no me tienen que obedecer a mí. Vos me tenés que obedecer a mí, y vos los tenés que obedecer a ellos." },
        {
          quien: "Iscandar",
          texto:
            "Sé que a veces son un poco locos y tal vez toman decisiones que uno podría juzgar imbéciles, pero son muy buenas personas y son muy responsables. Tienen que dejar de verte como una amiga.",
        },
        { quien: "Iscandar", texto: "Pero alguien tiene que mandar." },
        { quien: "Gunnlod", texto: "Pero padre dijo que no íbamos a combatir. ¿Y para qué afilamos las armas?" },
        { quien: "Haddrek", texto: "Para que estén preparadas para el combate." },
        { quien: "Caja", texto: "Me dijo la niña que me hiciste trampa." },
        { quien: "Caltor", texto: "Si voy yo directamente, ya no tendría ninguna chance de negociar." },
        {
          quien: "Caltor",
          texto:
            "Estoy dispuesto a dar una carta. No de rendición, sino de tregua. Que estoy dispuesto a sentarme a hablar con Krenko, y no con uno de sus generales, cara a cara, en un lugar totalmente neutral.",
        },
      ],
    },
    {
      titulo: "Un hermoso día para morir",
      texto:
        "Vuelan ocho horas en línea derecha, cruzando las Montañas de las Estrellas hacia el bosque profundo. Abajo aparecen los cúmulos de arboledas y después los huecos en el piso: crestas de piedra con cavernas que bajan desde la misma tierra. Es la Nidada. Hay estandartes, hay banderas, y hay restos de batalla que se vuelven más frecuentes cuanto más se adentran.\n\nLa primera que se da cuenta es Gunnlod. No le gusta, y no es por los restos. Siente mucha muerte abajo, y no vieja: dice que todavía hay gente muriendo bajo tierra, y que puede sentir el sufrimiento. Se mete en la sala de máquinas y la madera blanca del barco empieza a ponerse gris y a petrificarse.\n\nDespués es Caja. Deja el ajedrez a mitad de partida, se para, mira para un costado y sale corriendo a cubierta volteando el tablero, con ocho o diez barriles detrás. Lo que avisa no es lo que esperaban: hay un barco que no puede ver, tiene el alma de fuego y está cerca. Y pide armas.\n\nHaddrek se cuelga del palo mayor a izar la bandera pirata mientras Caja organiza la artillería y arma la gran balista. Y entonces la tierra se abre. Humanoides de metal brillante empiezan a desenterrarse por todos lados, algunos se fusionan entre ellos para formar cosas más grandes, otros despliegan alas, otros se clavan en el suelo como artillería fija.\n\nTiran la bengala. La bengala estalla en el cielo y no ilumina nada: abre un vórtice de fuego que se agranda hasta volverse un portal, y por ahí baja la panza de la Tortuga Veloz. Los dos barcos quedan a la misma altura, y Benetton los saluda sacándose el sombrero, con toda su artillería a la vista.\n\nLa sesión corta ahí, con la frase del vampiro en el aire y la batalla para la próxima.",
      dialogo: [
        { quien: "Gunnlod", texto: "Esto no me gusta. Siento mucha muerte abajo." },
        { quien: "Gunnlod", texto: "No, todavía la hay. Hay gente muriendo bajo tierra. Puedo sentir su sufrimiento." },
        { quien: "Caja", texto: "Hay un barco que no puedo ver y tiene el alma de fuego. Está cerca." },
        { quien: "Caja", texto: "Pero, capitán, creo que tenemos que portar armas." },
        { quien: "Iscandar", texto: "Preparen las armas. ¿Quién tiene la bengala?" },
        {
          quien: "Master",
          texto:
            "Desde la tierra ustedes ven que la tierra comienza a removerse y algunas especies de humanoides de brillante metal comienzan a desenterrarse. Algunos de ellos comienzan a mezclarse formando cosas más grandes.",
        },
        {
          quien: "Master",
          texto:
            "La bengala ilumina el cielo y cuando estalla se forma un vórtice de fuego que se agranda cada vez más.",
        },
        { quien: "Iscandar", texto: "Buenas noches, Benetton. Preparado para divertirse." },
        { quien: "Benetton", texto: "Este es un hermoso día para morir." },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Caltor",
      rol:
        "El caudillo de los Grandes Fauces del High Forest. Enorme, con dos estandartes flameando en la espalda y una espada ancha que arrastra como bastón. No entiende un grupo sin capitán y lo pregunta tres veces. Dio su palabra de marchar sobre Hellgate sin pedir nada a cambio más que liberar el bosque, aporta dos mil orcos repartidos en varios clanes y escribió de su puño la carta de tregua para Krenko. Tenía una deuda pendiente con Gonagal Crestarroja y la dio por saldada al recibirlos.",
    },
    {
      nombre: "El orco viejo de la trenza canosa",
      rol:
        "El jinete que los frenó a la entrada del asentamiento, montado en un jabalí de combate acorazado. Se rió del veinte de diplomacia de Haddrek y después regaló medio mundo: que Hellgate no se toma con un ejército, que los elfos mezclaron muertos con magia pesada para armar el suyo, que al elfo loco lo apuñalaron, lo empalaron y lo decapitaron y volvió, y que los trols de Krenko son el verdadero problema.",
    },
    {
      nombre: "El elfo loco de los Picos Perdidos",
      rol:
        "El que sostiene solo una guerra que terminó hace mucho. Túnica blanca y celeste, enojado con todo, vivo mucho después de lo que le corresponde. Los muertos de Hellgate le rinden tributo, y mientras él no caiga nada se mueve en el High Forest. Nadie de los que hablaron con el grupo sabe su nombre.",
    },
    {
      nombre: "La tribu Forel",
      rol:
        "La tribu más renombrada del Cryptic Garden: ciento veinte habitantes, noventa por ciento humanos, paredes de barro y techos de paja, recolección y caza. Indican dónde acampar, piden control con el fuego y con la caza, y le dejan ofrendas a Vaegrant en silencio porque en las planicies y en los grandes bosques todavía se honra la memoria de los elfos.",
    },
    {
      nombre: "Los Garra de Hielo",
      rol:
        "El clan de Krenko, que hasta esta sesión se llamaba Garra de Hierro. Goblins y trols con asentamientos repartidos por los bosques internos. Hicieron buenas migas con pueblos feéricos y con eso hicieron retroceder al elfo loco. Odian a los Grandes Fauces porque creen que los abandonaron en Hellgate, cuando en realidad las máquinas los interceptaron a mitad de camino y llegaron un día tarde.",
    },
    {
      nombre: "Las máquinas de los Pasos de Fuego",
      rol:
        "Lo que de verdad defiende Hellgate. Los enanos de los Pasos de Fuego se juntaron con los gnomos de Anrok y fabricaron maquinaria; la maquinaria formó voluntades propias y se organizó en ejércitos. No comen, no duermen, no descansan y tienen una sola orden, matar a todos los elfos. Salen de abajo de la tierra sin aviso, se fusionan entre ellas para formar cosas más grandes, algunas vuelan y otras son artillería fija.",
    },
    {
      nombre: "La Nidada",
      rol:
        "El punto de encuentro que dio Caltor, en el centro de los grandes bosques: una gran extensión boscosa con crestas de piedra y cavernas que bajan desde la misma tierra. Cuando el grupo llegó había estandartes, banderas y restos de batalla cada vez más presentes, gente muriendo bajo tierra y las máquinas esperando.",
    },
    {
      nombre: "La Tortuga Veloz",
      rol:
        "El barco de John Arthur Benetton, que apareció cuando lo llamaron con la bengala. La bengala no era una bengala: abrió un vórtice de fuego que se agrandó hasta ser un portal, y la Tortuga bajó por ahí con toda su artillería a la vista. Benetton sabe cuándo están en peligro a través de Gunnlod, que es más sensible que el resto.",
    },
  ],
  dudas: [
    "El caudillo llamó Danza de Plata al drow de Waterdeep, y en la Sesión 9 Crestarroja lo había nombrado capitán Lanza de Plata. La crónica se queda con Lanza de Plata hasta que el Master confirme cuál es.",
    "Los Grandes Fauces aparecen ahora en tres lugares distintos: el estandarte que Telgar le dio a Haddrek en las orillas de los volcanes, el pueblo fortaleza de la ruta comercial cerca de Puerto Corona y el clan de Caltor en las Montañas de las Estrellas. Nadie preguntó si es el mismo estandarte repartido o tres cosas que se llaman igual.",
    "Trobe ya había pasado por acá antes que ellos, diciendo que tenía un ejército y queriendo tomar Hellgate para sí mismo y gobernar todo el High Forest. Caltor no le creyó ni a él ni a su carta. Del viejo zorro no se sabe nada desde Ámbar.",
    "Crestarroja no contestó la araña. Le pidieron que venga con tecnología para detectar o paralizar las máquinas antes del amanecer, y la araña llegó pero no volvió con respuesta.",
    "Caltor tiene amigos en el Bosque Lejano, pasando el río después del High Forest: elfos forestales y pacíficos a los que el elfo loco les arruina la reputación. Quedó dicho que se podría navegar los ríos y buscar apoyo ahí, y nadie lo tomó todavía.",
    "El caudillo dijo que alguien los está dejando transitar el Mar de las Espadas, y que muy probablemente los estén vigilando. Es la segunda vez que alguien les dice lo mismo sin que lo pregunten.",
    "La carta de tregua está escrita y sin entregar. Krenko todavía no sabe que existe, y entre ellos y Krenko acaban de aparecer las máquinas.",
  ],
};

data.cronica.push(sesion10);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "El Cryptic Garden (Sesión 10)",
    tipo: "Sesión 10 · entre Waterdeep y el High Forest",
    texto:
      "El bosque donde todavía hay paz sin que nadie sepa explicar por qué. Árboles enormes rodeados de árboles menores, charcos de agua pura y tribus que viven en armonía, la más renombrada la tribu Forel. La caza está permitida y el abuso no; el fuego está permitido bajo control estricto, porque los árboles son aceitosos y un descuido prende todo. Se acampa en los Veinte Picos, unas formaciones rocosas afiladas en círculo que hace mucho fueron templo de un dios olvidado y que hoy no son lugar sagrado ni reservado, solo el mejor lugar para parar: descampado, a ciento cincuenta pies del primer árbol y con una vista linda.",
    destacado: false,
  },
  {
    nombre: "El puente de piedra y las torres gemelas (Sesión 10)",
    tipo: "Sesión 10 · el único paso al norte",
    texto:
      "El único lugar por donde se cruza sin meterse al agua ni pagarle a una barcaza. Es largo y tiene una torre en cada punta, las torres gemelas, con Red Larch en el medio, que ya no es un pueblo sino una fortaleza en ruinas donde descansan los guardias. Los guardias son coraceros con mosquetes. No hay peaje, no revisan carros, no piden papeles y no preguntan nada: levantan la barrera y miran pasar. Nadie en el camino sabe decir qué están cuidando. Del otro lado de la segunda torre ya empieza el territorio del High Forest.",
    destacado: false,
  },
  {
    nombre: "La fortaleza del fuego eterno (Sesión 10)",
    tipo: "Sesión 10 · los Grandes Fauces de Caltor",
    texto:
      "El asentamiento de los Grandes Fauces está escarbado en las Montañas de las Estrellas, al sur de los Picos Perdidos. La entrada es una gruta con dos cabezas de orco enormes talladas en la roca a los costados, y adelante una explanada con un gran brasero que llaman el fuego eterno. Las chozas están mejor fabricadas de lo que un orco suele permitirse y la organización es notablemente más civilizada: horas de entrenamiento, de descanso, de comida, de mantenimiento y de lectura. Doscientos orcos bien armados adentro de la fortaleza y unos dos mil a lo largo de la cadena montañosa, repartidos en varios estandartes y varios clanes.",
    destacado: false,
  },
  {
    nombre: "Lo que de verdad defiende Hellgate (Sesión 10)",
    tipo: "Sesión 10 · las máquinas que se desentierran",
    texto:
      "Los muertos de Hellgate son el problema conocido y no son el peor. Los enanos de los Pasos de Fuego se juntaron con los gnomos de Anrok, en las Montañas de Fuego, y fabricaron maquinaria; esa maquinaria empezó a formar voluntades propias y terminó organizada en ejércitos. Hoy son lo que queda protegiendo Hellgate. No comen, no duermen, no descansan y tienen una sola orden, matar a todos los elfos. Salen de abajo de la tierra sin que haya forma de verlas venir, se fusionan entre ellas para formar cosas más grandes, algunas vuelan y otras se clavan en el suelo como artillería fija. Media horda de goblins de Krenko cayó en el primer escalón, y a los Grandes Fauces los machacaron a mitad de camino cuando iban a socorrerlos.",
    destacado: true,
  },
  {
    nombre: "La guerra que ya terminó (Sesión 10)",
    tipo: "Sesión 10 · el High Forest y el elfo loco",
    texto:
      "La guerra del High Forest no está pasando: pasó, y los elfos la perdieron hace mucho. Lo que queda son focos de resistencia sostenidos por un solo hombre, un elfo de túnica blanca y celeste que vive en los Picos Perdidos, enojado con todo, que sigue peleando por pura devoción a la guerra. Los muertos que los elfos levantaron mezclando cadáveres con magia pesada le rinden tributo a él. Se dice que ya tendría que haber muerto de viejo, y que lo apuñalaron, lo empalaron y lo decapitaron, y poco después volvieron a verlo en el campo de batalla. Mientras él no caiga, el bosque no vuelve.",
    destacado: true,
  },
  {
    nombre: "La Nidada (Sesión 10)",
    tipo: "Sesión 10 · el centro de los grandes bosques",
    texto:
      "El punto de encuentro que puso Caltor para juntar las fuerzas. Una gran extensión boscosa con cúmulos de arboledas y huecos en el piso: crestas de piedra con cavernas que bajan desde la misma tierra. Hay estandartes y banderas, y restos de batalla que se vuelven más presentes cuanto más se entra. Gunnlod, que es la más sensible del barco, avisó lo que ninguno podía ver: que no es muerte vieja, que hay gente muriendo bajo tierra mientras pasan por arriba.",
    destacado: false,
  },
  {
    nombre: "El Bosque Lejano (Sesión 10)",
    tipo: "Sesión 10 · pasando el río, después del High Forest",
    texto:
      "Donde Caltor tiene un par de amigos. Los elfos del Bosque Lejano son pacíficos y forestales, y tienen algo contra el elfo loco de los Picos Perdidos por la misma razón que todos: les arruina la reputación. Se llega navegando los ríos, y quedó dicho que ahí se podría buscar apoyo. Nadie fue todavía.",
    destacado: false,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
// Pines nuevos, ubicados a ojo sobre el mismo mapa de Faerûn, como el resto.
const marcadoresNuevos = [
  {
    id: "cryptic-garden",
    nombre: "Cryptic Garden",
    x: 14.2,
    y: 16.2,
    tipo: "hito",
    sesiones: [10],
    estado: "confirmado",
    nota:
      "Primera parada saliendo de Waterdeep. Bosque de árboles enormes con tribus que viven en armonía, la más renombrada la tribu Forel. Se acampa en los Veinte Picos, un círculo de formaciones rocosas que fue templo de un dios olvidado. Acá le dejaron ofrendas a Vaegrant en silencio: en los grandes bosques todavía se honra la memoria de los elfos.",
  },
  {
    id: "puente-piedra",
    nombre: "El puente de piedra",
    x: 17.1,
    y: 16.3,
    tipo: "hito",
    sesiones: [10],
    estado: "confirmado",
    nota:
      "El único paso al norte sin meterse al agua. Una torre en cada punta, las torres gemelas, y Red Larch en el medio, hoy una fortaleza en ruinas donde descansan los guardias. Coraceros con mosquetes que no cobran peaje, no revisan nada y no preguntan nada. Del otro lado ya empieza el High Forest.",
  },
  {
    id: "fauces-estrellas",
    nombre: "Los Grandes Fauces (Montañas de las Estrellas)",
    x: 21.5,
    y: 17.1,
    tipo: "hito",
    sesiones: [10],
    estado: "aproximado",
    nota:
      "La fortaleza escarbada en la montaña del caudillo Caltor, al sur de los Picos Perdidos. Entrada de gruta con dos cabezas de orco talladas en la roca y una explanada con el fuego eterno. Doscientos orcos adentro y unos dos mil a lo largo de la cadena montañosa. Dieron su palabra de marchar sobre Hellgate.",
  },
  {
    id: "picos-perdidos",
    nombre: "Los Picos Perdidos",
    x: 21.2,
    y: 13.4,
    tipo: "hito",
    sesiones: [10],
    estado: "confirmado",
    nota:
      "La fortaleza de los elfos, y donde vive el elfo loco que sostiene solo una guerra que terminó hace mucho. Túnica blanca y celeste. Los muertos que los elfos levantaron con magia pesada le rinden tributo a él.",
  },
  {
    id: "la-nidada",
    nombre: "La Nidada",
    x: 23.8,
    y: 14.1,
    tipo: "hito",
    sesiones: [10],
    estado: "aproximado",
    nota:
      "El punto de encuentro que puso Caltor, en el centro de los grandes bosques: crestas de piedra con cavernas que bajan desde la tierra. Estandartes, banderas y restos de batalla. Acá se cortó la Sesión 10, con las máquinas saliendo del suelo y la Tortuga Veloz bajando por un portal de fuego.",
  },
  {
    id: "bosque-lejano",
    nombre: "El Bosque Lejano",
    x: 28.6,
    y: 10.7,
    tipo: "hito",
    sesiones: [10],
    estado: "aproximado",
    nota:
      "Pasando el río, después del High Forest. Elfos forestales y pacíficos, con los que Caltor tiene un par de amigos. Se llega navegando los ríos y todavía nadie fue a buscar ese apoyo.",
  },
];

const idsExistentes = new Set(data.mapa.marcadores.map((m) => m.id));
const marcadoresAgregados = marcadoresNuevos.filter((m) => !idsExistentes.has(m.id));
data.mapa.marcadores.push(...marcadoresAgregados);

for (const id of ["waterdeep", "hellgate", "gran-arbol-padre"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(10)) m.sesiones.push(10);
}

data.mapa.rutas.push({
  sesion: 10,
  estado: "recorrido",
  puntos: ["waterdeep", "cryptic-garden", "puente-piedra", "fauces-estrellas", "la-nidada"],
});

data.mapa.party = {
  marcadorId: "la-nidada",
  texto:
    "Fin de la Sesión 10: en el aire sobre la Nidada, arriba de un combate que todavía no empezó. Abajo hay máquinas desenterrándose y gente muriendo bajo tierra; al lado, a la misma altura de cielo, la Tortuga Veloz de Benetton con la artillería a la vista. Atrás quedan dos mil orcos de Caltor con su palabra dada y una carta de tregua para Krenko sin entregar. Crestarroja no contestó la araña. Pendiente: el elfo loco de los Picos Perdidos, los amigos del Bosque Lejano, y quién manda cuando empiece la batalla.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 10 agregada al canon:");
console.log(`  capítulos  : ${sesion10.capitulos.length}`);
console.log(`  diálogo    : ${sesion10.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres    : ${sesion10.nombres.length}`);
console.log(`  dudas      : ${sesion10.dudas.length}`);
console.log(`  lugares    : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log(`  marcadores : +${marcadoresAgregados.length} (total ${data.mapa.marcadores.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
