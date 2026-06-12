import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateUserInput,
  createUserSchema,
  Permission,
  RoleInput,
  roleSchema,
  UpdateUserInput,
  updateUserSchema,
} from '@beverage/shared';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
@RequirePermission(Permission.USERS_MANAGE)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  createUser(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Get('roles/all')
  listRoles() {
    return this.usersService.listRoles();
  }

  @Post('roles')
  createRole(@Body(new ZodValidationPipe(roleSchema)) body: RoleInput) {
    return this.usersService.createRole(body);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body(new ZodValidationPipe(roleSchema)) body: RoleInput) {
    return this.usersService.updateRole(id, body);
  }
}
