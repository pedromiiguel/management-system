import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@presentation/utils/toast';
import type { ISale } from '@modules/sale/domain/sale-model';
import { salesHistoryQuery, useVoidSale } from '@modules/sale/main/sale-queries';
import { salesReportQuery } from '@modules/reports/main/reports-queries';
import { VOIDED_MESSAGE } from './constants';
import { SalesReportLayout } from './layout';
import type { TSalesReportFlowProps } from './types';
import { averageTicket } from './utils';

export function SalesReportController({ period }: TSalesReportFlowProps) {
  const [pageState, setPageState] = useState(1);
  const [detailState, setDetailState] = useState<ISale | null>(null);
  const [voidingState, setVoidingState] = useState<ISale | null>(null);
  const { data: report } = useQuery(salesReportQuery(period));
  const { data: history } = useQuery(salesHistoryQuery(period, pageState));
  const voidSale = useVoidSale();

  const handleVoidConfirm = (sale: ISale) =>
    voidSale.mutate(sale.id, {
      onSuccess: () => {
        toast(VOIDED_MESSAGE);
        setVoidingState(null);
      },
    });

  return (
    <SalesReportLayout
      report={report}
      averageTicket={averageTicket(report)}
      history={history}
      page={pageState}
      detail={detailState}
      voiding={voidingState}
      isVoiding={voidSale.isPending}
      onPageChange={setPageState}
      onSaleClick={setDetailState}
      onVoidClick={setVoidingState}
      onVoidConfirm={handleVoidConfirm}
      onDetailClose={() => setDetailState(null)}
      onVoidClose={() => setVoidingState(null)}
    />
  );
}
