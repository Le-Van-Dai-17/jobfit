import { describe, expect, it, vi } from "vitest";

import {
  AuthService,
  DuplicateEmailError,
  InvalidCredentialsError,
  MAX_CREDENTIAL_PASSWORD_LENGTH,
  RegistrationValidationError,
} from "./auth.service";

function createRepository() {
  return {
    findUserByEmail: vi.fn(),
    createCredentialUser: vi.fn(),
  };
}

describe("AuthService", () => {
  it("rejects weak registration payloads before persistence", async () => {
    const repository = createRepository();
    const service = new AuthService(repository);

    await expect(
      service.register({
        name: "",
        email: "bad-email",
        password: "123456",
        passwordConfirmation: "654321",
        role: "ADMIN",
      })
    ).rejects.toBeInstanceOf(RegistrationValidationError);

    expect(repository.createCredentialUser).not.toHaveBeenCalled();
  });

  it("normalizes email, hashes the password, and never persists plaintext", async () => {
    const repository = createRepository();
    repository.findUserByEmail.mockResolvedValue(null);
    repository.createCredentialUser.mockResolvedValue({
      id: "user-1",
      email: "linh@example.com",
      name: "Linh Tran",
      role: "CANDIDATE",
    });
    const service = new AuthService(repository);

    await service.register({
      name: " Linh Tran ",
      email: "  LINH@Example.COM ",
      password: "Str0ng!Passw0rd",
      passwordConfirmation: "Str0ng!Passw0rd",
      role: "CANDIDATE",
    });

    expect(repository.findUserByEmail).toHaveBeenCalledWith("linh@example.com");
    expect(repository.createCredentialUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "linh@example.com",
        name: "Linh Tran",
        role: "CANDIDATE",
      })
    );
    const passwordHash = repository.createCredentialUser.mock.calls[0][0].passwordHash;
    expect(passwordHash).not.toContain("Str0ng!Passw0rd");
    await expect(service.verifyPassword("Str0ng!Passw0rd", passwordHash)).resolves.toBe(true);
  });

  it("rejects duplicate normalized emails", async () => {
    const repository = createRepository();
    repository.findUserByEmail.mockResolvedValue({ id: "existing" });
    const service = new AuthService(repository);

    await expect(
      service.register({
        name: "Mai",
        email: "MAI@example.com",
        password: "Str0ng!Passw0rd",
        passwordConfirmation: "Str0ng!Passw0rd",
        role: "RECRUITER",
      })
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("accepts a registration password at the credential length limit", async () => {
    const repository = createRepository();
    repository.findUserByEmail.mockResolvedValue(null);
    repository.createCredentialUser.mockResolvedValue({
      id: "user-boundary",
      email: "boundary@example.com",
      name: "Boundary",
      role: "CANDIDATE",
    });
    const service = new AuthService(repository);
    const hashPassword = vi.spyOn(service, "hashPassword").mockResolvedValue("boundary-hash");
    const password = `Aa1!${"x".repeat(MAX_CREDENTIAL_PASSWORD_LENGTH - 4)}`;

    await expect(
      service.register({
        name: "Boundary",
        email: "boundary@example.com",
        password,
        passwordConfirmation: password,
        role: "CANDIDATE",
      })
    ).resolves.toMatchObject({ id: "user-boundary" });

    expect(password).toHaveLength(MAX_CREDENTIAL_PASSWORD_LENGTH);
    expect(hashPassword).toHaveBeenCalledWith(password);
    expect(repository.createCredentialUser).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: "boundary-hash" })
    );
  });

  it("rejects registration passwords over the credential limit before hashing or persistence", async () => {
    const repository = createRepository();
    const service = new AuthService(repository);
    const hashPassword = vi.spyOn(service, "hashPassword");
    const password = `Aa1!${"x".repeat(MAX_CREDENTIAL_PASSWORD_LENGTH - 3)}`;

    await expect(
      service.register({
        name: "Mai",
        email: "mai@example.com",
        password,
        passwordConfirmation: password,
        role: "CANDIDATE",
      })
    ).rejects.toBeInstanceOf(RegistrationValidationError);

    expect(hashPassword).not.toHaveBeenCalled();
    expect(repository.findUserByEmail).not.toHaveBeenCalled();
    expect(repository.createCredentialUser).not.toHaveBeenCalled();
  });

  it("verifies stored hashes for login and rejects arbitrary 123456 in normal mode", async () => {
    const repository = createRepository();
    const service = new AuthService(repository);
    const passwordHash = await service.hashPassword("Str0ng!Passw0rd");
    repository.findUserByEmail.mockResolvedValue({
      id: "user-1",
      email: "mai@example.com",
      name: "Mai",
      role: "RECRUITER",
      passwordHash,
    });

    await expect(service.authenticate("MAI@example.com", "Str0ng!Passw0rd")).resolves.toMatchObject({
      id: "user-1",
      role: "RECRUITER",
    });
    await expect(service.authenticate("random@example.com", "123456")).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
  });

  it("rejects soft-deleted credential users fail-closed", async () => {
    const repository = createRepository();
    const service = new AuthService(repository);
    const passwordHash = await service.hashPassword("Str0ng!Passw0rd");
    repository.findUserByEmail.mockResolvedValue({
      id: "deleted-user",
      email: "deleted@example.com",
      name: "Deleted",
      role: "CANDIDATE",
      passwordHash,
      deletedAt: new Date(),
    });

    await expect(service.authenticate("deleted@example.com", "Str0ng!Passw0rd")).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );
  });

  it("rejects oversized login passwords before lookup or expensive verification", async () => {
    const repository = createRepository();
    const service = new AuthService(repository);
    const verifyPassword = vi.spyOn(service, "verifyPassword");

    await expect(
      service.authenticate("mai@example.com", "x".repeat(MAX_CREDENTIAL_PASSWORD_LENGTH + 1))
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(repository.findUserByEmail).not.toHaveBeenCalled();
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("runs a dummy verification for missing users to reduce timing leakage", async () => {
    const repository = createRepository();
    repository.findUserByEmail.mockResolvedValue(null);
    const service = new AuthService(repository);
    const verifyPassword = vi.spyOn(service, "verifyPassword");

    await expect(service.authenticate("missing@example.com", "Str0ng!Passw0rd")).rejects.toBeInstanceOf(
      InvalidCredentialsError
    );

    expect(verifyPassword).toHaveBeenCalledTimes(1);
    const dummyHash = verifyPassword.mock.calls[0]?.[1];
    const [prefix, salt, storedHash] = dummyHash?.split(":") ?? [];
    expect(prefix).toBe("scrypt");
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    expect(storedHash).toMatch(/^[0-9a-f]{128}$/);
    expect(Buffer.from(storedHash ?? "", "hex")).toHaveLength(64);
  });
});
