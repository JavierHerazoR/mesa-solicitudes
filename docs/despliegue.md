# Desplegar la demo de Mesa

La configuración usa **Render Free** para ejecutar React y NestJS en un solo servicio Node.js. SQLite se guarda en un archivo temporal y se inicializa automáticamente con 16 solicitudes ficticias cuando ese archivo no existe.

Estado: configuración preparada para desplegar. La URL pública se confirmará después de crear el servicio y probarlo. El repositorio de código es [JavierHerazoR/mesa-solicitudes](https://github.com/JavierHerazoR/mesa-solicitudes).

## 1. Crear el servicio

1. Inicia sesión o crea una cuenta en [Render](https://dashboard.render.com/).
2. Abre [Desplegar Mesa](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FJavierHerazoR%2Fmesa-solicitudes).
3. Si Render lo solicita, conecta GitHub y selecciona el repositorio `JavierHerazoR/mesa-solicitudes`.
4. Revisa la configuración del Blueprint: debe crear **un servicio web en el plan Free**, sin discos ni bases de datos adicionales. Si el nombre ya está ocupado, elige otro nombre disponible; Render asignará la dirección definitiva.
5. Confirma el despliegue y espera a que el servicio indique que está activo. Copia la URL HTTPS que genere Render.

El enlace de despliegue lee `render.yaml` del repositorio, según la [documentación del botón de Render](https://render.com/docs/deploy-to-render). Debe existir en GitHub antes de abrir el formulario.

## Configuración utilizada

| Campo              | Valor                                                           |
| ------------------ | --------------------------------------------------------------- |
| Tipo               | Web Service                                                     |
| Runtime            | Node                                                            |
| Plan               | Free                                                            |
| Directorio raíz    | Raíz del repositorio de Mesa                                    |
| Build Command      | `npm ci --include=dev && npm run build && npm prune --omit=dev` |
| Start Command      | `npm start`                                                     |
| Health Check Path  | `/api/health`                                                   |
| `NODE_VERSION`     | `24.18.0`, versión utilizada en la validación local             |
| `NODE_ENV`         | `production`                                                    |
| `HOST`             | `0.0.0.0`                                                       |
| `DATABASE_PATH`    | `/tmp/mesa/mesa.sqlite`                                         |
| `VITE_PUBLIC_DEMO` | `true`                                                          |

Render proporciona `PORT`; Mesa ya lo utiliza. El frontend usa rutas relativas `/api`, por lo que ambas capas comparten el mismo dominio. No hay que configurar una URL de backend en React. El servidor escucha en `0.0.0.0`, como requieren los [servicios web de Render](https://render.com/docs/web-services). La versión de Node se fija mediante `NODE_VERSION`, un [mecanismo admitido por Render](https://render.com/docs/node-version).

El build instala también las herramientas de desarrollo para compilar TypeScript y React; después conserva solo las dependencias de ejecución. `VITE_PUBLIC_DEMO` se incorpora durante la compilación y muestra un aviso de que los datos son compartidos y temporales.

## Qué significa usar el plan gratuito

Tras 15 minutos sin tráfico, el servicio se suspende y puede tardar aproximadamente un minuto en reactivarse. Reiniciar, suspender o desplegar borra los archivos locales. Free no admite discos persistentes. Consulta los [límites de Render Free](https://render.com/docs/free).

Esta demo permite a cualquier visitante consultar y modificar solicitudes de prueba en un espacio compartido. Usa datos ficticios. La persistencia local del proyecto sigue funcionando cuando el archivo SQLite se conserva; el carácter temporal de esta demo deriva del alojamiento.

Mantén el plan Free y revisa las cuotas y límites de gasto: si añades un método de pago, pueden existir cobros por excedentes.

## 2. Comprobar la URL pública

- Abre `/api/health` en el dominio asignado: debe devolver `{"status":"ok"}`.
- Abre la raíz del dominio y confirma que aparece «Demo pública · datos temporales».
- Crea una solicitud ficticia, inicia su atención y márcala como resuelta.
- Comprueba el historial, los filtros y una descarga CSV.
- Abre la misma dirección desde el teléfono y revisa el formulario y el menú.

Después de comprobarla, añade esa URL real al campo Website del repositorio, al README y a Destacados de LinkedIn. No uses el enlace del formulario de despliegue como si fuera la demo.

## Actualizar o retirar la demo

Los despliegues automáticos están desactivados en el Blueprint. Después de subir cambios a GitHub, abre el servicio en Render y despliega manualmente el último commit. Volver a desplegar reemplaza los datos temporales. Si actualizas el Blueprint, revisa también la sincronización de sus ajustes en Render.

Para retirar la demo, elimina su servicio desde Render. El repositorio de GitHub y los archivos locales se conservan.

## Si el despliegue falla

- **No encuentra `render.yaml`:** comprueba que el archivo esté publicado en la raíz de `main`.
- **No encuentra `tsc` o `vite`:** revisa que el build incluya `npm ci --include=dev` antes de compilar.
- **No detecta un puerto:** comprueba `HOST=0.0.0.0` y que se ejecute `npm start`.
- **Muestra JSON o un 404 en la raíz:** confirma que el build ejecute `npm run build`, que compila también React en `dist/client`.
- **No aparece el aviso de demo:** define `VITE_PUBLIC_DEMO=true` y vuelve a compilar/desplegar.
- **Los datos vuelven a los ejemplos:** es el comportamiento esperado del almacenamiento temporal de este plan.

## Validación previa al despliegue

El 29 de septiembre de 2026 se compiló una copia aislada con `NODE_ENV=production` y `VITE_PUBLIC_DEMO=true`. Pasaron las 8 pruebas de API y los 4 recorridos de Chromium. Tras retirar las dependencias de desarrollo, se verificaron el arranque en `0.0.0.0`, `/api/health`, la entrega de HTML, JavaScript y CSS, los 16 registros iniciales y el aviso público a 390 px sin desbordamiento. Esta comprobación es local; la URL asignada por Render debe probarse después de crear el servicio.
