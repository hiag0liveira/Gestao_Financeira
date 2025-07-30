import { Controller, Get, Query, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetBalanceDto } from './dto/get-balance.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBalanceByDateRangeDto } from './dto/get-balance-by-date-range.dto';

@ApiBearerAuth()
@ApiTags('balance')
@UseGuards(JwtAuthGuard)
@Controller('balance')
export class BalanceController {
    constructor(private readonly balanceService: BalanceService) { }

    @Get()
    @ApiOperation({ summary: 'Calcula o saldo do mês, com filtro opcional por múltiplas categorias.' })
    @ApiResponse({ status: 200, description: 'Saldo calculado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    getBalance(@Request() req, @Query(new ValidationPipe({ transform: true })) getBalanceDto: GetBalanceDto) {
        const userId = req.user.userId;
        return this.balanceService.calculateBalance(userId, getBalanceDto.year, getBalanceDto.month, getBalanceDto.categoryIds);
    }

    @Get('by-range')
    @ApiOperation({ summary: 'Calcula o saldo para um intervalo de datas, com filtro opcional por múltiplas categorias' })
    @ApiResponse({ status: 200, description: 'Saldo do período calculado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    getBalanceByDateRange(@Request() req, @Query(new ValidationPipe({ transform: true })) getBalanceDto: GetBalanceByDateRangeDto) {
        const userId = req.user.userId;
        return this.balanceService.calculateBalanceByDateRange(userId, getBalanceDto.startDate, getBalanceDto.endDate, getBalanceDto.categoryIds);
    }
}
