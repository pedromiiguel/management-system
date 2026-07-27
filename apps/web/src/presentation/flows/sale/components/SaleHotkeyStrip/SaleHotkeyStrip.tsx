import { Kbd } from '@/presentation/components/Kbd';

export function SaleHotkeyStrip() {
  return (
    <div className="s-strip">
      <span>
        <Kbd>F2</Kbd> buscar
      </span>
      <span>
        <Kbd>F4</Kbd> desconto
      </span>
      <span>
        <Kbd>Del</Kbd> remover
      </span>
      <span>
        <Kbd>F10</Kbd> finalizar
      </span>
      <span>
        <Kbd>Esc</Kbd> cancelar
      </span>
    </div>
  );
}
