# Presentar Mesa en una entrevista

Usa este guion después de ejecutar la aplicación, recorrer el código y comprobar que puedes explicar cada decisión. Es material de preparación, no una afirmación de experiencia laboral. El proyecto se creó con asistencia de IA; describe con precisión lo que revisaste, probaste o modificaste personalmente.

## Demo de tres minutos

**0:00–0:30 · Problema y alcance**

«Mesa es un proyecto de portafolio para centralizar solicitudes internas. La idea es que una persona pueda registrar un caso, encontrarlo después y saber en qué estado está. Usa datos ficticios y corre localmente con React, NestJS y SQLite».

**0:30–1:10 · Crear y encontrar una solicitud**

Crear una solicitud de acceso con prioridad Alta. Mostrar la validación de un campo y después guardar datos válidos. Buscar el título y combinarlo con un filtro.

«El formulario consume una API HTTP. La API vuelve a validar los datos: las reglas no dependen de que una persona utilice esta pantalla. La búsqueda y la paginación se resuelven en el servidor».

**1:10–1:50 · Reglas e historial**

Abrir el detalle, iniciar la atención, resolver y reabrir.

«Una solicitud empieza pendiente, pasa a en curso y después puede resolverse. Si hay que continuar, se reabre. La API rechaza saltos inválidos y conserva el historial de cada cambio».

**1:50–2:25 · Reporte y persistencia**

Mostrar los indicadores y descargar un CSV filtrado.

«Los indicadores describen el conjunto completo; la tabla responde a los filtros. El CSV incluye todas las coincidencias, aunque haya más de una página. SQLite conserva los datos en un archivo para que sea sencillo ejecutar la demo».

**2:25–3:00 · Verificación y límites**

Mostrar una prueba automatizada y un caso de la matriz de QA que hayas ejecutado.

«El objetivo es demostrar el recorrido desde la interfaz hasta la persistencia. Es una demo local sin autenticación. Para un uso multiusuario tendría que incorporar identidad, permisos y revisar la concurrencia. El desarrollo fue asistido por IA; puedo explicar el código que he revisado y las verificaciones que realicé».

## Decisiones que conviene poder defender

| Decisión                                             | Razón en este proyecto                                                                                           | Límite o alternativa                                                                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React + NestJS con TypeScript                        | Practicar componentes, contratos HTTP y organización de responsabilidades en un stack relacionado con mi perfil. | TypeScript no reemplaza la validación de datos recibidos por HTTP.                                                                                           |
| SQLite en un archivo                                 | Reducir pasos para que otra persona ejecute la demo sin configurar un servicio de base de datos.                 | Para otro volumen de escrituras o varios procesos habría que evaluar la persistencia y la concurrencia; PostgreSQL sería una alternativa.                    |
| Reglas de estado en el backend                       | Aplicar las mismas restricciones a cualquier cliente de la API.                                                  | La interfaz debe reflejar las opciones disponibles y comunicar los rechazos.                                                                                 |
| Historial separado de la solicitud                   | Consultar la evolución del estado, además del valor actual.                                                      | No es una auditoría de identidad: no existen usuarios autenticados.                                                                                          |
| Filtros y paginación en el servidor                  | Consultar solo la página necesaria y mantener una definición común de los filtros.                               | Esta demo no aporta una medición de rendimiento con grandes volúmenes.                                                                                       |
| CSV con el conjunto filtrado completo                | Permitir revisar o compartir los resultados de una búsqueda.                                                     | Una exportación muy grande necesitaría límites, streaming o procesamiento en segundo plano.                                                                  |
| API automatizada, Playwright y QA manual documentado | Verificar reglas HTTP y recorridos reproducibles de la interfaz, además de preparar la revisión manual.          | Los cuatro escenarios de Chromium no cubren todos los navegadores ni todos los casos de accesibilidad. Una matriz pendiente no cuenta como prueba ejecutada. |

## Preguntas para practicar con el código abierto

1. ¿Qué sucede desde que se pulsa «Crear» hasta que aparece la nueva solicitud?
2. ¿Dónde se validan longitudes y valores permitidos? ¿Qué devuelve una petición inválida?
3. ¿Qué diferencia hay entre un estado inexistente y una transición no permitida?
4. ¿Cómo se aplican los mismos filtros al listado y a la exportación?
5. ¿Qué guarda el historial y qué información no puede atribuir a un usuario?
6. ¿Cómo se evita que el CSV rompa sus columnas al contener comillas o saltos de línea?
7. ¿Qué prueban realmente los tests? ¿Qué bug podría escaparse?
8. ¿Qué cambiarías antes de permitir que varias personas usen esta aplicación?

Para cada respuesta, localizar el archivo y la función correspondiente. Si no puedes explicar una parte, revisarla y practicar antes de presentarla como habilidad dominada.

## Descripción breve para GitHub o LinkedIn

> Mesa es una demo de portafolio de seguimiento de solicitudes, con React, NestJS, TypeScript y SQLite. Incluye validación, filtros, paginación, historial de estados y exportación CSV. El proyecto fue preparado con asistencia de IA y utiliza datos ficticios. El repositorio documenta cómo ejecutarlo, su API y los casos de QA.

Publicar este texto cuando exista un repositorio accesible y se haya revisado personalmente el proyecto. Añadir el enlace real y una captura tomada de la aplicación; no afirmar que existe un despliegue público si todavía no se ha realizado.
