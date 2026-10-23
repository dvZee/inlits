import { Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { z } from "zod";
import { serviceDatabase } from "@/lib/intelligence/service.server";
import { reply } from "@/lib/intelligence/http.server";
export const meta: MetaFunction = () => [
  { title: "Stop outreach messages — Inlits" },
  { name: "referrer", content: "no-referrer" },
];
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST")
    return reply({ error: "Method not allowed" }, 405);
  if (request.headers.get("Origin") !== new URL(request.url).origin)
    return reply({ error: "Invalid origin" }, 403);
  const form = await request.formData();
  const token = z.string().uuid().safeParse(form.get("token"));
  if (!token.success) return reply({ error: "Invalid link" }, 400);
  try {
    const { error } = await serviceDatabase().rpc("intelligence_unsubscribe", {
      token: token.data,
    });
    if (error) throw error;
    return reply({ success: true });
  } catch {
    return reply(
      { error: "We could not save your preference. Please try again." },
      503
    );
  }
}
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const result = useActionData<{ success?: boolean; error?: string }>();
  return (
    <main
      style={{
        maxWidth: 540,
        margin: "12vh auto",
        padding: 28,
        fontFamily: "system-ui",
      }}
    >
      <h1>{result?.success ? "Preference saved" : "Stop these messages"}</h1>
      {result?.success ? (
        <p>
          This recipient will be excluded from future outreach by this sender.
        </p>
      ) : (
        <>
          <p>
            Confirm below to stop outreach from this sender. Opening this page
            alone does not change your preference.
          </p>
          {result?.error && <p role="alert">{result.error}</p>}
          <Form method="post">
            <input
              type="hidden"
              name="token"
              value={params.get("token") || ""}
            />
            <button type="submit">Unsubscribe</button>
          </Form>
        </>
      )}
    </main>
  );
}
