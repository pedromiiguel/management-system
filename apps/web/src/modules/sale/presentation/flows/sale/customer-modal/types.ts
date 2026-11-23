import type { FormEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { CustomerInput } from '@beverage/shared';
import type { ICustomer } from '@modules/sale/domain/sale-model';

export type TCustomerModalProps = {
  onPick: (customer: ICustomer) => void;
  onClose: () => void;
};

export type TCustomerModalLayoutProps = {
  search: string;
  customers: ICustomer[];
  register: UseFormRegister<CustomerInput>;
  canCreate: boolean;
  onSearchChange: (search: string) => void;
  onPick: (customer: ICustomer) => void;
  onCreate: (event?: FormEvent) => void;
  onClose: () => void;
};
