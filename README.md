# HexaHealth - Módulo E6: Gestor Nutricional y Catálogo de Alimentos

Proyecto académico de la asignatura **Procesos de Software** · 3.º Grado en Ingeniería del Software · Universidad Rey Juan Carlos

## Equipo 6 (E6)

Marcos Vidal Castillo · Pablo Villaplana Rodríguez · Paula Sánchez Garduño · Emiliano Sánchez Moreno · David Sebastián Sticea Covaciu · Raúl Tejada Merinero · Rubén Torres Rivero · Alessio Vecchio

Los roles de Scrum Master y Product Owner rotan; cada sprint indica los suyos:
- **Sprint 1:** Scrum Master: Marcos Vidal Castillo · Product Owner: Pablo Villaplana Rodríguez · Equipo de desarrollo: Paula Sánchez Garduño, Emiliano Sánchez Moreno, David Sebastián Sticea Covaciu, Raúl Tejada Merinero, Rubén Torres Rivero, Alessio Vecchio.
- **Sprint 2:** Scrum Master: Emiliano Sánchez Moreno · Product Owner: Rubén Torres Rivero · Equipo de desarrollo: Marcos Vidal Castillo, Pablo Villaplana Rodríguez, Paula Sánchez Garduño, David Sebastián Sticea Covaciu, Raúl Tejada Merinero, Alessio Vecchio.

## Descripción del Módulo

Subsistema **E6** de la aplicación global "Healthy Life". Se encarga de:

- Gestionar el catálogo de alimentos y sus valores nutricionales (macros).
- Permitir la creación de menús semanales personalizados.
- Aplicar reglas de bloqueo automático de ingredientes prohibidos según el perfil médico/alergias del usuario.
- Generar listas de la compra automatizadas.

## Roadmap

| Sprint | Foco | Historias de usuario (puntos) |
| ------ | ---- | ----------------------------- |
| [Sprint 1](docs/sprint1-readme.md) | MVP: funcionalidad básica | HU 1.1 Buscar alimentos y ver macros (3) · HU 1.2 Iconos de alérgenos (2) · HU 2.1 Objetivo calórico diario (3) · HU 3.1 Crear menú básico (5) |
| [Sprint 2](docs/sprint2-readme.md) | Lógica de negocio y seguridad | HU 2.2 Configurar alergias (2) · HU 2.3 Preferencias dietéticas (2) · HU 3.2 Sumar calorías del menú (3) · HU 3.3 Guardar menú favorito (2) · HU 3.4 Motor de reglas para bloquear alimentos peligrosos (5) · HU 1.3 Administrador añade alimentos (3) |
| Sprint 3 | Funciones extra y cierre | HU 4.1 Despensa virtual (3) · HU 4.2 Sugerencias de recetas según la despensa (5) · HU 5.1 Lista de la compra desde el menú (5) · HU 5.2 Marcar ingredientes de la lista (2) · HU 5.3 Compartir lista (WhatsApp/Email) (3) |

## Enlaces de Interés

