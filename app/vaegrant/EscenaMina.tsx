"use client";

// La escena de adentro, armada con el arte del juego "SILVAPOR, la mina de
// Krenko": misma escala, mismas capas y el mismo carro con sus ocho estados.

const A = "/vaegrant-mina";
const W = 660, H = 300;
const PISO = 246; // borde de arriba de las vías
const pix: React.CSSProperties = { imageRendering: "pixelated" };

// Estados del sprite del carro (8 cuadros de 112 × 88).
const CARRO = { anda: 0, anda2: 1, acelera: 2, frena: 3, aire: 4, aterriza: 5, agachados: 6, choque: 7 } as const;
type Estado = keyof typeof CARRO;

function Img({ src, x, y, w, h, flip, op }: { src: string; x: number; y: number; w: number; h: number; flip?: boolean; op?: number }) {
  return (
    <image href={`${A}/${src}`} x={flip ? -x - w : x} y={y} width={w} height={h} preserveAspectRatio="none"
      style={{ ...pix, opacity: op }} transform={flip ? "scale(-1 1)" : undefined} />
  );
}

function Carro({ x, estado, giro = 0 }: { x: number; estado: Estado; giro?: number }) {
  const f = CARRO[estado];
  const y = PISO + 8 - 88;
  return (
    <g transform={`rotate(${giro} ${x + 56} ${y + 80})`}>
      <svg x={x} y={y} width={112} height={88} viewBox={`${f * 112} 0 112 88`} overflow="hidden">
        <image href={`${A}/carro.png`} width={896} height={88} style={pix} />
      </svg>
    </g>
  );
}

function Vias({ desde = 0, hasta = W, y = PISO }: { desde?: number; hasta?: number; y?: number }) {
  const out = [];
  for (let x = desde; x < hasta; x += 94) out.push(<Img key={x} src="via.png" x={x} y={y} w={Math.min(94, hasta - x)} h={25} />);
  return <>{out}</>;
}

function Automata({ x, alt, caido }: { x: number; alt?: boolean; caido?: boolean }) {
  const w = 30 * 1.6, h = 35 * 1.6;
  return (
    <g transform={caido ? `rotate(80 ${x + w / 2} ${PISO + 4})` : undefined}>
      <Img src={alt ? "automata2.png" : "automata.png"} x={x} y={PISO + 6 - h} w={w} h={h} flip />
    </g>
  );
}

function Fondo({ paso, sinMedia }: { paso: number; sinMedia?: boolean }) {
  const lx = -((paso * 37) % 560);
  const mx = -((paso * 131) % 660);
  return (
    <>
      <Img src="lejos.png" x={lx} y={-15} w={560} h={330} />
      <Img src="lejos.png" x={lx + 560} y={-15} w={560} h={330} />
      <Img src="lejos.png" x={lx + 1120} y={-15} w={560} h={330} />
      {!sinMedia && (
        <>
          <Img src="media.png" x={mx} y={-30} w={660} h={330} />
          <Img src="media.png" x={mx + 660} y={-30} w={660} h={330} />
        </>
      )}
    </>
  );
}

function Cartel({ x, y, lineas }: { x: number; y: number; lineas: string[] }) {
  return (
    <g>
      <line x1={x + 40} y1={0} x2={x + 40} y2={y + 12} stroke="#2b2622" strokeWidth={3} />
      <line x1={x + 210} y1={0} x2={x + 210} y2={y + 12} stroke="#2b2622" strokeWidth={3} />
      <Img src="placa-ancha.png" x={x} y={y} w={250} h={103} />
      {lineas.map((l, k) => (
        <text key={k} x={x + 125} y={y + 56 + k * 19 - (lineas.length - 1) * 9} textAnchor="middle"
          fontSize={15} fontWeight={700} fill="#d8c9a8" letterSpacing="0.06em" style={{ fontFamily: "Georgia, serif" }}>
          {l}
        </text>
      ))}
    </g>
  );
}

