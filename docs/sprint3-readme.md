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

## Pendiente al cerrar este Sprint

- [ ] Actualizar `diagrams/01-flujo-aplicacion.puml` con los componentes y endpoints nuevos
      (despensa, recetas, lista de la compra) y volver a renderizar el PNG.
- [ ] Decidir si el diagrama de procesos funcionales (`diagrams/02-...`) necesita una versión
      nueva para el flujo de HU 4.x/5.x, o si el de bloqueo de alérgenos sigue vigente tal cual
      junto a uno nuevo.
- [ ] Mover estas historias a "Historias implementadas" con su descripción, siguiendo el
      formato de `docs/sprint2-readme.md`.
- [ ] Actualizar el recuento de tests E2E.
