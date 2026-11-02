import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type { Json } from "@/integrations/supabase/types";
import {
  aiConfigured,
  aiModel,
  studentContext,
  tutorSystemPrompt,
  UnauthorizedError,
  userClientFromRequest,
} from "@/lib/ai.server";

type Body = { messages: UIMessage[]; conversationId: string; mode?: "chat" | "steps" };

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function textOf(m: UIMessage) {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!aiConfigured()) {
          return json(503, {
            error: "AI_NOT_CONFIGURED",
            message: "The AI tutor isn't set up yet. Enable Lovable AI for this project.",
          });
        }
        let auth: Awaited<ReturnType<typeof userClientFromRequest>>;
        try {
          auth = await userClientFromRequest(request);
        } catch (e) {
          return json(e instanceof UnauthorizedError ? 401 : 500, { error: "UNAUTHORIZED" });
        }
        const { supabase, userId } = auth;
        const body = (await request.json()) as Body;
        if (!body?.conversationId || !Array.isArray(body.messages) || body.messages.length === 0) {
          return json(400, { error: "BAD_REQUEST" });
        }
        const conv = await supabase
          .from("conversations")
          .select("*")
          .eq("id", body.conversationId)
          .single();
        if (conv.error || !conv.data) return json(404, { error: "NOT_FOUND" });

        const ctx = await studentContext(supabase, userId, conv.data.exam);
        const history = body.messages.slice(-24);
        const lastUser = [...history].reverse().find((m) => m.role === "user");

        const result = streamText({
          model: aiModel(),
          system: tutorSystemPrompt(ctx.text, body.mode === "steps" ? "steps" : "chat"),
          messages: await convertToModelMessages(history),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ responseMessage }) => {
            const rows = [];
            if (lastUser) {
              rows.push({
                conversation_id: conv.data.id,
                user_id: userId,
                sdk_id: lastUser.id,
                role: "user",
                parts: lastUser.parts as unknown as Json,
              });
            }
            rows.push({
              conversation_id: conv.data.id,
              user_id: userId,
              sdk_id: responseMessage.id,
              role: "assistant",
              parts: responseMessage.parts as unknown as Json,
            });
            await supabase.from("chat_messages").insert(rows);
            const isFirst = conv.data.title === "New conversation" && lastUser;
            await supabase
              .from("conversations")
              .update({
                updated_at: new Date().toISOString(),
                ...(isFirst ? { title: textOf(lastUser).slice(0, 60) || "Conversation" } : {}),
              })
              .eq("id", conv.data.id);
          },
        });
      },
    },
  },
});
