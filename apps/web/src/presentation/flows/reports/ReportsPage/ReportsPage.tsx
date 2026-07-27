import { useReportsPageModel } from './ReportsPage.model';
import { ReportsPageView } from './ReportsPage.view';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { tab, from, to, exportCsv, ...rest } = useReportsPageModel();

  async function onExportCsv() {
    const blob = await exportCsv();
    downloadBlob(blob, `relatorio-${tab}-${from}-a-${to}.csv`);
  }

  return <ReportsPageView tab={tab} from={from} to={to} onExportCsv={() => void onExportCsv()} {...rest} />;
}
