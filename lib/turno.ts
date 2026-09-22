// ════════════════════════════════════════════════════════════════
//  El flujo de un combate, armado con los números reales de la hoja
//
//  No es texto fijo: sale de las acciones que el personaje tiene
//  cargadas y de sus valores derivados, así que si sube de nivel o
//  cambia hechizos, el plan cambia solo.
//
//  La idea es contestar cuatro preguntas en orden:
//    1. ¿Tengo que hacer algo ANTES de que empiece?
//    2. ¿Cómo entro? (iniciativa)
//    3. ¿Qué hago el primer turno y qué hago los demás?
//    4. ¿Qué número tengo que superar yo y qué tienen que superar ellos?
// ════════════════════════════════════════════════════════════════
import type { CombatAction } from "./combatData";
import { ABILITY_ES, type Derived } from "./srd";

export interface Paso {
  titulo: string;
  que: string;
  porque?: string;
  tirada?: string;
  ojo?: string;
}

export interface PlanTurno {
  resumen: string;
  antes: Paso[];
  iniciativa: Paso;
  abre: Paso[];
  sostiene: Paso[];
  aprietos: Paso[];
  superar: { titulo: string; texto: string }[];
  avisos: string[];
}

// ── helpers ─────────────────────────────────────────────────────

const esAccion = (a: CombatAction) => /^acci[oó]n$/i.test(a.accion.trim());
const esBonus = (a: CombatAction) => /adicional|bonificaci/i.test(a.accion);
const aVoluntad = (a: CombatAction) => /truco|voluntad|gratis/i.test(a.coste) || !a.usaEspacio;

/** Daño medio de una acción, para elegir cuál es "el ataque de todos los turnos". */
function danoMedio(a: CombatAction): number {
  const rayos = a.tirada.tipo === "ataque" ? a.tirada.rayos ?? 1 : 1;
  const porGolpe = (a.danos ?? []).reduce((s, d) => {
    if (d.flat !== undefined) return s + d.flat;
    return s + d.cantidad * ((d.caras + 1) / 2) + (d.modificador ?? 0);
  }, 0);
  return porGolpe * rayos;
}

function textoDano(a: CombatAction): string {
  return (a.danos ?? [])
    .map((d) =>
      d.flat !== undefined
        ? `${d.flat} de ${d.tipo}`
        : `${d.cantidad}d${d.caras}${d.modificador ? `+${d.modificador}` : ""} de ${d.tipo}`
    )
    .join(" más ");
}

function textoTirada(a: CombatAction): string | undefined {
  const t = a.tirada;
  if (t.tipo === "ataque") {
    const rayos = t.rayos ?? 1;
    return `1d20 ${t.bonus >= 0 ? "+" : ""}${t.bonus} contra la CA del objetivo${
      rayos > 1 ? `, una vez por cada uno de los ${rayos} rayos` : ""
    }. Empatar la CA ya es pegar.`;
  }
  if (t.tipo === "salvacion") return `No tirás vos: tira el otro. Salvación de ${t.stat} contra CD ${t.cd}. Si saca menos, ${t.fallo}`;
  if (t.tipo === "especial") return t.texto;
  return t.nota;
}

// ── el plan ─────────────────────────────────────────────────────

