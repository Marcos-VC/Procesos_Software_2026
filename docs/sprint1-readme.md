# Sprint 1 · Módulo E6 (Gestor Nutricional)

Documentación detallada del incremento entregado en el Sprint 1. Para la visión general del proyecto, el stack y cómo ejecutarlo, consulta el [README principal](../README.md).

## Resumen

| Jira | Historia | Puntos | Rama | Test E2E |
| --- | --- | --- | --- | --- |
| [SCRUM-21](https://procesossoftware.atlassian.net/browse/SCRUM-21) | HU 1.1 Buscar un alimento | 3 | `feature/SCRUM-21-buscar-alimentos` | [Tests 1 y 2](#tests-e2e-qué-comprueba-cada-uno) (`catalogo.spec.js`) |
| [SCRUM-27](https://procesossoftware.atlassian.net/browse/SCRUM-27) | HU 1.2 Ver iconos de ingredientes (alérgenos) | 2 | `feature/SCRUM-27-iconos-alergenos` | [Tests 3 y 4](#tests-e2e-qué-comprueba-cada-uno) (`catalogo.spec.js`) |
| [SCRUM-17](https://procesossoftware.atlassian.net/browse/SCRUM-17) | HU 2.1 Fijar objetivo calórico diario | 3 | `feature/SCRUM-17-perfil-alergias` | [Test 5](#tests-e2e-qué-comprueba-cada-uno) (`perfil.spec.js`) |
| [SCRUM-34](https://procesossoftware.atlassian.net/browse/SCRUM-34) | HU 3.1 Creación de menús | 5 | `feature/SCRUM-34-crear-menu` | [Test 6](#tests-e2e-qué-comprueba-cada-uno) (`menu.spec.js`) |

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

### HU 2.1 · Fijar objetivo calórico diario (SCRUM-17)

El usuario fija su objetivo calórico diario en su perfil nutricional.

- **AC1:** dado que el usuario está en la pantalla de edición de su perfil, cuando indica su objetivo calórico diario y guarda los cambios, entonces la app actualiza el objetivo en el sistema (se guarda en `mocks/mock_usuarios.json`) y persiste tras recargar.
- **Backend:** `PUT /api/users/{userId}/nutritional-profile` (valida que `caloricGoal` sea un entero entre 500 y 10000).
- **Frontend:** `ProfileEditor` (pestaña "Perfil").

### HU 3.1 · Creación de menús (SCRUM-34)

El usuario diseña su menú semanal asignando alimentos del catálogo a Desayuno, Comida o Cena de cada día. Se elige el día arriba (cada día muestra sus calorías) y, en cada comida, se pulsa **"Añadir alimento"**, se busca en el catálogo y con un clic queda añadido.

- **AC1:** dado que el usuario está en el diseñador de menús, cuando selecciona alimentos del catálogo y los asigna a Desayuno, Comida o Cena, entonces la app los añade a la estructura de ese día. Permite además quitar elementos y compara las calorías del día con el objetivo del perfil.
- **Guardado:** "Guardar menú" persiste el menú (con un UUID v4) en `mocks/mock_menus.json`; sobrevive a una recarga.
- **Reglas:** el backend rechaza con 400 los días, secciones o alimentos desconocidos.
- **Backend:** `GET` y `PUT /api/menus/{userId}`.
- **Frontend:** `MenuBuilder` (pestaña "Menú").

## Tests E2E: qué comprueba cada uno

Los tests E2E (de extremo a extremo, con Playwright) abren la aplicación en un navegador real, hacen lo que haría una persona (escribir, pulsar, elegir) y comprueban lo que se ve en pantalla y lo que se guarda en el sistema. Cada test verifica **un criterio de aceptación** y su nombre empieza por el criterio (`AC1`, `AC2`). Hay **6 tests en 3 ficheros** de `e2e/tests/`:

| Fichero | Historias que cubre | Tests |
| --- | --- | --- |
| `catalogo.spec.js` | HU 1.1 (buscar) y HU 1.2 (iconos de alérgenos) | 1, 2, 3 y 4 |
| `perfil.spec.js` | HU 2.1 (objetivo calórico) | 5 |
| `menu.spec.js` | HU 3.1 (menús) | 6 |

| Nº | Historia · criterio | Qué hace el test | Qué comprueba |
| --- | --- | --- | --- |
| 1 | HU 1.1 · AC1 | En el catálogo escribe `arroz` en el buscador y pulsa "Buscar". | Aparece **una sola** tarjeta, "Arroz integral", con sus `111 kcal` y sus macros (proteína, carbohidratos y grasas). "Pan de trigo" ya no aparece. |
| 2 | HU 1.1 · AC2 | Busca `zzzxxx`, algo que no existe. | Se muestra el mensaje **"No se encontraron alimentos"** y no hay ninguna tarjeta. |
| 3 | HU 1.2 · AC1 | Mira la tarjeta de "Pan de trigo" y la de "Arroz integral". | "Pan de trigo" muestra visible el icono 🌾 del alérgeno **Gluten**; "Arroz integral", que no tiene alérgenos, no muestra ningún icono. |
| 4 | HU 1.2 · AC2 | Pulsa el icono del gluten en "Pan de trigo". | Antes de pulsar no hay texto; al pulsar se despliega una explicación con el nombre **"Gluten"** y la palabra "intolerancia"; al pulsar otra vez **desaparece**. |
| 5 | HU 2.1 · AC1 | En "Perfil" escribe `2000` en el objetivo calórico diario y pulsa "Guardar cambios". | Sale **"Perfil guardado correctamente"**; la tarjeta superior muestra `2000 kcal`; la API devuelve `caloricGoal = 2000` (se guardó de verdad); y tras **recargar** la página el campo sigue en 2000. Al terminar restaura el valor original. |
| 6 | HU 3.1 · AC1 | En "Menú" elige el martes y añade Manzana al Desayuno, Pechuga de pollo a la Comida y Salmón a la Cena (con "Añadir alimento"). | Cada alimento aparece **en su comida**; el botón del martes muestra `425 kcal` (52 + 165 + 208); el miércoles sigue **vacío**; al pulsar "Guardar menú" sale "Menú guardado correctamente"; la API devuelve un menú con **id UUID v4** y un alimento en cada comida del martes; y tras **recargar** la Cena del martes sigue teniendo Salmón. |

**Detalles comunes a todos los tests**

- Los tests 1 a 4 empiezan abriendo la aplicación y esperando a que cargue el catálogo (la tarjeta "Pan de trigo").
- Usan el usuario de demo `5d37a69d-…` del mock de usuarios.
- Trabajan sobre **una copia temporal** de `mocks/`, con su propio backend (`:3100`) y frontend (`:5174`): no modifican los datos del repositorio ni hace falta arrancar nada antes.
- En el código, los pasos están comentados con las mismas palabras que el criterio: **Dado / Cuando / Entonces**.

**Cómo ejecutarlos y verlos**

```bash
cd e2e
npm test                       # los 6 tests; al final muestra qué criterios pasan o fallan
npm run test:ui                # interfaz visual: se ve cada test paso a paso
npx playwright test --headed   # abre el navegador para ver cómo se ejecutan
npx playwright show-report     # informe HTML de la última ejecución
```

Además existe `e2e/tests/screenshots.spec.ts`, que **no** es un test de criterios y no forma parte de `npm test`: genera las capturas de `docs/assets/` que usa el README (`npm run screenshots`).

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
docker compose up --build                          # http://localhost:5173
```

Recuerda ejecutar `npm install` en `backend/` y `frontend/` si no usas Docker.

## Definition of Done

| Criterio | Estado |
| --- | --- |
| Código revisado mediante pull request por al menos otro miembro | Hecho |
| Pruebas escritas y en verde (CI a partir del Sprint 2) | Hecho: 6 tests E2E en verde en local |
| Documentación (README/API) actualizada | Hecho |
| Criterios de aceptación verificados por el delegado de PO | Hecho |
| Sin secretos ni credenciales en el código ni en el historial | Hecho |
