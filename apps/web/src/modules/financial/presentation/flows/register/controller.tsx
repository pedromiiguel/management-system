import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@presentation/utils/toast';
import {
  currentRegisterQuery,
  registerHistoryQuery,
  useCloseRegister,
  useOpenRegister,
} from '@modules/financial/main/financial-queries';
import { OPENED_MESSAGE } from './constants';
import { RegisterLayout } from './layout';
import type { TRegisterModal } from './types';
import { closeRegisterMessage } from './utils';

export function RegisterController() {
  const [modalState, setModalState] = useState<TRegisterModal>('none');
  const { data: register } = useQuery(currentRegisterQuery());
  const { data: history = [] } = useQuery(registerHistoryQuery());
  const openRegister = useOpenRegister();
  const closeRegister = useCloseRegister();
  const closeModal = () => setModalState('none');

  const handleOpenSubmit = (openingBalance: number) =>
    openRegister.mutate(
      { openingBalance },
      {
        onSuccess: () => {
          toast(OPENED_MESSAGE);
          closeModal();
        },
      },
    );

  const handleCloseSubmit = (countedBalance: number) =>
    closeRegister.mutate(
      { countedBalance },
      {
        onSuccess: ({ difference }) => {
          const { message, tone } = closeRegisterMessage(difference);
          toast(message, tone);
          closeModal();
        },
      },
    );

  return (
    <RegisterLayout
      register={register}
      history={history}
      modal={modalState}
      isOpening={openRegister.isPending}
      isClosing={closeRegister.isPending}
      onOpenClick={() => setModalState('open')}
      onMovementClick={() => setModalState('movement')}
      onCloseClick={() => setModalState('close')}
      onOpenSubmit={handleOpenSubmit}
      onCloseSubmit={handleCloseSubmit}
      onModalClose={closeModal}
    />
  );
}
