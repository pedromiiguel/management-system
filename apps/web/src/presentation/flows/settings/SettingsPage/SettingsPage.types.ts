export type SettingsTab = 'general' | 'access' | 'categories';

export type SettingsPageViewProps = {
  tab: SettingsTab;
  onChangeTab: (tab: SettingsTab) => void;
  title: string;
};
