/** Valor da meta como o campo mostra ("50000,00"); vazio sem meta. */
export function formatTargetInput(target: number | null): string {
  return target?.toFixed(2).replace('.', ',') ?? '';
}
