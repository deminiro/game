import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { CreateMockDto } from '@/modules/mock/dto/create-mock.dto';
import { QueryMockDto } from '@/modules/mock/dto/query-mock.dto';
import { UpdateMockDto } from '@/modules/mock/dto/update-mock.dto';
import { MockEntity } from '@/modules/mock/entities/mock.entity';
import { MockEventsStream } from '@/modules/mock/events/mock-events.stream';
import { MockService } from '@/modules/mock/mock.service';

@ApiTags('mocks')
@Controller({ path: 'mocks', version: '1' })
export class MockController {
  constructor(
    private readonly mockService: MockService,
    private readonly mockEventsStream: MockEventsStream,
  ) {}

  @Post()
  @ApiOkResponse({ type: MockEntity })
  create(@Body() dto: CreateMockDto): Promise<MockEntity> {
    return this.mockService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryMockDto) {
    return this.mockService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: MockEntity })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MockEntity> {
    return this.mockService.findOne(id);
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.mockEventsStream.onMockCreated().pipe(
      map(
        (event): MessageEvent => ({
          type: event.type,
          data: {
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            version: event.version,
            payload: event.payload,
            occurredAt: event.occurredAt,
            metadata: event.metadata,
          },
          id: event.id,
        }),
      ),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: MockEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMockDto,
  ): Promise<MockEntity> {
    return this.mockService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mockService.remove(id);
  }
}
