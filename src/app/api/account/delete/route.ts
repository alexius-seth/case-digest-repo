import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token." }, { status: 401 });
    }

    // Verify the token belongs to a real, currently-valid session BEFORE
    // doing anything destructive. This uses the normal (non-admin) client
    // so RLS still applies to this identity check — we are not trusting
    // a user-supplied ID, only a signed session token Supabase itself issued.
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const admin = createAdminClient();

    // Delete owned data first. RLS would normally scope this to the caller,
    // but since the admin client bypasses RLS, we explicitly filter by the
    // verified user.id ourselves so we never risk deleting another user's rows.
    const { error: digestsError } = await admin
      .from("case_digests")
      .delete()
      .eq("user_id", user.id);

    if (digestsError) {
      return NextResponse.json({ error: `Failed to delete digests: ${digestsError.message}` }, { status: 500 });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: `Failed to delete profile: ${profileError.message}` }, { status: 500 });
    }

    // Best-effort: remove any uploaded avatar files for this user.
    await admin.storage.from("avatars").remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.gif`,
    ]);

    // Finally, delete the Auth account itself. This requires the service
    // role key and cannot be done from the browser under any circumstance.
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return NextResponse.json({ error: `Failed to delete account: ${deleteUserError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}