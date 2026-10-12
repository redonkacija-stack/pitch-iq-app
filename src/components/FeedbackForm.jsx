import { useState } from "react";
import { Send, MessageSquareText } from "lucide-react";

const MAX_LENGTH = 1000;

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const feedback = message.trim();
    if (!feedback || sending) return;

    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedback }),
      });
      if (!response.ok) throw new Error("Feedback could not be sent.");
      setMessage("");
      setStatus("Thanks for sharing your thoughts!");
    } catch {
      setStatus("Sorry, your feedback couldn’t be sent. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto my-12 max-w-3xl px-4 sm:px-7" aria-labelledby="feedback-title">
      <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-5 shadow-xl sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-lime/20 bg-lime/10 text-lime">
            <MessageSquareText size={19} />
          </span>
          <div>
            <h2 id="feedback-title" className="font-display text-xl font-bold text-white">Your feedback helps us improve</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Found a mistake or a bug, or liked what the website offers? Share your thoughts and help make PitchIQ better.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="feedback-message" className="mb-2 block text-xs font-semibold text-slate-300">Your message</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
            maxLength={MAX_LENGTH}
            rows={5}
            required
            placeholder="Write your feedback here…"
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500" aria-live="polite">{message.length}/{MAX_LENGTH} characters</span>
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-lime/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} /> {sending ? "Sending…" : "Send feedback"}
            </button>
          </div>
          {status && <p className="mt-3 text-sm text-slate-300" role="status">{status}</p>}
        </form>
      </div>
    </section>
  );
}