function Arcos({ x, y, n, marcada }: { x: number; y: number; n: number; marcada?: number }) {
  return (
    <g>
      {Array.from({ length: n }).map((_, k) => {
        const px = x + k * 46;
        return (
          <g key={k}>
            <path d={`M${px} ${y + 70} V${y + 22} Q${px + 17} ${y} ${px + 34} ${y + 22} V${y + 70} Z`}
              fill="#05060a" stroke={k === marcada ? "#c99c5a" : "#4a3b2c"} strokeWidth={k === marcada ? 3 : 2} />
            <text x={px + 17} y={y + 50} textAnchor="middle" fontSize={14} fontWeight={700}
              fill={k === marcada ? "#c99c5a" : "#6b5a46"} style={{ fontFamily: "Georgia, serif" }}>{k + 1}</text>
          </g>
        );
      })}
    </g>
  );
}

function Lava() {
  return (
    <g>
      <defs>
        <linearGradient id="vg-m-lava" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a3c" stopOpacity={0} />
          <stop offset="35%" stopColor="#f0622a" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#ffcf6b" />
        </linearGradient>
      </defs>
      <rect x={0} y={PISO + 20} width={W} height={H - PISO} fill="#0a0504" />
      <rect className="vg-lava" x={0} y={PISO + 8} width={W} height={H - PISO} fill="url(#vg-m-lava)" />
      {[90, 230, 410, 560].map((x, k) => (
        <circle key={k} className="vg-lava" cx={x} cy={PISO + 30 - (k % 2) * 16} r={5 + (k % 3) * 2} fill="#ffb347" />
      ))}
    </g>
  );
}

// Dónde está el carro en cada escena: la cámara lo sigue, como en el juego.
const FOCO: Record<string, number> = {
  ascensor: 200, puente: 380, portones: 330, topetazo: 380, palancas: 440, rueda: 360, espolones: 360,
  brecha: 440, desvio: 470, bajada: 330, pit: 470, botones: 330, constructos: 400, salida: 440,
};
const VW = 440, VH = 200;

