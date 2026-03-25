import { notFound } from "next/navigation";
import { AgentPlannerRuntime } from "@/components/runtime/agent-planner";
import { CopyLabRuntime } from "@/components/runtime/copy-lab";
import { PromptStudioRuntime } from "@/components/runtime/prompt-studio";

export default async function RuntimePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "prompt-studio") return <PromptStudioRuntime />;
  if (slug === "agent-planner") return <AgentPlannerRuntime />;
  if (slug === "copy-lab") return <CopyLabRuntime />;
  notFound();
}
