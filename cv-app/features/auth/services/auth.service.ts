import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { UserRole } from "@prisma/client";
import { z } from "zod";

const scrypt = promisify(scryptCallback);
const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;
export const MAX_CREDENTIAL_PASSWORD_LENGTH = 1024;
const DUMMY_PASSWORD_HASH =
  "scrypt:00000000000000000000000000000000:2ff2b147d8ac71a1fc54a15f764a17201d6b40687bbd23bb845db397ebce6de2f842d362a249253564e7cd0d8ecb33e6e90bbd767f5d3a98df28e8ba2cfe46af";

const registrationSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
    email: z.string().trim().email("Email không hợp lệ").max(254),
    password: z
      .string()
      .min(12, "Mật khẩu phải có ít nhất 12 ký tự")
      .max(
        MAX_CREDENTIAL_PASSWORD_LENGTH,
        `Mật khẩu không được vượt quá ${MAX_CREDENTIAL_PASSWORD_LENGTH} ký tự`
      )
      .regex(/[a-z]/, "Mật khẩu cần có chữ thường")
      .regex(/[A-Z]/, "Mật khẩu cần có chữ hoa")
      .regex(/[0-9]/, "Mật khẩu cần có số"),
    passwordConfirmation: z.string(),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirmation"],
        message: "Mật khẩu xác nhận không khớp",
      });
    }
  });

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: string;
};

export type CredentialUserRecord = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  passwordHash?: string | null;
  deletedAt?: Date | null;
};

export type AuthUserRepository = {
  findUserByEmail(email: string): Promise<CredentialUserRecord | null>;
  createCredentialUser(input: {
    name: string;
    email: string;
    role: Extract<UserRole, "CANDIDATE" | "RECRUITER">;
    passwordHash: string;
  }): Promise<CredentialUserRecord>;
};

export class RegistrationValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Registration payload is invalid");
  }
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already exists");
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
  }
}

export class AuthService {
  constructor(private readonly repository: AuthUserRepository) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `${HASH_PREFIX}:${salt}:${derived.toString("hex")}`;
  }

  async verifyPassword(password: string, passwordHash: string) {
    const [prefix, salt, storedHash] = passwordHash.split(":");
    if (prefix !== HASH_PREFIX || !salt || !storedHash) return false;

    const stored = Buffer.from(storedHash, "hex");
    const derived = (await scrypt(password, salt, stored.length)) as Buffer;
    return stored.length === derived.length && timingSafeEqual(stored, derived);
  }

  async register(input: RegistrationInput) {
    const parsed = registrationSchema.safeParse(input);
    if (!parsed.success) {
      throw new RegistrationValidationError(parsed.error.issues);
    }

    const email = this.normalizeEmail(parsed.data.email);
    const existing = await this.repository.findUserByEmail(email);
    if (existing) {
      throw new DuplicateEmailError();
    }

    return this.repository.createCredentialUser({
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      passwordHash: await this.hashPassword(parsed.data.password),
    });
  }

  async authenticate(emailInput: string, password: string) {
    if (password.length > MAX_CREDENTIAL_PASSWORD_LENGTH) {
      throw new InvalidCredentialsError();
    }

    const email = this.normalizeEmail(emailInput);
    const user = await this.repository.findUserByEmail(email);
    if (!user?.passwordHash || user.deletedAt) {
      await this.verifyPassword(password, DUMMY_PASSWORD_HASH);
      throw new InvalidCredentialsError();
    }

    const matches = await this.verifyPassword(password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}
