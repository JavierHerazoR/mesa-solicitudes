# API de Mesa

URL base local: `http://localhost:4010/api`.

Los cuerpos de creación y cambio de estado usan JSON. Los ejemplos requieren que la aplicación esté iniciada; las solicitudes, identificadores, fechas y conteos que recibas dependerán de tu base local. No hay autenticación en esta demo.

## Endpoints

| Método  | Ruta relativa a `/api` | Uso                                             |
| ------- | ---------------------- | ----------------------------------------------- |
| `GET`   | `/health`              | Comprobar que la API responde                   |
| `GET`   | `/requests`            | Consultar solicitudes con filtros y paginación  |
| `GET`   | `/requests/stats`      | Consultar los indicadores globales              |
| `GET`   | `/requests/export`     | Descargar todas las coincidencias como CSV      |
| `GET`   | `/requests/:id`        | Consultar una solicitud y su historial          |
| `POST`  | `/requests`            | Crear una solicitud pendiente                   |
| `PATCH` | `/requests/:id/status` | Cambiar de estado y registrar una nota opcional |

Comprobación rápida:

```bash
curl 'http://localhost:4010/api/health'
```

Respuesta esperada: `{"status":"ok"}`. Este endpoint confirma la respuesta HTTP del proceso; no constituye una comprobación exhaustiva de todos los flujos.

## Valores de dominio

| Campo      | Valores API                                        | Etiquetas en la interfaz      |
| ---------- | -------------------------------------------------- | ----------------------------- |
| `status`   | `pending`, `in_progress`, `resolved`               | Pendiente, En curso, Resuelta |
| `priority` | `low`, `medium`, `high`                            | Baja, Media, Alta             |
| `category` | `Soporte`, `Accesos`, `Facturación`, `Operaciones` | Mismos valores                |

Los estados admiten exclusivamente `pending → in_progress`, `in_progress → resolved` y `resolved → in_progress`. El cliente no puede elegir el estado inicial al crear una solicitud.

## Crear una solicitud

```bash
curl -i -X POST 'http://localhost:4010/api/requests' \
  -H 'Content-Type: application/json' \
  --data '{
    "title": "Revisar acceso al tablero de pruebas",
    "description": "El usuario de demostración necesita acceso de lectura al tablero de solicitudes.",
    "requester": "Persona Demo",
    "category": "Accesos",
    "priority": "high"
  }'
```

| Campo requerido | Regla                         |
| --------------- | ----------------------------- |
| `title`         | Texto de 3 a 100 caracteres   |
| `description`   | Texto de 10 a 1500 caracteres |
| `requester`     | Texto de 3 a 70 caracteres    |
| `category`      | Una categoría del catálogo    |
| `priority`      | `low`, `medium` o `high`      |

Una creación válida devuelve HTTP **201**. El servidor asigna el `id`, el `code` con formato `MES-0001`, el estado `pending` y las fechas `createdAt` y `updatedAt`.

## Consultar y filtrar

```bash
curl --get 'http://localhost:4010/api/requests' \
  --data-urlencode 'search=acceso' \
  --data-urlencode 'status=pending' \
  --data-urlencode 'priority=high' \
  --data-urlencode 'category=Accesos' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=8'
```

Todos los parámetros son opcionales. Los filtros se combinan; omitir un filtro evita restringir por ese campo.

| Parámetro                        | Comportamiento                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `search`                         | Hasta 100 caracteres; busca en código, título, descripción y solicitante. `%` y `_` se tratan como texto literal. |
| `status`, `priority`, `category` | Deben pertenecer a los catálogos anteriores.                                                                      |
| `page`                           | Entero entre 1 y 100000; predeterminado: 1.                                                                       |
| `pageSize`                       | Entero entre 1 y 50; predeterminado: 8, también utilizado por la interfaz.                                        |

El orden es por fecha de creación descendente y, si coincide, por identificador descendente. No se admiten campos de consulta adicionales.

