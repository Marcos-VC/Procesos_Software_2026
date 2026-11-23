# Sprint 3 · Módulo E6 (Gestor Nutricional)

11 nov – 15 dic. Visión general y cómo ejecutarlo en el [README principal](../README.md).

## Roles

- **Product Owner:** David Sebastián Sticea Covaciu
- **Scrum Master:** Paula Sánchez Garduño

## Sprint Goal

Completar el ciclo de la planificación nutricional de extremo a extremo: que el usuario controle
lo que ya tiene en su despensa, reciba sugerencias de recetas que aprovechen esos productos, y
genere y comparta automáticamente la lista de la compra con lo que realmente necesita —
reduciendo el desperdicio de comida y el tiempo invertido en planificar la compra semanal.

## Historias planificadas

- HU 4.1 Añadir y quitar productos de la despensa virtual (3)
- HU 4.2 Recibir sugerencias de recetas basadas en los productos de la despensa (5)
- HU 5.1 Generar lista de la compra automática desde el menú (5)
- HU 5.2 Marcar/tachar ingredientes de la lista (3)
- HU 5.3 Compartir lista de la compra (WhatsApp/Email) (3)
- HU 5.4 Añadir productos manuales a la lista de la compra (3)

22 puntos en total.

### Planificación por velocidad histórica

El enunciado del Sprint 3 pide partir de la velocidad del Sprint 2 y comprometer **al menos un
10 % más**, con un máximo de 8 puntos por historia.

| Dato | Puntos |
| ---- | ------ |
| Velocidad del Sprint 2 (entregado) | 17 |
| Mínimo a comprometer (17 × 1,10 = 18,7) | 19 |
| **Comprometido en el Sprint 3** | **22** (+29 % sobre el Sprint 2) |

- Ninguna historia pasa de 8 puntos: las mayores (HU 4.2 y HU 5.1) valen 5, así que no hace
  falta dividir ninguna.
- Todas las estimaciones usan la escala de Fibonacci (1, 2, 3, 5, 8) y se comparan con historias
  ya terminadas en los Sprints anteriores.
- La semana del 7 de diciembre no hay clase (festivos de la Constitución y la Inmaculada); el
  trabajo de esos días se organiza sin sesión presencial.

## Tests E2E

- HU 5.1: 3 criterios de aceptación (`compra.spec.js`)
- HU 5.2: 4 criterios de aceptación (`compra.spec.js`)
- HU 5.4: 4 criterios de aceptación (`compra.spec.js`)

La HU 5.1 cubre que la pestaña "Compra" muestra los alimentos del menú semanal
agrupados, con las veces que aparece cada uno ("2 veces", "1 vez"), que con el
menú vacío se muestra el aviso de lista vacía, y que
`GET /api/menus/{userId}/shopping-list` devuelve cada alimento con su nombre y
el número de veces que aparece en el menú.

La HU 5.2 cubre que al marcar un ingrediente en la pestaña "Compra" aparece
tachado y el contador de comprados se actualiza, que la marca se conserva al
recargar la página, que se puede desmarcar (y también se conserva), y que el
endpoint rechaza con `400` un `checked` que no es booleano y con `404` un
producto que no está en la lista o un usuario inexistente.

La HU 5.4 cubre que un producto añadido a mano desde el formulario aparece en
la lista, ordenado junto a los alimentos del menú y con la etiqueta "Añadido a
mano", y se conserva al recargar; que se puede marcar como comprado (cuenta en
el contador) y eliminar, y no vuelve a aparecer al recargar; que con el menú
semanal vacío se puede crear una lista solo con productos añadidos a mano; y
que la API rechaza con `400` un nombre vacío o demasiado largo y el borrado de
un alimento del menú, con `409` un producto que ya está en la lista (sin
distinguir mayúsculas ni tildes, y el formulario muestra el error) y con `404`
un usuario inexistente o el borrado de un producto que no está en la lista.

## Historias implementadas

### HU 5.1 · Generar lista de la compra automática desde el menú

La pestaña **Compra** genera la lista de la compra a partir del menú semanal
del usuario: recorre los siete días y las tres comidas, agrupa los alimentos
repetidos y muestra cada uno una sola vez, ordenados por nombre, con las veces
que aparece en la semana. La lista se calcula en el momento a partir del menú
guardado, así que siempre está al día (el botón "Actualizar" la vuelve a
generar sin recargar la página). Si el menú está vacío, se indica que hay que
añadir alimentos al menú para generarla.

### HU 5.2 · Marcar/tachar ingredientes de la lista

Cada producto de la lista de la compra tiene una casilla para marcarlo como
comprado: al marcarlo aparece tachado, sin cambiar de posición, y un contador
indica cuántos productos se han comprado ya del total. La marca se guarda en
el backend (`mock_shopping_lists.json`), así que se conserva al recargar, y se
puede desmarcar en cualquier momento. Si el guardado falla, la casilla vuelve
a su estado anterior y se muestra el error.

### HU 5.4 · Añadir productos manuales a la lista de la compra

Encima de la lista hay un formulario para añadir productos que no salen del
menú semanal (papel de cocina, detergente...). Aparecen ordenados junto a los
alimentos del menú con la etiqueta "Añadido a mano", se pueden marcar como
comprados igual que el resto y, a diferencia de los alimentos del menú, se
pueden eliminar desde la propia lista. El formulario se muestra aunque el menú
esté vacío, así que se puede hacer una lista solo con productos añadidos a
mano. No se admiten nombres vacíos, de más de 60 caracteres ni productos que
ya estén en la lista (sin distinguir mayúsculas ni tildes); en ese caso se
muestra el motivo. Se guardan en `mock_shopping_lists.json` (`manualItems`).

## Pendiente al cerrar este Sprint

- [ ] Actualizar `diagrams/01-flujo-aplicacion.puml` con los componentes y endpoints nuevos
      (despensa, recetas, lista de la compra) y volver a renderizar el PNG.
- [ ] Decidir si el diagrama de procesos funcionales (`diagrams/02-...`) necesita una versión
      nueva para el flujo de HU 4.x/5.x, o si el de bloqueo de alérgenos sigue vigente tal cual
      junto a uno nuevo.
- [ ] Mover estas historias a "Historias implementadas" con su descripción, siguiendo el
      formato de `docs/sprint2-readme.md`.
- [ ] Actualizar el recuento de tests E2E.
