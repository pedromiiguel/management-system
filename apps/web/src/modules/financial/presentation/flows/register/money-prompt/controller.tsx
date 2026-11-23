import { useState } from 'react';
import { moneyText } from '@presentation/utils/format';
import { MoneyPromptLayout } from './layout';
import type { TMoneyPromptProps } from './types';

/** Pede um valor em R$ (abertura e fechamento de caixa), validado pela regra do shared. */
export function MoneyPromptController({
  title,
  label,
  submitLabel,
  width,
  rule,
  isPending,
  header,
  footer,
  onSubmit,
  onClose,
}: TMoneyPromptProps) {
  const [rawState, setRawState] = useState('');
  const parsed = moneyText(rule).safeParse(rawState);
  const canSubmit = parsed.success && !isPending;

  const handleSubmit = () => {
    if (parsed.success && !isPending) onSubmit(parsed.data);
  };

  return (
    <MoneyPromptLayout
      title={title}
      label={label}
      submitLabel={submitLabel}
      width={width}
      raw={rawState}
      canSubmit={canSubmit}
      header={header}
      footerContent={parsed.success && footer ? footer(parsed.data) : null}
      onRawChange={setRawState}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
