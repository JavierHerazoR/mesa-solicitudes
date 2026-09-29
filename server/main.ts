import { createApp } from './app';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 4010);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un puerto válido entre 1 y 65535.');
  }
  const host = process.env.HOST || '127.0.0.1';
  const app = await createApp();
  await app.listen(port, host);
  console.log(`Mesa API disponible en http://${host}:${port}/api/requests`);
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : 'No se pudo iniciar Mesa.');
  process.exitCode = 1;
});
