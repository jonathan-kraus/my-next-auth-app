// lib/db.ts

// 1. 🎯 Import PrismaClient from the custom generated path
//    (This path is needed because of the 'output = "../src/generated/"' in schema.prisma)
import { PrismaClient } from '@/src/generated/client'; 

// 2. Initialize the standard Prisma client
const db = new PrismaClient(); 

export default db;