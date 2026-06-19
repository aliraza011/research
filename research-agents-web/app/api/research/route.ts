import { NextRequest, NextResponse } from "next/server";
import { runResearch } from "../../../lib/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 });
    }

    if (!body.hypothesis || typeof body.hypothesis !== "string") {
      return NextResponse.json({ ok: false, error: "Hypothesis is required." }, { status: 400 });
    }

    if (!Array.isArray(body.agentIds) || body.agentIds.length < 2) {
      return NextResponse.json({ ok: false, error: "Select at least two agents." }, { status: 400 });
    }

    const result = await runResearch({
      title: body.title,
      hypothesis: body.hypothesis,
      goal: typeof body.goal === "string" ? body.goal : "",
      constraints: typeof body.constraints === "string" ? body.constraints : "",
      agentIds: body.agentIds
    });

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Unknown research server error." },
      { status: 500 }
    );
  }
}
