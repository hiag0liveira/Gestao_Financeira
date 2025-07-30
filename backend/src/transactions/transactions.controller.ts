// backend/src/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Patch, ValidationPipe, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@ApiBearerAuth()
@ApiTags('transactions')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @ApiOperation({ summary: 'Cria uma nova transação para o usuário logado' })
    @ApiBody({ type: CreateTransactionDto })
    @ApiResponse({ status: 201, description: 'A transação foi criada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    create(@Body(ValidationPipe) createTransactionDto: CreateTransactionDto, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.create(createTransactionDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Lista as transações do usuário logado com filtros e paginação' })
    @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    findAll(@Request() req, @Query(ValidationPipe) query: GetTransactionsQueryDto) {
        const userId = req.user.userId;
        return this.transactionsService.findAllByUserId(userId, query);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualiza uma transação específica do usuário logado' })
    @ApiBody({ type: UpdateTransactionDto })
    @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.update(id, updateTransactionDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove uma transação específica do usuário logado' })
    @ApiResponse({ status: 204, description: 'Transação removida com sucesso.' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.remove(id, userId);
    }
}
