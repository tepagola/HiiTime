# PLAN.md - HiiTime

## 1. Visión del Producto
Aplicación web simple (SPA) para gestionar y ejecutar rutinas de entrenamiento HIIT/Tabata/Circuitos sin distracciones.
**Problema:** Las apps actuales son complejas, requieren interacción constante o no manejan bien la mezcla de tiempo/repeticiones.
**Solución:** Una interfaz limpia que guía al usuario ejercicio por ejercicio con un cronómetro y persistencia automática del estado actual.

## 2. MVP (Producto Mínimo Viable)

### Funcionalidades Core
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

## 3. Arquitectura (Definida por @backend-architect)

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

## 4. Diseño (A definir por @frontend-pwa)
*   Componentes UI.
*   Flujo de navegación.
