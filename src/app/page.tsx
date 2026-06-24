import { BracketPageClient } from "@/components/bracket/BracketPageClient";
import { getServerBracket } from "@/lib/server/get-bracket";

export default async function HomePage() {
  const initialBracket = await getServerBracket();
  return <BracketPageClient initialBracket={initialBracket} />;
}
