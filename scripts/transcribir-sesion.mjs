// Transcribe los audios de una sesion con ElevenLabs Scribe (STT batch).
// Deja, por cada audio: <nombre>.txt (legible, diarizado) y <nombre>.json (respuesta cruda).
//
// Uso:
//   node scripts/transcribir-sesion.mjs "sources/Vaegrant/Sesion 3"
//
// Requiere ELEVENLABS_API_KEY en .env.local (o en el entorno).

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';
const MODEL_ID = 'scribe_v1';
const LANGUAGE = 'spa'; // partida en espanol -> mejora precision
const AUDIO_EXT = new Set(['.ogg', '.opus', '.mp3', '.m4a', '.wav', '.flac', '.aac', '.webm', '.mp4']);

// --- cargar API key desde .env.local sin dependencias externas ---
function loadEnvLocal() {
  const p = path.resolve('.env.local');
  if (!existsSync(p)) return;
  const txt = require('node:fs').readFileSync(p, 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
loadEnvLocal();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Falta ELEVENLABS_API_KEY (poné la key en .env.local).');
  process.exit(1);
}

const dir = process.argv[2];
if (!dir) {
  console.error('Uso: node scripts/transcribir-sesion.mjs "sources/Vaegrant/Sesion 3"');
  process.exit(1);
}

function fmtTime(sec) {
  if (sec == null) return '??:??';
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor((sec / 60) % 60).toString().padStart(2, '0');
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// Agrupa palabras consecutivas del mismo speaker en bloques legibles.
function toDiarizedText(json) {
  const words = json.words ?? [];
  if (!words.length) return json.text ?? '';
  const blocks = [];
  let cur = null;
  for (const w of words) {
    const spk = w.speaker_id ?? 'speaker_0';
    if (w.type === 'spacing') { if (cur) cur.text += w.text ?? ' '; continue; }
    if (!cur || cur.spk !== spk) {
      cur = { spk, start: w.start, end: w.end, text: '' };
      blocks.push(cur);
    }
    cur.text += (w.type === 'audio_event' ? ` (${w.text}) ` : w.text ?? '');
    cur.end = w.end ?? cur.end;
  }
  return blocks
    .map((b) => {
      const label = '[Speaker ' + (b.spk.replace(/^speaker_/, '')) + ']';
      return `${label} (${fmtTime(b.start)} - ${fmtTime(b.end)})\n${b.text.trim()}`;
    })
    .join('\n\n');
}

async function transcribeOne(filePath) {
  const buf = await readFile(filePath);
  const form = new FormData();
  form.append('model_id', MODEL_ID);
  form.append('language_code', LANGUAGE);
  form.append('diarize', 'true');
  form.append('tag_audio_events', 'true');
  form.append('timestamps_granularity', 'word');
  form.append('file', new Blob([buf]), path.basename(filePath));

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} -> ${body.slice(0, 500)}`);
  }
  return res.json();
}

async function main() {
  const entries = await readdir(dir, { withFileTypes: true });
  const audios = entries
    .filter((e) => e.isFile() && AUDIO_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort(); // el nombre trae la hora -> orden cronologico

  if (!audios.length) {
    console.log(`No hay audios en "${dir}" (extensiones: ${[...AUDIO_EXT].join(', ')}).`);
    return;
  }

  console.log(`${audios.length} audio(s) a transcribir en "${dir}":\n`);
  let ok = 0;
  for (let i = 0; i < audios.length; i++) {
    const name = audios[i];
    const src = path.join(dir, name);
    const txtOut = path.join(dir, name + '.txt');
    const jsonOut = path.join(dir, name + '.json');

    if (existsSync(txtOut)) {
      console.log(`[${i + 1}/${audios.length}] SKIP (ya existe .txt): ${name}`);
      ok++;
      continue;
    }
    process.stdout.write(`[${i + 1}/${audios.length}] ${name} ... `);
    try {
      const json = await transcribeOne(src);
      await writeFile(jsonOut, JSON.stringify(json, null, 2), 'utf8');
      await writeFile(txtOut, toDiarizedText(json), 'utf8');
      const nspk = new Set((json.words ?? []).map((w) => w.speaker_id).filter(Boolean)).size;
      console.log(`OK (${nspk} speaker(s))`);
      ok++;
    } catch (err) {
      console.log(`FALLO: ${err.message}`);
    }
  }
  console.log(`\nListo: ${ok}/${audios.length} transcriptos. Los .txt quedaron junto a los audios.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
