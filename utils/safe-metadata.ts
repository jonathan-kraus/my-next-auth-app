import { Prisma } from '@prisma/client';

export function safeMetadata(
  input: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  try {
    if (input === null || input === undefined) return Prisma.JsonNull;
    return JSON.parse(JSON.stringify(input)) as Prisma.InputJsonValue;
  } catch {
    return Prisma.JsonNull;
  }
}