- **Tablero Miro (Product Discovery & User Story Map):** [Healthy Life en Miro](https://miro.com/welcomeonboard/eC8vdlVYNEhXNmY2MkMwTEhFS2JGZ3lQZHptSWE1YzRXb1JzUlNoKzhkSHZ1SThwQkRJUVpyOXU0eTRQQVdoSUErNXZCM25LcW9wclJuZmZOZjFNb3RBVFhWSDVOTklMREU0R0R6TkUzMTg3cU5taXF2YkJDa3NBM0lMeWJreUNzVXVvMm53MW9OWFg5bkJoVXZxdFhRPT0hdjE=?share_link_id=302909706404)
- **Tablero Jira (Sprint Backlog):** [Healthy Life en Jira](https://procesossoftware.atlassian.net/jira/software/projects/SCRUM/summary?atlOrigin=eyJpIjoiODQ6NjYwOTg5MmE3NDNkZmFhOGUzgzgzYjU3ZGIwNTkiLCJwIjoiaiJ9)
- **Documentación API / Mocks:** en la carpeta [`/mocks`](mocks) de este repositorio.

---

## Stack Tecnológico

- **Frontend:** React + TypeScript + Vite y TailwindCSS, con la identidad visual de la URJC (rojo corporativo `primary`, gris oscuro `secondary`).
- **Backend:** Node.js con Express (API REST).
- **Datos:** ficheros JSON de la carpeta `mocks/`. Previsto: SQLite (el esquema ya está en `backend/src/store/sqliteStore.js`, sin uso activo).
- **Tests E2E:** Playwright (carpeta `e2e/`).
- **Despliegue:** Git, GitHub y Docker.
- **Seguridad:** previstos tokens JWT; por ahora no hay autenticación y el frontend usa un usuario de demo.

---

## Ejecución

Requisitos: **Node.js 22 o superior** y **Docker**.

```bash
docker compose up --build                   # frontend :5173, API :3000/api/health
docker compose down                         # lo guardado en mocks/ se conserva

cd backend && npm install && npm run dev    # API en :3000
cd frontend && npm install && npm run dev   # Front en :5173
cd frontend && npm run typecheck            # comprobación de tipos

cd e2e && npm install && npm run install:browsers   # solo la primera vez
cd e2e && npm test                          # batería E2E
cd e2e && npm run test:ui                   # interfaz visual de Playwright
cd e2e && npm run screenshots               # regenera docs/assets/sprint*/*.png
```

**Tests E2E** (`e2e/tests/`, Playwright): un fichero por área (catálogo, perfil, menú) y un test por criterio de aceptación, nombrado con él (por ejemplo, `HU 1.1 › AC2`).
Cada test abre la app en un navegador real, hace lo que haría una persona y comprueba lo que se ve y lo que se guarda en la API; los pasos van comentados como Dado / Cuando / Entonces.
Arrancan su propio backend (:3100) y frontend (:5174) sobre una copia temporal de `mocks/`, así que no modifican los datos del repositorio.

El backend escribe en `mocks/` (perfil y menús), por eso `docker-compose.yml` monta esa carpeta como volumen.

---

## Arquitectura de Integración y Contratos (API REST)

El acuerdo de interfaces no es solo interno: es la negociación con los otros equipos de la clase (por ejemplo, con el equipo **E1**, que hace los usuarios, o el **E2**, que hace las gráficas). Sirve para decidir cómo se van a comunicar los servidores en el futuro para que nadie programe a ciegas.

El Módulo E6 se comunica con el resto del ecosistema Healthy Life mediante una arquitectura orientada a microservicios simulada vía **API REST**, utilizando **JSON** como formato de intercambio de datos.

### Dependencias entrantes (lo que E6 necesita leer)

**Perfil nutricional y alergias — dependencia de E1 (Gestión de Usuarios)**

Para la validación estricta de restricciones médicas y el cálculo de menús, E6 consume los perfiles gestionados por el módulo de identidades.

- **Endpoint esperado:** `GET /api/users/{userId}/nutritional-profile`
- **Payload requerido** (los ids de alérgeno son los de `GET /api/allergens`; se actualiza según lo que necesite cada HU):

  ```json
  {
    "userId": "5d37a69d-97c8-4280-afb7-2dc90467d688",
    "weight": 75.5,
    "caloricGoal": 2200,
    "medicalRestrictions": {
      "allergies": ["gluten", "frutos_secos"],
      "dietType": "vegan"
    }
  }
  ```

- **Estado actual:** aislado y resuelto mediante simulación local. Para evitar bloqueos, la respuesta de este endpoint está mockeada en [`/mocks/mock_usuarios.json`](mocks/mock_usuarios.json).

### Servicios expuestos (lo que E6 ofrece al resto)

**Telemetría nutricional — consumido por E2 (Seguimiento de Hábitos) y E5 (Entrenamiento)**

Para alimentar el dashboard analítico y de seguimiento de hábitos, E6 presenta el consumo calórico en tiempo real: calorías totales consumidas en el día actual y desglose de macronutrientes listos para ser graficados

- **Endpoint expuesto:** `GET /api/nutrition/{userId}/daily-summary`
- **Respuesta proporcionada:**

  ```json
  {
    "userId": "string",
    "date": "YYYY-MM-DD",
    "totalCaloriesConsumed": "number",
    "macros": {
      "protein": "number",
      "carbs": "number",
      "fats": "number"
    }
  }
  ```

### Endpoints internos de E6

| Método | Ruta                                      | Descripción                                                                                                                                     |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/foods?search=`                      | Catálogo de alimentos, con búsqueda por nombre (sin distinguir mayúsculas ni tildes)                                                            |
| GET    | `/api/allergens`                          | Catálogo de alérgenos (id, nombre, icono y explicación)                                                                                         |
| PUT    | `/api/users/{userId}/nutritional-profile` | Actualiza el objetivo calórico diario (`caloricGoal`) (escribe en `mock_usuarios.json`)                                                         |
| PUT    | `/api/users/{userId}/allergies`           | Sustituye las alergias del usuario: recibe un array de ids de alérgeno, p. ej. `["gluten", "lactosa"]` (escribe en `mock_usuarios.json`)         |
| GET    | `/api/menus/{userId}`                     | Menú del usuario (vacío si aún no tiene)                                                                                                        |
| PUT    | `/api/menus/{userId}`                     | Guarda el menú `{ days: { lunes: { desayuno: [foodId], comida: [], cena: [] }, ... } }`                                                        |
| GET    | `/api/menus/favorites`                    | Lista los menús favoritos con nombre                                                                                                            |
| POST   | `/api/menus/favorites`                    | Guarda un menú favorito `{ userId, name, days }`                                                                                                |

---

## Definition of Done

Una HU está terminada solo si cumple los cinco puntos; si falta alguno, no pasa a "Done" en Jira.

1. **Código revisado:** rama `feature/SCRUM-<n>-<nombre>` y PR con la [plantilla](PULL_REQUEST_TEMPLATE.md) rellena, aprobado por otro miembro del equipo. Se acepta con "Create a merge commit" (sin squash).
2. **Pruebas en verde:** un test E2E por criterio de aceptación (`HU 3.4 › AC1`) y la batería completa pasando antes del merge.
3. **Documentación al día:** README y API reflejan los endpoints y reglas nuevos.
4. **Aceptada por el PO:** valida los criterios de aceptación; solo el PO acepta o rechaza el incremento.
5. **Sin secretos** en el código ni en el historial de Git.

---

## Estándares de Desarrollo Interno (leer antes de hacer push)

1. **Tipado de IDs:** utilizar siempre formato **UUID v4** (ej. `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`) para todos los identificadores (usuarios, alimentos, menús). Evita colisiones entre módulos.
2. **Tratamiento de alérgenos:** el motor de reglas compara strings en **español, minúsculas, sin tildes ni espacios** (ej. `"gluten"`, `"frutos_secos"`).
3. **Respuestas HTTP y errores:** todo endpoint devuelve un JSON válido. En caso de error, la respuesta estándar es:

   ```json
   { "error": true, "code": 404, "message": "Descripción del problema" }
   ```

4. **Bloqueo por mock:** no hacer peticiones `fetch`/`axios` reales a las URLs de otros equipos. Leer directamente del archivo local `mocks/mock_usuarios.json`.