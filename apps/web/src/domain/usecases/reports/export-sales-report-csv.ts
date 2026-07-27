export interface IExportSalesReportCsv {
  export: (from: string, to: string) => Promise<Blob>;
}
