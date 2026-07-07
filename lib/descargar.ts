// Descarga una imagen (misma origin o remota) como archivo.
export async function descargarImagen(url: string) {
  const nombre = (url.split("/").pop() || "imagen").split("?")[0];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = obj;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(obj);
  } catch {
    // CORS u otro problema: al menos abrirla para guardar a mano
    window.open(url, "_blank");
  }
}
