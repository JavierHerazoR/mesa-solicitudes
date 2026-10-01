import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('bandeja, paginación, filtros combinados y reporte completo', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tus solicitudes, en orden.' })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await expect(page.getByText('Mostrando 1–8 de 16 solicitudes')).toBeVisible();
  await mkdir(resolve('docs/screenshots'), { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/desktop.png', fullPage: true });
  const first = await page.locator('tbody tr').first().textContent();
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByText('Página 2 de 2')).toBeVisible();
  await expect(page.locator('tbody tr').first()).not.toHaveText(first!);
  await page.getByLabel('Filtrar por categoría').selectOption('Accesos');
  await page.getByLabel('Filtrar por prioridad').selectOption('high');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  const pendingTab = page.getByRole('button', { name: /^Pendiente/ });
  await pendingTab.click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  const result = await request.get('/api/requests?category=Accesos&priority=high&status=pending');
  const data = await result.json();
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Bogota',
    })
      .formatToParts(new Date(data.items[0].createdAt))
      .map(({ type, value }) => [type, value]),
  );
  const date = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  await page.getByLabel('Fecha de creación desde').fill(date);
  await page.getByLabel('Fecha de creación hasta').fill(date);
  await expect(page.locator('tbody tr')).toHaveCount(1);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const download = await downloadEvent;
  const csv = await readFile((await download.path())!, 'utf8');
  expect(csv).toContain(data.items[0].code);
  expect(csv.split('\r\n').filter(Boolean).length).toBe(data.total + 1);
  expect(errors).toEqual([]);
});

test('crear, iniciar, resolver y reabrir conserva el historial visible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva solicitud' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Asunto').fill('Revisar reporte de demostración');
  await dialog.getByLabel('Solicitante').fill('Equipo de pruebas');
  await dialog.getByLabel('Categoría').selectOption('Operaciones');
  await dialog.getByLabel('Prioridad').selectOption('high');
  await dialog
    .getByLabel('Descripción')
    .fill('Validar que el reporte contenga la información del período de demostración.');
  await dialog.getByRole('button', { name: 'Crear solicitud' }).click();
  await expect(
    dialog.getByRole('heading', { name: 'Revisar reporte de demostración' }),
  ).toBeVisible();
  await expect(dialog.getByText('Solicitud creada', { exact: true })).toBeVisible();
  await dialog.getByLabel('Nota del cambio').fill('Comenzamos la validación del reporte.');
  await dialog.getByRole('button', { name: 'Iniciar atención' }).click();
  await expect(dialog.getByText('Pendiente → En curso')).toBeVisible();
  await dialog
    .getByLabel('Nota del cambio')
    .fill('Se verificaron los filtros y el archivo exportado.');
  await dialog.getByRole('button', { name: 'Marcar como resuelta' }).click();
  await expect(dialog.getByText('En curso → Resuelta')).toBeVisible();
  await expect(
    dialog.getByText('Se verificaron los filtros y el archivo exportado.'),
  ).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/detail.png' });
  await dialog.getByRole('button', { name: 'Reabrir solicitud' }).click();
  await expect(dialog.getByText('Resuelta → En curso')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByLabel('Buscar solicitudes').fill('Revisar reporte de demostración');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr').getByText('En curso', { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Revisar reporte de demostración', exact: true }),
  ).toBeVisible();
});

test('búsqueda sin coincidencias, recuperación de errores y reporte', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Buscar solicitudes').fill('solicitud inexistente 938491');
  await expect(page.getByText('No encontramos coincidencias')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await page.route('**/api/requests?*', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Error de demostración.' }),
    }),
  );
  await page.getByLabel('Buscar solicitudes').fill('prueba');
  await expect(
    page.getByRole('heading', { name: 'No pudimos cargar las solicitudes' }),
  ).toBeVisible();
  await page.unroute('**/api/requests?*');
  await page.getByRole('button', { name: 'Volver a intentar' }).click();
  await expect(
    page.getByRole('heading', { name: 'No pudimos cargar las solicitudes' }),
  ).not.toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Reportes' }).click();
  await expect(page.getByRole('heading', { name: 'Del seguimiento a los datos.' })).toBeVisible();
  await expect(page.getByText('Distribución de todas las solicitudes del espacio.')).toBeVisible();
});

test('móvil: navegación, formulario accesible y retorno de foco', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await expect(page.locator('.sidebar')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Reportes' }).click();
  await expect(page.getByRole('heading', { name: 'Del seguimiento a los datos.' })).toBeVisible();
  const create = page.getByRole('button', { name: 'Nueva solicitud' });
  await create.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByLabel('Asunto')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(create).toBeFocused();
});
