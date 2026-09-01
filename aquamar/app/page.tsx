import { redirect } from "next/navigation";
import { esAdmin, sesionCliente } from "@/lib/auth";

export default async function Inicio() {
  if (await esAdmin()) redirect("/admin");
  if (await sesionCliente()) redirect("/panel");
  redirect("/login");
}
