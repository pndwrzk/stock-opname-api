import { ROLES, Role } from "../../constants/roles";
import { storeRepository } from "../store/store.repository";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { CreateUserDto, ListUserQuery, UpdateUserDto } from "./user.interface";
import { userRepository, UserWithStore } from "./user.repository";

const getOrFail = async (id: string): Promise<UserWithStore> => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const assertNikAvailable = async (nik: string, exceptId?: string) => {
  const existing = await userRepository.findByNik(nik);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `NIK "${nik}" already exists`);
  }
};

const assertUsernameAvailable = async (username: string, exceptId?: string) => {
  const existing = await userRepository.findByUsernameSafe(username);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `Username "${username}" already exists`);
  }
};

const assertRoleStoreRule = async (role: Role, storeId: string | null, exceptUserId?: string) => {
  if (role === ROLES.OWNER) {
    if (storeId) throw new ApiError(422, "OWNER must not be assigned to a store");
    return;
  }

  if (!storeId) throw new ApiError(422, "storeId is required for MANAGER and STAFF");

  const store = await storeRepository.findById(storeId);
  if (!store) throw new ApiError(404, "Store not found");

  if (role === ROLES.MANAGER) {
    const manager = await userRepository.findManagerByStore(storeId, exceptUserId);
    if (manager) throw new ApiError(409, "This store already has a manager");
  }
};

export const userService = {
  async create(dto: CreateUserDto): Promise<UserWithStore> {
    await assertNikAvailable(dto.nik);
    await assertUsernameAvailable(dto.username);
    await assertRoleStoreRule(dto.role, dto.storeId ?? null);

    const password = await hashPassword(dto.password);
    return userRepository.create({ ...dto, password });
  },

  async findAll(query: ListUserQuery) {
    const { items, total } = await userRepository.findAll(query);
    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  findById: (id: string): Promise<UserWithStore> => getOrFail(id),

  async update(id: string, dto: UpdateUserDto): Promise<UserWithStore> {
    const current = await getOrFail(id);

    if (dto.nik) await assertNikAvailable(dto.nik, id);
    if (dto.username) await assertUsernameAvailable(dto.username, id);

    const role = (dto.role ?? current.role) as Role;
    const storeId = dto.storeId !== undefined ? dto.storeId : current.storeId;
    await assertRoleStoreRule(role, storeId, id);

    const { password, ...rest } = dto;
    const data: UpdateUserDto = {
      ...rest,
      ...(password && { password: await hashPassword(password) }),
      ...(role === ROLES.OWNER && { storeId: null }),
    };

    return userRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    await getOrFail(id);
    await userRepository.delete(id);
  },
};