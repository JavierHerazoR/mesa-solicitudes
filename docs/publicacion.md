# Preparar Mesa para GitHub

Esta guía prepara la publicación de un proyecto nuevo de portafolio. **El repositorio remoto todavía no se ha creado y esta documentación no publica archivos en ninguna cuenta.** Mesa fue preparado con asistencia de IA y utiliza datos ficticios; debe presentarse como proyecto personal, separado de la experiencia laboral.

## Datos para crear el repositorio

| Campo          | Propuesta                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Nombre         | `mesa-solicitudes`                                                                                                         |
| Descripción    | `Demo full stack de seguimiento de solicitudes con React, NestJS, TypeScript y SQLite: filtros, historial, CSV y pruebas.` |
| Topics         | `react`, `nestjs`, `typescript`, `sqlite`, `vite`, `playwright`, `portfolio`, `fullstack`                                  |
| Visibilidad    | Público cuando se haya revisado el contenido que se va a compartir                                                         |
| Enlace de demo | Dejar vacío mientras no exista un despliegue                                                                               |

El repositorio debe contener solamente esta aplicación. No incluir código, bases de datos, entregables de hoja de vida ni historial de los proyectos empresariales con los que comparte actualmente una carpeta superior.

## Revisar antes de preparar el commit

1. Ejecutar Mesa, crear una solicitud, cambiar su estado y exportar una búsqueda.
2. Leer `README.md`, `docs/api.md` y el código de esos flujos; ajustar cualquier afirmación que no puedas explicar.
3. Ejecutar `npm run typecheck`, `npm test` y `npm run test:e2e` según las instrucciones del README.
4. Revisar las capturas generadas y confirmar que contienen únicamente datos de demostración.
5. Mantener en `.gitignore` las dependencias, los archivos compilados, `.env`, las bases de datos y los artefactos temporales de pruebas. El archivo `package-lock.json` sí debe acompañar al código.

## Crear un repositorio local propio

Estos comandos son una guía para ejecutar después de revisar la aplicación. **Todos deben ejecutarse dentro de la carpeta `mesa`, nunca en la raíz de Kredit ni en otro repositorio corporativo.** Puedes copiar primero la carpeta `mesa` a un directorio personal independiente.

Reemplaza `/ruta/a/mesa` por la ubicación real de esa carpeta:

```bash
cd /ruta/a/mesa
pwd
git init -b main
git rev-parse --show-toplevel
git status --short
```

Antes de continuar, comprobar que `git rev-parse --show-toplevel` devuelve exactamente la carpeta de Mesa. Revisar los archivos que muestra `git status`; si aparecen otros proyectos o documentos personales, corregir la ubicación antes de preparar el commit.

```bash
git add .
git diff --cached --stat
git diff --cached --name-only
```

Verificar que el contenido preparado incluye el código, las pruebas, la documentación, los archivos de configuración y el lockfile. Después:

```bash
git commit -m "feat: añade demo full stack de seguimiento de solicitudes"
```

El commit es local. Todavía no existe un enlace público ni se ha enviado contenido a GitHub.

## Publicación, cuando se decida realizarla

En GitHub, crear un repositorio vacío con el nombre y descripción propuestos. No añadir desde GitHub otro README, `.gitignore` o licencia que compita con los archivos locales. Elegir una licencia solo después de decidir expresamente qué permisos se quiere conceder sobre este proyecto.

GitHub mostrará las instrucciones para conectar ese repositorio y enviar un repositorio existente. Usar **la URL real que genere GitHub** para la cuenta elegida; esta guía no presupone una cuenta de destino ni inventa una dirección de repositorio.

Cuando la publicación esté completada y comprobada:

1. Añadir los topics y destacar el repositorio en el perfil.
2. Enlazar el repositorio real desde el README del perfil de GitHub y desde la sección Destacados de LinkedIn.
3. Actualizar la frase de estado del README de Mesa para indicar la publicación real. Un repositorio público y una demo alojada son dos cosas diferentes.

## Texto breve para acompañar el enlace

> Mesa es mi proyecto de portafolio de seguimiento de solicitudes internas con React, NestJS, TypeScript y SQLite. Permite crear solicitudes, filtrar resultados, consultar un historial de estados y exportar CSV. Fue preparado con asistencia de IA y datos ficticios. El repositorio incluye instrucciones de ejecución, pruebas de API, escenarios de navegador y documentación de QA.

Antes de publicar, añadir una frase propia sobre una parte que hayas revisado o mejorado personalmente y que puedas explicar con un ejemplo del código.
