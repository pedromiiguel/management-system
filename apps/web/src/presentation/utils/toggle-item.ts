/** Liga ou desliga um item numa lista (checkbox de permissões, formas de pagamento). */
export function toggleItem<T>(list: T[], item: T, isOn: boolean): T[] {
  return isOn ? [...list, item] : list.filter((current) => current !== item);
}
