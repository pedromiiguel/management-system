import { Body, Controller, Get, Put } from '@nestjs/common';
import { Permission, SettingsInput, updateSettingsSchema } from '@beverage/shared';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Put()
  @RequirePermission(Permission.SETTINGS_WRITE)
  update(@Body(new ZodValidationPipe(updateSettingsSchema)) body: SettingsInput) {
    return this.settingsService.update(body);
  }
}
