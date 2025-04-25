// app/api/get-timestamps/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL not defined in environment");

    const res = await fetch(`${baseUrl}/get-timestamps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
