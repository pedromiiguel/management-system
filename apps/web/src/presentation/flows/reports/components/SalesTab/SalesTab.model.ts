import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/sol';
import type { Sale } from '@/domain/models/sale';
import { apiErrorMessage } from '@/lib/api';
import { useVoidSaleMutation } from '@/main/factories/mutations/sale';
import { useSalesReportQuery } from '@/main/factories/queries/reports';
import { useSalesHistoryQuery } from '@/main/factories/queries/sale';

export function useSalesTabModel(from: string, to: string) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [detail, setDetail] = useState<Sale | null>(null);

  const { data: report } = useSalesReportQuery(from, to);
  const { data: history } = useSalesHistoryQuery(from, to);

  const voidSale = useVoidSaleMutation();

  function confirmVoid() {
    if (!voiding) return;
    voidSale.mutate(voiding.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['sales'] });
        void queryClient.invalidateQueries({ queryKey: ['reports'] });
        void queryClient.invalidateQueries({ queryKey: ['products'] });
        toast('Venda estornada — estoque e receita revertidos (BR-05)');
        setVoiding(null);
      },
      onError: (error) => toast(apiErrorMessage(error), 'danger'),
    });
  }

  return {
    report,
    sales: history?.items ?? [],
    detail,
    onSelectDetail: setDetail,
    onCloseDetail: () => setDetail(null),
    voiding,
    onRequestVoid: setVoiding,
    onCancelVoid: () => setVoiding(null),
    onConfirmVoid: confirmVoid,
    isVoiding: voidSale.isPending,
  };
}
