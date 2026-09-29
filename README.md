# Healthy Life - Módulo E6: Gestor Nutricional y Catálogo de Alimentos

Proyecto académico de la asignatura **Procesos de Software** · 3.º Grado en Ingeniería del Software · Universidad Rey Juan Carlos

## Equipo 6 (E6)

- Marcos Vidal Castillo (Scrum Master - SM)
- Pablo Villaplana Rodríguez (Product Owner - PO)
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
- **Documentación API / Mocks:** En la carpeta `/mocks` de este repositorio.

## Despliegue y Ejecución (Docker)

El proyecto está preparado para ejecutarse mediante contenedores Docker, tal y como exige la rúbrica del Sprint 1.

Para levantar el entorno completo, ejecuta desde la raíz del repositorio:

    docker-compose up --build

Cuando termine el arranque, estarán disponibles:

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/health

La estructura principal es:

```text
backend/
    src/server.js
    Dockerfile
    package.json
frontend/
    src/App.jsx
    src/main.jsx
    src/styles.css
    Dockerfile
    nginx.conf
mocks/mock_usuarios.json
docker-compose.yml
```
El acuerdo de interfaces no es solo entre vosotros, es la negociación con los otros equipos de la clase (por ejemplo, con el equipo E1 que hace los usuarios o el E2 que hace las gráficas). Sirve para decidir cómo se van a hablar vuestros servidores en el futuro para que nadie programe a ciegas.

Copia este bloque completo. Pégalo en un post-it grande o cuadro de texto en vuestro tablero de Miro, y usadlo también como el documento inicial para vuestro README.md en GitHub.
🛠️ Stack Tecnológico y Contrato de Interfaces (Módulo E6)
1. Entorno Tecnológico (Stack Base)

    Frontend: React.js (Componentes funcionales de interfaz).

    Backend: Node.js con Express (Lógica de negocio y endpoints).

    Base de Datos: MongoDB (Colecciones de alimentos y menús).

    Control de Versiones y Despliegue: Git, GitHub y Docker.

2. Formato y Estándares de Comunicación

    Estilo arquitectónico: API REST.

    Formato de intercambio de datos: JSON (JavaScript Object Notation).

    Seguridad: Paso de Tokens JWT (JSON Web Tokens) en las cabeceras HTTP para la sesión del usuario.

3. Interoperabilidad (Contrato con otros grupos)

➡️ DEPENDENCIAS ENTRANTES (Lo que el Módulo E6 necesita leer):

    Dependencia de: Módulo E1 (Gestión de Usuarios).

    Endpoint pactado: GET /api/users/{userId}/nutritional-profile

    Carga útil (Payload) acordada: userId, weight, caloricGoal, medicalRestrictions (array de alérgenos).

    Estado Sprint 1: Aislado y resuelto mediante simulación local (mock_usuarios.json).

⬅️ SERVICIOS EXPUESTOS (Lo que el Módulo E6 ofrece al resto):

    Consumido por: Módulo E2 (Seguimiento de Hábitos) y E5 (Entrenamiento).

    Endpoint expuesto: GET /api/nutrition/{userId}/daily-summary

    Carga útil (Payload) a entregar: Calorías totales consumidas en el día actual y desglose de macronutrientes listos para ser graficados.
    
## Stack Tecnológico

- **Backend:** Node.js con Express
- **Frontend:** React con Vite
- **Base de Datos:** JSON / Mocks (Sprint 1) - _Por definir para Sprints posteriores_
- **Despliegue:** Docker

## Estado del Sprint 1 (MVP)

En este primer Sprint se han implementado las siguientes funcionalidades principales (Historias de Usuario):

- **[HU 1.1]** Búsqueda de alimentos y macros.
- **[HU 1.2]** Visualización de iconos de alérgenos en el catálogo.
- **[HU 2.1]** Configuración del objetivo calórico del usuario.
- **[HU 3.1]** Creación básica de menú.
