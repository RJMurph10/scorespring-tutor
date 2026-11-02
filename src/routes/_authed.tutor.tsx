import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  ListOrdered,
  MessageSquarePlus,
  MessagesSquare,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ErrorState, LoadingState } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getAiStatus } from "@/lib/ai.functions";
import { activeExam, useProfile, useUserId } from "@/lib/data";
import { isDemo } from "@/lib/demo";
import { cn } from "@/lib/utils";

type Search = { c?: string; q?: string; mode?: "steps" };

export const Route = createFileRoute("/_authed/tutor")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof s["c"] === "string") out.c = s["c"];
    if (typeof s["q"] === "string") out.q = s["q"];
    if (s["mode"] === "steps") out.mode = "steps";
    return out;
  },
  head: () => ({ meta: [{ title: "AI Tutor — ScoreSpring" }] }),
  component: TutorPage,
});

const SUGGESTIONS: Record<"SAT" | "ACT", string[]> = {
  SAT: [
    "Teach me SAT quadratic equations.",
    "Why was my answer wrong?",
    "Help me improve SAT reading.",
    "Give me a harder practice question.",
    "Explain this like I'm a beginner.",
    "Quiz me on my weakest skills.",
  ],
  ACT: [
    "Teach me ACT slope and linear functions.",
    "Why was my answer wrong?",
    "How do I read ACT Science graphs faster?",
    "Give me a harder practice question.",
    "Explain this like I'm a beginner.",
    "Quiz me on my weakest skills.",
  ],
};

function useConversations() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["conversations", uid],
    enabled: !!uid,
    queryFn: async () => {
      const r = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", uid!)
        .order("updated_at", { ascending: false })
        .limit(50);
      if (r.error) throw new Error(r.error.message);
      return r.data;
    },
  });
}

function TutorPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/tutor" });
  const uid = useUserId();
  const { data: profile } = useProfile();
  const exam = activeExam(profile);
  const convs = useConversations();
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ["ai-status"],
    queryFn: () => getAiStatus(),
    staleTime: 60_000,
  });
  const creating = useRef(false);

  // Make sure there is always an active conversation.
  useEffect(() => {
    if (!uid || convs.isLoading || search.c || creating.current) return;
    const existing = convs.data?.find((c) => c.exam === exam);
    if (existing && !search.q) {
      navigate({ search: { ...search, c: existing.id }, replace: true });
      return;
    }
    creating.current = true;
    supabase
      .from("conversations")
      .insert({ user_id: uid, exam })
      .select("*")
      .single()
      .then(({ data, error }) => {
        creating.current = false;
        if (error || !data)
          return void toast.error(error?.message ?? "Couldn't start a conversation");
        qc.invalidateQueries({ queryKey: ["conversations"] });
        navigate({ search: { ...search, c: data.id }, replace: true });
      });
  }, [uid, convs.isLoading, convs.data, search, exam, navigate, qc]);

  async function newConversation() {
    if (!uid) return;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: uid, exam })
      .select("*")
      .single();
    if (error || !data) return void toast.error(error?.message ?? "Couldn't start a conversation");
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    navigate({ search: { c: data.id } });
  }

  async function deleteConversation(id: string) {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    if (search.c === id) navigate({ search: {} });
  }

  const list = (
    <div className="space-y-1">
      <Button variant="outline" className="mb-3 w-full justify-start" onClick={newConversation}>
        <MessageSquarePlus className="size-4" /> New conversation
      </Button>
      {(convs.data ?? []).map((c) => (
        <div
          key={c.id}
          className={cn(
            "group flex items-center rounded-lg",
            c.id === search.c ? "bg-accent" : "hover:bg-muted",
          )}
        >
          <button
            className="min-w-0 flex-1 px-3 py-2 text-left"
            onClick={() => navigate({ search: { c: c.id } })}
          >
            <p className="truncate text-sm font-medium text-navy">{c.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {c.exam} · {new Date(c.updated_at).toLocaleDateString()}
            </p>
          </button>
          <button
            className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive focus:opacity-100"
            onClick={() => deleteConversation(c.id)}
            aria-label={`Delete ${c.title}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  const conv = convs.data?.find((c) => c.id === search.c);

  return (
    <div className="-mt-2 grid h-[calc(100svh-9.5rem)] gap-6 md:h-[calc(100svh-7rem)] md:grid-cols-[240px_1fr]">
      <aside className="hidden overflow-y-auto md:block">{list}</aside>
      <div className="flex min-h-0 min-w-0 flex-col rounded-2xl border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:hidden"
                  aria-label="Conversations"
                >
                  <MessagesSquare className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetHeader className="p-0 pb-3">
                  <SheetTitle>Conversations</SheetTitle>
                </SheetHeader>
                {list}
              </SheetContent>
            </Sheet>
            <Sparkles className="size-4 shrink-0 text-primary" />
            <p className="truncate text-sm font-semibold text-navy">{conv?.title ?? "AI Tutor"}</p>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {conv?.exam ?? exam}
            </span>
          </div>
          <div
            className="flex rounded-lg border bg-muted/60 p-0.5 text-xs font-semibold"
            role="group"
            aria-label="Tutor mode"
          >
            <button
              className={cn(
                "rounded-md px-2.5 py-1",
                search.mode !== "steps" ? "bg-card text-navy shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => navigate({ search: ({ mode: _m, ...rest }) => rest })}
              aria-pressed={search.mode !== "steps"}
            >
              Chat
            </button>
            <button
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1",
                search.mode === "steps" ? "bg-card text-navy shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => navigate({ search: { ...search, mode: "steps" } })}
              aria-pressed={search.mode === "steps"}
            >
              <ListOrdered className="size-3.5" />{" "}
              <span className="hidden sm:inline">Step-by-step</span>
              <span className="sm:hidden">Steps</span>
            </button>
          </div>
        </div>

        {status.data && !status.data.configured && !isDemo() ? (
          <div className="m-6 rounded-xl border border-warning/40 bg-warning-soft p-5 text-sm text-navy">
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4" /> The AI tutor isn't set up yet
            </p>
            <p className="mt-1 text-muted-foreground">
              No AI responses will be generated until AI is enabled for this project. In Lovable,
              open the project's Cloud settings and enable Lovable AI — it securely provides the
              server key. Everything else in the app (practice, lessons, plan, analytics) works
              without it.
            </p>
          </div>
        ) : !search.c || convs.isLoading ? (
          <LoadingState />
        ) : convs.error ? (
          <ErrorState error={convs.error} />
        ) : (
          <ChatPane
            key={search.c}
            conversationId={search.c}
            exam={(conv?.exam as "SAT" | "ACT") ?? exam}
            mode={search.mode === "steps" ? "steps" : "chat"}
            initialPrompt={search.q}
            onConsumedPrompt={() =>
              navigate({ search: ({ q: _q, ...rest }) => rest, replace: true })
            }
            onActivity={() => qc.invalidateQueries({ queryKey: ["conversations"] })}
          />
        )}
      </div>
    </div>
  );
}

function ChatPane({
  conversationId,
  exam,
  mode,
  initialPrompt,
  onConsumedPrompt,
  onActivity,
}: {
  conversationId: string;
  exam: "SAT" | "ACT";
  mode: "chat" | "steps";
  initialPrompt?: string | undefined;
  onConsumedPrompt: () => void;
  onActivity: () => void;
}) {
  const history = useQuery({
    queryKey: ["chat", conversationId],
    staleTime: Infinity,
    queryFn: async () => {
      const r = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");
      if (r.error) throw new Error(r.error.message);
      return r.data.map((m) => ({
        id: m.sdk_id ?? m.id,
        role: m.role as "user" | "assistant",
        parts: m.parts as UIMessage["parts"],
      }));
    },
  });
  if (history.isLoading) return <LoadingState label="Loading conversation…" />;
  if (history.error) return <ErrorState error={history.error} onRetry={() => history.refetch()} />;
  return (
    <ChatInner
      conversationId={conversationId}
      exam={exam}
      mode={mode}
      initial={history.data ?? []}
      initialPrompt={initialPrompt}
      onConsumedPrompt={onConsumedPrompt}
      onActivity={onActivity}
    />
  );
}

function ChatInner({
  conversationId,
  exam,
  mode,
  initial,
  initialPrompt,
  onConsumedPrompt,
  onActivity,
}: {
  conversationId: string;
  exam: "SAT" | "ACT";
  mode: "chat" | "steps";
  initial: UIMessage[];
  initialPrompt?: string | undefined;
  onConsumedPrompt: () => void;
  onActivity: () => void;
}) {
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/tutor",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ conversationId, mode: modeRef.current }),
      }),
    [conversationId],
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    messages: initial,
    transport,
    onFinish: () => onActivity(),
  });
  const [input, setInput] = useState("");
  const demo = isDemo();
  const [demoBlocked, setDemoBlocked] = useState(false);
  const sentInitial = useRef(false);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (initialPrompt && !sentInitial.current && messages.length === 0) {
      sentInitial.current = true;
      if (demo) setInput(initialPrompt);
      else sendMessage({ text: initialPrompt });
      onConsumedPrompt();
    }
  }, [initialPrompt, messages.length, sendMessage, onConsumedPrompt]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    if (demo) return setDemoBlocked(true);
    sendMessage({ text: t });
    setInput("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <>
      <Conversation className="min-h-0">
        <ConversationContent className="gap-6 px-4 py-6 md:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center">
              <div className="rounded-full bg-accent p-3 text-primary">
                {mode === "steps" ? (
                  <ListOrdered className="size-6" />
                ) : (
                  <Sparkles className="size-6" />
                )}
              </div>
              <h2 className="mt-3 text-lg font-bold text-navy">
                {mode === "steps" ? "Work a problem one step at a time" : `Your ${exam} tutor`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "steps"
                  ? "Paste a problem (or ask for one). The tutor gives one step, waits for your try, then continues."
                  : "Ask about any concept or question. The tutor sees your practice results, so it can focus on what you actually miss."}
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {(mode === "steps"
                  ? [
                      "Give me a problem on my weakest skill.",
                      "Walk me through solving 2x² − 8 = 0.",
                      "Help me with a comma vs. semicolon question.",
                      "Give me an ACT Science data question.",
                    ]
                  : SUGGESTIONS[exam]
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border bg-background px-3 py-2.5 text-left text-sm text-navy hover:border-primary/40 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent
                  className={
                    m.role === "assistant" ? "text-[15px] leading-relaxed text-navy" : "text-[15px]"
                  }
                >
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : (
                        <p key={i} className="whitespace-pre-wrap">
                          {p.text}
                        </p>
                      )
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && (
            <p className="rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">
              The tutor couldn't respond
              {error.message.includes("AI_NOT_CONFIGURED")
                ? " — AI isn't configured for this project yet."
                : `: ${error.message.slice(0, 200)}`}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3 md:p-4">
        {demo && (
          <p
            className={cn(
              "mb-2 rounded-lg px-3 py-2 text-xs",
              demoBlocked ? "bg-warning-soft text-navy" : "bg-muted text-muted-foreground",
            )}
          >
            {demoBlocked
              ? "The AI tutor needs a free account. Create one from the banner at the top — your guest progress stays in this browser."
              : "You're using ScoreSpring as a guest. The AI tutor is available with a free account."}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={
              mode === "steps" ? "Paste a problem or your next step…" : "Ask a question…"
            }
            className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-label="Message the tutor"
          />
          {busy ? (
            <Button size="icon" variant="outline" onClick={() => stop()} aria-label="Stop">
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={!input.trim()}
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
          AI can make mistakes. Check worked answers against the explanation.
        </p>
      </div>
    </>
  );
}
