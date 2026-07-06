/**
 * Lista los perfiles con rol admin en Supabase.
 * Ejecutar: npm run list-admins
 *
 * Nota: las contraseñas en la BD están hasheadas (bcrypt) y NO se pueden leer.
 * Este script muestra las contraseñas originales solo si coinciden con las
 * definidas en create-admins.ts / seed.ts (cuentas creadas por esos scripts).
 */

import { createClient } from "@supabase/supabase-js";
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

/** Contraseñas conocidas solo para cuentas creadas con nuestros scripts de seed */
const KNOWN_PASSWORDS: Record<string, string> = {
  samuel: "secretario2026",
  alejandra: "admin2026",
  sophia: "presidente2026",
  valeria: "vicepresidente2026",
};

async function listAdmins() {
  console.log("🔍 Consultando administradores en Supabase...\n");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, email, role, media_outlet, is_active, created_at")
    .eq("role", "admin")
    .order("display_name");

  if (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  if (!data?.length) {
    console.log("No hay perfiles con rol admin.");
    return;
  }

  console.log(`Encontrados: ${data.length} admin(s)\n`);
  console.log("─".repeat(70));

  data.forEach((admin, i) => {
    const knownPassword = KNOWN_PASSWORDS[admin.username];
    console.log(`\n#${i + 1} ${admin.display_name}`);
    console.log(`   ID:           ${admin.id}`);
    console.log(`   Usuario:      ${admin.username}`);
    console.log(`   Correo:       ${admin.email ?? "(sin correo)"}`);
    console.log(`   Medio:        ${admin.media_outlet ?? "—"}`);
    console.log(`   Estado:       ${admin.is_active ? "Activo" : "Bloqueado"}`);
    console.log(`   Creado:       ${new Date(admin.created_at).toLocaleString("es-CO")}`);
    console.log(
      `   Contraseña:   ${
        knownPassword
          ? knownPassword + "  (contraseña del script create-admins/seed)"
          : "(desconocida — fue cambiada o creada manualmente; no se puede leer de la BD)"
      }`
    );
  });

  console.log("\n" + "─".repeat(70));
  console.log("\nℹ️  Las contraseñas en la base de datos están encriptadas (bcrypt).");
  console.log("   Solo se muestran las que coinciden con los scripts del proyecto.");
  console.log("   Si alguien cambió su contraseña, hay que resetearla con create-admins.\n");
}

listAdmins().catch(console.error);