import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.create(createCategoryDto, userId);
    }

    @Get()
    findAll(@Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.findAllByUserId(userId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.update(id, updateCategoryDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        return this.categoriesService.remove(id, userId);
    }
}
