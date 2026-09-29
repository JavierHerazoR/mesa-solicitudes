import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChangeStatusDto, CreateRequestDto, RequestFiltersDto } from './requests.dto';
import { RequestsService } from './requests.service';

const requestIdPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('El identificador debe ser un número entero.'),
});

@Controller('requests')
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get()
  list(@Query() filters: RequestFiltersDto) {
    return this.requests.list(filters);
  }

  @Get('stats')
  stats() {
    return this.requests.stats();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="mesa-solicitudes.csv"')
  export(@Query() filters: RequestFiltersDto) {
    return this.requests.exportCsv(filters);
  }

  @Get(':id')
  detail(@Param('id', requestIdPipe) id: number) {
    return this.requests.detail(id);
  }

  @Post()
  create(@Body() input: CreateRequestDto) {
    return this.requests.create(input);
  }

  @Patch(':id/status')
  changeStatus(@Param('id', requestIdPipe) id: number, @Body() input: ChangeStatusDto) {
    return this.requests.changeStatus(id, input);
  }
}
