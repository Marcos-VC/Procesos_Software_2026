# Healthy Life - Módulo E6: Gestor Nutricional y Catálogo de Alimentos

Proyecto académico de la asignatura **Procesos de Software** · 3.º Grado en Ingeniería del Software · Universidad Rey Juan Carlos

## Equipo 6 (E6)

- **Marcos Vidal Castillo** (Scrum Master - SM)
- **Pablo Villaplana Rodríguez** (Product Owner - PO)
- Paula Sánchez Garduño
- Emiliano Sánchez Moreno
- David Sebastián Sticea Covaciu
- Raúl Tejada Merinero
- Rubén Torres Rivero
- Alessio Vecchio

## Descripción del Módulo

Este repositorio contiene el código correspondiente al Subsistema **E6** de la aplicación global "Healthy Life".

Nuestro módulo se encarga de:

- Gestionar el catálogo de alimentos y sus valores nutricionales (macros).
- Permitir la creación de menús semanales personalizados.
- Aplicar reglas de bloqueo automático de ingredientes prohibidos según el perfil médico/alergias del usuario.
- Generar listas de la compra automatizadas.

## Enlaces de Interés

- **Tablero Miro (Product Discovery & User Story Map):** [Healthy Life en Miro](https://miro.com/welcomeonboard/eC8vdlVYNEhXNmY2MkMwTEhFS2JGZ3lQZHptSWE1YzRXb1JzUlNoKzhkSHZ1SThwQkRJUVpyOXU0eTRQQVdoSUErNXZCM25LcW9wclJuZmZOZjFNb3RBVFhWSDVOTklMREU0R0R6TkUzMTg3cU5taXF2YkJDa3NBM0lMeWJreUNzVXVvMm53MW9OWFg5bkJoVXZxdFhRPT0hdjE=?share_link_id=302909706404)
- **Tablero Jira (Sprint Backlog):** [Healthy Life en Jira](https://procesossoftware.atlassian.net/jira/software/projects/SCRUM/summary?atlOrigin=eyJpIjoiODQ2NjYwOTg5MmE3NDNkZmFhOGUzMjgzYjU3ZGIwNTkiLCJwIjoiaiJ9)
- **Documentación API / Mocks:** en la carpeta [`/mocks`](mocks) de este repositorio.

---

## Stack Tecnológico

- **Frontend:** React.js con Vite (componentes funcionales de interfaz) y **TailwindCSS** para los estilos.
- **Backend:** Node.js con Express (lógica de negocio y API REST).
- **Base de datos:** MongoDB (colecciones de alimentos y menús). _Nota: en el Sprint 1 se utilizan JSON/Mocks; la base de datos definitiva se concretará en Sprints posteriores._
- **Tests E2E:** Playwright (carpeta `e2e/`).
- **Control de versiones y despliegue:** Git, GitHub y Docker.
- **Seguridad:** tokens JWT (JSON Web Tokens) en las cabeceras HTTP para la sesión del usuario.

---

## Despliegue y Ejecución (Docker)

El proyecto está preparado para ejecutarse mediante contenedores Docker, tal y como exige la rúbrica del Sprint 1.

Para levantar el entorno completo, ejecuta desde la raíz del repositorio:

```bash
docker-compose up --build
```

Cuando termine el arranque, estarán disponibles:

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api/health

### Estructura principal

```text
backend/
    src/server.js          # arranque (listen)
    src/app.js             # Express: middlewares, rutas y errores
    src/routes/            # food, user, nutrition, menu
    src/controllers/       # lógica de cada endpoint
    src/services/          # reglas de negocio (usuarios, menús)
    src/store/jsonStore.js # lectura/escritura de los mocks JSON
    Dockerfile
    package.json
frontend/
    src/App.jsx
    src/api.js
    src/components/        # SearchBar, FoodList, FoodItem, ProfileEditor, MenuBuilder...
    src/main.jsx
    src/styles.css         # Tailwind + tokens de diseño
    vite.config.js
    Dockerfile
    nginx.conf
e2e/                       # tests Playwright (una spec por historia de usuario)
mocks/
    mock_usuarios.json
    mock_alimentos.json
    mock_alergenos.json
    mock_consumo.json
    mock_menus.json
docker-compose.yml
```

El backend escribe en los ficheros de `mocks/` (perfil y menús), por eso `docker-compose.yml` monta esa carpeta como volumen.

### Desarrollo local y tests E2E

```bash
cd backend && npm install && npm run dev    # API en :3000
cd frontend && npm install && npm run dev   # Front en :5173

cd e2e && npm install && npm run install:browsers   # solo la primera vez
cd e2e && npm test
```

Los tests arrancan su propio backend (:3100) sobre una copia temporal de `mocks/` y el frontend (:5174), así que no modifican los datos del repositorio ni necesitan Docker.

> **Sobre la batería de tests:** se ha creado para facilitar la **validación de los criterios de aceptación** (Dado/Cuando/Entonces) de cada Historia de Usuario. Hay una spec por historia en `e2e/tests` y cada test está nombrado con su criterio (por ejemplo, `HU 1.1 › AC2`), con los pasos comentados con las mismas palabras "Dado / Cuando / Entonces" de la historia. Así, comprobar que una historia cumple lo acordado con el PO es ejecutar `npm test` y ver qué criterios pasan o fallan.

---

## Arquitectura de Integración y Contratos (API REST)

El acuerdo de interfaces no es solo interno: es la negociación con los otros equipos de la clase (por ejemplo, con el equipo **E1**, que hace los usuarios, o el **E2**, que hace las gráficas). Sirve para decidir cómo se van a comunicar los servidores en el futuro para que nadie programe a ciegas.

El Módulo E6 se comunica con el resto del ecosistema Healthy Life mediante una arquitectura orientada a microservicios simulada vía **API REST**, utilizando **JSON** como formato de intercambio de datos.

### Dependencias entrantes (lo que E6 necesita leer)

**Perfil nutricional y alergias — dependencia de E1 (Gestión de Usuarios)**

Para la validación estricta de restricciones médicas y el cálculo de menús, E6 consume los perfiles gestionados por el módulo de identidades.

- **Endpoint esperado:** `GET /api/users/{userId}/nutritional-profile`
- **Payload requerido:**

  ```json
  {
    "userId": "string",
    "weight": "number",
    "caloricGoal": "number",
    "medicalRestrictions": {
      "allergies": ["string"],
      "dietType": "string"
    }
  }
  ```

- **Estado Sprint 1:** aislado y resuelto mediante simulación local. Para evitar bloqueos, la respuesta de este endpoint está mockeada en [`/mocks/mock_usuarios.json`](mocks/mock_usuarios.json).

### Servicios expuestos (lo que E6 ofrece al resto)

**Telemetría nutricional — consumido por E2 (Seguimiento de Hábitos) y E5 (Entrenamiento)**

Para alimentar el dashboard analítico y de seguimiento de hábitos, E6 expone el consumo calórico en tiempo real: calorías totales consumidas en el día actual y desglose de macronutrientes listos para ser graficados.

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

### Endpoints internos de E6 (Sprint 1)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/foods?search=&userId=` | Catálogo. Con `userId` marca `blocked`/`blockedBy` según las alergias del perfil |
| GET | `/api/allergens` | Catálogo de alérgenos (id, nombre, icono y explicación) |
| PUT | `/api/users/{userId}/nutritional-profile` | Actualiza alergias, objetivo calórico, etc. (escribe en `mock_usuarios.json`) |
| GET | `/api/menus/{userId}` | Menú del usuario (vacío si aún no tiene) |
| PUT | `/api/menus/{userId}` | Guarda el menú `{ days: { lunes: { desayuno: [foodId], comida: [], cena: [] }, ... } }`. Rechaza con 422 los alimentos bloqueados por el perfil |

---

## Estándares de Desarrollo Interno (leer antes de hacer push)

1. **Tipado de IDs:** utilizar siempre formato **UUID v4** (ej. `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`) para todos los identificadores (usuarios, alimentos, menús). Evita colisiones entre módulos.
2. **Tratamiento de alérgenos:** el motor de reglas compara strings en **español, minúsculas, sin tildes ni espacios** (ej. `"gluten"`, `"frutos_secos"`).
3. **Respuestas HTTP y errores:** todo endpoint devuelve un JSON válido. En caso de error, la respuesta estándar es:

   ```json
   { "error": true, "code": 404, "message": "Descripción del problema" }
   ```

4. **Bloqueo por mock (Sprint 1):** no hacer peticiones `fetch`/`axios` reales a las URLs de otros equipos. Leer directamente del archivo local `mocks/mock_usuarios.json`.

---

## 🏁 Estado del Sprint 1 (MVP)

En este primer Sprint se han implementado las siguientes funcionalidades principales (Historias de Usuario):

- **[HU 1.1]** Búsqueda de alimentos y macros.
- **[HU 1.2]** Visualización de iconos de alérgenos en el catálogo.
- **[HU 2.1]** Configuración del perfil nutricional: alergias/intolerancias y objetivo calórico.
- **[HU 3.1]** Creación básica de menú (Desayuno, Comida y Cena por día).

Los criterios de aceptación de las cuatro historias están cubiertos por los tests E2E de la carpeta `e2e/tests`.

### Detalle de las Historias de Usuario

| Jira | Historia | Puntos | Rama | Test E2E |
| --- | --- | --- | --- | --- |
| [SCRUM-21](https://procesossoftware.atlassian.net/browse/SCRUM-21) | HU 1.1 Buscar un alimento | 3 | `feature/SCRUM-21-buscar-alimentos` | `e2e/tests/catalogo.spec.js` |
| [SCRUM-27](https://procesossoftware.atlassian.net/browse/SCRUM-27) | HU 1.2 Ver iconos de ingredientes (alérgenos) | 2 | `feature/SCRUM-27-iconos-alergenos` | `e2e/tests/catalogo.spec.js` |
| [SCRUM-17](https://procesossoftware.atlassian.net/browse/SCRUM-17) | HU 2.1 Indicar alérgenos e intolerancias | 3 | `feature/SCRUM-17-perfil-alergias` | `e2e/tests/perfil.spec.js` |
| [SCRUM-34](https://procesossoftware.atlassian.net/browse/SCRUM-34) | HU 3.1 Creación de menús | 5 | `feature/SCRUM-34-crear-menu` | `e2e/tests/menu.spec.js` |

#### HU 1.1 · Buscar un alimento (SCRUM-21)

El usuario puede buscar en el catálogo y ver, para cada alimento, sus calorías y macronutrientes (proteínas, carbohidratos y grasas por cada 100 g).

- **AC1:** dado que el usuario escribe un término en el buscador, cuando pulsa "Buscar", entonces se muestra la lista filtrada de coincidencias. La búsqueda no distingue mayúsculas ni tildes (`salmon` encuentra "Salmón").
- **AC2:** dado que no existen coincidencias, cuando se realiza la búsqueda, entonces se muestra el mensaje "No se encontraron alimentos".
- **Backend:** `GET /api/foods?search=` (datos en `mocks/mock_alimentos.json`).
- **Frontend:** componentes `SearchBar`, `FoodList` y `FoodItem`.

#### HU 1.2 · Ver iconos de alérgenos (SCRUM-27)

Cada alimento del catálogo muestra un icono por cada alérgeno que contiene.

- **AC1:** dado que el usuario ve la lista del catálogo, cuando un alimento contiene alérgenos comunes, entonces se muestran sus iconos de forma visible. Los alimentos sin alérgenos no muestran ninguno.
- **AC2:** dado que el usuario pulsa el icono de un alérgeno, entonces se despliega un texto con el nombre de la alergia o intolerancia y su explicación; al pulsarlo de nuevo se oculta.
- **Backend:** `GET /api/allergens` devuelve el catálogo de alérgenos (`id`, `name`, `icon`, `description`) desde `mocks/mock_alergenos.json`.
- **Frontend:** `FoodItem` (botones con icono y tooltip accesible).

#### HU 2.1 · Indicar alérgenos e intolerancias (SCRUM-17)

El usuario configura su perfil nutricional: qué alergias o intolerancias tiene y su objetivo calórico diario. Esas preferencias activan el **bloqueo automático** de ingredientes prohibidos.

- **AC1:** dado que el usuario está en la pantalla de edición de su perfil, cuando selecciona una o varias alergias del listado desplegable y guarda los cambios, entonces la app actualiza sus preferencias en el sistema (se guardan en `mocks/mock_usuarios.json`).
- **Efecto en el resto de la app:** en el catálogo los alimentos con alérgenos del perfil se atenúan y muestran "Bloqueado por tu perfil", y en el menú no se pueden añadir.
- **Backend:** `PUT /api/users/{userId}/nutritional-profile` (valida que las alergias existan en el catálogo y las normaliza) y `GET /api/foods?userId=` (marca `blocked` y `blockedBy`).
- **Frontend:** `ProfileEditor` (pestaña "Perfil").

#### HU 3.1 · Creación de menús (SCRUM-34)

El usuario diseña su menú semanal asignando alimentos del catálogo a Desayuno, Comida o Cena de cada día.

- **AC1:** dado que el usuario está en el diseñador de menús, cuando selecciona alimentos del catálogo y los asigna a Desayuno, Comida o Cena, entonces la app los añade a la estructura de ese día. Además muestra las calorías totales del día y permite quitar elementos.
- **Guardado:** "Guardar menú" persiste el menú (con un UUID v4) en `mocks/mock_menus.json`; sobrevive a una recarga.
- **Reglas:** el backend rechaza con 422 los alimentos bloqueados por el perfil y con 400 los días, secciones o alimentos desconocidos.
- **Backend:** `GET` y `PUT /api/menus/{userId}`.
- **Frontend:** `MenuBuilder` (pestaña "Menú").

### Flujo de ramas y Pull Requests

Cada historia se desarrolló en su propia rama y se entrega mediante un Pull Request, tal y como pide la Definition of Done (revisión por al menos otro miembro del equipo y validación del delegado de Product Owner). Las ramas están encadenadas: cada una parte de la anterior, así que los PR deben aceptarse **en este orden**:

1. `feature/SCRUM-21-buscar-alimentos` → `main` (incluye la base del backend en capas y la configuración de TailwindCSS y Playwright).
2. `feature/SCRUM-27-iconos-alergenos`
3. `feature/SCRUM-17-perfil-alergias`
4. `feature/SCRUM-34-crear-menu`
5. `docs/sprint1-readme`

Recomendación: aceptar los PR con **"Create a merge commit"** (no "Squash"), para que los PR siguientes, que parten de la rama anterior, no generen conflictos.
