import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolverTier } from "@/lib/cambio/tier";

export async function GET() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No user" }, { status: 401 });
  }

  const tier = await resolverTier(sb, user.email, user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    tier,
  });
}
