import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from './requests.types';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const integer = ({ value }: { value: unknown }) =>
  typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;

export class CreateRequestDto {
  @Transform(trim)
  @IsString({ message: 'El título debe ser texto.' })
  @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres.' })
  title!: string;

  @Transform(trim)
  @IsString({ message: 'La descripción debe ser texto.' })
  @Length(10, 1500, { message: 'La descripción debe tener entre 10 y 1500 caracteres.' })
  description!: string;

  @Transform(trim)
  @IsString({ message: 'El solicitante debe ser texto.' })
  @Length(3, 70, { message: 'El solicitante debe tener entre 3 y 70 caracteres.' })
  requester!: string;

  @IsIn(CATEGORIES, { message: 'Selecciona una categoría válida.' })
  category!: RequestCategory;

  @IsIn(PRIORITIES, { message: 'Selecciona una prioridad válida.' })
  priority!: RequestPriority;
}

export class ChangeStatusDto {
  @IsIn(STATUSES, { message: 'Selecciona un estado válido.' })
  status!: RequestStatus;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La nota debe ser texto.' })
  @MaxLength(500, { message: 'La nota no puede superar 500 caracteres.' })
  note?: string;
}

export class RequestFiltersDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La búsqueda debe ser texto.' })
  @MaxLength(100, { message: 'La búsqueda no puede superar 100 caracteres.' })
  search?: string;

  @IsOptional()
  @IsIn(STATUSES, { message: 'Selecciona un estado válido.' })
  status?: RequestStatus;

  @IsOptional()
  @IsIn(PRIORITIES, { message: 'Selecciona una prioridad válida.' })
  priority?: RequestPriority;

  @IsOptional()
  @IsIn(CATEGORIES, { message: 'Selecciona una categoría válida.' })
  category?: RequestCategory;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha inicial debe tener formato AAAA-MM-DD.' })
  @IsISO8601({ strict: true }, { message: 'Selecciona una fecha inicial válida.' })
  dateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha final debe tener formato AAAA-MM-DD.' })
  @IsISO8601({ strict: true }, { message: 'Selecciona una fecha final válida.' })
  dateTo?: string;

  @Transform(integer)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1.' })
  @Max(100000, { message: 'La página no puede superar 100000.' })
  page = 1;

  @Transform(integer)
  @IsInt({ message: 'El tamaño de página debe ser un número entero.' })
  @Min(1, { message: 'El tamaño de página debe ser mayor o igual a 1.' })
  @Max(50, { message: 'El tamaño de página no puede superar 50.' })
  pageSize = 8;
}
