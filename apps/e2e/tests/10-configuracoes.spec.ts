import { expect, test } from '@playwright/test';
import { resetDatabase } from './support/db';
import { openSettingsTab } from './support/settings';

// Suíte E2E de configurações — trava o comportamento observável das 3 abas
// ANTES da refatoração estrutural (ADR 0001/0010), mesmo espírito das suítes
// de financeiro/produtos/estoque/relatórios. A única regra de negócio com
// ramificação real (guarda de lockout do papel Administrador) já está coberta
// por apps/api/test/users.e2e-spec.ts (supertest) — aqui só se verifica o
// caminho feliz da UI das 3 abas.

test.describe('Configurações — Geral', () => {
  test.beforeAll(() => resetDatabase());
  test.beforeEach(async ({ page }) => openSettingsTab(page, 'Geral'));

  test('troca a política de estoque insuficiente (BR-03/FR-15)', async ({ page }) => {
    await page.getByRole('button', { name: 'Apenas avisar' }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');
    await expect(page.getByRole('button', { name: 'Apenas avisar' })).toHaveClass(/is-active/);
  });

  test('altera o alerta de validade (FR-08)', async ({ page }) => {
    await page.getByRole('button', { name: '60 dias' }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');
    await expect(page.getByRole('button', { name: '60 dias' })).toHaveClass(/is-active/);
  });

  test('salva a meta de faturamento mensal (FR-36)', async ({ page }) => {
    await page.getByPlaceholder('ex.: 50000,00').fill('75000,00');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');
  });

  test('bloqueia desabilitar a última forma de pagamento habilitada (FR-17)', async ({ page }) => {
    await page.getByRole('button', { name: 'Dinheiro' }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');
    await page.getByRole('button', { name: 'PIX', exact: true }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');
    await page.getByRole('button', { name: 'Cartão' }).click();
    await expect(page.locator('.s-toast')).toContainText('Configuração salva');

    // Só resta "Fiado (a prazo)" habilitado — tentar desligar é bloqueado no cliente.
    await page.getByRole('button', { name: 'Fiado (a prazo)' }).click();
    await expect(page.locator('.s-toast')).toContainText('Mantenha ao menos uma forma de pagamento');
    await expect(page.getByRole('button', { name: 'Fiado (a prazo)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test.describe('Configurações — Usuários & Perfis', () => {
  test.beforeAll(() => resetDatabase());
  test.beforeEach(async ({ page }) => openSettingsTab(page, 'Usuários & Perfis'));

  test('cria um novo perfil e ele aparece na matriz de permissões', async ({ page }) => {
    await page.getByRole('button', { name: '+ Novo perfil' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo perfil' });
    await dialog.getByTestId('role-name').fill('Caixa E2E');
    await dialog
      .locator('label', { hasText: 'Operar o PDV' })
      .getByRole('button')
      .click();
    await dialog.getByRole('button', { name: 'Criar perfil' }).click();
    await expect(dialog).toBeHidden();

    await expect(page.locator('.s-th').getByText('Caixa E2E')).toBeVisible();
  });

  test('cria um novo usuário vinculado a um perfil', async ({ page }) => {
    await page.getByRole('button', { name: '+ Novo usuário' }).click();
    const dialog = page.getByRole('dialog', { name: 'Novo usuário' });
    await dialog.getByTestId('user-name').fill('Operador E2E');
    await dialog.getByTestId('user-login').fill('operador-e2e');
    await dialog.getByTestId('user-password').fill('senha123');
    await dialog.getByRole('button', { name: 'Criar' }).click();
    await expect(dialog).toBeHidden();

    const row = page.locator('.s-tr').filter({ hasText: 'Operador E2E' });
    await expect(row).toBeVisible();
    await expect(row.getByText('Administrador')).toBeVisible();
  });
});

test.describe('Configurações — Categorias financeiras', () => {
  test.beforeAll(() => resetDatabase());
  test.beforeEach(async ({ page }) => openSettingsTab(page, 'Categorias financeiras'));

  test('lista as categorias padrão do seed com a origem "sistema"', async ({ page }) => {
    const row = page.locator('.s-tr').filter({ hasText: 'Vendas' });
    await expect(row.getByText('sistema')).toBeVisible();
  });

  test('cria uma categoria de despesa e ela aparece na listagem', async ({ page }) => {
    await page.getByTestId('category-name').fill('Manutenção e2e');
    await page.getByRole('button', { name: 'Despesa' }).click();
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.locator('.s-toast')).toContainText('Categoria criada');

    const row = page.locator('.s-tr').filter({ hasText: 'Manutenção e2e' });
    await expect(row.getByText('despesa')).toBeVisible();
  });
});
