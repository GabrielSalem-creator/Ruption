import { useParams } from "react-router-dom";
import { AgentPlannerRuntime } from "@/components/runtime/agent-planner";
import { CopyLabRuntime } from "@/components/runtime/copy-lab";
import { PromptStudioRuntime } from "@/components/runtime/prompt-studio";
export function RuntimePage() { const { slug } = useParams(); if (slug === "prompt-studio") return <PromptStudioRuntime />; if (slug === "agent-planner") return <AgentPlannerRuntime />; if (slug === "copy-lab") return <CopyLabRuntime />; return <main><div className="panel"><h1>Runtime not found</h1></div></main>; }
