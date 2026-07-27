import { useSettingsPageModel } from './SettingsPage.model';
import { SettingsPageView } from './SettingsPage.view';

export function SettingsPage() {
  const { tab, setTab } = useSettingsPageModel();
  const title = tab === 'access' ? 'Usuários & Perfis' : 'Configurações';

  return <SettingsPageView tab={tab} onChangeTab={setTab} title={title} />;
}
