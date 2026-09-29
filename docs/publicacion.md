# Mesa en GitHub

El repositorio está publicado en **[JavierHerazoR/mesa-solicitudes](https://github.com/JavierHerazoR/mesa-solicitudes)**. Mesa es un proyecto personal preparado con asistencia de IA y datos ficticios. La demo alojada sigue pendiente; el README explica cómo ejecutarlo localmente.

## Publicación verificada

El 29 de septiembre de 2026 se comprobó mediante la API pública de GitHub que el repositorio es público, utiliza la rama `main` y contiene los 40 archivos del proyecto. Los hashes de los archivos publicados coincidieron con la copia local que superó las pruebas. Se incluyen código, lockfile, pruebas, documentación y tres capturas; no se incluyeron dependencias instaladas ni bases de datos.

Los cambios posteriores de documentación se envían al repositorio mediante un nuevo commit, como se muestra a continuación.

## Actualizar la documentación publicada

Ejecutar desde la carpeta `mesa`:

```bash
git rev-parse --show-toplevel
git remote -v
git status --short
```

La raíz debe ser la carpeta Mesa y `origin` debe apuntar a `JavierHerazoR/mesa-solicitudes`. Revisar los cambios antes de confirmarlos:

```bash
git diff -- README.md docs/publicacion.md docs/entrevista.md
git add README.md docs/publicacion.md docs/entrevista.md
git commit -m "docs: actualiza enlaces y estado de publicación"
git push origin main
```

El repositorio ya está inicializado y tiene remoto: no hace falta repetir `git init` ni `git remote add`.

## Presentación del repositorio

| Campo          | Estado o propuesta                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre         | `mesa-solicitudes`                                                                                                                                    |
| Visibilidad    | Público, verificado                                                                                                                                   |
| Descripción    | Aplicación de seguimiento de solicitudes con React, NestJS, TypeScript y SQLite. Incluye filtros, historial, exportación CSV y pruebas automatizadas. |
| Topics         | Pendientes de añadir: `react`, `nestjs`, `typescript`, `sqlite`, `vite`, `playwright`, `portfolio`, `fullstack`                                       |
| Enlace de demo | Pendiente de despliegue; mantener vacío hasta contar con una dirección funcional                                                                      |

La descripción ya está configurada en GitHub. Los topics y el campo de demo estaban vacíos durante la revisión. Puedes destacar el repositorio en tu perfil y enlazarlo desde Destacados de LinkedIn.

## Texto breve para acompañar el enlace

> Mesa es mi proyecto de portafolio de seguimiento de solicitudes internas con React, NestJS, TypeScript y SQLite. Permite crear solicitudes, filtrar resultados, consultar un historial de estados y exportar CSV. Fue preparado con asistencia de IA y datos ficticios. El repositorio incluye instrucciones de ejecución, pruebas de API, escenarios de navegador y documentación de QA.

Repositorio: https://github.com/JavierHerazoR/mesa-solicitudes

Al presentarlo en una entrevista, explica las partes del código que has revisado o mejorado personalmente. Mantén este proyecto separado de tu experiencia laboral.
