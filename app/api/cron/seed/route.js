import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateRandomJob } from "@/lib/fakeJobs";

export async function GET() {
  try {
    let count = 0;

    for (let i = 0; i < 10; i++) {
      const job = generateRandomJob();
      const { error } = await supabaseAdmin.from("job").insert([{ ...job, user_id: null }]);
      if (!error) count++;
    }

    return Response.json({ ok: true, created: count });
  } catch (err) {
    console.error(err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
