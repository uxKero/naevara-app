// Suma la Sesión 12 de Silvapor al canon: data/vaegrant.json → cronica[],
// más Bosque Plano y la sala de Krenko como lugares y marcador, la ruta y la
// posición del grupo.
//
// Fuente: sources/Vaegrant/Sesion 12 (13 audios, 2 h 42 min, transcriptos con
// ElevenLabs) y la foto de la posición inicial del combate que mandó Alan.
//
// Confirmado con Alan antes de escribir:
//   · el que fue a cortar madera con los barriles y trajo los tablones fue
//     Iscandar; Vaegrant vio la sombra cuando venía detrás de él;
//   · las emociones de Gunnlod y la capa gélida son de Haddrek, que es el
//     que usa el tricornio;
//   · Pyros se fue con Benetton, su capitán, al terminar el combate. No hubo
//     cicatriz que anotar.
//
// Uso: node scripts/patch-vaegrant-sesion12.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

if ((data.cronica || []).some((s) => s.id === "sesion-12")) {
  console.log("La crónica ya tiene 'sesion-12'. Nada que hacer.");
  process.exit(0);
}

// ── 1. Crónica ───────────────────────────────────────────────────
const sesion12 = {
  id: "sesion-12",
  numero: 12,
  titulo: "Esto lleva adentro",
  fecha: "2026-09-29",
  resumen:
    "La primera ola llega al Recodo antes de que el Albatros pueda levantarse: turbas de autómatas que suben al barco y llegan hasta la burbuja de Gunnlod. Los echan con Pyros y Benetton de su lado y con Caja y los barriles hechos pedazos. Pasan la noche reparando, y algo de humo y oscuridad, más alto que cualquiera de ellos, les trae tablones y a la mañana les limpia el casco. Gunnlod despierta y tiene con el grupo la conversación más difícil desde que existe. Spinel vuelve con el mapa de la batalla, un goblin trae el plan de Krenko, y a la noche, mientras dos mil orcos cargan cuesta abajo, Vaegrant y Jeremy bajan una palanca en una sala de banquetes vacía y un carro minero se los lleva hacia adentro de la montaña.",
  capitulos: [
    {
      titulo: "Turbas",
      texto:
        "No llegan a terminar el descanso. Los enemigos que vieron caer al Albatros llegan al Recodo antes de que el barco pueda despegarse del piso, y no vienen de a uno: son turbas, autómatas que pelean en bloque, tres de frente y varias filas detrás, y que pegan con la fuerza de todas las filas juntas. Cada uno que cae le resta fuerza al resto, y la única manera de aflojarlos es meterles daño hasta que quede nada más que la primera línea.\n\nDel lado del grupo pelean también Pyros y Benetton. Pyros no distingue amigo de enemigo: cuando se lanza, el ataque cae de frente, de costado o donde el grupo decida, y en el primer turno casi se lleva puesto a uno de los suyos. Lo frenan con una tirada de voluntad y queda pegado al enemigo sin atacar. Más adelante pega el salto y cae en el medio de la turba como una bola de fuego, gritando que se corran.\n\nIscandar canaliza su divinidad, pega, y con el escudo empuja y tira al piso a lo que tiene enfrente. Vaegrant marca con Maleficio y dispara Eldritch Blast desde arriba, porque no está para el cuerpo a cuerpo. Prueba con la Presencia Feérica cuando lo rodean y no sirve de nada: son autómatas, y pasan solos cualquier salvación de Sabiduría. Lo que sí funciona es la Armadura de Agathys: cada uno que le pega de cerca se come el frío.\n\nLas turbas no se quedan afuera. Abordan, se desparraman por todo el barco y paran en seco las reparaciones. Iscandar ordena a Caja y a los barriles a sus puestos de combate, porque hay polizones. Caja termina con dos puntos de vida y los barriles pierden a la mayoría. Una de las turbas atraviesa las defensas y empieza a golpear la burbuja donde duerme Gunnlod. Iscandar corre hasta la cabina, se planta entre ella y ellos en defensa total, y aguanta con nueve puntos de vida.\n\nCuando la turba del medio pierde a suficientes, se quiebra y se retira, y las demás se dispersan. Terminan de rematar a los pocos que quedan. A lo lejos, Benetton sigue peleando con algo bastante más grande, para que nada más venga hacia ellos. Cuando termina, Pyros se va con él. Es su capitán.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "No es un muchacho, son una turba. Cuando pongo peanas abajo, representa que son grupos. No son swarm, son grupos.",
        },
        {
          quien: "Master",
          texto:
            "Uno, dos o tres, ataque frontal. Cuatro, cinco o seis, ataque al lateral. No diferencia amigo de enemigo. Siete, ocho, deciden ustedes el objetivo.",
        },
        {
          quien: "Master",
          texto:
            "No te va a servir. Son autómatas. Todo lo que tenga salvación de Sabiduría la pasan automáticamente.",
        },
        { quien: "Iscandar", texto: "¡Caja, barriles, a sus puestos de combate! ¡Hay polizones!" },
        { quien: "Iscandar", texto: "¡Salgan de mi barco!" },
        {
          quien: "Master",
          texto:
            "Las cosas atraviesan tu defensa y empiezan a tratar de romper el huevo donde está Gunnlod.",
        },
      ],
    },
    {
      titulo: "Chatarra y madera",
      texto:
        "El panorama después de la pelea es malo. Caja está hecho pedazos, quedan muy pocos barriles y el barco está lleno de chatarra. Gunnlod es el combustible del Albatros y sufre el mismo daño que el barco, así que no alcanza con curarla a ella: hay que reparar la mecánica entera. Caja calcula toda la noche y parte del día siguiente, con doble turno y con los pocos que quedan, y pide madera de buena calidad.\n\nSe reparten. Revisando la cubierta juntan diez piezas de chatarra: engranajes y repuestos para Caja y los barriles. Cada barril nuevo pide tres de chatarra y dos de madera, y para volver a levantarlos hace falta además la magia de Gunnlod, que les devuelve el aliento. Haddrek arma su equipo de herrero afuera, porque en un barco de madera no se prende fuego, y se pasa la noche martillando engranajes como un poseído, en cuero, negro de hollín. A los primeros martillazos todos piensan lo mismo: el ruido puede atraer algo. Es un riesgo calculado. Los van a encontrar igual.\n\nIscandar se lleva a los barriles a un robledal cercano. Talan el mejor roble, arman dos horquetas con las ramas y montan un banco de trabajo para descortezar y sacar tablas. Tienen el conocimiento y no la calidad: sirve para emparchar, no para reparar.\n\nVaegrant, que venía de mandar a Spinel a volar alto hacia la batalla para ver qué pasaba, ya le había mandado antes del combate una araña a Crestarroja pidiendo ayuda. No hubo respuesta. O no puede contestar, o no quiere.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Gunnlod solamente es el combustible de este barco. Pero sufre el mismo daño que el barco.",
        },
        {
          quien: "Master",
          texto:
            "El panorama es el siguiente: Caja está hecho mierda, barriles le quedan muy pocos y el barco está todo lleno de chatarra.",
        },
        {
          quien: "Master",
          texto:
            "Tienen el conocimiento para hacerlo. Aun así no pueden lograr la calidad necesaria. Para emparchar sirve.",
        },
      ],
    },
    {
      titulo: "La sombra",
      texto:
        "Mientras los barriles cortan, Iscandar mira la ladera de la montaña y ve una sombra que no debería estar ahí, por dónde está la luna. Está parada, al costado de una saliente de piedra, y mide unos dos metros quince. Se corre un poco de su línea de visión y sigue trabajando. La cosa se dio cuenta de que están ahí y no parece importarle. Después flota por el piso hasta la roca, corre la piedra como si fuera un manto y la atraviesa.\n\nIscandar descansa con los barriles trabajando y a las cuatro de la mañana se despierta de golpe, porque no quería quedarse dormido. Ya hay un buen acopio de tablas. Se carga dos, pesadas y resbalosas, y cuando se endereza escucha algo detrás: la cosa está a diez pies, removiendo la tierra como si buscara algo. Lo mira y sigue en lo suyo. Iscandar aplica la regla que le queda: si no me jode, no lo jodo.\n\nLo que él no ve es lo que ve Vaegrant desde el campamento cuando Iscandar vuelve con los tablones: la sombra viene detrás. Más tarde baja de la misma polvareda por la que bajó él, trae cuatro tablones, los deja en el camino sin acercarse, se da vuelta y se va.\n\nIscandar lo cuenta y nadie le cree del todo. Es un ser de oscuridad pura y humo, y él está muy seguro de lo que vio. Vinieron en un barco que vuela y de un portal salió otro barco manejado por un vampiro: a esta altura cualquier cosa es posible.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Ves una sombra al costado de una saliente de piedra y te llama la atención. La sombra mide más o menos unos dos metros quince de altura.",
        },
        { quien: "Iscandar", texto: "He visto suficientes películas de terror." },
        {
          quien: "Master",
          texto:
            "Ves cómo se mueve, flotando en el piso, llegando a un lugar. Y ves que corre la piedra como si fuese un manto y atraviesa la piedra.",
        },
        {
          quien: "Master",
          texto:
            "Una sombra de dos metros trae cuatro tablones, los deja en el camino, no se acerca, se da vuelta y se va.",
        },
        {
          quien: "Jeremy",
          texto:
            "Desde el momento en que nos subimos a un barco que vuela se abre cualquier posibilidad.",
        },
      ],
    },
    {
      titulo: "Soldado o esclavo",
      texto:
        "A las seis de la tarde el barco cruje y se levanta. Queda estable a treinta pies del piso otra vez. Gunnlod está despierta, callada y cansada, sin el brillo de siempre.\n\nIscandar se sienta al lado de ella y le pregunta si se acuerda de lo que le dijo: no buscar riesgos más allá de los que uno puede manejar. Ella le contesta con lo que para ella es obvio. No perciben el tiempo como ellos: mientras ellos nacen y mueren y vuelven a nacer, ella cumple un año. Lo que ellos llaman guerra, para ella es un juego. Y Trobe no le dijo lo mismo; Trobe la alentaba a pelear. Iscandar le pregunta dónde está Trobe ahora. Nadie sabe. Porque golpeaba primero y preguntaba después, y eso es muy divertido hasta que alguien paga con su vida. Le dice que hoy es un poco más adulta, y se va a acostar.\n\nVaegrant baja. Le dice que el capitán tiene razón, pero que la próxima vez que haya que pelear se imagine que son barquitos pesqueros, y que no se contenga: si ella cae y no la pueden levantar, también muere. Ella le contesta que al pesquero no le pegó con todas sus fuerzas, y que la última vez que hizo eso terminó destruida en el muelle de Trobe. El volcán del norte, dice, ahora lo llaman el Pico de Hielo.\n\nY después viene la pregunta. Si tiene que atacar cuando se lo piden, se transforma en lo que ellos llaman esclava. Vaegrant le dice que es parte del equipo: que así como ellos atacan y la defienden, ella ataca y los defiende, y que si el capitán le dice a él que ataque, él ataca. Ella le pregunta cuál es la diferencia entre un esclavo y un soldado, y si los soldados que no quieren estar ahí son esclavos o soldados. Vaegrant no tiene una respuesta limpia. Le dice que depende de quién los mande, que ellos son un equipo y que alcanza con eso, y le promete que va a jugar mucho con el gatito.\n\nGunnlod le señala la pared. En la madera hay algo como unas fauces cerradas. Vaegrant pasa el dedo entre los dientes, las fauces se abren, sale una lengua y escupe a Spinel, que se sacude la baba. Durante la batalla el pseudodragón volvió volando y quedó expuesto, y Astrid, el espíritu del retoño que vive en la sala de máquinas, lo agarró con sus ramas y lo guardó. Gunnlod le tiene cariño. Él no se sabe defender.",
      dialogo: [
        { quien: "Iscandar", texto: "¿Te acordás lo que te dije de no buscar riesgos más allá de los que uno puede lidiar?" },
        {
          quien: "Gunnlod",
          texto:
            "Nosotros no percibimos el tiempo como ustedes. Mientras ustedes nacen y mueren y vuelven a nacer y morir, es igual a que yo cumpla un solo año.",
        },
        { quien: "Gunnlod", texto: "Lo que ustedes llaman guerra, para nosotros es un juego." },
        { quien: "Gunnlod", texto: "Trobe me alentaba a pelear." },
        {
          quien: "Iscandar",
          texto:
            "¿Y dónde está Trobe ahora? Nadie sabe. Porque golpea primero y pregunta después. Eso es muy divertido hasta que alguien paga con su vida.",
        },
        {
          quien: "Vaegrant",
          texto:
            "Para la próxima que estemos así en peligro y haya que pelear, vos imaginate que son barquitos pesqueros.",
        },
        {
          quien: "Gunnlod",
          texto: "La última vez que hice eso, terminé destruida en el muelle de Trobe. El volcán del norte ahora lo llaman el Pico de Hielo.",
        },
        { quien: "Gunnlod", texto: "Me transformo prácticamente en lo que ustedes llaman esclavo." },
        { quien: "Vaegrant", texto: "Sos parte del equipo. Así como nosotros atacamos y te defendemos, vos atacás y nos defendés." },
        { quien: "Gunnlod", texto: "¿Y cuál es la diferencia entre un esclavo y un soldado entonces?" },
        { quien: "Gunnlod", texto: "¿Y los soldados que no quieren estar ahí son esclavos o son soldados?" },
        {
          quien: "Vaegrant",
          texto: "Depende de quién los mande. En nuestro caso, somos un equipo y eso es suficiente.",
        },
        { quien: "Gunnlod", texto: "Astrid lo guardó para que nada le pase. Él no se sabe defender." },
      ],
    },
    {
      titulo: "Lo que vio Spinel",
      texto:
        "Spinel le cuenta a Vaegrant, en ideas y en imágenes, todo lo que vio desde arriba. Tres máquinas gigantes, del tamaño del barco pero paradas, destruyendo a otras máquinas. Goblins, trols y algunos orcos resistiendo y replegándose hacia un hueco en la tierra, y las tres gigantes de su lado, cubriéndoles la retirada. Las máquinas enemigas no son todas iguales: hay unas mejor protegidas, otras de puro metal, otras más rápidas y estilizadas que disparan desde muy lejos, y en el aire algunas que no vuelan sino que saltan y planean. Barcos, ninguno, salvo el de Benetton.\n\nEl grupo grande está a unos dos kilómetros y medio de la boca de la tierra y uno más chico a medio kilómetro. Todo eso queda a veintidós kilómetros del Recodo: Spinel hizo el viaje de ida y ya no volvió.\n\nVaegrant le hace una última pregunta: si vio a algún enano de barba toda roja. Lo vio. Adentro de las máquinas gigantes. Crestarroja no contestaba la araña porque estaba ocupado.",
      dialogo: [
        { quien: "Spinel", texto: "Vi tres máquinas gigantes." },
        { quien: "Vaegrant", texto: "Definime gigante." },
        { quien: "Spinel", texto: "Del tamaño de este barco, pero paradas, no acostadas." },
        {
          quien: "Spinel",
          texto:
            "Vi goblins, trols y algunos orcos resistiendo en combate, replegándose a un hueco en la tierra. Estas tres cosas gigantes parecían estar a favor de los orcos, cubriendo la retirada.",
        },
        { quien: "Vaegrant", texto: "¿Viste a algún enano con una barba toda roja?" },
        { quien: "Spinel", texto: "Adentro de las máquinas gigantes." },
      ],
    },
    {
      titulo: "El mensajero de Krenko",
      texto:
        "Después del almuerzo se escucha un motorcito. Una polvareda con humo blanco viene del lado de la batalla y un artilugio a vapor frena al lado del barco. Se baja un goblin joven, se saca un sombrero abultado y unas antiparras, y grita desde abajo que tiene un mensaje para el capitán. Sube por la escala, pide permiso para abordar, y descalzo y firme le entrega el pergamino a Iscandar.\n\nEs de Krenko. Vio el aterrizaje del Albatros y sabe que hay un cara blanca llamado Benetton ayudando. La batalla los favorece: el repliegue hacia las fauces de la montaña es falso, para que las máquinas crean que van ganando, y para tenerlas a todas juntas en ese lugar cuando caigan los orcos que vienen cabalgando. Todavía no saben quién llamó a la tropa, pero los están apoyando. La contraofensiva empieza casi a la noche. El goblin no sabe pelear y no sabe nada de la batalla: memoriza, escribe y comunica, y nada más.\n\nLe mandan una araña a Caltor con el plan: Krenko se replegó falsamente a las cavernas, se contraataca de noche, y es una pinza, los que están adentro con los que están afuera. Se encuentran en una meseta alta para ver la batalla.\n\nGunnlod no está para pelear, y lo sabe. Le gustaría, pero no está. Iscandar le deja dicho a Caja que, si hay riesgo, gire por la zona de batalla y escape hacia donde vinieron. Vaegrant se lleva a Spinel. Y a Durin le mandan otra araña sin esperar respuesta: lo insulta al principio, en el medio y al final, le cuenta que hicieron todo lo que les pidió y mucho más, y que conocieron a Crestarroja, que es mucho más divertido que él.",
      dialogo: [
        { quien: "El mensajero", texto: "¡Al capitán! Mensaje al capitán." },
        { quien: "El mensajero", texto: "Permiso para abordar, capitán." },
        {
          quien: "El mensajero",
          texto:
            "Estamos siendo favorecidos. Retrocedimos hacia las fauces de la montaña para que piensen que van ganando. Queremos tenerlos a todos en ese lugar para cuando caigan los orcos que vienen cabalgando.",
        },
        {
          quien: "El mensajero",
          texto: "Yo solo soy un mensajero. Memoricé lo que están diciendo. No sé pelear. Solo sé hablar.",
        },
      ],
    },
    {
      titulo: "La capa gélida",
      texto:
        "Van en los Fast Boy hasta la meseta que los goblins de Krenko llaman Bosque Plano, en la última parte de las Montañas de las Estrellas. Desde ahí, a tres kilómetros, se ve la explanada donde las máquinas se reorganizan. Están las que ya los atacaron y otras nuevas: algunas que ni siquiera tocan la tierra, flotan; otras más chicas y más altas; otras que se mimetizan con el ambiente. Y un par de artilugios muy parecidos a Caja están armando algo grande.\n\nHaddrek tira voluntad con un veinte y, a través del tricornio, siente cinco cosas de Gunnlod a la vez: miedo, sorpresa, bienestar, cosquillas y al final tranquilidad. Nunca le pasó así, siempre fue una por vez. Se saca el tricornio y no siente nada. Vuelve al barco a ver qué pasa, y lo que ven al llegar es a la sombra, con un cepillo, limpiándole el casco al Albatros. Cuando se da cuenta de que la miran, les clava un fulgor rojizo desde las órbitas, exhala un humo blanco, junta sus cosas y se va.\n\nGunnlod está bien. Se asustó, nada más. Pero Haddrek está al borde del colapso, y ella sale de su burbuja y le pone encima una capa de hielo que no enfría. Es una capa gélida: le da más uno a todas las salvaciones, lo hace inmune al miedo y dura veinticuatro horas.\n\nDe la sombra saben poco más. Manipula la realidad de forma natural, no como un mago. No es feérica. Hay muy pocas razas que la conocen, y ninguno de ellos es de esas razas.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Sentís una mezcla de sabores en la cabeza. Primero sentís un poco de miedo. Después sentís sorpresa. Después sentís algo como bienestar y cosquillas. Y después sentís tranquilidad.",
        },
        {
          quien: "Haddrek",
          texto:
            "Acaba de pasar por cinco sentimientos de golpe. No es normal. Suelo pasar de uno a otro, pero no cinco a la vez.",
        },
        {
          quien: "Master",
          texto:
            "Cuando se percata de ustedes, los mira intensamente y alcanzan a ver un fulgor rojizo de sus órbitas oculares, y exhala un humo blanco. Junta sus cosas y se va.",
        },
        { quien: "Gunnlod", texto: "Ahora me siento bien. Pero me pegó un susto." },
      ],
    },
    {
      titulo: "La sala de Krenko",
      texto:
        "Al lado de la meseta está lo que los goblins llaman el Culo de Gusano: una entrada alternativa a las minas de Krenko que no se usa hace mucho. Respira, entra y sale una ventisca, así que sigue conectada con las minas. Adentro hay un pasillo de veinte metros con antorchas apagadas, y después una puerta.\n\nVaegrant manda a Spinel treinta metros adentro y mira por sus ojos. Es un salón de banquetes, una recepción, no tan ostentosa como para reyes. Todo servido y nunca servido: platos, copas dadas vuelta, manteles, tierra y telarañas, cinco años sin visitas. En la punta opuesta, la silla del mandamás, y detrás un cofre viejo con la llave colgada del respaldo. Spinel trae la llave.\n\nEntran Vaegrant y Jeremy. La vajilla es de plata, y cada plato, cada cubierto y cada silla están numerados, salvo el de la punta, que dice Krenko en común. El cofre tiene un centro de mesa y un montón de antorchas nuevas. Hay dos puertas de laja de piedra sin mecanismo a la vista, con algo escrito en goblin. Jeremy lanza su ritual de idiomas: una dice esto lleva adentro, la otra esto lleva afuera. No hay palanca en ninguna pared. Vaegrant llama a uno de los de afuera para que lo ayude a forzarlas, y el que resuelve es él: pone el centro de mesa, un cuerno retorcido con frutitas, en su lugar de la mesa, y las dos puertas se abren a la vez. No son pasillos: son cubículos para tres o cuatro personas. Es un ascensor. Al rato el cuerno vibra y vomita fruta fresca.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "Este salón, a simple vista, parece que en algo más de cinco años no ha tenido visita alguna. No es un lugar muy ostentoso, no digno de un rey, pero aquellos que han comido y han bebido en estos lugares seguro han encontrado un buen cobijo.",
        },
        {
          quien: "Master",
          texto: "Hay dos puertas. Una dice: esto lleva adentro. Y la otra dice: esto lleva afuera.",
        },
        { quien: "Master", texto: "Es un ascensor. Esto es goblin." },
      ],
    },
    {
      titulo: "Esto lleva adentro",
      texto:
        "Llegando la noche, en el horizonte aparece la caballería verde. Vienen despacio, preparándose para cargar, con los tambores de los orcos y los cuernos. Las dos primeras filas son lanceros y las tres siguientes, martilladores, y los lanceros también llevan el martillo a la espalda. El plan es simple: cargar lo más rápido posible, sacar los martillos y martillar todo lo que se mueva. No hay plan B. Caltor va en la tercera fila, entre los martilladores. Vinieron también Gorko y Morko, a ver quién gana la apuesta: uno apostó a favor del grupo y el otro en contra.\n\nAl frente hay un caudillo que ninguno vio nunca, que les saca dos cabezas a Gorko y a Morko. Armadura completa, con parches de colores, un color por cada clan. Es el campeón de todos, y da la arenga final con voz de bestia: el que vuelva sin sangre en los nudillos no merece volver.\n\nIscandar se saca la toga, se queda con la armadura de cuero, la espada y el símbolo sagrado, y le grita a los orcos si alguien quiere sangre. Haddrek se va con los lanceros, con el hacha, y con la bandera de Omán en una de sus jabalinas.\n\nVaegrant y Jeremy toman la puerta que dice que lleva adentro. Adentro hay una sola palanca. Vaegrant se cubre con la Armadura de Agathys por las dudas y la baja. Suenan tres cosas, un clanc, un cric y un chasquido, y algo se desengancha. Las paredes se abren y se dan cuenta de que están arriba de un carro minero, que empieza a tomar velocidad hacia abajo, hacia adentro, quién sabe hacia dónde.\n\nLa sesión corta ahí. La próxima empieza con el mapa: elegir un camino sin saber adónde lleva.",
      dialogo: [
        {
          quien: "Master",
          texto:
            "La estrategia es muy simple. Cargar lo más rápido posible y sacar los martillos y martillar todo lo que se mueva. Plan simple, fácil de ejecutar. No hay estrategia y no hay plan B.",
        },
        {
          quien: "Master",
          texto:
            "Tiene la armadura como si tuviese parches de diferentes colores, y cada color es un clan diferente. Sería el campeón de todo.",
        },
        { quien: "Iscandar", texto: "Who wants blood?" },
        {
          quien: "Master",
          texto:
            "Ustedes escuchan un clanc, un cric y un slash. Tres sonidos que indican que algo se desenganchó. Las paredes se abren y se dan cuenta que están montados sobre un carro minero.",
        },
        { quien: "Master", texto: "Hacia adentro. Quién sabe hacia dónde. Muy goblin." },
      ],
    },
  ],
  nombres: [
    {
      nombre: "Las turbas de autómatas",
      rol:
        "Las máquinas que atacaron el Recodo. No pelean de a una: son grupos en bloque, tres de frente y varias filas, que suman la fuerza de cada fila al golpe y la van perdiendo a medida que caen. Pasan solas cualquier salvación de Sabiduría. Cuando pierden a suficientes se quiebran y se dispersan.",
    },
    {
      nombre: "La sombra",
      rol:
        "Un ser de oscuridad pura y humo de unos dos metros quince, con un fulgor rojizo en las órbitas, que atraviesa la roca corriéndola como un manto. Le trajo tablones al grupo y le limpió el casco al Albatros con un cepillo. No es feérica, manipula la realidad sin ser maga y muy pocas razas la conocen. No les hizo nada.",
    },
    {
      nombre: "Astrid",
      rol:
        "El espíritu del retoño feérico que vive en la sala de máquinas. Cuando la defensa de Gunnlod baja, es ella la que protege. Atrapó a Spinel con sus ramas en plena batalla y lo guardó adentro del barco, en unas fauces de madera que solo ella usa.",
    },
    {
      nombre: "El mensajero de Krenko",
      rol:
        "Un goblin joven que llega en un artilugio a vapor, con sombrero abultado y antiparras, descalzo. Memoriza, escribe y comunica, y no sabe nada más de la batalla. Trajo el plan: el repliegue de Krenko es falso y la contraofensiva empieza de noche.",
    },
    {
      nombre: "El campeón de los clanes",
      rol:
        "El caudillo orco que encabeza la carga, sin nombre todavía. Les saca dos cabezas a Gorko y a Morko, lleva armadura completa con parches de colores, uno por cada clan, y dio la arenga final antes de la carga.",
    },
    {
      nombre: "Las máquinas gigantes",
      rol:
        "Tres máquinas del tamaño del Albatros, paradas, que destruyen a las otras y cubren la retirada de goblins, trols y orcos. Spinel vio adentro a un enano de barba toda roja.",
    },
  ],
  dudas: [
    "Spinel vio a un enano de barba toda roja adentro de las máquinas gigantes. Todo apunta a Crestarroja, que nunca contestó la araña, pero nadie lo vio de cerca.",
    "Krenko todavía no sabe quién llamó a la tropa que los está apoyando.",
    "Gunnlod dijo que la última vez que peleó con todas sus fuerzas terminó destruida en el muelle de Trobe, y que al volcán del norte ahora lo llaman el Pico de Hielo. Nadie le preguntó qué pasó.",
    "El grupo junta cabos sobre los velas negras: el drow tendría el motor del hermano de Gunnlod y estaría haciendo un cañón. No saben dónde, ni cómo tienen barcos chicos que vuelan, ni cómo llegaron tan rápido con tanta fuerza. Alguien los vendió o los están siguiendo.",
    "La sombra no es feérica y casi nadie la conoce. Por qué ayuda, y qué busca removiendo la tierra, no se sabe.",
    "Un par de artilugios muy parecidos a Caja están armando algo grande en la explanada de las máquinas.",
    "El carro minero baja hacia adentro de las minas de Krenko y no saben adónde lleva. Iscandar y Haddrek van con la carga de afuera.",
  ],
};