export default function EscenaMina({ tramo, paso }: { tramo: string; paso: number }) {
  let escena: React.ReactNode;
  switch (tramo) {
    case "ascensor":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Img src="ascensor.png" x={40} y={PISO + 22 - 301} w={169} h={301} />
        <Carro x={215} estado="anda" />
      </>);
      break;
    case "puente":
      escena = (<>
        <Fondo paso={paso} />
        <rect x={300} y={PISO - 4} width={150} height={H} fill="#03060f" />
        <Vias hasta={300} />
        <Img src="rotoDer.png" x={290} y={PISO - 3} w={41} h={31} />
        <Img src="rotoIzq.png" x={430} y={PISO - 3} w={41} h={31} />
        <Vias desde={470} />
        <g transform="translate(0 -70)"><Carro x={320} estado="aire" giro={-6} /></g>
      </>);
      break;
    case "portones":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Arcos x={420} y={PISO - 76} n={3} marcada={1} />
        <Cartel x={210} y={78} lineas={["CUIDADO ADELANTE", "DEFINE TU DESTINO"]} />
        <Carro x={230} estado="acelera" />
      </>);
      break;
    case "topetazo":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Automata x={395} caido />
        <Automata x={440} alt />
        <Carro x={300} estado="choque" />
      </>);
      break;
    case "palancas":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        {Array.from({ length: 6 }).map((_, k) => (
          <g key={k}>
            <Img src="palanca.png" x={360 + k * 44} y={PISO - 58} w={37} h={43} flip={k === 5} />
            <text x={378 + k * 44} y={PISO - 64} textAnchor="middle" fontSize={13} fontWeight={700}
              fill={k === 5 ? "#c99c5a" : "#6b5a46"} style={{ fontFamily: "Georgia, serif" }}>{k + 1}</text>
          </g>
        ))}
        <Carro x={250} estado="frena" giro={2} />
      </>);
      break;
    case "rueda":
    case "espolones":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Img src="pp-estalactitas.png" x={250} y={-8} w={135} h={164} />
        <Img src="pp-estalactitas.png" x={420} y={-30} w={112} h={136} />
        <Img src="pp-rocas.png" x={500} y={PISO - 22} w={96} h={59} />
        <circle cx={150} cy={PISO + 2} r={9} fill="none" stroke="#8c8781" strokeWidth={3} />
        <Carro x={300} estado="agachados" giro={-7} />
      </>);
      break;
    case "brecha":
    case "desvio":
      escena = (<>
        <Fondo paso={paso} sinMedia />
        <Lava />
        {Array.from({ length: 7 }).map((_, k) => <Img key={k} src="puente.png" x={k * 104 - 30} y={PISO - 6} w={104} h={34} />)}
        <Arcos x={420} y={PISO - 92} n={5} marcada={tramo === "desvio" ? 4 : undefined} />
        <Carro x={280} estado={tramo === "desvio" ? "frena" : "acelera"} giro={-7} />
      </>);
      break;
    case "bajada":
      escena = (<>
        <Fondo paso={paso} />
        <g transform={`rotate(10 ${W / 2} ${PISO})`}>
          <Vias desde={-100} hasta={W + 100} />
          <Carro x={270} estado="acelera" />
        </g>
        <Img src="pp-farol.png" x={180} y={-20} w={22} h={126} />
        <Img src="pp-farol.png" x={470} y={-30} w={22} h={126} />
      </>);
      break;
    case "pit":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <path d={`M560 ${PISO - 70} ${Array.from({ length: 7 }).map((_, k) => `l${k % 2 ? -14 : 14} 10`).join(" ")}`}
          fill="none" stroke="#8c8781" strokeWidth={4} />
        <rect x={570} y={PISO - 80} width={90} height={110} fill="#2b2622" />
        <Img src="pp-cajon.png" x={60} y={PISO - 30} w={84} h={70} />
        <Automata x={150} caido />
        <Carro x={450} estado="choque" giro={8} />
      </>);
      break;
    case "salon":
      escena = (<>
        <Img src="final.png" x={0} y={-180} w={W} h={660} />
        <rect width={W} height={H} fill="#03060f" opacity={0.15} />
        <g transform="translate(0 -150)"><Carro x={70} estado="anda" giro={14} /></g>
      </>);
      break;
    case "botones":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Img src="placa.png" x={360} y={PISO - 150} w={190} h={148} />
        {["#9aa3ab", "#c99c5a", "#d9572e", "#4f8fd1", "#7d6bc0"].map((c, k) => (
          <g key={k}>
            <circle cx={393 + k * 31} cy={PISO - 70} r={10} fill={c} stroke={k === 1 || k === 4 ? "#fff" : "#151311"} strokeWidth={k === 1 || k === 4 ? 3 : 2} />
          </g>
        ))}
        <Img src="pp-cristales.png" x={570} y={PISO - 44} w={60} h={64} />
        <Carro x={150} estado="anda" />
      </>);
      break;
    case "constructos":
      escena = (<>
        <Fondo paso={paso} />
        <Vias />
        <Automata x={390} caido />
        <Automata x={430} alt />
        <Automata x={470} />
        <Automata x={515} alt />
        <Carro x={300} estado="choque" giro={-4} />
      </>);
      break;
    case "salida":
    default:
      escena = (<>
        <Fondo paso={paso} />
        <defs>
          <radialGradient id="vg-m-salida">
            <stop offset="0%" stopColor="#f2f6fa" stopOpacity={1} />
            <stop offset="45%" stopColor="#bcd3e6" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#8fb1cf" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={640} cy={PISO - 70} rx={150} ry={170} fill="url(#vg-m-salida)" />
        <Vias />
        <Carro x={380} estado="acelera" giro={-5} />
      </>);
  }

  const enSalon = tramo === "salon";
  const cx = Math.max(0, Math.min(W - VW, (FOCO[tramo] ?? W / 2) - VW / 2));
  const vb = enSalon ? `0 0 ${W} ${H}` : `${cx} ${PISO + 46 - VH} ${VW} ${VH}`;
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", aspectRatio: `${VW} / ${VH}`, display: "block", borderRadius: 3, background: "#03060f" }}>
      {escena}
    </svg>
  );
}
