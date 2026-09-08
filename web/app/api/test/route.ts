import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "API works",
    timestamp: new Date().toISOString(),
    message: "If you see this, Vercel is serving new code"
  });
}
