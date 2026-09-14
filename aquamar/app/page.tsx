import { redirect } from "next/navigation";
import { esAdmin, sesionCliente } from "@/lib/auth";
import { SOLO_PROSPECCION } from "@/lib/sitio";

export default async function Inicio() {
  if (await esAdmin()) redirect(SOLO_PROSPECCION ? "/comercial/prospeccion" : "/comercial");
  if (await sesionCliente()) redirect("/panel");
  redirect("/login");
}
