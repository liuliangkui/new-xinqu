import { Controller, Get, Put, Body, Param, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'
import type { Request } from 'express'

@ApiTags('后台设置')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  private getUserId(req: Request) {
    return (req as Request & { user: { userId: string } }).user.userId
  }

  @Get()
  @Permissions('system:read')
  @ApiOperation({ summary: '查询后台设置' })
  findAll(@Req() req: Request) {
    return this.settingsService.findAll(this.getUserId(req))
  }

  @Put(':groupId/:itemId')
  @Permissions('system:update')
  @ApiOperation({ summary: '更新设置项' })
  updateItem(
    @Req() req: Request,
    @Param('groupId') groupId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateItem(this.getUserId(req), groupId, itemId, dto)
  }
}
