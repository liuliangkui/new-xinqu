import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { FavoriteService } from './favorite.service'
import { CreateFavoriteDto } from './dto/create-favorite.dto'
import { FavoriteQueryDto } from './dto/favorite-query.dto'
import type { Request } from 'express'

@ApiTags('收藏夹')
@ApiBearerAuth()
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  private getUserId(req: Request) {
    return (req as Request & { user: { userId: string } }).user.userId
  }

  @Get()
  @Permissions('favorite:read')
  @ApiOperation({ summary: '查询收藏列表' })
  findAll(@Req() req: Request, @Query() query: FavoriteQueryDto) {
    return this.favoriteService.findAll(this.getUserId(req), query)
  }

  @Post()
  @Permissions('favorite:create')
  @ApiOperation({ summary: '添加收藏' })
  create(@Req() req: Request, @Body() dto: CreateFavoriteDto) {
    return this.favoriteService.create(this.getUserId(req), dto)
  }

  @Delete(':id')
  @Permissions('favorite:delete')
  @ApiOperation({ summary: '取消收藏' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.favoriteService.remove(this.getUserId(req), id)
  }
}
