# Modelo 3D del Albatros

`albatros.glb` deriva de **"Dutch Ship Large 02"** de [Poly Haven](https://polyhaven.com/),
publicado bajo **CC0 1.0** (dominio público: uso libre, incluso comercial, sin atribución
obligatoria). El crédito va igual porque corresponde.

## Qué se le hizo

- Se descartaron las cámaras y luces del `.blend`, dejando solo las tres mallas: casco,
  jarcia y velas.
- Las texturas PBR se bajaron de 2048 a 1024 px y se recomprimieron a JPEG 82. A la escala
  a la que se ve en el visor no se nota, y pesa la cuarta parte.
- Exportado a GLB con compresión **Draco** nivel 6. El decodificador vive en `/public/draco/`
  y se sirve estático; sin él el modelo no carga.
- Resultado: **2,9 MB** (contra 5,8 MB sin Draco), 58.891 caras.

## Cómo se usa en el visor

El código no asume ninguna escala del modelo: al cargarlo mide **solo la malla del casco**
—el bounding box completo incluye el bauprés y la jarcia, que sobresalen mucho—, lo rota
para que la eslora caiga sobre X, lo escala hasta la eslora del spec y lo apoya por la
quilla. Si cambia `ALBATROS.eslora` en `data/albatros.ts`, el modelo se reescala solo.

El corte longitudinal se hace con planos de recorte **por material**, no globales, para no
cortar también el cielo y el agua.

## Descartado

En `Downloads/medieval boat/1/` había otra versión del mismo barco (3ds Max, FBX y OBJ) con
**490.815 triángulos y sin una sola textura**: ocho veces más pesada y peor. No se usó.
