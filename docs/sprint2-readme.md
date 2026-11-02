# Sprint 2 · Módulo E6 (Gestor Nutricional)

20 oct – 10 nov · 17 puntos, entregado. Visión general y cómo ejecutarlo en el [README principal](../README.md).

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

## Tests E2E

Las historias implementadas cuentan con la siguiente cobertura:

- HU 2.2: 3 criterios de aceptación (`perfil.spec.js`)
- HU 2.3: 3 criterios de aceptación (`perfil.spec.js`)
- HU 3.2: 2 criterios de aceptación (`menu.spec.js`)
- HU 3.3: 2 criterios de aceptación (`menu.spec.js`)
- HU 3.4: 4 criterios de aceptación (`alergenos.spec.js`)
- HU 1.3: 3 criterios de aceptación (`catalogo.spec.js`)

La HU 2.2 cubre la selección y persistencia de alergias desde el perfil, la
validación de alérgenos desconocidos con `400` y la respuesta `404` para
usuarios inexistentes. La HU 2.3 cubre la selección de una preferencia
dietética, su persistencia tras recargar, el rechazo de valores no válidos con
`400` y la respuesta `404` para usuarios inexistentes. La HU 3.2 cubre que el
total calórico del día y de cada comida se actualiza en tiempo real al añadir
y quitar alimentos, y que el total acumulado de la semana suma correctamente
varios días. La HU 3.3 cubre el guardado de un menú con nombre, la
recuperación posterior del menú favorito y el rechazo `400` al intentar
guardar uno sin nombre. La HU 3.4 cubre el marcado
`blocked`/`blockedBy` en el catálogo, el rechazo `422` al guardar un menú con
un alimento peligroso (tanto directamente vía API como desde la interfaz real
cuando el perfil cambia después de añadir el alimento), y que un menú sin
alérgenos del perfil se sigue guardando con normalidad.

El estado de cada historia está en el [tablero de Jira](https://procesossoftware.atlassian.net/jira/software/projects/SCRUM/summary).

## Historias implementadas

### HU 2.2 · Indicar alérgenos e intolerancias

Desde el perfil se pueden consultar y seleccionar los alérgenos del usuario.
La selección se guarda en el backend, se conserva al recargar la aplicación y
se validan tanto los alérgenos desconocidos como los usuarios inexistentes.

### HU 2.3 · Introducir preferencias dietéticas

La persona usuaria puede seleccionar una preferencia dietética —omnívora,
vegetariana, vegana o pescetariana— y guardarla desde su perfil. La opción
cetogénica no se ofrece en la interfaz. Los alimentos incompatibles con la
dieta activa se ocultan del catálogo y se muestra un aviso informativo.

### HU 3.3 · Guardar menú favorito

El diseñador permite guardar el menú completo con un nombre personalizado y
recuperarlo posteriormente desde la sección de favoritos para volver a
utilizarlo.

### HU 1.3 · Añadir nuevos alimentos al catálogo

El catálogo incorpora un formulario para que una persona administradora añada
alimentos con sus valores nutricionales y alérgenos. Los datos se validan,
persisten en el catálogo, se rechazan nombres duplicados y el nuevo alimento
queda disponible para búsquedas. Tras guardarlo, se muestra una confirmación
breve que desaparece automáticamente.

### HU 3.2 · Sumar calorías del menú automáticamente

El diseñador de menús muestra y actualiza en tiempo real el total calórico de
cada comida, de cada día y el acumulado de toda la semana a medida que se
añaden o eliminan alimentos, sin necesidad de guardar para verlo.

### HU 3.4 · Motor de reglas para bloquear alimentos peligrosos

Los alimentos que contienen algún alérgeno del perfil del usuario se marcan
como bloqueados en el catálogo (con el motivo visible) y no se pueden añadir
al menú desde el diseñador. Si aun así se intenta guardar un menú que incluye
uno —por ejemplo porque el perfil cambió después de añadirlo—, el backend lo
rechaza con `422` y la interfaz muestra el error.
