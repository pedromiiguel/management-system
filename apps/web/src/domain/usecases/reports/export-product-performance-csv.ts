export interface IExportProductPerformanceCsv {
  export: (from: string, to: string) => Promise<Blob>;
}
