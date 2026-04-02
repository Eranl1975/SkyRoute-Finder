import { NextRequest, NextResponse } from 'next/server';
import { sourceRegistry } from '@/skills/sourceTrust/registry';

export async function GET() {
  const sources = sourceRegistry.getAll();
  return NextResponse.json({ sources });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, patch } = await req.json();
    if (!id || !patch) {
      return NextResponse.json({ error: 'id and patch required' }, { status: 400 });
    }
    sourceRegistry.updateSource(id, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
