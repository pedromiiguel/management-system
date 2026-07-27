import type { Page } from '@playwright/test';

/** Abre a tela de relatórios e seleciona a aba pelo rótulo do `SSeg`. */
export async function openReportsTab(page: Page, label: string): Promise<void> {
  await page.goto('/reports');
  await page.getByRole('button', { name: label, exact: true }).click();
}
