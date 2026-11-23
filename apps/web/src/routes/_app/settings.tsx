import { createFileRoute } from '@tanstack/react-router';
import { SettingsFlow } from '@modules/settings/presentation/flows/settings';

export const Route = createFileRoute('/_app/settings')({
  component: SettingsFlow,
});
