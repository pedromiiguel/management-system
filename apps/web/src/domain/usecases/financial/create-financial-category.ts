import type { FinancialCategory, FinancialCategoryInput } from '@/domain/models/financial';

export interface ICreateFinancialCategory {
  create: (input: FinancialCategoryInput) => Promise<FinancialCategory>;
}
