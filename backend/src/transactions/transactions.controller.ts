import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Patch, ValidationPipe, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMonthlyTransactionsDto } from './dto/get-monthly-transactions.dto';
import { GetRangedTransactionsDto } from './dto/get-ranged-transactions.dto';

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
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    create(@Body(ValidationPipe) createTransactionDto: CreateTransactionDto, @Request() req) {
        return this.transactionsService.create(createTransactionDto, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Lista transações por mês/ano com filtros e paginação' })
    @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    findAllByMonth(@Request() req, @Query(new ValidationPipe({ transform: true })) query: GetMonthlyTransactionsDto) {
        return this.transactionsService.findAllByMonth(req.user.userId, query);
    }

    @Get('by-range')
    @ApiOperation({ summary: 'Lista transações por intervalo de datas com filtros e paginação' })
    @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    findAllByRange(@Request() req, @Query(new ValidationPipe({ transform: true })) query: GetRangedTransactionsDto) {
        return this.transactionsService.findAllByRange(req.user.userId, query);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualiza uma transação específica do usuário logado' })
    @ApiBody({ type: UpdateTransactionDto })
    @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto, @Request() req) {
        return this.transactionsService.update(id, updateTransactionDto, req.user.userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove uma transação específica do usuário logado' })
    @ApiResponse({ status: 204, description: 'Transação removida com sucesso.' })
    @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.transactionsService.remove(id, req.user.userId);
    }
}
