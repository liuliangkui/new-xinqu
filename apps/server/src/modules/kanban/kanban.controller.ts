import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { KanbanService } from './kanban.service'

@ApiTags('工单看板')
@ApiBearerAuth()
@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get()
  @Permissions('ticket:read')
  @ApiOperation({ summary: '查询看板数据' })
  findAll() {
    return this.kanbanService.findAll()
  }

  @Get('stats')
  @Permissions('ticket:read')
  @ApiOperation({ summary: '查询看板统计' })
  stats() {
    return this.kanbanService.stats()
  }
}
