# Auditoria UX y Architecture Decision Records (ADRs)

> Rol: UX Designer Senior + Arquitecto Frontend  
> Proyecto: Ooodle Game (React + Express)  
> Fecha: 2026-04-28  
> Estado: **Crítico — Requiere acción prioritaria**

---

## PARTE 1: AUDITORÍA UX — DECISIONES DE DISEÑO E INTERACCIÓN

### Metodología
Cada decisión se evalúa contra principios heurísticos de Nielsen, leyes de UX (Fitts, Hick, etc.), WCAG 2.1 y psicología cognitiva aplicada. **No se asume que lo existente esté bien.**

---

### 1. Arquitectura de Información y Navegación

#### 1.1 Ausencia de Router (SPA de una sola pantalla)
- **Archivo:** `App.tsx`
- **Decisión actual:** Renderiza únicamente `<JuegoVistaPantalla />`. No existe React Router, Wouter ni ningún sistema de navegación por URL.
- **Problema:** El usuario no puede compartir el enlace a una partida en curso, usar el botón "Atrás" del navegador, ni refrescar la página sin perder el estado.
- **Principios violados:**
  - **User Control and Freedom** (Nielsen, Heurística #3): el usuario debe poder deshacer acciones y navegar libremente.
  - **Flexibility and Efficiency of Use** (Nielsen, #7): no hay atajos ni URLs semánticas.
  - **Error Recovery**: un refresh accidental destruye la partida activa.
- **Justificación débil:** "Es un juego simple". Incluso Wordle tiene URLs por sesión.
- **Alternativa propuesta:** Implementar un router minimalista (ej. Wouter o React Router con hash mode) que soporte `/inicio`, `/juego/:sesionId`. Esto habilitaría recuperación de partida por URL.

#### 1.2 Estado de sesión no persistente
- **Archivo:** `useJuego.ts`, `juego_Logica.ts` (backend)
- **Decisión actual:** El estado de la partida vive únicamente en memoria RAM (frontend `useState` + backend `this.partida`).
- **Problema:** Si el usuario refresca, pierde todo. Si otro usuario inicia partida en el mismo backend, sobrescribe el estado global.
- **Principios violados:**
  - **Recognition rather than Recall** (Nielsen, #6): el sistema obliga al usuario a recordar/reconstruir su progreso.
  - **Session Continuity** (principio de usabilidad web): una sesión debe sobrevivir a un refresh.
- **Alternativa propuesta:**
  1. Frontend: persistir `historial`, `seleccion_Actual` y `id_Jugador` en `localStorage` como respaldo.
  2. Backend: generar un `sessionId` (UUID) por partida y devolverlo en `/api/juego/iniciar`. El frontend lo almacena y lo envía en cada request.

---

### 2. Pantalla de Inicio

#### 2.1 Exposición prematura del Ranking
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 156-197)
- **Decisión actual:** El ranking se muestra en el 40% derecho de la pantalla de inicio, incluso cuando está vacío.
- **Problema:** En el **Primer Vistazo (First Glance)**, el usuario nuevo recibe información irrelevante. El panel vacío muestra "Aun no hay puntajes visibles", lo que genera **Cognitive Dissonance**: "¿Por qué me muestras algo que no tiene utilidad ahora?"
- **Principios violados:**
  - **Progressive Disclosure** (Jack Carroll): mostrar solo lo necesario en cada etapa.
  - **Hick's Law**: más elementos visuales = más tiempo de decisión.
- **Alternativa propuesta:** Colapsar el ranking bajo un acordeón "Ver ranking" o moverlo a una pestaña secundaria. Mostrar solo el formulario de inicio como foco principal.

#### 2.2 Jargon técnico en copy de bienvenida
- **Archivo:** `JuegoVistaPantalla.tsx` (línea 93-96)
- **Texto actual:** "El backend genera la solucion y el resultado objetivo. En esta pantalla solo preparas la partida; el tablero aparece cuando la inicias."
- **Problema:** El usuario final no necesita saber que existe un "backend". Esto es **Jargon Técnico** que rompe el **Match Between System and the Real World** (Nielsen, #2).
- **Alternativa propuesta:** "Adivina la ecuación secreta en 6 intentos. Elige tu nivel y comienza."

#### 2.3 Formulario sin validación inline
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 98-140)
- **Decisión actual:** El input de nombre no valida hasta que el usuario hace submit. El error aparece debajo del formulario como un bloque rojo genérico.
- **Problema:** El usuario no sabe si su nombre es válido (ej. vacío, caracteres especiales) hasta hacer clic en "Iniciar partida".
- **Principios violados:**
  - **Error Prevention** (Nielsen, #5): es mejor prevenir que corregir.
  - **Visibility of System Status** (Nielsen, #1): el sistema no comunica el estado de validez del input en tiempo real.
- **Alternativa propuesta:**
  - Validar `onBlur` y mostrar un mensaje de error micro junto al input (patrón **Inline Validation**).
  - Deshabilitar el botón de submit hasta que el input sea válido, pero con un tooltip que explique por qué.

#### 2.4 Selector de dificultad sin estado de foco accesible
- **Archivo:** `App.css` (líneas 227-235)
- **Decisión actual:** Los chips de dificultad son `<button>` con estilo `:hover` y clase activa, pero no hay estilo `:focus-visible` definido.
- **Problema:** Un usuario de teclado no ve qué chip tiene el foco. El navegador aplica su outline por defecto, pero podría ser eliminado accidentalmente por el reset CSS.
- **Principios violados:**
  - **WCAG 2.4.7 Focus Visible** (Nivel AA)
- **Alternativa propuesta:** Agregar `button:focus-visible { outline: 2px solid var(--color-azul); outline-offset: 2px; }`.

#### 2.5 Botón de submit con feedback de carga insuficiente
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 133-139)
- **Decisión actual:** El texto cambia a "Iniciando..." pero no hay spinner ni cambio de forma del botón.
- **Problema:** Para usuarios con daltónismo o en condiciones de bajo contraste, el cambio de texto puede no ser suficiente. Además, el botón se deshabilita pero visualmente es muy similar.
- **Principios violados:**
  - **Visibility of System Status**: el sistema debe informar claramente que está trabajando.
- **Alternativa propuesta:** Agregar un spinner CSS dentro del botón y reducir opacidad del fondo al 70% durante `cargando`.

---

### 3. Pantalla de Juego

#### 3.1 Botón "Restart" sin confirmación (Error Slip)
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 210-217)
- **Decisión actual:** Un solo clic en "Restart" reinicia la partida inmediatamente.
- **Problema:** Es un objetivo grande cerca del título. Un **Slip** (error de acción no intencional, Norman, 1988) es muy probable, especialmente en móvil.
- **Principios violados:**
  - **Error Prevention** (Nielsen, #5)
  - **Slip Prevention** (Donald Norman): diseñar para que los errores no sean catastróficos.
- **Alternativa propuesta:**
  - Requerir un segundo clic (patrón **Double Confirm**) o
  - Cambiar a "¿Seguro?" durante 2 segundos (patrón **Undo Prompt**).

#### 3.2 Feedback cromático sin alternativa para daltónicos
- **Archivo:** `App.css` (líneas 449-465)
- **Decisión actual:** Los estados del tablero se comunican únicamente por color: verde (#68a55d), amarillo (#d9b24f), gris (#7b7b7b).
- **Problema:** Aproximadamente **8% de los hombres y 0.5% de las mujeres** tienen alguna forma de daltónismo. No pueden distinguir verde/amarillo o gris/amarillo.
- **Principios violados:**
  - **WCAG 1.4.1 Use of Color** (Nivel A): el color no debe ser el único medio visual para transmitir información.
- **Alternativa propuesta:**
  - Agregar íconos: ✓ (correcto), ⇄ (presente, posición incorrecta), ✕ (ausente).
  - O patrones de fondo: sólido, rayas, puntos.

#### 3.3 Teclado numérico y botón Delete adyacentes (Fitts's Law)
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 280-298)
- **Decisión actual:** El botón "Delete" está directamente debajo del grid numérico, alineado a la izquierda.
- **Problema:** En móvil, el usuario puede tocar accidentalmente "Delete" al intentar presionar el último número de la fila inferior. Esto es un **objetivo de error** (error target) según Fitts's Law.
- **Alternativa propuesta:** Separar el botón Delete del grid con más espacio o moverlo a la derecha (opuesto a Check), creando una simetría que reduce errores.

#### 3.4 Modal forzado sin botón de cerrar
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 301-342)
- **Decisión actual:** El modal final (`role="dialog"`) solo ofrece "Guardar puntaje" y "Play Again". No hay una X ni un "Cerrar".
- **Problema:** Obliga al usuario a una acción. No puede revisar el tablero final, tomar una captura de pantalla, o simplemente pausar.
- **Principios violados:**
  - **User Control and Freedom** (Nielsen, #3)
  - **Modal Forced Action** (patrón anti-UX): los modales deben ser escapables.
- **Alternativa propuesta:** Agregar un botón "Ver tablero" o una X de cierre que permita mantener el modal cerrado y seguir viendo la pantalla de juego.

#### 3.5 Feedback de éxito al guardar puntaje invisible
- **Archivo:** `useJuego.ts` (líneas 375-398) + `JuegoVistaPantalla.tsx` (modal)
- **Decisión actual:** Al guardar, `mensaje` cambia a "Puntaje guardado correctamente...", pero ese mensaje se renderiza detrás del modal, no dentro de él.
- **Problema:** El usuario no recibe **feedback inmediato y contextual** de que la acción fue exitosa.
- **Principios violados:**
  - **Feedback** (Shneiderman, 8 Golden Rules): el sistema debe informar sobre la respuesta a la acción del usuario.
- **Alternativa propuesta:** Mostrar un toast o banner verde *dentro* del modal cuando `puntaje_Guardado === true`.

#### 3.6 Mezcla de idiomas en la interfaz (Spanglish)
- **Archivo:** `JuegoVistaPantalla.tsx`
- **Ejemplos:** "Find the 4 numbers" (inglés) junto a "Victoria / Derrota" (español). Botones "Restart", "Check", "Delete" (inglés) junto a "Guardar puntaje", "Reiniciar" (español).
- **Problema:** Genera **Cognitive Friction** y rompe **Consistency and Standards** (Nielsen, #4). El cerebro bilingüe conmuta constantemente, aumentando la carga cognitiva.
- **Alternativa propuesta:** Estandarizar todo en español (audiencia objetivo aparente) o todo en inglés. No mezclar.

#### 3.7 Accesibilidad del grid (parcial)
- **Archivo:** `JuegoVistaPantalla.tsx` (líneas 225-243)
- **Positivo:** Uso de `role="grid"`, `role="row"`, `role="gridcell"`. Esto es excelente.
- **Negativo:** Falta `aria-label` en la fila que describa la ecuación completa (ej. "Intento 1: 1 más 2 por 3 menos 4 igual 7"). Un screen reader leería números sueltos sin contexto de la operación.
- **Alternativa propuesta:** Agregar `aria-label` dinámico en cada `.fila_Tablero` que describa la ecuación en lenguaje natural.

---

### 4. Diseño Visual y CSS

#### 4.1 Enfoque CSS Desktop-First
- **Archivo:** `App.css`
- **Decisión actual:** Las media queries usan `@media (max-width: 1080px)`, `@media (max-width: 820px)`, `@media (max-width: 640px)`.
- **Problema:** Este enfoque **Desktop-First** genera mayor especificidad y dificulta el mantenimiento. En 2026, el tráfico móvil supera el 60% globalmente.
- **Principios aplicables:**
  - **Mobile-First** (Luke Wroblewski): diseñar para constraints pequeños primero, luego escalar.
- **Alternativa propuesta:** Refactorizar a `min-width` breakpoints. Base para móvil, luego tablet, luego desktop.

#### 4.2 Uso de `backdrop-filter: blur` sin fallback
- **Archivo:** `App.css` (líneas 82-83)
- **Decisión actual:** `backdrop-filter: blur(16px)` se aplica a paneles sin fallback para navegadores que no lo soportan (Firefox en algunos contexts, navegadores antiguos).
- **Problema:** El panel puede verse transparente sin blur, reduciendo legibilidad del texto sobre el fondo.
- **Alternativa propuesta:**
  ```css
  .panel {
    background: rgba(255, 252, 248, 0.95); /* fallback sólido */
    background: var(--color-panel);
    backdrop-filter: blur(16px);
  }
  ```

#### 4.3 Scroll-behavior sin navegación por anclas
- **Archivo:** `index.css` (línea 2)
- **Decisión actual:** `html { scroll-behavior: smooth; }`
- **Problema:** No hay anclas (`#id`) ni navegación interna. Es **Dead Code** que aumenta ligeramente la especificidad global sin beneficio.
- **Alternativa propuesta:** Eliminarlo o agregar navegación por anclas a secciones si se expande la landing.

#### 4.4 Ausencia de modo oscuro
- **Archivo:** `App.css` (variables de color)
- **Decisión actual:** Paleta cálida (beige, blanco roto). Sin `@media (prefers-color-scheme: dark)`.
- **Problema:** En entornos de baja luz, el fondo claro causa fatiga visual y deslumbra.
- **Alternativa propuesta:** Implementar un tema oscuro usando las mismas variables CSS:
  ```css
  @media (prefers-color-scheme: dark) {
    :root {
      --color-fondo: #1a1612;
      --color-texto: #f0e6d8;
      /* ... */
    }
  }
  ```

---

### 5. Arquitectura de Hooks y Estado

#### 5.1 Hook monolítico `useJuego`
- **Archivo:** `useJuego.ts` (455 líneas)
- **Decisión actual:** Todo el estado y la lógica de presentación viven en un solo hook.
- **Problema:** Mezcla lógica de dominio (`construir_Operacion`, `obtener_Estado_Tecla`) con lógica de UI (`set_Modal_Visible`, `set_Error`). Dificulta las pruebas unitarias y el razonamiento sobre el estado.
- **Principios violados:**
  - **Single Responsibility Principle** (SRP): un módulo debe tener una única razón para cambiar.
  - **Cognitive Load Theory** (Sweller): más líneas de código en un archivo = más carga de trabajo de memoria para el desarrollador.
- **Alternativa propuesta:**
  - Extraer `useTablero` (estado del grid y selección).
  - Extraer `useTeclado` (estado de teclas y retroalimentación).
  - Extraer `usePartida` (comunicación con `juego_Vista` y estado de la partida).
  - `useJuego` orquesta los tres hooks anteriores.

#### 5.2 Uso prematuro de `useDeferredValue` y `useTransition`
- **Archivo:** `useRanking.ts` (líneas 14-15)
- **Decisión actual:** Se usan para "suavizar" la actualización del ranking.
- **Problema:** El ranking tiene máximo 10 elementos. El costo de renderizado es **infinitesimal** (< 1ms). Agregar estas APIs aumenta la complejidad cognitiva del código sin beneficio perceptible.
- **Principios violados:**
  - **YAGNI** (You Ain't Gonna Need It): no optimizar prematuramente.
  - **KISS** (Keep It Simple, Stupid): complejidad innecesaria.
- **Alternativa propuesta:** Usar `useState` directamente. Agregar `useTransition` solo si se miden cuellos de botella reales con React Profiler.

#### 5.3 Falsa recuperación de partida (`recuperar_Partida`)
- **Archivo:** `useJuego.ts` (líneas 209-228)
- **Decisión actual:** Al montar el componente, intenta `vista.sincronizar_Estado()`.
- **Problema:** En el backend, `juego_Logica` es un singleton por instancia de controlador. En un entorno con múltiples usuarios, `sincronizar_Estado` puede retornar la partida de **otro usuario** o nada. El frontend asume que esto "recupera" la sesión.
- **Principios violados:**
  - **Error Recovery** (Nielsen): parece recuperar, pero en realidad falla silenciosamente o peor, muestra datos de otro usuario.
- **Alternativa propuesta:**
  - Eliminar esta función hasta tener sesiones reales.
  - O, implementar sesiones con `localStorage` + `sessionId` como se propuso en 1.2.

---

## PARTE 2: ARCHITECTURE DECISION RECORDS (ADRs)

---

### ADR-001: Elección de React puro + Vite (sin framework)
- **Estado:** Aceptada, con limitaciones conocidas.
- **Contexto:** Se necesitaba una SPA ligera para un juego de navegador.
- **Decisión:** Usar React 19 con Vite. No usar Next.js, Remix, ni Astro.
- **Consecuencias:**
  - ✅ Bundle rápido, HMR instantáneo, configuración mínima.
  - ❌ Sin SSR (SEO nulo), sin routing nativo, sin API routes, sin Image Optimization.
- **Riesgo UX:** Sin SSR, el usuario ve una pantalla blanca hasta que JS carga. En conexiones 3G, esto puede durar segundos. No hay skeleton ni placeholder.
- **Alternativas consideradas:** Next.js (rechazado por complejidad innecesaria para una sola pantalla). Astro (rechazado por preferencia de equipo en React).
- **Recomendación:** Mantener, pero agregar un `index.html` con un skeleton CSS inline para mejorar **Perceived Performance**.

---

### ADR-002: Patrón Modelo-Vista-Presentador (MVP) en el frontend
- **Estado:** Aceptada con deuda técnica alta.
- **Contexto:** Separar lógica de negocio de la UI.
- **Decisión:** Capas `modelo` (Juego, Usuario), `vista` (juego_Vista, JuegoVistaPantalla), `hooks` (useJuego, useRanking), `servicios` (game_Service).
- **Consecuencias:**
  - ✅ Conceptualmente limpio. Facilita testing unitario de `modelo`.
  - ❌ `useJuego` viola SRP al mezclar presentación y orquestación. La clase `juego_Vista` es un adaptador poco cohesionado.
- **Riesgo UX:** La rigidez arquitectónica ralentiza la iteración. Cambiar una regla de retroalimentación requiere tocar `useJuego`, `Juego.ts`, y CSS.
- **Alternativa:** Usar una máquina de estados finita (XState) para modelar el juego. Esto haría explícitos los estados (inicio -> jugando -> ganado/perdido -> guardado) y facilitaría animaciones transicionales.

---

### ADR-003: Estado global en memoria (sin gestor de estado)
- **Estado:** Aceptada por simplicidad, riesgosa para escalar.
- **Contexto:** Compartir estado entre componentes.
- **Decisión:** No usar Redux, Zustand, Context API ni Jotai. Todo vive en `useJuego` y se propaga por props.
- **Consecuencias:**
  - ✅ Sin boilerplate. Sin problemas de re-renderizado por Context.
  - ❌ Imposible escalar a múltiples pantallas. No hay persistencia. El "prop drilling" es latente.
- **Riesgo UX:** No hay sincronización de estado entre pestañas del navegador.
- **Recomendación:** Mantener para MVP. Si se agrega una tercera pantalla (ej. perfil, historial), migrar a Zustand.

---

### ADR-004: Sin Router del lado del cliente
- **Estado:** **RECHAZADA para producción.**
- **Contexto:** Navegación entre pantallas de juego.
- **Decisión:** Usar un string `pantalla_Actual: "inicio" | "juego"` en vez de React Router.
- **Consecuencias:**
  - ✅ Código muy simple. Sin dependencias extra.
  - ❌ No hay URLs compartibles. El botón "Atrás" del navegador sale de la app. No hay deep linking.
- **Riesgo UX severo:** El usuario no puede compartir una partida. No puede usar gestos de navegación nativos.
- **Alternativa:** Wouter (1KB) o React Router v6.
- **Decisión final:** Debe migrarse antes de cualquier lanzamiento público.

---

### ADR-005: Backend stateful en memoria (singleton `juego_Logica`)
- **Estado:** **RECHAZADA para producción.**
- **Contexto:** Persistencia de partida activa en el servidor.
- **Decisión:** El controlador instancia `juego_Logica` una vez y guarda `this.partida` en memoria.
- **Consecuencias:**
  - ✅ Fácil de implementar. Sin base de datos para sesiones.
  - ❌ No escala horizontalmente. Dos usuarios simultáneos corrompen el estado. No hay aislamiento de sesión.
- **Riesgo UX crítico:** Un usuario puede ver (o sobrescribir) la partida de otro usuario.
- **Alternativa:** Sessions con `express-session` + Redis, o JWT + estado en `localStorage`.
- **Recomendación:** Implementar inmediatamente un `sessionId` por partida.

---

### ADR-006: CSS puro con variables CSS (sin UI framework)
- **Estado:** Aceptada para el alcance actual.
- **Contexto:** Estilizado de componentes.
- **Decisión:** No usar Tailwind, Chakra, MUI, ni Styled Components. Todo es CSS puro en `App.css`.
- **Consecuencias:**
  - ✅ Control total del diseño. Bundle pequeño (0KB de CSS framework).
  - ❌ No hay sistema de diseño documentado. No hay componentes reutilizables. El CSS es monolítico (708 líneas).
- **Riesgo UX:** La inconsistencia visual es probable a medida que crezca el equipo. No hay tokens de espaciado estandarizados (se usan valores arbitrarios como `1.75rem`, `0.95rem`).
- **Recomendación:** Documentar tokens o migrar a Tailwind con una configuración personalizada que respete la paleta actual.

---

### ADR-007: Doble canal de datos (REST propia + Supabase directo)
- **Estado:** **CUESTIONABLE / RIESGOSA.**
- **Contexto:** Persistencia de datos.
- **Decisión:** El frontend tiene `game_Service` (REST hacia backend propio) Y `supabase_Service` (acceso directo a Supabase).
- **Consecuencias:**
  - ✅ Flexibilidad para operaciones directas (ej. leer ranking en tiempo real).
  - ❌ **Confusión arquitectónica**: dos fuentes de verdad. El frontend expone la `anon key` de Supabase, permitiendo acceso directo a la BD si las RLS no están perfectamente configuradas.
- **Riesgo de seguridad y UX:** Si las RLS fallan, un usuario malintencionado puede manipular datos de otros. Desde UX, esto genera datos inconsistentes entre el ranking de la API y el ranking de Supabase.
- **Recomendación:** Consolidar TODO el acceso a datos a través del backend Express. Eliminar `supabase_Service` del frontend o reducirlo a un rol de "real-time subscriptions" si es estrictamente necesario.

---

### ADR-008: Fetching manual con `fetch` nativo
- **Estado:** Aceptada por simplicidad, con deuda técnica.
- **Contexto:** Comunicación HTTP con el backend.
- **Decisión:** Usar `fetch` nativo en `game_Service`, sin React Query, SWR, ni Axios.
- **Consecuencias:**
  - ✅ Sin dependencias. Código transparente.
  - ❌ Sin caching, sin deduplicación de requests, sin reintentos automáticos, sin manejo de estado de red (online/offline).
- **Riesgo UX:** En redes inestables, el usuario ve errores crudos o fallas silenciosas. No hay "retry" automático ni indicadores de red.
- **Alternativa:** TanStack Query (React Query). Proporciona caching, background refetching, y manejo de errores declarativo.
- **Recomendación:** Migrar a TanStack Query para el fetching de ranking y estado de juego.

---

### ADR-009: Ausencia de persistencia local (`localStorage`)
- **Estado:** Cuestionable.
- **Contexto:** Recuperación de partida tras refresh.
- **Decisión:** No usar `localStorage` ni `sessionStorage`. El estado se pierde al refrescar.
- **Consecuencias:**
  - ✅ Sin preocupaciones de privacidad (GDPR) por almacenamiento local.
  - ❌ UX terrible: un refresh accidental borra el progreso.
- **Principio UX violado:** Session Continuity.
- **Alternativa:** `localStorage` para estado de draft (nombre, dificultad seleccionada, historial de intentos) como respaldo. Sincronizar con backend al reconectar.
- **Recomendación:** Implementar `localStorage` backup para el estado de juego.

---

### ADR-010: Convención de nomenclatura `snake_case` en TypeScript
- **Estado:** **RECHAZADA.**
- **Contexto:** Estilo de código del equipo.
- **Decisión:** Todo el frontend usa `get_nombre_Usuario()`, `use_Juego`, `puntaje_Jugador`, etc.
- **Consecuencias:**
  - ✅ Posiblemente familiar para desarrolladores de Python o backend.
  - ❌ **Viola las convenciones de TypeScript/JavaScript (camelCase)**. Dificulta la integración con librerías externas, autocompletado, y lectura por parte de desarrolladores JS/TS estándar.
- **Riesgo:** Fricción en onboarding de nuevos devs. Inconsistencia con el ecosistema React.
- **Recomendación:** Migrar TODO a camelCase (`getNombreUsuario`, `useJuego`, `puntajeJugador`).

---

## RESUMEN EJECUTIVO DE HALLAZGOS

| Categoría | Hallazgos críticos | Hallazgos moderados | Hallazgos menores |
|---|---|---|---|
| **Accesibilidad** | Feedback solo por color (daltónismo) | Foco invisible en chips | Grid semántico bien implementado |
| **Navegación** | Sin router, sin URLs, sin historial | Modal forzado sin cerrar | — |
| **Formularios** | Sin validación inline | Error genérico post-submit | Label anidado funcional pero no óptimo |
| **Estado/Sesión** | Backend singleton compartido | Sin `localStorage` backup | Falsa recuperación de partida |
| **Copy/Lenguaje** | Mezcla Español/Inglés | Jargon técnico en bienvenida | — |
| **Arquitectura CSS** | Desktop-first media queries | CSS monolítico | `scroll-behavior` muerto |
| **Arquitectura JS** | Hook monolítico de 455 líneas | `useDeferredValue` innecesario | — |
| **Seguridad/Confianza** | Doble canal Supabase + REST | — | — |

---

## PRÓXIMAS ACCIONES RECOMENDADAS (Prioridad)

1. **P0 — Seguridad y Sesiones:** Implementar `sessionId` en backend y eliminar acceso directo a Supabase desde frontend (consolidar por API).
2. **P0 — Accesibilidad:** Agregar íconos/patrones al feedback del tablero para daltónicos.
3. **P1 — Navegación:** Agregar Wouter o React Router para habilitar URLs y botón atrás.
4. **P1 — Estado local:** Backup en `localStorage` para recuperación de partida.
5. **P2 — Refactor hooks:** Dividir `useJuego` en hooks especializados.
6. **P2 — CSS:** Migrar a mobile-first y agregar modo oscuro.
7. **P3 — TanStack Query:** Reemplazar fetching manual para mejor manejo de red.
8. **P3 — Idioma:** Estandarizar todo el copy en español.

---

*Documento generado con enfoque crítico. Cada decisión debe justificarse con principios nombrados; de lo contrario, es opinión no fundamentada.*