export function construirTurno(
  acciones: CombatAction[],
  derived: Derived,
  opts: { nivel: number; clase: string; concentraUna: boolean }
): PlanTurno {
  const conDano = acciones.filter((a) => (a.danos ?? []).length > 0);

  // El ataque de todos los turnos: el que más pega sin gastar recursos.
  const repetible = conDano
    .filter((a) => esAccion(a) && aVoluntad(a))
    .sort((x, y) => danoMedio(y) - danoMedio(x))[0];

  // Lo que se prepara antes: se pone sobre uno mismo, dura, y no le pide
  // nada a nadie (ni tirada de ataque ni salvación del enemigo).
  const preparables = acciones.filter(
    (a) => !a.concentracion && a.usaEspacio && /hora|minuto/i.test(a.duracion ?? "") && a.tirada.tipo === "ninguna"
  );

  // Lo que se enciende con acción adicional y multiplica el resto del combate.
  const encendido = acciones.filter((a) => esBonus(a) && (a.concentracion || a.usaEspacio));

  // Control: obligan a una salvación.
  const control = acciones
    .filter((a) => a.tirada.tipo === "salvacion")
    .sort((x, y) => (x.usaEspacio === y.usaEspacio ? 0 : x.usaEspacio ? 1 : -1));

  const familiar = acciones.filter((a) => a.grupo === "familiar");
  const reacciones = acciones.filter((a) => a.grupo === "reaccion");

  // El brujo es la única clase que recupera espacios con descanso corto.
  const recuperaEnCorto = opts.clase === "warlock";

  const slotsTxt = Object.entries(derived.slots)
    .filter(([, n]) => n > 0)
    .map(([lv, n]) => `${n} de nivel ${lv}`)
    .join(" y ");

  // ── antes de que empiece ──
  const antes: Paso[] = [];
  for (const a of preparables) {
    antes.push({
      titulo: a.nombre,
      que: `Lanzalo antes de entrar, no adentro del combate. Dura ${a.duracion}.`,
      porque:
        "Gastar tu acción del primer turno en algo que podías tener puesto de antes es el error más caro que existe. Si sabés que se viene pelea, ya tiene que estar encima.",
      tirada: textoTirada(a),
      ojo: a.ojo,
    });
  }
  const porDescanso = acciones.filter((a) => !a.usaEspacio && /descanso/i.test(a.coste)).map((a) => a.nombre);
  antes.push({
    titulo: "Contá lo que te queda",
    que: `Mirá cuántos espacios tenés sin usar (${slotsTxt || "ninguno"})${
      porDescanso.length ? ` y si te queda ${porDescanso.join(", ")}` : ""
    }. Si venís de pelear y no descansaste, entrás con menos de lo que creés.`,
    porque: recuperaEnCorto
      ? "Tus espacios vuelven con un descanso CORTO, que son dos horas. Es la ventaja grande de tu clase y casi siempre se olvida: si hay margen antes de entrar, pedí el descanso."
      : "Tus espacios vuelven con un descanso LARGO, así que lo que gastás hoy no vuelve hasta mañana. Elegí en qué pelea vale la pena gastarlos.",
  });

  // ── iniciativa ──
  const iniciativa: Paso = {
    titulo: "Tirá iniciativa",
    que: "Lo primero que pide el Master cuando algo se rompe. Define el orden de todos los turnos de la pelea.",
    tirada: `1d20 ${derived.initiative >= 0 ? "+" : ""}${derived.initiative}. No se supera ningún número: solo se ordena de mayor a menor.`,
    porque:
      "Si sacás alto te conviene encender lo que dure (marcar un objetivo) antes de que te peguen. Si sacás bajo, ya vas a haber comido daño, así que fijate si conviene ponerte a cubierto o curarte primero.",
  };

  // ── primer turno ──
  const abre: Paso[] = [];
  if (encendido.length) {
    const a = encendido[0];
    const dura = (a.duracion ?? "").replace(/^Concentración,\s*hasta\s*/i, "").trim();
    const suma = textoDano(a);
    abre.push({
      titulo: `Acción adicional: ${a.nombre}`,
      que: `Gastás un espacio y ${a.concentracion ? "quedás concentrado" : "queda puesto"}${
        dura ? `, hasta ${dura}` : ""
      }.${suma ? ` Suma ${suma} cada vez que le pegás a ese objetivo.` : ""}`,
      porque:
        "Va con acción adicional, así que no te come la acción: en el mismo turno lo encendés Y atacás. Por eso va primero y por eso va en el turno uno, para que sume en todos los golpes que siguen.",
      tirada: textoTirada(a),
      ojo: a.concentracion
        ? "Elegí bien el objetivo: moverlo a otro cuesta otra acción adicional, y solo cuando el primero cae a 0."
        : a.ojo,
    });
  }
  if (repetible) {
    abre.push({
      titulo: `Acción: ${repetible.nombre}`,
      que: `Tu ataque de siempre. ${textoDano(repetible)}${
        encendido.length ? ", más lo que sume lo que acabás de encender" : ""
      }.`,
      porque:
        "No gasta espacios, o sea que lo podés repetir toda la pelea. Todo lo demás que tenés es para cuando este no alcanza.",
      tirada: textoTirada(repetible),
    });
  }
  abre.push({
    titulo: "Movimiento",
    que: `Tenés ${Math.round((derived.speed * 0.3) / 1.5) * 1.5} metros y los podés partir: un poco antes de atacar y un poco después.`,
    porque:
      "Moverte no cuesta acción. Si tu ataque es a distancia, lo que querés es tener línea de visión y quedarte lejos del cuerpo a cuerpo; si te pegan mientras estás concentrado, podés perder lo que encendiste.",
  });

  // ── turnos siguientes ──
  const sostiene: Paso[] = [];
  if (repetible) {
    sostiene.push({
      titulo: `Repetí ${repetible.nombre}`,
      que: "Mismo ataque, mismo objetivo, hasta que caiga o hasta que la situación cambie.",
      porque:
        "Concentrar el daño en un enemigo por vez es lo que gana peleas: un enemigo a la mitad de vida pega igual que uno entero, uno muerto no pega nada.",
      tirada: textoTirada(repetible),
    });
  }
  if (control.length) {
    sostiene.push({
      titulo: `Cambiá a control cuando convenga: ${control.map((c) => c.nombre).join(", ")}`,
      que: "Cuando hay muchos encima, o cuando pegarle a uno no resuelve nada, usá lo que los obliga a tirar salvación.",
      porque:
        "Estos no fallan contra la CA: fallan contra la salvación del otro. Sirven justo cuando el enemigo tiene CA alta y tus ataques no entran.",
      tirada: `Todos contra tu CD de hechizos: ${derived.spellSaveDC ?? "sin CD"}.`,
    });
  }
  if (familiar.length) {
    sostiene.push({
      titulo: "Tu familiar",
      que: "Puede moverse, explorar, entregar cosas y darte sus sentidos siempre. Para que ataque, la regla es específica.",
      porque:
        "El Pacto de la Cadena deja que ataque solo si vos usás la acción de Atacar y renunciás a uno de tus ataques. Un truco no es la acción de Atacar, así que si tu turno fue lanzar un truco, el familiar ese turno no pega.",
      ojo: "Tiene poquísima vida. Mantenelo lejos del cuerpo a cuerpo y usalo para ver, no para pelear.",
    });
  }
  if (reacciones.length) {
    sostiene.push({
      titulo: `Guardá la reacción: ${reacciones.map((r) => r.nombre).join(", ")}`,
      que: "La reacción es una por ronda y se usa fuera de tu turno, cuando se dispara la condición.",
      porque: "Si la gastás a la primera oportunidad, no la tenés para la que importaba.",
    });
  }

  // ── cuando se complica ──
  const aprietos: Paso[] = [
    {
      titulo: "Te pegaron y estabas concentrado",
      que: `Tirá salvación de Constitución. La CD es 10, o la mitad del daño que recibiste si eso da más alto.`,
      tirada: `1d20 ${derived.saves.find((s) => s.key === "con")!.valor >= 0 ? "+" : ""}${
        derived.saves.find((s) => s.key === "con")!.valor
      } contra esa CD.`,
      porque:
        "Si fallás, se te cae lo que tenías encendido y perdiste el espacio. Por eso conviene no estar al alcance de nadie mientras sostenés algo.",
    },
    {
      titulo: "Te rodearon",
      que: "Antes de salir corriendo, acordate de que salir del alcance de un enemigo le regala un ataque de oportunidad.",
      porque:
        "Para irte sin comer ese ataque tenés que usar la acción de Retirada, que te come el turno entero. A veces conviene más quedarse y pegar.",
    },
    {
      titulo: "Llegaste a 0 de vida",
      que: "Caés inconsciente y a partir de tu turno tirás salvaciones de muerte: 1d20 pelado, sin sumar nada. Diez o más es éxito, nueve o menos es fallo. Tres éxitos te estabilizan, tres fallos te matan.",
      ojo: "Un 1 natural cuenta doble fallo y un 20 natural te levanta con 1 punto de vida. Si te pegan estando caído, eso es un fallo automático, y si es cuerpo a cuerpo son dos.",
    },
  ];

  // ── qué se supera ──
  const superar: { titulo: string; texto: string }[] = [];
  if (derived.spellAttack !== null) {
    superar.push({
      titulo: "Lo que tenés que superar vos",
      texto: `Cuando atacás con magia tirás 1d20 ${derived.spellAttack >= 0 ? "+" : ""}${derived.spellAttack} y tenés que igualar o pasar la CA del enemigo. El Master no te la dice: la vas deduciendo por lo que entra y lo que no. Un 20 natural pega siempre y duplica los dados de daño; un 1 natural falla siempre.`,
    });
  }
  if (derived.spellSaveDC !== null) {
    superar.push({
      titulo: "Lo que tienen que superar ellos",
      texto: `Cuando usás algo que pide salvación, el número fijo es tu CD de hechizos: ${derived.spellSaveDC}. Ellos tiran 1d20 más su modificador de esa característica y tienen que llegar a ${derived.spellSaveDC} o más. Si llegan, resisten; si no, se comen el efecto. Vos no tirás nada.`,
    });
  }
  superar.push({
    titulo: "Lo que te tienen que superar a vos",
    texto: `Tu CA es ${derived.ac}. Ellos pegan si su tirada la iguala o la pasa. Cuando el Master tira contra vos y pregunta "¿te pega un ${derived.ac}?", la respuesta es sí.`,
  });
  superar.push({
    titulo: "Cuando el Master te pide una prueba",
    texto: `Tirás 1d20 y sumás lo que dice la pestaña de Mis números para esa habilidad o esa salvación. Tus salvaciones fuertes son ${derived.saves
      .filter((s) => s.competente)
      .map((s) => `${ABILITY_ES[s.key]} ${s.valor >= 0 ? "+" : ""}${s.valor}`)
      .join(" y ")}: son las que te van a pedir contra hechizos y contra miedo. En las otras cuatro no sumás competencia, así que ahí sos vulnerable.`,
  });

  // ── avisos ──
  const avisos: string[] = [];
  if (opts.concentraUna) {
    const conc = acciones.filter((a) => a.concentracion).map((a) => a.nombre);
    if (conc.length > 1) {
      avisos.push(
        `Concentración: solo una a la vez. Tenés ${conc.length} cosas que la piden (${conc.join(", ")}), y lanzar la segunda apaga la primera sin devolverte el espacio.`
      );
    }
  }
  if (slotsTxt) {
    avisos.push(
      recuperaEnCorto
        ? `Espacios: ${slotsTxt}. Vuelven con descanso corto, así que no los guardes para nunca, pero tampoco los tires todos en el primer turno.`
        : `Espacios: ${slotsTxt}. Vuelven recién con descanso largo: lo que gastás hoy no lo tenés en la pelea siguiente.`
    );
  }
  const totalSlots = Object.values(derived.slots).reduce((s, n) => s + n, 0);
  if (totalSlots > 0 && preparables.length && encendido.length && totalSlots <= preparables.length + encendido.length) {
    avisos.push(
      `Cuentas: tenés ${totalSlots} espacio${totalSlots === 1 ? "" : "s"} en total. Si preparás ${preparables[0].nombre} antes de entrar y encendés ${encendido[0].nombre} en el primer turno, ya los gastaste todos y el resto de la pelea la peleás solo con ${repetible ? repetible.nombre : "lo que no gasta espacios"}. Está bien que sea así: para eso están.`
    );
  }
  if (repetible) {
    avisos.push(`Regla de oro: ${repetible.nombre} es gratis e infinito. Todo lo que gasta espacio es para cuando ${repetible.nombre} no alcanza.`);
  }

  const resumen = repetible
    ? `Nivel ${opts.nivel}. Preparás lo que dure antes de entrar, tirás iniciativa con ${
        derived.initiative >= 0 ? "+" : ""
      }${derived.initiative}, y el combate es ${
        encendido.length ? `encender ${encendido[0].nombre} con la acción adicional y ` : ""
      }repetir ${repetible.nombre} con la acción, sobre un solo enemigo por vez.`
    : `Nivel ${opts.nivel}. Preparás antes de entrar, tirás iniciativa y repartís cada turno entre una acción, una acción adicional y tu movimiento.`;

  return { resumen, antes, iniciativa, abre, sostiene, aprietos, superar, avisos };
}
