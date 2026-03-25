import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FeedItem } from "@/lib/types";

const categories = ["All", "AI Tool", "Agent", "Productivity", "Design Tool", "Experiment"];

export function SearchPage({ items }: { items: FeedItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const queryMatch = !query || `${item.title} ${item.description} ${item.tags.join(" ")} ${item.creator.username}`.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = category === "All" || item.category.replace(/_/g, " ").toLowerCase() === category.toLowerCase();
      return queryMatch && categoryMatch;
    });
  }, [category, items, query]);

  return <main><section className="panel"><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Search apps</h1><p className="muted">Trending apps, categories, and creators in one place.</p></div></div><div className="wizard-step"><input className="input" placeholder="Search apps, creators, tags..." value={query} onChange={(event) => setQuery(event.target.value)} /><div className="row">{categories.map((item) => <button className="chip" key={item} onClick={() => setCategory(item)} style={{ opacity: category === item ? 1 : 0.7 }} type="button">{item}</button>)}</div></div></section><section className="section-heading"><h2>Results</h2><span className="muted">{filtered.length} apps</span></section><section className="grid-2">{filtered.map((app) => <div className="editor-card" key={app.id}><div className="preview-device" style={{ minHeight: '20rem' }}><iframe src={app.appUrl} sandbox="allow-scripts allow-same-origin allow-forms" title={`${app.title} search preview`} /></div><div style={{ marginTop: '1rem' }}><div className="row"><span className="chip">@{app.creator.username}</span><span className="chip">{app.intentLabel}</span></div><h3 style={{ marginBottom: '0.5rem' }}>{app.title}</h3><p className="muted">{app.hook}</p><div className="row">{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="row" style={{ marginTop: '1rem' }}><Link className="button" to={`/apps/${app.slug}`}>Showcase</Link><Link className="ghost-button" to={`/profile/${app.creator.username}`}>Creator</Link></div></div></div>)}</section></main>;
}
