import { redirect } from "next/navigation";

export default async function MatchRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/discover?matchId=${id}`);
}
