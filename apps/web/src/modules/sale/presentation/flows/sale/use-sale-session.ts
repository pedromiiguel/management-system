import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useInvalidate } from '@main/query/query-keys';
import { toast } from '@presentation/utils/toast';
import { createSaleSession } from '@modules/sale/domain/sale-session';
import { makeSaleGateway } from '@modules/sale/main/sale-factory';
import { SALE_SETTLEMENT_EFFECTS } from '@modules/sale/main/sale-queries';
import { settingsQuery } from '@modules/settings/main/settings-queries';
import { QUANTITY_DEBOUNCE_MS } from './constants';
import { messageOf } from './utils';

/**
 * Adapter React da sessão do PDV (`domain/sale-session.ts`): liga o gateway
 * HTTP, transforma avisos e erros em toast, invalida o cache ao concluir e
 * entrega à sessão as formas de pagamento ligadas nas Configurações.
 */
export function useSaleSession({ onSettled }: { onSettled: () => void }) {
  const invalidateSettlement = useInvalidate(...SALE_SETTLEMENT_EFFECTS);
  const [session] = useState(() =>
    createSaleSession({
      gateway: makeSaleGateway(),
      quantityDelayMs: QUANTITY_DEBOUNCE_MS,
      events: {
        warn: (message) => toast(message, 'warn'),
        error: (error) => toast(messageOf(error), 'danger'),
        settled: onSettled,
        completed: async () => {
          await invalidateSettlement();
        },
      },
    }),
  );
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);

  const { data: settings } = useQuery(settingsQuery());
  const enabledPaymentMethods = settings?.enabledPaymentMethods;
  useEffect(() => {
    if (enabledPaymentMethods) session.setEnabledPaymentMethods(enabledPaymentMethods);
  }, [session, enabledPaymentMethods]);

  return { ...state, busy: state.adding || state.completing, session };
}
