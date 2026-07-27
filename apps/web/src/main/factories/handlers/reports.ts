import { ExportProductPerformanceCsvHandler } from '@/data/handlers/reports/export-product-performance-csv-handler';
import { ExportSalesReportCsvHandler } from '@/data/handlers/reports/export-sales-report-csv-handler';
import { ExportStockPositionCsvHandler } from '@/data/handlers/reports/export-stock-position-csv-handler';
import { GetProductPerformanceHandler } from '@/data/handlers/reports/get-product-performance-handler';
import { GetSalesReportHandler } from '@/data/handlers/reports/get-sales-report-handler';
import { GetSalesTotalHandler } from '@/data/handlers/reports/get-sales-total-handler';
import { GetStockPositionHandler } from '@/data/handlers/reports/get-stock-position-handler';
import { httpClient } from '@/main/factories/http/make-http-client';

export const makeGetSalesReport = () => new GetSalesReportHandler(httpClient);
export const makeExportSalesReportCsv = () => new ExportSalesReportCsvHandler(httpClient);
export const makeGetProductPerformance = () => new GetProductPerformanceHandler(httpClient);
export const makeExportProductPerformanceCsv = () => new ExportProductPerformanceCsvHandler(httpClient);
export const makeGetStockPosition = () => new GetStockPositionHandler(httpClient);
export const makeExportStockPositionCsv = () => new ExportStockPositionCsvHandler(httpClient);
export const makeGetSalesTotal = () => new GetSalesTotalHandler(httpClient);
