"use server";

import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

const normalizeUser = (row) => {
  if (!row || typeof row !== "object") return row;
  return {
    _id: String(row.id ?? ""),
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    role: row.role ?? "customer",
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt ?? null),
  };
};

export const getCustomers = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Please sign in again.");
  }
  if (session.user.role !== "admin") {
    throw new Error("Admin only.");
  }

  const rows = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.role, "customer"))
    .orderBy(desc(userTable.createdAt))
    .limit(500);

  return rows.map(normalizeUser);
};
