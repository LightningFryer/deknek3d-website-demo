import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/db";
import { notes } from "@/app/db/notes-schema";
import { eq, and, or, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/notes — returns the user's notes + all public notes
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  let rows;
  if (session?.user) {
    rows = await db
      .select()
      .from(notes)
      .where(
        or(eq(notes.userId, session.user.id), eq(notes.isPublic, true))
      )
      .orderBy(desc(notes.createdAt));
  } else {
    rows = await db
      .select()
      .from(notes)
      .where(eq(notes.isPublic, true))
      .orderBy(desc(notes.createdAt));
  }

  return NextResponse.json(rows);
}

// POST /api/notes — create a new note (requires auth)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, isPublic } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [note] = await db
    .insert(notes)
    .values({
      id: nanoid(),
      title: title.trim(),
      content: content?.trim() ?? "",
      userId: session.user.id,
      isPublic: isPublic ?? false,
    })
    .returning();

  return NextResponse.json(note, { status: 201 });
}
