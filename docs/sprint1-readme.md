# Sprint 1 · Módulo E6 (Gestor Nutricional)

MVP de 13 puntos, entregado. Visión general y cómo ejecutarlo en el [README principal](../README.md).

## Roles

- **Product Owner:** Pablo Villaplana Rodríguez
- **Scrum Master:** Marcos Vidal Castillo
- **Developers:** Paula Sánchez Garduño, Emiliano Sánchez Moreno, David Sebastián Sticea Covaciu, Raúl Tejada Merinero, Rubén Torres Rivero, Alessio Vecchio

## Historias implementadas

- HU 1.1 Buscar un alimento y ver sus macros (SCRUM-21) · `catalogo.spec.js`
- HU 1.2 Ver iconos de alérgenos (SCRUM-27) · `catalogo.spec.js`
- HU 2.1 Fijar objetivo calórico diario (SCRUM-17) · `perfil.spec.js`
- HU 3.1 Crear un menú básico (SCRUM-34) · `menu.spec.js`

Tests E2E: 6 en verde.

## Interfaz

### HU 1.1 · Buscar un alimento y ver sus macros

El catálogo permite buscar alimentos por nombre, ignorando diferencias de
mayúsculas y acentos, y muestra sus valores nutricionales principales:
calorías, proteínas, hidratos de carbono y grasas.

### HU 1.2 · Ver iconos de alérgenos

Cada alimento muestra de forma visible los iconos de los alérgenos que
contiene. Al seleccionar un icono se puede consultar el nombre del alérgeno
para identificar rápidamente los posibles riesgos.

### HU 2.1 · Fijar objetivo calórico diario

Desde el perfil nutricional se puede consultar y actualizar el objetivo
calórico diario. El valor se valida, se guarda en el backend y permanece tras
recargar la aplicación.

### HU 3.1 · Crear un menú básico

El diseñador permite añadir alimentos a Desayuno, Comida y Cena para cada día
de la semana, retirar alimentos y guardar el menú completo asociado al usuario.
