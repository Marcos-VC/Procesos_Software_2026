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
- HU 5.2 Marcar/tachar ingredientes de la lista (2)
- HU 5.3 Compartir lista de la compra (WhatsApp/Email) (3)

18 puntos en total. Pendiente de contrastar contra la velocidad real del Sprint 2 (igual que se
hizo con la del Sprint 1 para comprometer el Sprint 2) antes de darlo por definitivo en el Sprint
Planning.

## Tests E2E

- HU 5.2: 4 criterios de aceptación (`compra.spec.js`)

La HU 5.2 cubre que al marcar un ingrediente en la pestaña "Compra" aparece
tachado y el contador de comprados se actualiza, que la marca se conserva al
recargar la página, que se puede desmarcar (y también se conserva), y que el
endpoint rechaza con `400` un `checked` que no es booleano y con `404` un
producto que no está en la lista o un usuario inexistente.

## Historias implementadas

### HU 5.2 · Marcar/tachar ingredientes de la lista

Cada producto de la lista de la compra tiene una casilla para marcarlo como
comprado: al marcarlo aparece tachado, sin cambiar de posición, y un contador
indica cuántos productos se han comprado ya del total. La marca se guarda en
el backend (`mock_shopping_lists.json`), así que se conserva al recargar, y se
puede desmarcar en cualquier momento. Si el guardado falla, la casilla vuelve
a su estado anterior y se muestra el error.

## Pendiente al cerrar este Sprint

- [ ] Actualizar `diagrams/01-flujo-aplicacion.puml` con los componentes y endpoints nuevos
      (despensa, recetas, lista de la compra) y volver a renderizar el PNG.
- [ ] Decidir si el diagrama de procesos funcionales (`diagrams/02-...`) necesita una versión
      nueva para el flujo de HU 4.x/5.x, o si el de bloqueo de alérgenos sigue vigente tal cual
      junto a uno nuevo.
- [ ] Mover estas historias a "Historias implementadas" con su descripción, siguiendo el
      formato de `docs/sprint2-readme.md`.
- [ ] Actualizar el recuento de tests E2E.
