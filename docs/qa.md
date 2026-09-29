# QA manual de Mesa

Esta matriz propone verificaciones reproducibles. **Estado inicial: pendiente de ejecución manual**, salvo que se añada un resultado concreto en el registro al final. Las suites automatizadas indicadas a continuación cubren parte de estos flujos y se registran por separado.

## Verificación automatizada

Después de instalar las dependencias con `npm ci`:

```bash
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

`npm test` compila el servidor y ejecuta los casos HTTP de `tests/api.test.cjs` mediante `node:test` y Supertest. Incluyen datos iniciales, paginación, filtros, indicadores, validación, creación, transiciones, historial, exportación CSV, tratamiento de texto SQL y persistencia tras reiniciar.

`npm run test:e2e` compila el proyecto y ejecuta `tests/e2e/workflow.spec.ts` con Playwright y Chromium. La configuración inicia su propia API en `127.0.0.1:4011`. Si Chromium no inicia por bibliotecas ausentes en Linux, ejecutar `npx playwright install-deps chromium`; puede requerir permisos de administrador.

| Escenario de navegador                     | Comprobaciones incluidas                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Bandeja, paginación, filtros y exportación | Filas visibles, navegación entre páginas, combinación de filtros y contenido del CSV descargado |
| Crear, iniciar, resolver y reabrir         | Formulario, notas, historial visible, búsqueda posterior y recarga de la página                 |
| Búsqueda vacía y recuperación de error     | Estado sin coincidencias, respuesta HTTP 500 simulada, reintento y navegación a reportes        |
| Navegación móvil y foco                    | Vista de 390 px, menú, formulario, cierre con Escape y devolución del foco                      |

Los escenarios generan capturas de la aplicación cuando alcanzan los pasos correspondientes. Una captura producida antes de un fallo no demuestra que haya pasado todo el escenario. Estos casos tampoco sustituyen la evaluación manual de contraste, zoom, todos los recorridos de teclado o múltiples navegadores.

### Ejecución registrada: 29 de septiembre de 2026

Entorno: Linux, Node.js **24.18.0**, npm **11.16.0**, Playwright **1.57.0** con Chromium. Se utilizó la versión local inicial de Mesa (`package.json`: `1.0.0`), todavía sin un commit público asociado.

| Verificación                                     | Resultado                                          | Evidencia reproducible                                    |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------- |
| Compilación de servidor e interfaz               | Correcta                                           | `npm run build`                                           |
| API e integración HTTP                           | **8 de 8 pruebas aprobadas**                       | `npm test`; casos en `tests/api.test.cjs`                 |
| Flujos de navegador en Chromium                  | **4 de 4 escenarios aprobados**                    | `npm run test:e2e`; casos en `tests/e2e/workflow.spec.ts` |
| Auditoría de dependencias durante la instalación | **0 vulnerabilidades reportadas** en esa ejecución | Informe de npm al instalar las dependencias del lockfile  |

Las pruebas de navegador confirmaron las correcciones de desbordamiento horizontal a 390 px, foco inicial en el campo **Asunto** y restauración del foco al cerrar el formulario con Escape. Se generaron capturas reales de [escritorio](screenshots/desktop.png), [detalle e historial](screenshots/detail.png) y [móvil](screenshots/mobile.png).

El resultado de la auditoría corresponde al lockfile y a los avisos disponibles durante esa instalación. Las pruebas automatizadas anteriores están ejecutadas; **la matriz manual siguiente sigue pendiente de ejecución registrada**, incluyendo zoom al 200 %, contraste, revisión completa por teclado y otros navegadores.

Para mantener el formato, `npm run format:check` revisa código y documentación con Prettier 3.6.2; `npm run format` aplica el formato.

## Preparación

1. Instalar y ejecutar según el README, con Node.js 24 o superior.
2. Usar una base de datos de prueba para mantener los cambios separados: `DATABASE_PATH=./data/mesa-qa.sqlite npm run dev` en Linux/macOS.
3. Abrir `http://localhost:5173`. Anotar navegador, tamaño de ventana, fecha y versión del código.
4. Tener abiertas las herramientas de desarrollo del navegador para inspeccionar peticiones y errores.

No depender de un identificador o un conteo fijo de los datos de ejemplo: usar la solicitud creada durante cada caso y comparar el estado anterior con el posterior.

## Casos funcionales

