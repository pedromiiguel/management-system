import { expect, test } from '@playwright/test';
import { resetDatabase } from './support/db';
import { openReportsTab } from './support/reports';
import { completeKnownSale } from './support/sale';
import { PRODUCTS } from './support/seed-data';

// formatBRL usa espaço fino (U+00A0) entre "R$" e o valor — ver support/format.ts#brl.
const brl = (value: string) => `R$ ${value}`;

// Suíte E2E de relatórios — trava o comportamento observável das 4 abas
// ANTES da refatoração estrutural (ADR 0001/0009), mesmo espírito das
// suítes de financeiro/produtos/estoque. BR-05 (estorno) já está coberta
// por apps/api/test/reports.e2e-spec.ts (supertest) — aqui só se verifica
// a integração UI ↔ API do caminho feliz.

test.describe('Relatórios — navegação e filtro de período', () => {
  test.beforeAll(() => resetDatabase());

  test('troca de aba mostra o conteúdo correspondente', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    await expect(page.getByText('Receita no período')).toBeVisible();

    await page.getByRole('button', { name: 'Mais vendidos', exact: true }).click();
    await expect(page.getByText('Qtd vendida')).toBeVisible();

    await page.getByRole('button', { name: 'Margem por produto', exact: true }).click();
    await expect(page.getByText('Margem %')).toBeVisible();

    await page.getByRole('button', { name: 'Posição de estoque', exact: true }).click();
    await expect(page.getByText('Itens ativos')).toBeVisible();
  });

  test('chips de período (hoje/7 dias/mês) atualizam os campos de data', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    const dateInputs = page.locator('input[type="date"]');
    const today = new Date().toISOString().slice(0, 10);

    await page.getByRole('button', { name: 'Hoje', exact: true }).click();
    await expect(dateInputs.nth(0)).toHaveValue(today);
    await expect(dateInputs.nth(1)).toHaveValue(today);

    await page.getByRole('button', { name: '7 dias', exact: true }).click();
    await expect(dateInputs.nth(1)).toHaveValue(today);
    await expect(dateInputs.nth(0)).not.toHaveValue(today);
  });

  test('posição de estoque não mostra filtro de período, só exportar CSV', async ({ page }) => {
    await openReportsTab(page, 'Posição de estoque');
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Exportar CSV' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exportar PDF' })).toHaveCount(0);
  });
});

test.describe('Relatórios — Vendas por período (histórico, detalhe e estorno)', () => {
  test.beforeAll(() => resetDatabase());

  test.beforeEach(async ({ page }) => {
    await completeKnownSale(page, [{ code: PRODUCTS.skol.ean, quantity: 2 }]);
  });

  test('a venda concluída aparece no histórico do período', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    const row = page.locator('.s-tr.is-selectable').first();
    await expect(row.getByText('PIX')).toBeVisible();
    await expect(row.getByText(brl('7,00'), { exact: true })).toBeVisible(); // 2 x R$3,50
  });

  test('clicar na linha abre o detalhe com itens e total', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    await page.locator('.s-tr.is-selectable').first().click();

    const dialog = page.getByRole('dialog', { name: /^Venda #[A-Z0-9]{6}$/ });
    await expect(dialog).toBeVisible();
    // O cupom (impressão) fica oculto na tela mas no DOM, com o mesmo texto
    // do produto — escopo à tabela de itens do modal, não ao cupom.
    await expect(dialog.locator('.s-table').getByText(PRODUCTS.skol.name)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Imprimir cupom' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Fechar' }).click();
    await expect(dialog).toBeHidden();
  });

  test('estornar a venda pelo modal de confirmação reflete na listagem (BR-05)', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    const row = page.locator('.s-tr.is-selectable').first();
    await row.getByRole('button', { name: 'Estornar' }).click();

    const confirm = page.getByRole('dialog', { name: /^Estornar venda #[A-Z0-9]{6}\?$/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Estornar venda' }).click();
    await expect(confirm).toBeHidden();

    await expect(page.locator('.s-toast')).toContainText('Venda estornada');
    await expect(row.getByText('cancelada', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Estornar' })).toHaveCount(0);
  });

  test('exportar CSV das vendas dispara o download', async ({ page }) => {
    await openReportsTab(page, 'Vendas por período');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar CSV' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^relatorio-sales-.*\.csv$/);
  });
});

test.describe('Relatórios — Mais vendidos / margem', () => {
  // Reset por teste (não só por describe): os dois relatórios agregam por
  // produto em todo o período — uma 2ª venda do mesmo produto no mesmo
  // describe inflaria os totais esperados.
  test.beforeEach(async ({ page }) => {
    resetDatabase();
    await completeKnownSale(page, [{ code: PRODUCTS.brahma.ean, quantity: 4 }]);
  });

  test('mais vendidos lista o produto vendido no período', async ({ page }) => {
    await openReportsTab(page, 'Mais vendidos');
    await expect(page.getByText(PRODUCTS.brahma.name)).toBeVisible();
    const row = page.locator('.s-tr').filter({ hasText: PRODUCTS.brahma.name });
    await expect(row.getByText('4', { exact: true })).toBeVisible();
  });

  test('margem por produto mostra receita, custo e margem calculados', async ({ page }) => {
    await openReportsTab(page, 'Margem por produto');
    const row = page.locator('.s-tr').filter({ hasText: PRODUCTS.brahma.name });
    await expect(row).toBeVisible();
    // Receita 4 x R$4,20 = R$16,80
    await expect(row.getByText(brl('16,80'), { exact: true })).toBeVisible();
  });
});

test.describe('Relatórios — Posição de estoque', () => {
  test.beforeAll(() => resetDatabase());
  test.beforeEach(async ({ page }) => openReportsTab(page, 'Posição de estoque'));

  test('lista os produtos ativos com estoque atual', async ({ page }) => {
    await expect(page.getByText(PRODUCTS.skol.name)).toBeVisible();
    const row = page.locator('.s-tr').filter({ hasText: PRODUCTS.skol.name });
    await expect(row.getByText(String(PRODUCTS.skol.stock), { exact: true })).toBeVisible();
  });

  test('destaca produto com estoque abaixo do mínimo', async ({ page }) => {
    const row = page.locator('.s-tr').filter({ hasText: 'Refrigerante Zero Estoque 350ml' });
    await expect(row.locator('.s-low')).toBeVisible();
  });
});
