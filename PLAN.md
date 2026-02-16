# PLAN.md - HiiTime

## 1. Visión del Producto - [COMPLETADO]
Aplicación web simple (SPA) para gestionar y ejecutar rutinas de entrenamiento HIIT/Tabata/Circuitos sin distracciones.
**Problema:** Las apps actuales son complejas, requieren interacción constante o no manejan bien la mezcla de tiempo/repeticiones.
**Solución:** Una interfaz limpia que guía al usuario ejercicio por ejercicio con un cronómetro y persistencia automática del estado actual.

## 2. MVP (Producto Mínimo Viable)

### Funcionalidades Core - [COMPLETADO]
1.  **Creador de Rutinas**:
    *   Añadir ejercicios a una lista.
    *   Tipos de ejercicio:
        *   **Tiempo**: Cronómetro cuenta atrás (ej. 40s).
        *   **Repeticiones**: Solo informativo (ej. 10 reps). El usuario pulsa "Next" manualmente o se estima un tiempo (MVP: Botón "Siguiente" manual para reps es más seguro, o un timer estimado como sugiere el usuario). *Decisión: Timer estimado + Botón "Hecho" para avanzar antes si se acaba.*
        *   **Descanso**: Cronómetro cuenta atrás.
    *   Definir número de vueltas (Rounds) al circuito completo.
2.  **Modo Entrenamiento ("Play")**:
    *   Pantalla principal limpia con: Cronómetro gigante, Ejercicio actual, Siguiente ejercicio (preview).
    *   Avisos sonoros/visuales al cambiar.
    *   Persistencia: Si cierras el navegador, al volver está donde lo dejaste (o al menos el plan está cargado listo para retomar).
3.  **Resumen**:
    *   Al acabar (o parar), mostrar resumen breve.
    *   Botón "Borrar y Nuevo" para empezar de cero.

### Restricciones Técnicas
*   **Stack**: React + Vite (Ya iniciado).
*   **Datos**: No backend. Todo en `localStorage`.
*   **Diseño**: Mobile-first, botones grandes, alto contraste.

## 3. Arquitectura (Definida por @backend-architect) - [COMPLETADO]

### Modelo de Datos (TypeScript + Zod)
Defined in `src/types/models.ts`:

*   **`Exercise`**:
    *   `id`: UUID
    *   `name`: string
    *   `type`: 'timer' | 'reps' | 'rest'
    *   `duration`: number (segundos, para timer/rest)
    *   `reps`: number (para reps)
*   **`Plan`**:
    *   `id`: UUID
    *   `exercises`: Exercise[]
    *   `rounds`: number
    *   `createdAt`: timestamp

### Persistencia
*   **Storage**: `localStorage` del navegador.
*   **Key**: `hiitime_current_plan`
*   **Estrategia**:
    *   **Save**: Cada cambio en el "Creador" guarda el plan completo.
    *   **Load**: Al iniciar la app, validar presencia de data con schema Zod. Si falla, borrar y limpiar.
    *   **Delete**: Botón explícito "Nuevo Plan" borra la key.

## 5. Próximas Fases (En desarrollo)

### Fase 5: Internacionalización (EN/ES) - [COMPLETADO]
*   **Detección Automática**: Lógica para identificar el idioma del navegador/país y establecer ES/EN por defecto.
*   **Selector Manual**: Componente en la UI para cambiar entre idiomas.
*   **Traducciones**: Migración de todos los textos hardcoded a un sistema de claves.
*   **Persistencia**: Guardar la preferencia en `localStorage`.

### Fase 6: Gestión de Misiones (Guardado Local) - [COMPLETADO]
*   **Almacenamiento**: Persistencia de hasta 10 rutinas (planes) en `localStorage` (o IndexedDB abstraída).
*   **Lógica de Negocio**:
    *   Guardar rutina actual en lista "Mis Misiones".
    *   Límite de 10 slots.
    *   Si lleno (10/10) -> UI para sobreescribir/reemplazar una existente.
