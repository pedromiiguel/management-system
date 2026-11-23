import { Kbd } from '@presentation/components/Kbd';
import { SALE_HOTKEYS } from '../constants';

export function SaleHotkeyStrip() {
  return (
    <div className="s-strip">
      {Object.values(SALE_HOTKEYS).map((hotkey) =>
        'hint' in hotkey ? (
          <span key={hotkey.key}>
            <Kbd>{hotkey.label}</Kbd> {hotkey.hint}
          </span>
        ) : null,
      )}
    </div>
  );
}
