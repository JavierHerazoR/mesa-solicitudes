import type { CreateRequestDto } from './requests.dto';
import type { RequestStatus } from './requests.types';

// Contenido original y ficticio: no representa solicitudes de ninguna empresa.
export const DEMO_REQUESTS: Array<CreateRequestDto & { status: RequestStatus }> = [
  {
    title: 'Habilitar acceso al tablero de operaciones',
    description:
      'Necesito consultar el tablero del equipo para preparar el informe semanal de actividades.',
    requester: 'Lucía Torres',
    category: 'Accesos',
    priority: 'high',
    status: 'pending',
  },
  {
    title: 'Revisar valor duplicado en una factura',
    description:
      'La factura de demostración FAC-1042 muestra dos veces el mismo concepto de servicio.',
    requester: 'Mateo Ríos',
    category: 'Facturación',
    priority: 'high',
    status: 'in_progress',
  },
  {
    title: 'Error al adjuntar un archivo PDF',
    description:
      'El formulario muestra un error al cargar un documento PDF de menos de dos megabytes.',
    requester: 'Valentina Gil',
    category: 'Soporte',
    priority: 'medium',
    status: 'pending',
  },
  {
    title: 'Actualizar horario de una actividad',
    description: 'Solicito mover la actividad de inventario del jueves a las nueve de la mañana.',
    requester: 'Daniel Vega',
    category: 'Operaciones',
    priority: 'medium',
    status: 'in_progress',
  },
  {
    title: 'Restablecer acceso de una cuenta de prueba',
    description:
      'La cuenta de prueba quedó bloqueada después de varios intentos de ingreso fallidos.',
    requester: 'Sara Luna',
    category: 'Accesos',
    priority: 'high',
    status: 'resolved',
  },
  {
    title: 'Corregir datos del comprobante de pago',
    description:
      'El nombre del servicio en el comprobante de demostración necesita una corrección.',
    requester: 'Nicolás Mora',
    category: 'Facturación',
    priority: 'low',
    status: 'pending',
  },
  {
    title: 'La búsqueda no encuentra códigos completos',
    description:
      'Al buscar un código completo no aparecen resultados, aunque la solicitud está registrada.',
    requester: 'Camila Sol',
    category: 'Soporte',
    priority: 'high',
    status: 'in_progress',
  },
  {
    title: 'Confirmar disponibilidad de equipo',
    description:
      'Necesitamos confirmar la disponibilidad del equipo de demostración para el próximo turno.',
    requester: 'Andrés Pardo',
    category: 'Operaciones',
    priority: 'medium',
    status: 'pending',
  },
  {
    title: 'Crear permiso de consulta de reportes',
    description:
      'El perfil de consulta necesita acceso de lectura a los reportes mensuales del entorno de prueba.',
    requester: 'Lucía Torres',
    category: 'Accesos',
    priority: 'medium',
    status: 'resolved',
  },
  {
    title: 'Descargar resumen de facturación',
    description:
      'Solicito un resumen de las facturas de ejemplo para revisar los conceptos registrados.',
    requester: 'Mateo Ríos',
    category: 'Facturación',
    priority: 'low',
    status: 'resolved',
  },
  {
    title: 'Ajustar mensaje de validación del formulario',
    description:
      'Cuando falta la descripción, el formulario debería explicar qué información debemos completar.',
    requester: 'Valentina Gil',
    category: 'Soporte',
    priority: 'low',
    status: 'pending',
  },
  {
    title: 'Reprogramar revisión de inventario',
    description: 'La revisión del inventario de demostración debe pasar al siguiente día hábil.',
    requester: 'Daniel Vega',
    category: 'Operaciones',
    priority: 'medium',
    status: 'resolved',
  },
  {
    title: 'Retirar permiso temporal de edición',
    description:
      'Finalizó la prueba y ya no se necesita el permiso temporal de edición en el tablero.',
    requester: 'Sara Luna',
    category: 'Accesos',
    priority: 'medium',
    status: 'in_progress',
  },
  {
    title: 'Consultar estado de nota de ajuste',
    description:
      'Necesito conocer el estado de la nota de ajuste registrada en el ambiente de demostración.',
    requester: 'Nicolás Mora',
    category: 'Facturación',
    priority: 'medium',
    status: 'pending',
  },
  {
    title: 'Mejorar lectura de la tabla en móvil',
    description:
      'En pantallas pequeñas cuesta identificar el estado y la prioridad de las solicitudes.',
    requester: 'Camila Sol',
    category: 'Soporte',
    priority: 'low',
    status: 'resolved',
  },
  {
    title: 'Registrar entrega de materiales de prueba',
    description:
      'Solicito registrar la entrega de los materiales ficticios utilizados en la actividad del equipo.',
    requester: 'Andrés Pardo',
    category: 'Operaciones',
    priority: 'low',
    status: 'resolved',
  },
];
