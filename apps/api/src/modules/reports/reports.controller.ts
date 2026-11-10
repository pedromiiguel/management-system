import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Permission, ReportQuery, reportQuerySchema } from '@beverage/shared';
import { z } from 'zod';
import { RequirePermission } from '../auth/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CsvColumn, toCsv } from '../../common/utils/csv';
import { StockService } from '../stock/stock.service';
import { ReportsService } from './reports.service';

const formatQuerySchema = reportQuerySchema.pick({ format: true });

/** Cada relatório responde JSON ou, com `format=csv`, o arquivo para download. */
@Controller('reports')
@RequirePermission(Permission.REPORTS_READ)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly stockService: StockService,
  ) {}

  @Get('sales')
  async salesByPeriod(
    @Res({ passthrough: true }) res: Response,
    @Query(new ZodValidationPipe(reportQuerySchema)) query: ReportQuery,
  ) {
    const report = await this.reportsService.salesByPeriod(query);
    if (query.format === 'json') return report;
    return sendCsv(res, 'vendas-por-periodo.csv', report.days, [
      { key: 'day', label: 'Dia' },
      { key: 'count', label: 'Vendas' },
      { key: 'revenue', label: 'Receita (R$)' },
      { key: 'serviceFee', label: 'Taxa de serviço (R$)' },
    ]);
  }

  /** FR-38/FR-39: mais vendidos e margem em um único relatório. */
  @Get('products')
  async productPerformance(
    @Res({ passthrough: true }) res: Response,
    @Query(new ZodValidationPipe(reportQuerySchema)) query: ReportQuery,
  ) {
    const report = await this.reportsService.productPerformance(query);
    if (query.format === 'json') return report;
    const rows = report.map(({ product, ...r }) => ({
      ...r,
      name: product.name,
      sku: product.sku,
    }));
    return sendCsv(res, 'desempenho-produtos.csv', rows, [
      { key: 'name', label: 'Produto' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity', label: 'Qtd vendida' },
      { key: 'grossSales', label: 'Valor bruto (R$)' },
      { key: 'cost', label: 'Custo (R$)' },
      { key: 'margin', label: 'Margem (R$)' },
      { key: 'marginPercent', label: 'Margem (%)' },
    ]);
  }

  /** FR-40: posição atual de estoque. */
  @Get('stock-position')
  async stockPosition(
    @Res({ passthrough: true }) res: Response,
    @Query(new ZodValidationPipe(formatQuerySchema)) query: z.output<typeof formatQuerySchema>,
  ) {
    const report = await this.stockService.position();
    if (query.format === 'json') return report;
    return sendCsv(res, 'posicao-estoque.csv', report, [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Produto' },
      { key: 'unit', label: 'Unidade' },
      { key: 'currentStock', label: 'Estoque' },
      { key: 'minimumStock', label: 'Mínimo' },
      { key: 'stockCost', label: 'Custo em estoque (R$)' },
      { key: 'stockValue', label: 'Valor de venda (R$)' },
    ]);
  }
}

function sendCsv<Row extends object>(
  res: Response,
  filename: string,
  rows: Row[],
  columns: CsvColumn<Row>[],
) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return toCsv(rows, columns);
}
