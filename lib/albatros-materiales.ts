import * as THREE from "three";

// Texturas generadas por código en un <canvas>. No hay que descargar nada, pesan
// cero en la red y se ven muchísimo mejor que un color plano. Para un barco de
// madera el tablonado es el 80% de la lectura visual.

function lienzo(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function ruido(g: CanvasRenderingContext2D, w: number, h: number, cantidad: number, alfa: number) {
  for (let i = 0; i < cantidad; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    g.fillStyle = `rgba(0,0,0,${Math.random() * alfa})`;
    g.fillRect(x, y, 1 + Math.random() * 2, 1);
  }
}

/** Tablonado de cubierta: tablas largas, juntas calafateadas y veta. */
export function texturaCubierta(): THREE.Texture {
  const W = 512, H = 512;
  const { c, g } = lienzo(W, H);
  g.fillStyle = "#8a6a45";
  g.fillRect(0, 0, W, H);

  const alto = 32;
  for (let fila = 0; fila * alto < H; fila++) {
    const y = fila * alto;
    // variación de tono por tabla
    const t = 0.82 + Math.random() * 0.32;
    g.fillStyle = `rgb(${Math.round(138 * t)},${Math.round(106 * t)},${Math.round(69 * t)})`;
    g.fillRect(0, y, W, alto - 2);

    // veta
    g.strokeStyle = "rgba(60,40,24,0.18)";
    g.lineWidth = 1;
    for (let v = 0; v < 6; v++) {
      const vy = y + 3 + Math.random() * (alto - 8);
      g.beginPath();
      g.moveTo(0, vy);
      for (let x = 0; x <= W; x += 32) g.lineTo(x, vy + (Math.random() - 0.5) * 2.5);
      g.stroke();
    }

    // junta calafateada (la brea entre tablas)
    g.fillStyle = "rgba(22,16,10,0.85)";
    g.fillRect(0, y + alto - 2, W, 2);

    // topes de tabla, desfasados por fila
    const desfase = (fila % 3) * 170;
    for (let x = desfase; x < W; x += 512) {
      g.fillStyle = "rgba(22,16,10,0.7)";
      g.fillRect(x, y, 2, alto - 2);
    }
  }
  ruido(g, W, H, 4000, 0.09);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Forro del casco: tracas horizontales más oscuras y mojadas. */
export function texturaCasco(): THREE.Texture {
  const W = 512, H = 512;
  const { c, g } = lienzo(W, H);
  g.fillStyle = "#3a2a1e";
  g.fillRect(0, 0, W, H);

  const alto = 26;
  for (let fila = 0; fila * alto < H; fila++) {
    const y = fila * alto;
    const t = 0.78 + Math.random() * 0.42;
    g.fillStyle = `rgb(${Math.round(58 * t)},${Math.round(42 * t)},${Math.round(30 * t)})`;
    g.fillRect(0, y, W, alto - 1);
    g.fillStyle = "rgba(14,10,7,0.8)";
    g.fillRect(0, y + alto - 1, W, 1);
  }
  // manchas de humedad
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 10 + Math.random() * 50;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(10,18,20,0.22)");
    grad.addColorStop(1, "rgba(10,18,20,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ruido(g, W, H, 6000, 0.12);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Lona de vela: trama de tejido con refuerzos. */
export function texturaVela(): THREE.Texture {
  const W = 256, H = 256;
  const { c, g } = lienzo(W, H);
  g.fillStyle = "#d9cdb4";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(150,132,104,0.22)";
  g.lineWidth = 1;
  for (let i = 0; i < W; i += 4) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(W, i); g.stroke();
  }
  // costuras de los paños
  g.strokeStyle = "rgba(120,102,78,0.5)";
  g.lineWidth = 2;
  for (let i = 32; i < W; i += 48) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke();
  }
  ruido(g, W, H, 2500, 0.07);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Cielo en degradé, como fondo de la escena. */
export function texturaCielo(): THREE.Texture {
  const { c, g } = lienzo(4, 256);
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#0d1a26");
  grad.addColorStop(0.45, "#20394d");
  grad.addColorStop(0.72, "#4a5f6b");
  grad.addColorStop(0.88, "#8c7a63");
  grad.addColorStop(1.0, "#c08f5a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** ¿Hay WebGL? Si no, el visor cae al plano 2D. */
export function hayWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}
