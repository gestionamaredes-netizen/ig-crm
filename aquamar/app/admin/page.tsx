import { redirect } from "next/navigation";

/** /admin era la única puerta antes de separar las dos áreas. */
export default function Admin() {
  redirect("/comercial");
}
