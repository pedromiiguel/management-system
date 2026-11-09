/**
 * Dados do seed, sem dependências — importados também pelas suítes de teste
 * (`apps/api/test`, `apps/e2e`), que assim não copiam valores à mão.
 */

/** Credenciais do administrador criado pelo seed base. */
export const ADMIN = {
  login: 'admin',
  password: process.env.ADMIN_PASSWORD ?? 'admin123',
} as const;

/**
 * Ids fixos: a suíte Playwright guarda o token de uma sessão e o reaproveita
 * entre resets do banco; o token carrega o id do usuário.
 */
export const SEED_IDS = {
  adminRole: 'seed-role-admin',
  adminUser: 'seed-user-admin',
  fixtureCustomer: 'seed-customer-fiado',
} as const;

export interface FixtureProduct {
  sku: string;
  ean: string | null;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  minimumStock: number;
  /** Entrada inicial; 0 = produto sem estoque e sem movimentação. */
  stock: number;
}

/** Dados de exemplo / fixtures de teste — nunca entram no seed de produção. */
export const FIXTURES = {
  products: {
    skol: {
      sku: 'CRV-SKL-269',
      ean: '7891149104017',
      name: 'Cerveja Skol Lata 269ml',
      unit: 'un',
      purchasePrice: 2.1,
      salePrice: 3.5,
      minimumStock: 20,
      stock: 120,
    },
    brahma: {
      sku: 'CRV-BRH-350',
      ean: '7891149010059',
      name: 'Cerveja Brahma Lata 350ml',
      unit: 'un',
      purchasePrice: 2.6,
      salePrice: 4.2,
      minimumStock: 20,
      stock: 96,
    },
    heineken: {
      sku: 'CRV-HNK-330',
      ean: '7896045506873',
      name: 'Cerveja Heineken Long Neck 330ml',
      unit: 'un',
      purchasePrice: 4.5,
      salePrice: 7.5,
      minimumStock: 20,
      stock: 48,
    },
    cocaCola: {
      sku: 'RFR-CCA-2L',
      ean: '7894900011517',
      name: 'Coca-Cola 2L',
      unit: 'un',
      purchasePrice: 6.5,
      salePrice: 10.0,
      minimumStock: 20,
      stock: 60,
    },
    guarana: {
      sku: 'RFR-GRN-2L',
      ean: '7891991010856',
      name: 'Guaraná Antarctica 2L',
      unit: 'un',
      purchasePrice: 5.0,
      salePrice: 8.0,
      minimumStock: 20,
      stock: 60,
    },
    agua: {
      sku: 'AGU-MIN-500',
      ean: '7896098900116',
      name: 'Água Mineral 500ml',
      unit: 'un',
      purchasePrice: 0.8,
      salePrice: 2.0,
      minimumStock: 20,
      stock: 200,
    },
    redBull: {
      sku: 'ENE-RBL-250',
      ean: '9002490100070',
      name: 'Red Bull 250ml',
      unit: 'un',
      purchasePrice: 6.0,
      salePrice: 10.0,
      minimumStock: 20,
      stock: 36,
    },
    delValle: {
      sku: 'SUC-DVL-1L',
      ean: '7891000100103',
      name: 'Suco Del Valle Uva 1L',
      unit: 'un',
      purchasePrice: 5.5,
      salePrice: 9.0,
      minimumStock: 20,
      stock: 40,
    },
    vinho: {
      sku: 'VNH-TNT-750',
      ean: '7891141017834',
      name: 'Vinho Tinto Suave 750ml',
      unit: 'un',
      purchasePrice: 12.0,
      salePrice: 22.0,
      minimumStock: 20,
      stock: 24,
    },
    gelo: {
      sku: 'GEL-PCT-5KG',
      ean: null,
      name: 'Gelo Pacote 5kg',
      unit: 'pct',
      purchasePrice: 4.0,
      salePrice: 8.0,
      minimumStock: 20,
      stock: 30,
    },
    /** Sem saldo — exercita a venda sem estoque (BR-03). */
    zeroStock: {
      sku: 'RFR-ZER-350',
      ean: '7891234500009',
      name: 'Refrigerante Zero Estoque 350ml',
      unit: 'un',
      purchasePrice: 3.0,
      salePrice: 5.0,
      minimumStock: 20,
      stock: 0,
    },
  },
  /** Cliente ativo — o fiado exige cliente. */
  customer: { id: SEED_IDS.fixtureCustomer, name: 'Cliente Fiado Teste' },
  /** Caixa aberto pelo admin — venda em dinheiro exige caixa aberto (BR-06). */
  openRegister: { openingBalance: 100 },
  /** Fiado em aberto do cliente acima. */
  openReceivable: { amount: 42 },
} as const;

// Cada produto de exemplo precisa ter a forma completa usada pelo seed.
FIXTURES.products satisfies Record<string, FixtureProduct>;
