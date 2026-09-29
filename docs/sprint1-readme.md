# Sprint 1 · Módulo E6 (Gestor Nutricional)

Documentación detallada del incremento entregado en el Sprint 1. Para la visión general del proyecto, el stack y cómo ejecutarlo, consulta el [README principal](../README.md).

## Resumen

| Jira | Historia | Puntos | Rama | Test E2E |
| --- | --- | --- | --- | --- |
| [SCRUM-21](https://procesossoftware.atlassian.net/browse/SCRUM-21) | HU 1.1 Buscar un alimento | 3 | `feature/SCRUM-21-buscar-alimentos` | `e2e/tests/catalogo.spec.js` |
| [SCRUM-27](https://procesossoftware.atlassian.net/browse/SCRUM-27) | HU 1.2 Ver iconos de ingredientes (alérgenos) | 2 | `feature/SCRUM-27-iconos-alergenos` | `e2e/tests/catalogo.spec.js` |
| [SCRUM-17](https://procesossoftware.atlassian.net/browse/SCRUM-17) | HU 2.1 Indicar alérgenos e intolerancias | 3 | `feature/SCRUM-17-perfil-alergias` | `e2e/tests/perfil.spec.js` |
| [SCRUM-34](https://procesossoftware.atlassian.net/browse/SCRUM-34) | HU 3.1 Creación de menús | 5 | `feature/SCRUM-34-crear-menu` | `e2e/tests/menu.spec.js` |

## Historias de Usuario

### HU 1.1 · Buscar un alimento (SCRUM-21)

El usuario puede buscar en el catálogo y ver, para cada alimento, sus calorías y macronutrientes (proteínas, carbohidratos y grasas por cada 100 g).

- **AC1:** dado que el usuario escribe un término en el buscador, cuando pulsa "Buscar", entonces se muestra la lista filtrada de coincidencias. La búsqueda no distingue mayúsculas ni tildes (`salmon` encuentra "Salmón").
- **AC2:** dado que no existen coincidencias, cuando se realiza la búsqueda, entonces se muestra el mensaje "No se encontraron alimentos".
- **Backend:** `GET /api/foods?search=` (datos en `mocks/mock_alimentos.json`).
- **Frontend:** componentes `SearchBar`, `FoodList` y `FoodItem`.

### HU 1.2 · Ver iconos de alérgenos (SCRUM-27)

Cada alimento del catálogo muestra un icono por cada alérgeno que contiene.

- **AC1:** dado que el usuario ve la lista del catálogo, cuando un alimento contiene alérgenos comunes, entonces se muestran sus iconos de forma visible. Los alimentos sin alérgenos no muestran ninguno.
- **AC2:** dado que el usuario pulsa el icono de un alérgeno, entonces se despliega un texto con el nombre de la alergia o intolerancia y su explicación; al pulsarlo de nuevo se oculta.
- **Backend:** `GET /api/allergens` devuelve el catálogo de alérgenos (`id`, `name`, `icon`, `description`) desde `mocks/mock_alergenos.json`.
- **Frontend:** `FoodItem` (botones con icono y tooltip accesible).

### HU 2.1 · Indicar alérgenos e intolerancias (SCRUM-17)

El usuario configura su perfil nutricional: qué alergias o intolerancias tiene y su objetivo calórico diario. Esas preferencias activan el **bloqueo automático** de ingredientes prohibidos.

- **AC1:** dado que el usuario está en la pantalla de edición de su perfil, cuando selecciona una o varias alergias del listado desplegable y guarda los cambios, entonces la app actualiza sus preferencias en el sistema (se guardan en `mocks/mock_usuarios.json`).
- **Efecto en el resto de la app:** en el catálogo los alimentos con alérgenos del perfil se atenúan y muestran "Bloqueado por tu perfil", y en el menú no se pueden añadir.
- **Backend:** `PUT /api/users/{userId}/nutritional-profile` (valida que las alergias existan en el catálogo y las normaliza) y `GET /api/foods?userId=` (marca `blocked` y `blockedBy`).
- **Frontend:** `ProfileEditor` (pestaña "Perfil").

### HU 3.1 · Creación de menús (SCRUM-34)

El usuario diseña su menú semanal asignando alimentos del catálogo a Desayuno, Comida o Cena de cada día.

- **AC1:** dado que el usuario está en el diseñador de menús, cuando selecciona alimentos del catálogo y los asigna a Desayuno, Comida o Cena, entonces la app los añade a la estructura de ese día. Además muestra las calorías totales del día y permite quitar elementos.
- **Guardado:** "Guardar menú" persiste el menú (con un UUID v4) en `mocks/mock_menus.json`; sobrevive a una recarga.
- **Reglas:** el backend rechaza con 422 los alimentos bloqueados por el perfil y con 400 los días, secciones o alimentos desconocidos.
- **Backend:** `GET` y `PUT /api/menus/{userId}`.
- **Frontend:** `MenuBuilder` (pestaña "Menú").

## Flujo de ramas y Pull Requests

Cada historia se desarrolló en su propia rama y se entrega mediante un Pull Request, tal y como pide la Definition of Done (revisión por al menos otro miembro del equipo y validación del delegado de Product Owner). Las ramas están **encadenadas**: cada una parte de la anterior, así que los PR deben aceptarse en este orden:

| Orden | Rama | Base del PR |
| --- | --- | --- |
| 1 | `feature/SCRUM-21-buscar-alimentos` (incluye la base del backend en capas y la configuración de TailwindCSS y Playwright) | `main` |
| 2 | `feature/SCRUM-27-iconos-alergenos` | `feature/SCRUM-21-buscar-alimentos` |
| 3 | `feature/SCRUM-17-perfil-alergias` | `feature/SCRUM-27-iconos-alergenos` |
| 4 | `feature/SCRUM-34-crear-menu` | `feature/SCRUM-17-perfil-alergias` |
| 5 | `docs/sprint1-readme` | `feature/SCRUM-34-crear-menu` |

Cada rama contiene sus propios tests E2E y pasa la batería completa hasta ese punto (2, 4, 5 y 7 tests respectivamente).

**Cómo aceptarlos:**

1. Otro miembro del equipo revisa el PR y lo aprueba.
2. El delegado de Product Owner valida los criterios de aceptación de la historia.
3. Se acepta con **"Create a merge commit"** (no "Squash"), para que los PR siguientes, que parten de la rama anterior, no generen conflictos. El repositorio no borra las ramas al aceptar un PR, por lo que GitHub **no** redirige el siguiente PR a `main`: tras aceptar cada PR hay que cambiar la base del siguiente a `main` (botón "Edit" junto al título del PR) o borrar a mano la rama ya aceptada. Si no, el PR se acepta contra la rama anterior y su contenido no llega a `main` (así ocurrió en el Sprint 1 y se resolvió con el PR #6).

## Cómo revisar y probar un PR

```bash
git fetch origin
git checkout feature/SCRUM-21-buscar-alimentos     # la rama del PR que se revisa

# Opción 1: batería de tests E2E (arranca su propio backend y frontend)
cd e2e && npm install && npm run install:browsers  # solo la primera vez
npm test

# Opción 2: ver la app
docker-compose up --build                          # http://localhost:5173
```

Recuerda ejecutar `npm install` en `backend/` y `frontend/` si no usas Docker.

## Definition of Done

| Criterio | Estado |
| --- | --- |
| Código revisado mediante pull request por al menos otro miembro | Pendiente de revisión |
| Pruebas escritas y en verde (CI a partir del Sprint 2) | Hecho: 7 tests E2E en verde en local |
| Documentación (README/API) actualizada | Hecho |
| Criterios de aceptación verificados por el delegado de PO | Pendiente |
| Sin secretos ni credenciales en el código ni en el historial | Hecho |
