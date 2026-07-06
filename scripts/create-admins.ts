/**
 * Crear o actualizar las 2 cuentas de administrador.
 * Ejecutar: npm run create-admins
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

const envLocal = resolve(process.cwd(), ".env.local");
const envFile = resolve(process.cwd(), ".env");
dotenv.config({ path: existsSync(envLocal) ? envLocal : envFile });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("❌ Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const ADMINS = [
  {
    username: "samuel",
    display_name: "Samuel Lugo",
    email: "samuel.lugo@senado.bimun",
    password: "secretario2026",
    media_outlet: "Secretaría General del Senado",
  },
  {
    username: "alejandra",
    display_name: "Alejandra Valencia",
    email: "alejandra.valencia@senado.bimun",
    password: "admin2026",
    media_outlet: "Administración — Senado Press",
  },
    {
    username: "sophia",
    display_name: "Sophia Hamburguer",
    email: "sophia.hamburguer@senado.bimun",
    password: "presidente2026",
    media_outlet: "Presidencia del Senado",
  },
  {
    username: "valeria",
    display_name: "Valeria Gómez",
    email: "valeria.gomez@senado.bimun",
    password: "vicepresidente2026",
    media_outlet: "Vicepresidencia del Senado",
  }
];

async function createAdmins() {
  console.log("🔐 Creando cuentas de administrador...\n");

  for (const admin of ADMINS) {
    const hash = await bcrypt.hash(admin.password, 10);
    const { error } = await supabase.from("profiles").upsert(
      {
        username: admin.username,
        display_name: admin.display_name,
        email: admin.email,
        password_hash: hash,
        role: "admin",
        media_outlet: admin.media_outlet,
        is_active: true,
      },
      { onConflict: "username" }
    );

    if (error) {
      console.error(`  ❌ ${admin.username}: ${error.message}`);
    } else {
      console.log(`  ✅ Admin: ${admin.display_name} (@${admin.username})`);
    }
  }

  console.log("\n📋 Credenciales de administrador:");
  console.log("\n🎉 Listo. Inician sesión en /login y van a /admin automáticamente.");
}

createAdmins().catch(console.error);