import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.create(createTransactionDto, userId);
    }

    @Get()
    findAll(@Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.findAllByUserId(userId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTransactionDto: UpdateTransactionDto, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.update(id, updateTransactionDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        return this.transactionsService.remove(id, userId);
    }
}