La respuesta contiene:

- `items`: solicitudes de la página pedida.
- `total`: número total de coincidencias antes de paginar.
- `page` y `pageSize`: página y tamaño de página utilizados.
- `totalPages`: número de páginas del resultado.

Cada solicitud expone `id`, `code`, `title`, `description`, `requester`, `category`, `priority`, `status`, `createdAt` y `updatedAt`.

## Consultar el detalle y su historial

Reemplaza `1` por el `id` de una solicitud existente:

```bash
curl 'http://localhost:4010/api/requests/1'
```

La respuesta incluye los campos de la solicitud y un arreglo `history`, ordenado del primer evento al más reciente. Cada elemento contiene `id`, `fromStatus`, `toStatus`, `note` y `createdAt`. `fromStatus` es `null` para el registro inicial de creación.

## Cambiar de estado

Usa el `id` de una solicitud que esté en `pending`:

```bash
curl -i -X PATCH 'http://localhost:4010/api/requests/1/status' \
  -H 'Content-Type: application/json' \
  --data '{"status":"in_progress","note":"Se inicia la revisión del acceso de prueba."}'
```

Después de iniciarla, resolver:

```bash
curl -i -X PATCH 'http://localhost:4010/api/requests/1/status' \
  -H 'Content-Type: application/json' \
  --data '{"status":"resolved","note":"Acceso validado en el entorno de demostración."}'
```

Después de resolverla, reabrir:

```bash
curl -i -X PATCH 'http://localhost:4010/api/requests/1/status' \
  -H 'Content-Type: application/json' \
  --data '{"status":"in_progress","note":"Se requiere una comprobación adicional."}'
```

`status` es obligatorio. `note` es opcional y admite hasta 500 caracteres. Un cambio válido responde HTTP **200**. Intentar repetir el estado actual o saltar de `pending` directamente a `resolved` devuelve HTTP **409**.

## Indicadores globales

```bash
curl 'http://localhost:4010/api/requests/stats'
```

La respuesta devuelve `total`, `pending`, `in_progress`, `resolved` y `highPriority`. Los indicadores no se restringen por los filtros de la bandeja. `highPriority` cuenta las solicitudes de prioridad alta; no se debe interpretar como un indicador de solicitudes vencidas.

## Exportar CSV

```bash
curl --get 'http://localhost:4010/api/requests/export' \
  --data-urlencode 'status=pending' \
  --data-urlencode 'category=Accesos' \
  --output mesa-pendientes.csv
```

La exportación acepta los mismos filtros `search`, `status`, `priority` y `category` del listado. Incluye **todas** las coincidencias; no se limita a una página. Si se envían `page` y `pageSize`, se validan pero no restringen el archivo. La respuesta utiliza `Content-Type: text/csv; charset=utf-8` y una cabecera de descarga.

El archivo usa UTF-8 con BOM, separador coma y saltos de línea CRLF. Los estados y prioridades se exportan con etiquetas en español. Las comillas se escapan y los textos que podrían interpretarse como fórmulas llevan un apóstrofo inicial.

## Errores esperados

| Código HTTP | Situación                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------- |
| `400`       | Campos inválidos o adicionales, valores fuera del catálogo o parámetros de consulta inválidos |
| `404`       | No existe una solicitud con el identificador indicado                                         |
| `409`       | La transición solicitada no está permitida desde el estado actual                             |

Ejemplo de validación: este cuerpo tiene un título demasiado corto y debe ser rechazado sin crear una solicitud.

```bash
curl -i -X POST 'http://localhost:4010/api/requests' \
  -H 'Content-Type: application/json' \
  --data '{
    "title": "A",
    "description": "Caso de prueba para validar el título.",
    "requester": "Persona Demo",
    "category": "Soporte",
    "priority": "medium"
  }'
```

Consultar `message` en la respuesta para conocer el detalle de la validación. Los mensajes exactos no se consideran una traducción estable de la API.
