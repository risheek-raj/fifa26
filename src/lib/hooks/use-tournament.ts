"use client";

import { useQuery } from "@tanstack/react-query";
import type { BracketState } from "@/types/tournament";
import type { LiveMatch } from "@/lib/api/espn/client";

export interface BracketResponse extends BracketState {
  source: "espn" | "seed";
  updatedAt: string;
}

export interface StandingsResponse {
  groups: BracketState["groups"];
  thirdPlaceQualifiers: {
    team: BracketState["thirdPlaceQualifiers"][0]["team"];
    groupId: string;
    rank: number;
    qualified: boolean;
    points: number;
    goalDifference: number;
  }[];
  source: "espn" | "seed";
  updatedAt: string;
}

export interface LiveResponse {
  matches: LiveMatch[];
  source: "espn" | "seed";
  updatedAt: string;
  hasLiveMatches: boolean;
}

const POLL_LIVE = 15_000;
const POLL_NORMAL = 30_000;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export function useBracket(initialData?: BracketResponse) {
  const liveQuery = useQuery({
    queryKey: ["live"],
    queryFn: () => fetchJson<LiveResponse>("/api/live"),
    refetchInterval: (query) =>
      query.state.data?.hasLiveMatches ? POLL_LIVE : POLL_NORMAL,
    retry: 2,
  });

  return useQuery({
    queryKey: ["bracket"],
    queryFn: () => fetchJson<BracketResponse>("/api/bracket"),
    initialData,
    refetchInterval: liveQuery.data?.hasLiveMatches
      ? POLL_LIVE
      : POLL_NORMAL,
    retry: 2,
  });
}

export function useStandings(initialData?: StandingsResponse) {
  const liveQuery = useQuery({
    queryKey: ["live"],
    queryFn: () => fetchJson<LiveResponse>("/api/live"),
    refetchInterval: (query) =>
      query.state.data?.hasLiveMatches ? POLL_LIVE : POLL_NORMAL,
    retry: 2,
  });

  return useQuery({
    queryKey: ["standings"],
    queryFn: () => fetchJson<StandingsResponse>("/api/standings"),
    initialData,
    refetchInterval: liveQuery.data?.hasLiveMatches
      ? POLL_LIVE
      : POLL_NORMAL,
    retry: 2,
  });
}

export function useLiveScores() {
  return useQuery({
    queryKey: ["live"],
    queryFn: () => fetchJson<LiveResponse>("/api/live"),
    refetchInterval: (query) =>
      query.state.data?.hasLiveMatches ? POLL_LIVE : POLL_NORMAL,
  });
}
