import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Patch, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: 'Cria uma nova categoria para o usuário logado' })
    @ApiBody({ type: CreateCategoryDto })
    @ApiResponse({ status: 201, description: 'A categoria foi criada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.create(createCategoryDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Lista todas as categorias do usuário logado' })
    @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    findAll(@Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.findAllByUserId(userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualiza uma categoria específica do usuário logado' })
    @ApiBody({ type: UpdateCategoryDto })
    @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.update(id, updateCategoryDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove uma categoria específica do usuário logado' })
    @ApiResponse({ status: 204, description: 'Categoria removida com sucesso.' })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.remove(id, userId);
    }
}
