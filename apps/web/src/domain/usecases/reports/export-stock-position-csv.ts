export interface IExportStockPositionCsv {
  export: () => Promise<Blob>;
}
