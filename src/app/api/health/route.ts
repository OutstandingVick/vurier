import { NextResponse } from "next/server";
import { connection } from "next/server";

export async function GET() {
  await connection();
  return NextResponse.json(
    { status: "ok", service: "vurier" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
