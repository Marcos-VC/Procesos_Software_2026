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

## Inicialización desde cero

Los comandos equivalentes para crear esta estructura en un repositorio vacío son:

```powershell
mkdir backend, frontend, mocks
cd backend
npm init -y
npm install express cors
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
cd ..
```

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
