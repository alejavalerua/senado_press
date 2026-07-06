/**
 * Script de seed para crear usuarios y senadores iniciales.
 * Ejecutar: npx tsx scripts/seed.ts
 *
 * Requiere variables de entorno en .env.local
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("❌ Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const USERS = [
  {
    username: "samuel",
    display_name: "Samuel Lugo",
    password: "secretario2026",
    role: "admin" as const,
    media_outlet: "Secretaría General del Senado",
  },
  {
    username: "periodista1",
    display_name: "María González",
    password: "prensa2026",
    role: "journalist" as const,
    media_outlet: "El Espectador Júnior",
  },
  {
    username: "periodista2",
    display_name: "Carlos Ruiz",
    password: "prensa2026",
    role: "journalist" as const,
    media_outlet: "Semana Estudiantil",
  },
  {
    username: "periodista3",
    display_name: "Laura Méndez",
    password: "prensa2026",
    role: "journalist" as const,
    media_outlet: "RCN Modelo",
  },
  {
    username: "periodista4",
    display_name: "Andrés Vargas",
    password: "prensa2026",
    role: "journalist" as const,
    media_outlet: "Caracol Parlamento",
  },
  {
    username: "periodista5",
    display_name: "Isabella Torres",
    password: "prensa2026",
    role: "journalist" as const,
    media_outlet: "La Silla Vacía Júnior",
  },
];

const SENATORS = [
  { full_name: "Gustavo Bolívar", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Aída Avella", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Alexander López Maya", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Ariel Ávila", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Catalina del Socorro Pérez", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Feliciano Valencia", party: "Pacto Histórico", caucus: "Comunes" },
  { full_name: "Gloria Inés Flórez", party: "Pacto Histórico", caucus: "Alianza Verde" },
  { full_name: "Humberto de la Calle", party: "Pacto Histórico", caucus: "Coalición Centro Esperanza" },
  { full_name: "Iván Cepeda", party: "Pacto Histórico", caucus: "Polo Democrático" },
  { full_name: "María José Pizarro", party: "Pacto Histórico", caucus: "Pacto Histórico" },
  { full_name: "Nadia Blel Scaff", party: "Pacto Histórico", caucus: "Partido Conservador" },
  { full_name: "Sandra Ramírez", party: "Pacto Histórico", caucus: "Comunes" },
  { full_name: "Sor Berenice Bedoya", party: "Pacto Histórico", caucus: "ASI" },
  { full_name: "Carlos Fernando Motoa", party: "Centro Democrático", caucus: "Centro Democrático" },
  { full_name: "Efraín Cepeda", party: "Centro Democrático", caucus: "Centro Democrático" },
  { full_name: "Miguel Uribe Turbay", party: "Centro Democrático", caucus: "Centro Democrático" },
  { full_name: "Paloma Valencia", party: "Centro Democrático", caucus: "Centro Democrático" },
  { full_name: "Juan Diego Gómez", party: "Partido Liberal", caucus: "Partido Liberal" },
  { full_name: "Juan Manuel Galán", party: "Partido Liberal", caucus: "Partido Liberal" },
  { full_name: "Rodrigo Lara Restrepo", party: "Partido Liberal", caucus: "Partido Liberal" },
  { full_name: "David Luna", party: "Cambio Radical", caucus: "Cambio Radical" },
  { full_name: "Germán Varón", party: "Cambio Radical", caucus: "Cambio Radical" },
  { full_name: "Angélica Lozano", party: "Independiente", caucus: "Verdes" },
  { full_name: "Antonio Sanguino", party: "Pacto Histórico", caucus: "Alianza Verde" },
];

async function seed() {
  console.log("🌱 Iniciando seed...\n");

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, 10);
    const { error } = await supabase.from("profiles").upsert(
      {
        username: user.username,
        display_name: user.display_name,
        password_hash: hash,
        role: user.role,
        media_outlet: user.media_outlet,
        is_active: true,
      },
      { onConflict: "username" }
    );

    if (error) {
      console.error(`  ❌ ${user.username}: ${error.message}`);
    } else {
      console.log(`  ✅ Usuario: ${user.display_name} (${user.username})`);
    }
  }

  const { count } = await supabase.from("senators").select("*", { count: "exact", head: true });

  if (!count || count === 0) {
    const { error } = await supabase.from("senators").insert(SENATORS);
    if (error) {
      console.error(`  ❌ Senadores: ${error.message}`);
    } else {
      console.log(`\n  ✅ ${SENATORS.length} senadores insertados`);
    }
  } else {
    console.log(`\n  ⏭️  Senadores ya existen (${count}), omitiendo`);
  }

  const { count: stateCount } = await supabase.from("senate_state").select("*", { count: "exact", head: true });
  if (!stateCount || stateCount === 0) {
    await supabase.from("senate_state").insert({
      live_topic: "Reforma a la educación — Primer debate",
      is_live: true,
      active_projects: 3,
      active_dispatches: 0,
      open_questions: 5,
      active_debates: 2,
    });
    console.log("  ✅ Estado inicial del senado creado");
  }

  console.log("\n🎉 Seed completado!");
  console.log("\n📋 Credenciales:");
  console.log("   Admin:     samuel / secretario2026");
  console.log("   Periodistas: periodista1-5 / prensa2026");
}

seed().catch(console.error);