data.cronica.push(sesion12);

// ── 2. Mundo: lugares nuevos ─────────────────────────────────────
const lugares = [
  {
    nombre: "Bosque Plano y el Culo de Gusano (Sesión 12)",
    tipo: "Sesión 12 · la meseta sobre la batalla",
    texto:
      "La meseta que los goblins de Krenko llaman Bosque Plano, en la última parte de las Montañas de las Estrellas, a tres kilómetros de la explanada donde se reorganizan las máquinas. Al lado está el Culo de Gusano, una entrada alternativa a las minas de Krenko que no se usa hace años y que respira: una ventisca entra y sale, así que sigue conectada. Hay restos de animales de caza y todo está salvaje.",
    destacado: false,
  },
  {
    nombre: "La sala de recepción de Krenko (Sesión 12)",
    tipo: "Sesión 12 · adentro del Culo de Gusano",
    texto:
      "Un salón de banquetes goblin sin visitas hace cinco años, servido y nunca usado: vajilla de plata, platos, cubiertos y sillas numerados, y el lugar de la punta con el nombre de Krenko en común. Un cofre con antorchas y un centro de mesa, un cuerno retorcido que al ponerlo en su lugar abre dos puertas de laja y después vomita fruta fresca. Las puertas dicen en goblin esto lleva adentro y esto lleva afuera, y son cubículos de un ascensor que baja en carro minero.",
    destacado: true,
  },
];
data.mundo.lugares.push(...lugares);

