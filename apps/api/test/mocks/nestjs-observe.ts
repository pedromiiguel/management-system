import { DynamicModule, Module } from '@nestjs/common';

/**
 * Substituto do `@nestjs/observe` nos testes e2e: o pacote é ESM-only e o Jest
 * (CommonJS) não consegue carregá-lo. Também evita enviar telemetria ao coletor
 * durante os testes.
 */
@Module({})
class ObserveModuleMock {
  static forRoot(): DynamicModule {
    return { module: ObserveModuleMock };
  }
}

export function createObserveModule() {
  return { ObserveModule: ObserveModuleMock, ObserveInstrument: undefined };
}
