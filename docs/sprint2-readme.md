# Sprint 2 · Módulo E6 (Gestor Nutricional)

20 oct – 10 nov · 17 puntos. Visión general y cómo ejecutarlo en el [README principal](../README.md).

## Roles

- **Product Owner:** Rubén Torres
- **Scrum Master:** Emiliano Sánchez
- **Developers:** Paula, Marcos, David, Raúl, Pablo y Alessio

## Sprint Goal

Garantizar la seguridad clínica del usuario automatizando el bloqueo de alimentos incompatibles con sus alergias o dieta, y dotar al diseñador de menús de cálculo inteligente y opciones de guardado.

## Historias

- HU 2.2 Indicar alérgenos e intolerancias (SCRUM-26) · `perfil.spec.js`
- HU 2.3 Introducir preferencias dietéticas (SCRUM-35) · `perfil.spec.js`
- HU 3.2 Sumar calorías del menú automáticamente (SCRUM-20)
- HU 3.3 Guardar menú favorito (SCRUM-23) · `menu.spec.js`
- HU 3.4 Motor de reglas para bloquear alimentos peligrosos (SCRUM-24)
- HU 1.3 Añadir nuevos alimentos al catálogo (SCRUM-28)

Tests E2E definidos para las historias implementadas en este módulo:

- HU 1.1: 2 criterios de aceptación (`catalogo.spec.js`)
- HU 1.2: 2 criterios de aceptación (`catalogo.spec.js`)
- HU 2.1: 1 criterio de aceptación (`perfil.spec.js`)
- HU 2.3: 3 criterios de aceptación (`perfil.spec.js`)
- HU 3.1: 1 criterio de aceptación (`menu.spec.js`)

La HU 2.3 cubre la selección de una preferencia dietética desde el perfil, su
persistencia tras recargar, el rechazo de valores no válidos con `400` y la
respuesta `404` para usuarios inexistentes. En el catálogo, los alimentos
incompatibles con la preferencia activa se mantienen visibles al final de la
lista, atenuados y marcados para evitar recomendaciones engañosas.

El estado de cada una está en el [tablero de Jira](https://procesossoftware.atlassian.net/jira/software/projects/SCRUM/summary).

## Interfaz

Capturas en [`assets/sprint2/`](assets/sprint2), generadas con `cd e2e && npm run screenshots`.

**HU 2.2 · Alergias en el perfil**

![Perfil con alergias](assets/sprint2/perfil-alergias.png)

**HU 3.3 · Menú favorito**

![Menú con favoritos](assets/sprint2/menu-favoritos.png)

**HU 2.3 · Preferencias dietéticas**

La persona usuaria puede seleccionar una preferencia dietética (omnívora,
vegetariana, vegana, pescetariana o cetogénica), guardarla desde su perfil y
comprobar que se conserva al volver a cargar la aplicación. La API valida los
valores permitidos y devuelve `400` para preferencias desconocidas y `404` para
usuarios inexistentes. El catálogo conserva, por ejemplo, el salmón visible
para una persona vegana, pero lo identifica como no compatible y lo separa de
los alimentos recomendados.

**HU 3.2 · Calorías del menú** — _pendiente_

**HU 3.4 · Motor de reglas** — _pendiente_

**HU 1.3 · Añadir alimentos** — _pendiente_
