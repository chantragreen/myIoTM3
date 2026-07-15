import { NextResponse } from "next/server";
import { deleteDevice } from "@/lib/server/device-registry";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = deleteDevice(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
