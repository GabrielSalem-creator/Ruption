import { ArrowRight, ChartColumn, Heart, Save, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addComment, listComments, reportApp, toggleLike, toggleSave } from "@/lib/data";
import { FeedItem } from "@/lib/types";

type CommentRecord = { id: string; content: string; created_at: string; user_id: string };

export function AppDetailPage({ app }: { app: FeedItem }) {
  const [likes, setLikes] = useState(app.stats.likes);
  const [saves, setSaves] = useState(app.stats.saves);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("broken");
  const [reportNotes, setReportNotes] = useState("");

  useEffect(() => {
    listComments(app.id).then((result) => setComments(result as CommentRecord[]));
  }, [app.id]);

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment(app.slug, comment.trim());
      const refreshed = await listComments(app.id);
      setComments(refreshed as CommentRecord[]);
      setComment("");
    } catch {}
  }

  async function handleReportSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await reportApp(app.slug, reportReason, reportNotes);
      setReportNotes("");
    } catch {}
  }

  return <main><section className="grid-2"><div className="panel" style={{ background: app.theme.surface }}><div className="row"><span className="kicker"><Sparkles size={14} /> {app.intentLabel}</span>{app.isVerified ? <span className="chip"><ShieldCheck size={14} /> Verified</span> : null}</div><h1 style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>{app.title}</h1><p className="subtitle" style={{ maxWidth: "none" }}>{app.description}</p><div className="row" style={{ marginTop: "1rem" }}>{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="row" style={{ marginTop: "1.5rem" }}><a className="button" href={app.appUrl}>Open runtime <ArrowRight size={16} /></a><Link className="ghost-button" to="/feed">Back to feed</Link><button className="ghost-button" onClick={() => toggleLike(app.slug).then((result) => setLikes(result.likes)).catch(() => undefined)} type="button"><Heart size={16} /> {likes}</button><button className="ghost-button" onClick={() => toggleSave(app.slug).then((result) => setSaves(result.saves)).catch(() => undefined)} type="button"><Save size={16} /> {saves}</button></div></div><div className="grid-2"><div className="stat-card"><div className="muted">Views</div><strong>{app.stats.views.toLocaleString()}</strong></div><div className="stat-card"><div className="muted">Likes</div><strong>{likes.toLocaleString()}</strong></div><div className="stat-card"><div className="muted">Saves</div><strong>{saves.toLocaleString()}</strong></div><div className="stat-card"><div className="muted">Avg session</div><strong>{app.stats.avgSessionTimeSeconds}s</strong></div></div></section><section className="section-heading"><h2>App details</h2></section><section className="grid-3"><div className="panel"><div className="row"><ChartColumn size={18} /><strong>Health and time to value</strong></div><p className="muted">Health score {app.stats.healthScore} · Time to value {app.stats.timeToValueSeconds}s · Bounce {Math.round(app.stats.bounceRate * 100)}%</p><p>{app.changelog}</p></div><div className="panel"><div className="row"><Heart size={18} /><strong>Who it is for</strong></div><p>{app.whoItsFor}</p><p className="muted">{app.whatItDoes}</p></div><div className="panel"><div className="row"><Save size={18} /><strong>Collaboration hooks</strong></div><div className="row">{app.collaboration.lookingForDevs ? <span className="chip">Looking for devs</span> : null}{app.collaboration.lookingForDesigners ? <span className="chip">Looking for designers</span> : null}{app.collaboration.lookingForFunding ? <span className="chip">Looking for funding</span> : null}</div><p className="muted">{app.resourcesNeeded}</p></div></section><section className="grid-2"><div className="panel"><h2>Comments</h2><form className="wizard-step" onSubmit={handleCommentSubmit}><textarea className="textarea" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave useful feedback" /><button className="button" type="submit">Add comment</button></form><div style={{ height: 16 }} />{comments.length === 0 ? <p className="muted">No comments yet.</p> : comments.map((entry) => <div className="sidebar-card" key={entry.id} style={{ marginBottom: "0.75rem" }}><div className="muted">{new Date(entry.created_at).toLocaleString()}</div><p>{entry.content}</p></div>)}</div><div className="panel"><h2>Report app</h2><form className="wizard-step" onSubmit={handleReportSubmit}><label className="label">Reason<select className="select" value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option value="broken">Broken</option><option value="phishing">Phishing</option><option value="malware">Malware</option><option value="login_wall">Login wall</option><option value="spam">Spam</option></select></label><label className="label">Notes<textarea className="textarea" value={reportNotes} onChange={(event) => setReportNotes(event.target.value)} placeholder="Describe the issue" /></label><button className="ghost-button" type="submit">Submit report</button></form></div></section></main>;
}