// ── 3. Mapa ──────────────────────────────────────────────────────
const marcadoresNuevos = [
  {
    id: "bosque-plano",
    nombre: "Bosque Plano",
    x: 24.9,
    y: 13.9,
    tipo: "hito",
    sesiones: [12],
    estado: "aproximado",
    nota:
      "La meseta sobre la batalla, a tres kilómetros de las máquinas y a unos veintidós del Recodo. Al lado, el Culo de Gusano, la entrada vieja a las minas de Krenko, con su sala de banquetes y el ascensor que baja en carro minero.",
  },
];

const idsExistentes = new Set(data.mapa.marcadores.map((m) => m.id));
const marcadoresAgregados = marcadoresNuevos.filter((m) => !idsExistentes.has(m.id));
data.mapa.marcadores.push(...marcadoresAgregados);

for (const id of ["el-recodo", "la-nidada"]) {
  const m = data.mapa.marcadores.find((x) => x.id === id);
  if (m && !m.sesiones.includes(12)) m.sesiones.push(12);
}

data.mapa.rutas.push({
  sesion: 12,
  estado: "recorrido",
  puntos: ["el-recodo", "bosque-plano"],
});

data.mapa.party = {
  marcadorId: "bosque-plano",
  texto:
    "Fin de la Sesión 12: la carga de los orcos arranca cuesta abajo desde Bosque Plano, con Iscandar y Haddrek en ella. Vaegrant y Jeremy van en un carro minero que baja hacia adentro de las minas de Krenko por el ascensor de la sala de banquetes. El Albatros quedó atrás, reparado a medias, con Gunnlod sin fuerzas para pelear y Caja con orden de escapar si hay riesgo. Krenko finge la retirada para cerrar la pinza desde adentro.",
};

// ── 4. Escribir ──────────────────────────────────────────────────
await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("Sesión 12 agregada al canon:");
console.log(`  capítulos  : ${sesion12.capitulos.length}`);
console.log(`  diálogo    : ${sesion12.capitulos.reduce((n, c) => n + (c.dialogo?.length ?? 0), 0)} líneas`);
console.log(`  nombres    : ${sesion12.nombres.length}`);
console.log(`  dudas      : ${sesion12.dudas.length}`);
console.log(`  lugares    : +${lugares.length} (total ${data.mundo.lugares.length})`);
console.log(`  marcadores : +${marcadoresAgregados.length} (total ${data.mapa.marcadores.length})`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
