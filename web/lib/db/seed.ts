import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./index";
import { companies as companiesTable, stages, leads, tasks as tasksTable, activity, accounts } from "./schema";
import { companies as companyData } from "../companies";
import { funnelStages, leadsByCompany } from "../funnel";
import { tasks as taskData, activity as activityData } from "../dashboard-data";

async function main() {
  console.log("Sembrando IG CRM…");

  // Limpieza (orden por dependencias)
  await db.delete(accounts);
  await db.delete(tasksTable);
  await db.delete(activity);
  await db.delete(leads);
  await db.delete(stages);
  await db.delete(companiesTable);

  for (const c of companyData) {
    const [company] = await db
      .insert(companiesTable)
      .values({
        slug: c.slug,
        name: c.name,
        category: c.category,
        init: c.init,
        logo: c.logo,
        color: c.color,
        grad: c.grad,
        status: c.status,
        modules: c.modules,
      })
      .returning();

    // Etapas del embudo por empresa
    const stageRows = await db
      .insert(stages)
      .values(funnelStages.map((s, i) => ({ companyId: company.id, name: s.label, color: s.color, order: i })))
      .returning();
    const stageByKey = new Map(funnelStages.map((s, i) => [s.key, stageRows[i].id]));

    // Leads
    const ls = leadsByCompany[c.slug] ?? [];
    if (ls.length) {
      await db.insert(leads).values(
        ls.map((l) => ({
          companyId: company.id,
          stageId: stageByKey.get(l.stage) ?? null,
          name: l.name,
          description: l.desc,
          value: l.value.replace(/[^0-9]/g, "") || "0",
          channel: "otro",
        }))
      );
    }

    // Cuentas vinculadas base
    await db.insert(accounts).values([
      { companyId: company.id, type: "ig", url: "", linked: true },
      { companyId: company.id, type: "wa", url: "", linked: c.status === "activo" },
      { companyId: company.id, type: "web", url: "", linked: c.status === "activo" },
    ]);
  }

  // Tareas globales (asociadas por nombre de empresa)
  const bySlugName = new Map(companyData.map((c) => [c.name, c.slug]));
  const dbCompanies = await db.select().from(companiesTable);
  const idBySlug = new Map(dbCompanies.map((c) => [c.slug, c.id]));
  await db.insert(tasksTable).values(
    taskData.map((t) => ({
      companyId: idBySlug.get(bySlugName.get(t.company) ?? "") ?? null,
      title: t.title,
      priority: t.priority,
    }))
  );

  // Actividad
  await db.insert(activity).values(
    activityData.map((a) => ({
      companyId: idBySlug.get(bySlugName.get(a.title.split(" en ").pop() ?? "") ?? "") ?? null,
      text: `${a.title} — ${a.meta}`,
      type: "seed",
    }))
  );

  console.log("Listo ✅");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
