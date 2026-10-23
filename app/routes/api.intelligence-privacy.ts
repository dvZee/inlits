import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import {
  authenticate,
  databaseError,
  privateHeaders,
} from "@/lib/intelligence/server.server";
import { readCommand, reply, safeError } from "@/lib/intelligence/http.server";
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { db } = await authenticate(request);
    const { data, error } = await db.rpc("intelligence_export_data");
    if (error) databaseError(error);
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="inlits-intelligence-data.json"',
      },
    });
  } catch (error) {
    return safeError(error);
  }
}
export async function action({ request }: ActionFunctionArgs) {
  try {
    const input = await readCommand(request);
    const { db } = await authenticate(request);
    const parsed = z
      .object({ confirmation: z.literal("DELETE INTELLIGENCE DATA") })
      .strict()
      .safeParse(input);
    if (!parsed.success)
      return reply({ error: "Explicit deletion confirmation required." }, 400);
    const { error } = await db.rpc("intelligence_delete_data", {
      confirmation: parsed.data.confirmation,
    });
    if (error) {
      if (error.code === "P0001")
        return reply(
          {
            error:
              "A provider dispatch is still in flight. Cancel queued work, wait for the dispatch state to settle, then retry.",
          },
          409
        );
      databaseError(error);
    }
    return reply({ deleted: true });
  } catch (error) {
    return safeError(error);
  }
}
