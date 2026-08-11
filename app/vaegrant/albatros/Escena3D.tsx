"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ALBATROS } from "@/data/albatros";
import { alturaRegala, COLOR, colorTipo, contornoCasco, esTabique, factorAltura, nivelDe, poligonoCompartimento, semimangaEn, semimangaUtil } from "@/lib/albatros";
import { texturaCasco, texturaCielo, texturaCubierta, texturaVela } from "@/lib/albatros-materiales";
import type { AlbatrosNivelId } from "@/types/albatros";

type Modo = "orbita" | "libre";

interface Props {
  visibles: Record<AlbatrosNivelId, boolean>;
  seleccion: string | null;
  onSeleccion: (id: string | null) => void;
  etiquetas: boolean;
  mostrarCasco: boolean;
  mostrarVelas: boolean;
}

interface Etiqueta {
  id: string;
  texto: string;
  pos: THREE.Vector3;
}

/** Casco por lofting entre las cuadernas del spec. */
function construirCasco(): THREE.BufferGeometry {
  const spec = ALBATROS;
  const NX = 48;
  const NY = 12;
  const x0 = spec.cuadernas[0].x;
  const x1 = spec.cuadernas[spec.cuadernas.length - 1].x;
  const yBajo = -spec.puntal;

  const pos: number[] = [];
  const idx: number[] = [];
  const fila = (NY + 1) * 2; // estribor + babor por estación

  for (let i = 0; i <= NX; i++) {
    const x = x0 + ((x1 - x0) * i) / NX;
    const s = semimangaEn(x);
    const yAlto = alturaRegala(x); // el casco sube por encima de la cubierta
    for (let lado = 0; lado < 2; lado++) {
      const signo = lado === 0 ? 1 : -1;
      for (let j = 0; j <= NY; j++) {
        const y = yBajo + ((yAlto - yBajo) * j) / NY;
        // por encima de la cubierta la borda se cierra un poco hacia adentro
        const cierre = y > 0 ? 1 - 0.1 * (y / Math.max(0.001, yAlto)) : 1;
        const z = signo * s * factorAltura(y) * cierre;
        pos.push(x, y, z);
      }
    }
  }
  for (let i = 0; i < NX; i++) {
    for (let lado = 0; lado < 2; lado++) {
      for (let j = 0; j < NY; j++) {
        const a = i * fila + lado * (NY + 1) + j;
        const b = a + 1;
        const c = (i + 1) * fila + lado * (NY + 1) + j;
        const d = c + 1;
        if (lado === 0) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Superficie de un nivel, recortada al contorno del casco a esa altura. */
function construirPiso(y: number): THREE.BufferGeometry {
  const f = factorAltura(y);
  const forma = new THREE.Shape();
  const pts = contornoCasco(48).map(([x, z]) => new THREE.Vector2(x, z * f));
  forma.setFromPoints(pts);
  const g = new THREE.ShapeGeometry(forma);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}

export default function Escena3D({ visibles, seleccion, onSeleccion, etiquetas, mostrarCasco, mostrarVelas }: Props) {
  const cont = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<Modo>("orbita");
  const [rotulos, setRotulos] = useState<{ id: string; texto: string; x: number; y: number; visible: boolean }[]>([]);
  const modoRef = useRef(modo);
  modoRef.current = modo;
  const visiblesRef = useRef(visibles);
  visiblesRef.current = visibles;
  const selRef = useRef(seleccion);
  selRef.current = seleccion;
  const [cargando, setCargando] = useState(true);
  const exteriorRef = useRef<{ grupo: THREE.Group; partes: Record<string, THREE.Object3D | undefined> } | null>(null);
  const cascoRef = useRef(mostrarCasco);
  cascoRef.current = mostrarCasco;
  const velasRef = useRef(mostrarVelas);
  velasRef.current = mostrarVelas;
  const hoverRef = useRef<string | null>(null);
  const etiquetasRef = useRef(etiquetas);
  etiquetasRef.current = etiquetas;

  useEffect(() => {
    const host = cont.current;
    if (!host) return;

    const movil = matchMedia("(max-width: 760px)").matches || /iPhone|iPad|Android/i.test(navigator.userAgent);

    const escena = new THREE.Scene();
    escena.fog = new THREE.Fog(0x2b3f4d, 45, 150);

    // Cúpula de cielo en degradé: cuesta un triángulo y cambia toda la escena.
    const cielo = new THREE.Mesh(
      new THREE.SphereGeometry(240, 32, 16),
      new THREE.MeshBasicMaterial({ map: texturaCielo(), side: THREE.BackSide, fog: false, depthWrite: false }),
    );
    escena.add(cielo);

    const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 600);
    const render = new THREE.WebGLRenderer({ antialias: !movil, powerPreference: "high-performance" });
    // En mobile el DPR alto es el mayor costo de fill rate y casi no se nota.
    render.setPixelRatio(movil ? 1 : Math.min(devicePixelRatio, 2));
    render.shadowMap.enabled = !movil;
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    render.toneMapping = THREE.ACESFilmicToneMapping;
    render.toneMappingExposure = 1.25;
    // Recorte por material: permite abrir el casco sin tocar cielo ni agua.
    render.localClippingEnabled = true;
    host.appendChild(render.domElement);
    render.domElement.style.display = "block";
    render.domElement.style.touchAction = "none";
    render.domElement.style.cursor = "grab";

    // ── luces ────────────────────────────────────────────────
    escena.add(new THREE.HemisphereLight(0xbcd8f0, 0x6b5844, 2.2));
    const relleno = new THREE.DirectionalLight(0x9fc2e0, 0.85);
    relleno.position.set(-12, 9, -14);
    escena.add(relleno);
    // Luz cenital suave para que los interiores no queden negros al abrir niveles.
    const luzInterior = new THREE.PointLight(0xffd9a8, 22, 26, 2);
    luzInterior.position.set(-2, -2.4, 0);
    escena.add(luzInterior);
    const sol = new THREE.DirectionalLight(0xffe6bd, 2.3);
    sol.position.set(14, 22, 10);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.bias = -0.0012;
    sol.shadow.normalBias = 0.035;
    sol.shadow.camera.left = -16;
    sol.shadow.camera.right = 16;
    sol.shadow.camera.top = 16;
    sol.shadow.camera.bottom = -16;
    escena.add(sol);

    // ── agua ─────────────────────────────────────────────────
    const mar = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x18313f, roughness: 0.5, metalness: 0.1 }),
    );
    mar.rotation.x = -Math.PI / 2;
    // El calado se mide desde la quilla hacia arriba: la superficie del agua
    // queda a -(puntal - calado), no a -calado.
    mar.position.y = -(ALBATROS.puntal - ALBATROS.calado);
    mar.receiveShadow = false;
    escena.add(mar);

    // ── casco ────────────────────────────────────────────────
    // Todo lo que flota cuelga de este pivote, para que cabecee junto.
    const barco = new THREE.Group();
    escena.add(barco);

    // Casco exterior: modelo real (Poly Haven, CC0) en vez de geometría propia.
    // Se auto-encaja al spec: se mide el modelo, se rota para que la eslora
    // caiga sobre X y se escala hasta los 19 m del canon. Así el interior
    // procedural, que sigue saliendo del spec, calza adentro.
    const exterior = new THREE.Group();
    barco.add(exterior);
    const partes: { casco?: THREE.Object3D; jarcia?: THREE.Object3D; velas?: THREE.Object3D } = {};
    // Plano de corte longitudinal: se lleva la mitad de estribor y deja ver
    // el interior que el modelo ya trae (forro, cuadernas y cubierta).
    const planoCorte = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.15);
    const materialesCasco: THREE.Material[] = [];

    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    const cargador = new GLTFLoader();
    cargador.setDRACOLoader(draco);

    cargador.load(
      "/vaegrant-3d/albatros.glb",
      (gltf) => {
        const raiz = gltf.scene;

        // El bounding box completo incluye bauprés y jarcia, que sobresalen
        // mucho de la eslora real. Se mide SOLO la malla del casco.
        let mallaCasco: THREE.Mesh | null = null;
        raiz.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && o.name.toLowerCase().includes("hull")) mallaCasco = mallaCasco ?? m;
        });
        const medir = (obj: THREE.Object3D) => new THREE.Box3().setFromObject(obj);
        const refInicial = mallaCasco ?? raiz;

        const c0 = medir(refInicial);
        const t0 = c0.getSize(new THREE.Vector3());
        if (t0.z > t0.x) raiz.rotation.y = Math.PI / 2; // eslora sobre X
        raiz.updateMatrixWorld(true);

        const c1 = medir(refInicial);
        const t1 = c1.getSize(new THREE.Vector3());
        raiz.scale.setScalar(ALBATROS.eslora / t1.x);
        raiz.updateMatrixWorld(true);

        const c2 = medir(refInicial);
        const centro = c2.getCenter(new THREE.Vector3());
        raiz.position.x -= centro.x;
        raiz.position.z -= centro.z;
        // la quilla del modelo se apoya en -puntal, como en el spec
        raiz.position.y -= c2.min.y + ALBATROS.puntal;

        // Encajar el interior dentro del casco real, con un pequeño margen
        // para que los mamparos no asomen por el forro.
        raiz.updateMatrixWorld(true);
        const cf = medir(refInicial);
        const tf = cf.getSize(new THREE.Vector3());
        interior.scale.set(
          Math.min(1, (tf.x * 0.97) / ALBATROS.eslora),
          1,
          Math.min(1, (tf.z * 0.82) / ALBATROS.manga),
        );

        raiz.traverse((o) => {
          const malla = o as THREE.Mesh;
          if (!malla.isMesh) return;
          o.castShadow = true;
          o.receiveShadow = true;
          for (const m of Array.isArray(malla.material) ? malla.material : [malla.material]) {
            // doble cara para que el corte no deje agujeros
            (m as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
            materialesCasco.push(m);
          }
          const n = o.name.toLowerCase();
          if (n.includes("sail")) partes.velas = partes.velas ?? o;
          else if (n.includes("rig")) partes.jarcia = partes.jarcia ?? o;
          else partes.casco = partes.casco ?? o;
        });

        exterior.add(raiz);
        setCargando(false);
      },
      undefined,
      () => setCargando(false),
    );

    exteriorRef.current = { grupo: exterior, partes };

    // ── niveles ──────────────────────────────────────────────
    // El interior va en su propio grupo: cuando cargue el casco real se lo
    // encaja adentro, porque la forma del modelo no es la de mi spec.
    const interior = new THREE.Group();
    barco.add(interior);
    const grupos: Partial<Record<AlbatrosNivelId, THREE.Group>> = {};
    const seleccionables: THREE.Object3D[] = [];
    const etiquetasBase: Etiqueta[] = [];

    const texCubierta = texturaCubierta();
    texCubierta.repeat.set(1.6, 5);
    const texEntre = texturaCubierta();
    texEntre.repeat.set(1.4, 4);

    for (const nivel of ALBATROS.niveles) {
      const g = new THREE.Group();
      grupos[nivel.id] = g;
      interior.add(g);

      // Los pisos los pone el modelo: acá solo cuelgan los pines.
    }

    // El modelo ya trae el interior del casco: forro, cuadernas y cubierta.
    // Así que acá no se construye geometría, solo PINES: marcadores de canon
    // que se ven a través del casco, como los de un mapa. Nada que choque.
    const matPin = new THREE.MeshBasicMaterial({ color: 0xc99c5a, depthTest: false, transparent: true, opacity: 0.95 });
    const matPinSecreto = new THREE.MeshBasicMaterial({ color: 0xd8a0e0, depthTest: false, transparent: true, opacity: 0.95 });
    const geoPin = new THREE.OctahedronGeometry(0.22, 0);

    function pin(id: string, nombre: string, x: number, y: number, z: number, secreto = false, nivel: AlbatrosNivelId) {
      const m = new THREE.Mesh(geoPin, secreto ? matPinSecreto : matPin);
      m.position.set(x, y, z);
      m.renderOrder = 999;
      m.userData = { id, nombre };
      grupos[nivel]!.add(m);
      seleccionables.push(m);
      etiquetasBase.push({ id, texto: nombre, pos: new THREE.Vector3(x, y + 0.34, z) });
      return m;
    }

    for (const c of ALBATROS.compartimentos) {
      const nivel = nivelDe(c.nivel);
      pin(
        c.id,
        c.nombre,
        (c.x[0] + c.x[1]) / 2,
        nivel.y + nivel.puntal * 0.45,
        (c.z[0] + c.z[1]) / 2,
        !!c.secreto,
        c.nivel,
      );
    }

    for (const p of ALBATROS.piezas) {
      if (p.tipo === "escalera" || p.tipo === "escotilla") continue; // ya están en el modelo
      const nivel = nivelDe(p.nivel);
      pin(p.id, p.nombre, p.pos[0], nivel.y + p.tam[1] * 0.5, p.pos[2], false, p.nivel);
    }

    // ── cámara: órbita y vuelo libre, escritas a mano ────────
    const objetivo = new THREE.Vector3(0, 0.4, 0);
    let radio = 21;
    let theta = Math.PI * 0.72;
    let phi = Math.PI * 0.36;
    const libre = { pos: new THREE.Vector3(12, 3, 12), yaw: -Math.PI * 0.72, pitch: -0.15 };
    const teclas = new Set<string>();
    let arrastrando = false;
    let px = 0, py = 0;

    function aplicarOrbita() {
      camara.position.set(
        objetivo.x + radio * Math.sin(phi) * Math.cos(theta),
        objetivo.y + radio * Math.cos(phi),
        objetivo.z + radio * Math.sin(phi) * Math.sin(theta),
      );
      camara.lookAt(objetivo);
    }
    aplicarOrbita();

    const onDown = (e: PointerEvent) => {
      arrastrando = true; px = e.clientX; py = e.clientY;
      render.domElement.setPointerCapture(e.pointerId);
      render.domElement.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      arrastrando = false;
      try { render.domElement.releasePointerCapture(e.pointerId); } catch {}
      render.domElement.style.cursor = "grab";
    };
    const onMove = (e: PointerEvent) => {
      if (!arrastrando) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      px = e.clientX; py = e.clientY;
      if (modoRef.current === "orbita") {
        theta -= dx * 0.005;
        phi = Math.max(0.12, Math.min(Math.PI - 0.12, phi - dy * 0.005));
        aplicarOrbita();
      } else {
        libre.yaw -= dx * 0.004;
        libre.pitch = Math.max(-1.5, Math.min(1.5, libre.pitch - dy * 0.004));
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (modoRef.current !== "orbita") return;
      radio = Math.max(6, Math.min(90, radio * (1 + Math.sign(e.deltaY) * 0.12)));
      aplicarOrbita();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      teclas.add(e.key.toLowerCase());
      if (["w", "a", "s", "d", " "].includes(e.key.toLowerCase()) && modoRef.current === "libre") e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => teclas.delete(e.key.toLowerCase());

    // click para seleccionar
    const rayo = new THREE.Raycaster();
    const puntero = new THREE.Vector2();
    let bajoX = 0, bajoY = 0;
    const onClickDown = (e: PointerEvent) => { bajoX = e.clientX; bajoY = e.clientY; };
    const onClickUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - bajoX, e.clientY - bajoY) > 4) return; // fue un arrastre
      const r = render.domElement.getBoundingClientRect();
      puntero.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      puntero.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      rayo.setFromCamera(puntero, camara);
      const visiblesAhora = seleccionables.filter((o) => {
        const g = o.parent as THREE.Group;
        return g.visible;
      });
      const hit = rayo.intersectObjects(visiblesAhora, false)[0];
      onSeleccion(hit ? (hit.object.userData.id as string) : null);
    };

    // Hover: el rótulo aparece solo sobre lo que estás señalando.
    const onHover = (e: PointerEvent) => {
      const r = render.domElement.getBoundingClientRect();
      puntero.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      puntero.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      rayo.setFromCamera(puntero, camara);
      const vis = seleccionables.filter((o) => (o.parent as THREE.Group).visible);
      const hit = rayo.intersectObjects(vis, false)[0];
      hoverRef.current = hit ? (hit.object.userData.id as string) : null;
      if (!arrastrando) render.domElement.style.cursor = hit ? "pointer" : "grab";
    };
    render.domElement.addEventListener("pointermove", onHover);

    render.domElement.addEventListener("pointerdown", onDown);
    render.domElement.addEventListener("pointerup", onUp);
    render.domElement.addEventListener("pointermove", onMove);
    render.domElement.addEventListener("wheel", onWheel, { passive: false });
    render.domElement.addEventListener("pointerdown", onClickDown);
    render.domElement.addEventListener("pointerup", onClickUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ── bucle ────────────────────────────────────────────────
    const reloj = new THREE.Clock();
    let vivo = true;
    let tick = 0;
    let habiaRotulos = false;
    const adelante = new THREE.Vector3();
    const derecha = new THREE.Vector3();

    function frame() {
      if (!vivo) return;
      requestAnimationFrame(frame);
      const dt = Math.min(reloj.getDelta(), 0.1);
      tick++;

      for (const n of ALBATROS.niveles) {
        const g = grupos[n.id];
        if (g) g.visible = visiblesRef.current[n.id];
      }

      const ext = exteriorRef.current;
      if (ext && ext.partes.velas) ext.partes.velas.visible = velasRef.current;

      // cascoRef ahora significa 'casco entero'; en false se abre el corte
      const cortar = !cascoRef.current;
      for (const m of materialesCasco) {
        const quiere = cortar ? [planoCorte] : null;
        if (m.clippingPlanes !== quiere) {
          m.clippingPlanes = quiere;
          m.needsUpdate = true;
        }
      }

      // Cabeceo: dos senos desfasados. Es barato y es lo que hace que el barco
      // se lea como flotando en vez de como una maqueta clavada al agua.
      const t = reloj.getElapsedTime();
      barco.rotation.z = Math.sin(t * 0.42) * 0.017;
      barco.rotation.x = Math.sin(t * 0.31 + 1.1) * 0.011;
      barco.position.y = Math.sin(t * 0.53) * 0.075;

      if (modoRef.current === "libre") {
        const v = teclas.has("shift") ? 14 : 6;
        adelante.set(Math.sin(libre.yaw) * Math.cos(libre.pitch), Math.sin(libre.pitch), Math.cos(libre.yaw) * Math.cos(libre.pitch)).normalize();
        derecha.set(Math.sin(libre.yaw - Math.PI / 2), 0, Math.cos(libre.yaw - Math.PI / 2)).normalize();
        const paso = new THREE.Vector3();
        if (teclas.has("w") || teclas.has("arrowup")) paso.add(adelante);
        if (teclas.has("s") || teclas.has("arrowdown")) paso.sub(adelante);
        if (teclas.has("d") || teclas.has("arrowright")) paso.add(derecha);
        if (teclas.has("a") || teclas.has("arrowleft")) paso.sub(derecha);
        if (teclas.has("e") || teclas.has(" ")) paso.y += 1;
        if (teclas.has("q") || teclas.has("control")) paso.y -= 1;
        if (paso.lengthSq() > 0) libre.pos.addScaledVector(paso.normalize(), v * dt);
        camara.position.copy(libre.pos);
        camara.lookAt(libre.pos.clone().add(adelante));
      }

      // Rótulos proyectados a pantalla. Se recalculan cada 4 frames: a 60 fps
      // eso son 15 actualizaciones por segundo, imperceptible al mover la
      // cámara y con la cuarta parte de re-renders de React.
      if (tick % 4 === 0) {
        habiaRotulos = true;
        const r = render.domElement.getBoundingClientRect();
        const proy = new THREE.Vector3();
        const salida: { id: string; texto: string; x: number; y: number; visible: boolean }[] = [];
        for (const et of etiquetasBase) {
          if (!etiquetasRef.current && et.id !== selRef.current && et.id !== hoverRef.current) continue;
          const comp = ALBATROS.compartimentos.find((c) => c.id === et.id);
          const pieza = ALBATROS.piezas.find((p) => p.id === et.id);
          const nivelId = (comp?.nivel ?? pieza?.nivel) as AlbatrosNivelId;
          if (!visiblesRef.current[nivelId]) continue;
          proy.copy(et.pos).project(camara);
          if (proy.z > 1) continue;
          const dist = camara.position.distanceTo(et.pos);
          salida.push({
            id: et.id,
            texto: et.texto,
            x: ((proy.x + 1) / 2) * r.width,
            y: ((-proy.y + 1) / 2) * r.height,
            visible: dist < 45,
          });
        }
        setRotulos(salida);
      } else if (false) {
        habiaRotulos = false;
        setRotulos([]);
      }

      render.render(escena, camara);
    }
    frame();

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      render.setSize(w, h, false);
    });
    ro.observe(host);

    return () => {
      vivo = false;
      ro.disconnect();
      render.domElement.removeEventListener("pointermove", onHover);
      render.domElement.removeEventListener("pointerdown", onDown);
      render.domElement.removeEventListener("pointerup", onUp);
      render.domElement.removeEventListener("pointermove", onMove);
      render.domElement.removeEventListener("wheel", onWheel);
      render.domElement.removeEventListener("pointerdown", onClickDown);
      render.domElement.removeEventListener("pointerup", onClickUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      render.dispose();
      host.removeChild(render.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={cont} style={{ width: "100%", height: "100%" }} />

      {cargando && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", color: "#8b9199", fontSize: 12.5 }}>
          Cargando el casco…
        </div>
      )}

      {rotulos.filter((r) => r.visible).map((r) => (
        <div
          key={r.id}
          onClick={() => onSeleccion(r.id)}
          style={{
            position: "absolute", left: r.x, top: r.y, transform: "translate(-50%,-50%)",
            pointerEvents: "auto", cursor: "pointer", whiteSpace: "nowrap",
            fontSize: 10.5, letterSpacing: "0.04em",
            padding: "2px 7px", borderRadius: 3,
            background: r.id === selRef.current ? "rgba(201,156,90,0.92)" : "rgba(16,21,28,0.72)",
            color: r.id === selRef.current ? "#10151c" : "#e8dfd2",
            border: "1px solid rgba(201,156,90,0.45)",
            fontWeight: r.id === selRef.current ? 700 : 500,
          }}
        >
          {r.texto}
        </div>
      ))}

      <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
        {(["orbita", "libre"] as Modo[]).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            style={{
              padding: "5px 11px", fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: "pointer",
              background: modo === m ? "rgba(201,156,90,0.9)" : "rgba(16,21,28,0.75)",
              color: modo === m ? "#10151c" : "#c9bfae",
              border: "1px solid rgba(201,156,90,0.4)",
            }}
          >
            {m === "orbita" ? "Órbita" : "Cámara libre"}
          </button>
        ))}
        <span style={{ fontSize: 10.5, color: "#8b9199", marginLeft: 4 }}>
          {modo === "orbita"
            ? "Arrastrá para girar · rueda para acercar · clic en una pieza"
            : "WASD para moverte · E/Q sube y baja · Shift corre · arrastrá para mirar"}
        </span>
      </div>
    </div>
  );
}
