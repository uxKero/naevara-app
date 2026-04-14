# Naevara Tirael — App de personaje

App local para gestionar el perfil, historia y stats del personaje Naevara Tirael.

---

## Cómo usar

### 1. Instalar dependencias (solo la primera vez)

Abrí una terminal, entrá a la carpeta del proyecto y corré:

```
npm install
```

### 2. Iniciar la app

```
npm run dev
```

Después abrí tu navegador en: **http://localhost:3000**

---

## Edición de contenido

- **Hacé click en cualquier texto o número** para editarlo directamente en la página
- Presioná **Enter** (o hacé click afuera) para confirmar el cambio
- Presioná **Escape** para cancelar sin guardar
- Usá el botón **Guardar** (arriba a la derecha en la barra de tabs) para guardar todo en el archivo `data/character.json`

---

## Asistente de IA (OpenRouter)

Los botones **✦ IA** abren un modal para escribir con ayuda de inteligencia artificial.

### Configurar la API key

1. Creá una cuenta en [openrouter.ai](https://openrouter.ai)
2. Generá una API key en [openrouter.ai/keys](https://openrouter.ai/keys)
3. En el modal de IA, hacé click en **⚙ Config** y pegá tu key ahí
4. Elegí el modelo que prefieras
5. Hacé click en **Guardar configuración** — queda guardado en el navegador

### Cómo usarlo

1. Hacé click en **✦ IA** junto a cualquier sección (especialmente en Historia)
2. Escribí qué querés que haga la IA: "expandí esto", "reescribilo más oscuro", "agregá detalles sobre la abuela", etc.
3. Hacé click en **✦ Generar con IA**
4. Si el resultado te gusta, hacé click en **✓ Aplicar este texto**
5. Guardá con el botón Guardar

---

## Datos guardados

Todo se guarda en `data/character.json`. Podés editar ese archivo directamente también si querés hacer cambios grandes.

---

## Modelos disponibles en OpenRouter

| Modelo | Ideal para |
|--------|-----------|
| Claude 3.5 Sonnet | Narrativa de alta calidad |
| Claude 3 Haiku | Rápido y económico |
| GPT-4o | Muy bueno para escritura |
| Llama 3.3 70B | Opción gratuita |
| Gemini Flash 1.5 | Rápido y económico |
