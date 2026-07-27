import { useState } from 'react';
import type { SettingsTab } from './SettingsPage.types';

export function useSettingsPageModel() {
  const [tab, setTab] = useState<SettingsTab>('general');
  return { tab, setTab };
}
