import { Request, Response, NextFunction } from 'express';
import prismaFotosnaps from '../db-fotosnaps';
import prismaKeripik from '../db-keripik';

// Menambahkan properti `prisma` dan `unitBisnis` ke setiap request,
// dipilih berdasarkan prefix URL: /api/fotosnaps/... atau /api/keripik-bujangan/...
// Note: dityped sebagai `any` supaya kedua Prisma Client (skema identik tapi
// generated terpisah) bisa dipakai bergantian tanpa konflik tipe TypeScript.
declare global {
  namespace Express {
    interface Request {
      prisma: any;
      unitBisnis: 'FOTOSNAPS' | 'KERIPIK_BUJANGAN';
    }
  }
}

export function unitBisnisMiddleware(unit: 'FOTOSNAPS' | 'KERIPIK_BUJANGAN') {
  // Widen each client to `any` BEFORE the ternary, not just the result —
  // TypeScript still tries to structurally compare the two independently-
  // generated Prisma Client types to form the ternary's union type even
  // when the `const` itself is annotated `any`, and blows its comparison
  // stack on their deeply nested/recursive relation input types
  // ("Excessive stack depth comparing types"). Operating the ternary on
  // two already-`any` operands means no such union is ever computed.
  const fotosnapsClient: any = prismaFotosnaps;
  const keripikClient: any = prismaKeripik;
  const client = unit === 'FOTOSNAPS' ? fotosnapsClient : keripikClient;
  return (req: Request, _res: Response, next: NextFunction) => {
    req.prisma = client;
    req.unitBisnis = unit;
    next();
  };
}
