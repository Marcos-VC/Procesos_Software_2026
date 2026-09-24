# Healthy Life - Módulo E6: Gestor Nutricional y Catálogo de Alimentos

Asignatura Procesos Software

## Equipo 6 (E6)

- Paula Sánchez Garduño
- Emiliano Sánchez Moreno
- David Sebastián Sticea Covaciu
- Raúl Tejada Merinero
- Rubén Torres Rivero
- Marcos Vidal Castillo
- Pablo Villaplana Rodríguez
- Alessio Vecchio

## Descripción del Módulo

Este repositorio contiene el código correspondiente al Subsistema **E6** de la aplicación global "Healthy Life".

Nuestro módulo se encarga de:

- Gestionar el catálogo de alimentos y sus valores nutricionales (macros).
- Permitir la creación de menús semanales personalizados.
- Aplicar reglas de bloqueo automático de ingredientes prohibidos según el perfil médico/alergias del usuario.
- Generar listas de la compra automatizadas.

## Enlaces de Interés

- **Tablero Miro (Product Discovery & User Story Map):** [AÑADIR ENLACE AQUÍ]
- **Tablero Jira (Sprint Backlog):** [AÑADIR ENLACE AQUÍ]
- **Documentación API / Mocks:** En la carpeta `/mocks` de este repositorio.

## Despliegue y Ejecución (Docker)

El proyecto está preparado para ejecutarse mediante contenedores Docker, tal y como exige la rúbrica del Sprint 1.

Para levantar el entorno de desarrollo, ejecuta:

    docker-compose up --build

## Stack Tecnológico

- **Backend:** [AÑADIR LENGUAJE/FRAMEWORK Ej. Java Spring Boot, Node.js...]
- **Frontend:** [AÑADIR FRAMEWORK Ej. React, Angular, Vue...]
- **Base de Datos:** [AÑADIR BD Ej. PostgreSQL, MongoDB...]
- **Despliegue:** Docker

## Estado del Sprint 1 (MVP)

En este primer Sprint se han implementado las siguientes funcionalidades principales (Historias de Usuario):

- **[HU 1.1]** Búsqueda de alimentos y macros.
- **[HU 1.2]** Visualización de iconos de alérgenos en el catálogo.
- **[HU 2.1]** Configuración del objetivo calórico del usuario.
- **[HU 3.1]** Creación básica de menú.
