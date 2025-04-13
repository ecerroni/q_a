import { SCOPES } from "~/config";

// 1. hash a password
// online hash.js emulator
// http://www.xorbin.com/tools/sha256-hash-calculator

// 2. encrypt the hashed password
// online bcrypt emulator (use 12 rounds)
// https://www.browserling.com/tools/bcrypt
export const mockUsers = [
  {
    id: 1,
    name: "Admin",
    username: "admin",
    email: "admin@test.it",
    password: "$2a$12$1e616OUCfSM7Wd3VOvbZve.4DtCrRDPrAZcKvIo3.lDUHm3kiXhna", // this is === 123456
    delta: 0,
    role: SCOPES.ROLES.ADMIN.VALUE,
  },
];
