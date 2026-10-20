import { useEffect, useState } from "react";
import { BarChart3, MousePointerClick } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { useAuth } from "@/hooks/useAuth";
import { api, useDatabase } from "@/services/api";
import type { DailyPoll as DailyPollType } from "@/types";

/**
 * Quick daily poll: one click votes and the live percentage bars appear
 * immediately. Votes persist per signed-in persona in the simulated backend.
 */
export function DailyPoll() {
  const { user } = useAuth();
  const database = useDatabase();
  const [poll, setPoll] = useState<DailyPollType | null>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | undefined>(undefined);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void api.polls.today().then((result) => {
      if (!alive) return;
      setPoll(result.poll);
      setHasVoted(result.hasVoted);
      setVotedOptionId(result.votedOptionId);
    });
    return () => {
      alive = false;
    };
  }, [database.polls, database.pollVotes, database.sessionUserId]);

  async function vote(optionId: string): Promise<void> {
    if (!user) {
      setMessage("Sign in with any demo persona to cast your vote.");
      return;
    }
    if (!poll) return;
    try {
      const updated = await api.polls.vote(poll.id, optionId, user.id);
      setPoll(updated);
      setHasVoted(true);
      setVotedOptionId(optionId);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vote failed.");
    }
  }

  if (!poll) return null;
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="fmie-card flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="fmie-eyebrow">Quick daily poll</p>
        <Badge tone="gold">
          <BarChart3 className="mr-1 inline h-3 w-3" /> {total.toLocaleString()} votes
        </Badge>
      </div>
      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-brand-charcoal">
        {poll.question}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {poll.options.map((option) => {
          const percent = total === 0 ? 0 : Math.round((option.votes / total) * 100);
          const chosen = votedOptionId === option.id;
          return (
            <li key={option.id}>
              {hasVoted ? (
                <div className="rounded-md border border-brand-border px-3 py-2">
                  <div className="flex items-center justify-between text-xs font-medium text-brand-charcoal">
                    <span>
                      {option.label}
                      {chosen ? (
                        <span className="ml-2 text-brand-gold-dark">✓ your vote</span>
                      ) : null}
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-brand-cream">
                    <div
                      className="h-1.5 rounded-full bg-brand-gold transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void vote(option.id)}
                  className="flex w-full items-center justify-between rounded-md border border-brand-border px-3 py-2 text-left text-sm font-medium text-brand-charcoal transition-colors hover:border-brand-gold hover:bg-brand-cream"
                >
                  {option.label}
                  <MousePointerClick className="h-3.5 w-3.5 text-brand-gold-dark" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {message ? <p className="mt-3 text-xs text-brand-slate">{message}</p> : null}
      <p className="mt-auto pt-3 text-[11px] text-brand-slate">
        Live percentages update the moment you vote. Sample audience — not
        population-representative.
      </p>
    </div>
  );
}

export default DailyPoll;
