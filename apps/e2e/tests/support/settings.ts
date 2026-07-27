import type { Page } from '@playwright/test';

/** Abre a tela de configurações e seleciona a aba pelo rótulo do `SSeg`. */
export async function openSettingsTab(page: Page, label: string): Promise<void> {
  await page.goto('/settings');
  await page.getByRole('button', { name: label, exact: true }).click();
}
