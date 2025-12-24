import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Database } from '../../db/database.module';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { users, roles } from '../../db/schema';
import { eq, and, or, not } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email o username ya existen
    const existingUser = await this.db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, createUserDto.email),
          eq(users.username, createUserDto.username),
        ),
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('El email o username ya está en uso');
    }

    // Verificar que el rol existe
    const role = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, createUserDto.roleId))
      .limit(1);

    if (role.length === 0) {
      throw new NotFoundException('El rol especificado no existe');
    }

    // Hash de la contraseña
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    // Crear el usuario
    const [newUser] = (await this.db
      .insert(users)
      .values({
        id: nanoid(21),
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        roleId: createUserDto.roleId,
        isActive: true,
      })
      .returning()) as any[];

    return this.mapToUserResponse(newUser);
  }

  async findAll(activeOnly?: boolean): Promise<UserResponseDto[]> {
    const conditions = activeOnly ? [eq(users.isActive, true)] : [];

    const allUsers = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return allUsers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      roleId: user.roleId,
      role: user.role
        ? {
            id: user.role.id,
            code: user.role.code,
            name: user.role.name,
          }
        : undefined,
      isActive: user.isActive ?? true,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt || '',
      updatedAt: user.updatedAt || '',
    }));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const [user] = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      roleId: user.roleId,
      isActive: user.isActive ?? true,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt || '',
      updatedAt: user.updatedAt || '',
    };
  }

  async findByEmail(email: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  async findByUsername(username: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user || null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Si se está actualizando el email o username, verificar que no estén en uso
    if (updateUserDto.email || updateUserDto.username) {
      const conditions: any[] = [];
      if (updateUserDto.email) {
        conditions.push(eq(users.email, updateUserDto.email));
      }
      if (updateUserDto.username) {
        conditions.push(eq(users.username, updateUserDto.username));
      }

      const conflictingUser = await this.db
        .select()
        .from(users)
        .where(and(...conditions, not(eq(users.id, id))))
        .limit(1);

      if (conflictingUser.length > 0) {
        throw new ConflictException('El email o username ya está en uso');
      }
    }

    // Si se está actualizando el rol, verificar que existe
    if (updateUserDto.roleId) {
      const role = await this.db
        .select()
        .from(roles)
        .where(eq(roles.id, updateUserDto.roleId))
        .limit(1);

      if (role.length === 0) {
        throw new NotFoundException('El rol especificado no existe');
      }
    }

    // Si se está actualizando la contraseña, hashearla
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = (await bcrypt.hash(
        updateUserDto.password,
        10,
      )) as string;
    }

    // Actualizar el usuario
    const [updatedUser] = (await this.db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning()) as any[];

    return this.mapToUserResponse(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.db.delete(users).where(eq(users.id, id));
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(users.id, id));
  }

  private mapToUserResponse(user: {
    id: string;
    username: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    roleId: string;
    isActive?: boolean | null;
    lastLogin?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      roleId: user.roleId,
      isActive: user.isActive ?? true,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt || '',
      updatedAt: user.updatedAt || '',
    };
  }
}