*   **UI**:
    *   Botón "Guardar Misión".
    *   Menú/Modal "Cargar Misión" con lista de rutinas guardadas.
    *   Confirmación de reemplazo.

### Fase 7: PWA & Calidad (Basado en QA Report)
*   Fix manifest and service worker.
*   SEO meta tags.
*   A11y improvements.

### Fase 8: Bloqueo de Pantalla (Screen Wake Lock) - [PENDIENTE]
**Objetivo:** Evitar que la pantalla del dispositivo se apague o entre en modo reposo durante la ejecución del entrenamiento, lo cual es crítico para que el usuario pueda ver el tiempo restante y el siguiente ejercicio sin tener que tocar el dispositivo con las manos sudadas.

*   **Implementación Técnica:**
    *   Utilizar la **Screen Wake Lock API** nativa del navegador (`navigator.wakeLock`).
    *   Crear un hook personalizado o servicio (`useWakeLock` o `WakeLockManager`) para gestionar el ciclo de vida.
*   **Comportamiento:**
    *   **Activar (Request):** Automáticamente cuando el cronómetro comienza a correr ("Play").
    *   **Desactivar (Release):** Automáticamente cuando el entrenamiento se pausa, se termina, o el usuario navega fuera de la vista de ejecución.
    *   **Recuperación:** Gestionar la re-adquisición del bloqueo si la app pierde el foco (ej. cambio de pestaña) y lo recupera, o si el bloqueo es liberado por el sistema por batería baja.
*   **UX/UI:**
    *   No requiere interfaz compleja, es una mejora "invisible" pero vital.
    *   Opcional: Un pequeño icono en la interfaz de "Runner" que indique si la pantalla está bloqueada (fija), o un mensaje de error (toast) si el navegador no soporta la API o falla la solicitud (batería baja).

### Fase 9: Estructura Completa de Entrenamiento (Warm-up & Cooldown) - [PENDIENTE]
**Objetivo:** Profesionalizar la estructura de las rutinas permitiendo fases de "Calentamiento" y "Vuelta a la Calma" que se ejecuten una única vez, diferenciándolas del "Núcleo" del entrenamiento (el circuito) que sí se repite por vueltas (Rounds).

*   **Cambios en Modelo de Datos (`Plan`):**
    *   Extender la interfaz `Plan` para soportar estructuras más complejas.
    *   Actual:
        ```typescript
        { exercises: Exercise[], rounds: number }
        ```
    *   Nuevo:
        ```typescript
        {
          warmup: Exercise[], // Se ejecuta 1 vez al inicio
          exercises: Exercise[], // Circuito principal (se repite N rounds)
          cooldown: Exercise[], // Se ejecuta 1 vez al final
          rounds: number // Aplica solo a 'exercises'
        }
        ```
*   **Editor de Rutinas:**
    *   **Secciones Visuales:** Dividir la lista de ejercicios en tres bloques claros:
        1.  **Calentamiento (Opcional):** Lista colapsable o separada.
        2.  **Circuito Principal:** La lista actual, donde aplica el selector de "Rounds".
        3.  **Enfriamiento (Opcional):** Lista al final.
    *   Permitir arrastrar y soltar ejercicios entre secciones (si es posible) o botones específicos de "Añadir a Calentamiento".
*   **Modo Entrenamiento (Runner):**
    *   **Lógica de Secuencia:** Actualizar la máquina de estados para seguir el flujo: `Warmup -> (Circuito * Rounds) -> Cooldown`.
    *   **Indicadores Visuales:**
        *   Mostrar claramente la fase actual: "CALENTAMIENTO", "RONDA X/Y", "ENFRIAMIENTO".
        *   Diferenciar visualmente (quizás con un cambio sutil de color de fondo o etiqueta) cuando se está fuera del circuito principal.
        *   El progreso total debe reflejar la suma de todos los ejercicios de todas las fases.
