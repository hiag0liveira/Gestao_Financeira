import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {
        const newCategory = this.categoriesRepository.create({
            ...createCategoryDto,
            user: { id: userId },
        });
        return this.categoriesRepository.save(newCategory);
    }

    findAllByUserId(userId: number): Promise<Category[]> {
        return this.categoriesRepository.find({
            where: { user: { id: userId } },
        });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto, userId: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!category) {
            throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
        }

        if (category.user.id !== userId) {
            throw new UnauthorizedException('Você não tem permissão para editar esta categoria.');
        }

        const updatedCategory = this.categoriesRepository.merge(category, updateCategoryDto);

        return this.categoriesRepository.save(updatedCategory);
    }

    async remove(id: number, userId: number): Promise<void> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!category) {
            throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
        }

        if (category.user.id !== userId) {
            throw new UnauthorizedException('Você não tem permissão para remover esta categoria.');
        }

        await this.categoriesRepository.remove(category);
    }
}