| ID    | Caso y pasos                                                                                                                                                      | Resultado esperado                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| QA-01 | Abrir la aplicación por primera vez.                                                                                                                              | Se muestran solicitudes de ejemplo, indicadores y controles de búsqueda; no hay un estado de carga permanente.          |
| QA-02 | Crear una solicitud con título «Revisar acceso de prueba», descripción de al menos 10 caracteres, solicitante «Persona Demo», categoría Accesos y prioridad Alta. | Se informa el éxito, aparece un código y la solicitud nace en Pendiente; puede consultarse su detalle.                  |
| QA-03 | Intentar crear sin datos obligatorios o con un título de menos de 3 caracteres.                                                                                   | El formulario comunica la validación; una petición inválida directa a la API devuelve HTTP 400 y no crea registros.     |
| QA-04 | Crear una solicitud con caracteres españoles, comillas y saltos de línea en su descripción.                                                                       | La información se conserva y se muestra como texto.                                                                     |
| QA-05 | Buscar un fragmento del título de una solicitud creada.                                                                                                           | El listado contiene la solicitud coincidente; el total refleja el filtro.                                               |
| QA-06 | Combinar estado, prioridad y categoría. Quitar los filtros.                                                                                                       | Cada fila cumple todos los filtros activos; al quitarlos, se recupera el listado completo.                              |
| QA-07 | Buscar un texto que no exista.                                                                                                                                    | Se presenta un estado vacío comprensible y se permite cambiar o limpiar la búsqueda.                                    |
| QA-08 | Ir a la segunda página y después aplicar un filtro.                                                                                                               | La búsqueda vuelve a una página válida; los controles y el total son coherentes con los resultados.                     |
| QA-09 | Abrir una solicitud pendiente, iniciarla, resolverla y reabrirla.                                                                                                 | Los estados avanzan a En curso, Resuelta y En curso; cada cambio aparece en el historial con su fecha.                  |
| QA-10 | Enviar por API el salto Pendiente → Resuelta o repetir el estado actual.                                                                                          | La API responde HTTP 409; no cambia el estado ni agrega un cambio al historial.                                         |
| QA-11 | Cambiar de estado incluyendo una nota. Consultar de nuevo el detalle.                                                                                             | La nota permanece asociada al cambio correspondiente.                                                                   |
| QA-12 | Anotar los indicadores globales y aplicar un filtro. Crear una solicitud y cambiar su estado.                                                                     | Filtrar no modifica los indicadores globales; crear o cambiar estado actualiza los conteos que correspondan.            |
| QA-13 | Filtrar resultados que ocupen más de una página y descargar CSV.                                                                                                  | La descarga incluye todas las coincidencias, una fila de encabezados y un CSV legible con caracteres españoles.         |
| QA-14 | Exportar datos que contengan comas, comillas, saltos de línea o un texto que comience con `=`.                                                                    | Las celdas conservan su estructura; los textos no se convierten en fórmulas al abrir el archivo en una hoja de cálculo. |
| QA-15 | Crear una solicitud, detener y reiniciar el servidor con el mismo `DATABASE_PATH`.                                                                                | La solicitud y su historial se conservan; no se duplican los datos iniciales.                                           |
| QA-16 | Solicitar por API un ID inexistente o parámetros de paginación inválidos.                                                                                         | Se responde HTTP 404 para el recurso inexistente y HTTP 400 para parámetros inválidos.                                  |
| QA-17 | Con la interfaz abierta, detener la API e intentar recargar datos o enviar una solicitud.                                                                         | Se comunica un error sin anunciar un guardado exitoso. Al reiniciar la API puede recuperarse el flujo.                  |

## Interfaz y accesibilidad

| ID    | Caso y pasos                                                                                           | Resultado esperado                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| QA-18 | Recorrer búsqueda, filtros, botones y formulario usando Tab, Shift+Tab, Enter y Escape cuando aplique. | El foco es visible y los controles se pueden utilizar con teclado; no se pierde el foco dentro de un diálogo cerrado. |
| QA-19 | Revisar a 1440 px y a 390 px de ancho.                                                                 | Títulos, botones y campos siguen siendo legibles y utilizables; los elementos no se superponen.                       |
| QA-20 | Aumentar el zoom del navegador a 200 %.                                                                | Se mantienen el acceso a los controles y la lectura de los contenidos.                                                |
| QA-21 | Revisar etiquetas de campos, mensajes de error y estados sin basarse solo en el color.                 | Los campos se identifican por texto y los estados incluyen una etiqueta comprensible.                                 |
| QA-22 | Enviar varias veces seguidas el formulario y cambiar rápidamente los filtros.                          | La interfaz evita envíos accidentales durante el guardado y muestra resultados coherentes con el filtro más reciente. |

## Registrar hallazgos

Un reporte útil incluye: ID del caso, pasos exactos, dato de prueba, resultado esperado, resultado observado, entorno y una captura o respuesta HTTP. Clasificar la severidad según si impide el flujo, corrompe información o afecta la presentación.

| Fecha | Versión del código | Entorno | Casos ejecutados | Resultado y evidencia                     |
| ----- | ------------------ | ------- | ---------------- | ----------------------------------------- |
| —     | —                  | —       | —                | Pendiente de ejecución manual registrada. |

Repetir un caso después de corregirlo y revisar los flujos relacionados. Mantener el resultado anterior como evidencia, en vez de sustituirlo por un «pasó» sin contexto.
