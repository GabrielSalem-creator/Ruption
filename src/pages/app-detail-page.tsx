import { ArrowLeft, ExternalLink, Heart, Info, Save, ShieldCheck } from "lucide-react";
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
    await addComment(app.slug, comment.trim());
    const refreshed = await listComments(app.id);
    setComments(refreshed as CommentRecord[]);
    setComment("");
  }

  async function handleReportSubmit(event: FormEvent) {
    event.preventDefault();
    await reportApp(app.slug, reportReason, reportNotes);
    setReportNotes("");
  }

  return <main><section className="grid-2"><div className="editor-card"><div className="split"><Link className="ghost-button" to="/feed"><ArrowLeft size={16} /> Back</Link><div className="row"><button className="ghost-button" onClick={() => toggleLike(app.slug).then((result) => setLikes(result.likes)).catch(() => undefined)} type="button"><Heart size={16} /> {likes}</button><button className="ghost-button" onClick={() => toggleSave(app.slug).then((result) => setSaves(result.saves)).catch(() => undefined)} type="button"><Save size={16} /> {saves}</button></div></div><div className="preview-device" style={{ minHeight: '70vh', marginTop: '1rem' }}><iframe src={app.appUrl} sandbox="allow-scripts allow-same-origin allow-forms" title={`${app.title} showcase`} /></div></div><div className="editor-stack"><div className="editor-card"><div className="row"><span className="kicker">{app.intentLabel}</span>{app.isVerified ? <span className="chip"><ShieldCheck size={14} /> Verified</span> : null}</div><h1 style={{ marginBottom: '0.5rem' }}>{app.title}</h1><p className="muted">{app.hook}</p><div className="row">{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="row" style={{ marginTop: '1rem' }}><a className="button" href={app.appUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open source</a><Link className="ghost-button" to={`/profile/${app.creator.username}`}>@{app.creator.username}</Link></div></div><div className="editor-card"><div className="row"><Info size={18} /><strong>Description</strong></div><p>{app.description}</p><p className="muted">{app.whatItDoes}</p><p className="muted">For: {app.whoItsFor}</p></div><div className="editor-card"><strong>Comments</strong><form className="comment-form" onSubmit={handleCommentSubmit} style={{ marginTop: '1rem' }}><textarea className="textarea" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave feedback" /><button className="button" type="submit">Comment</button></form><div className="comment-stack" style={{ marginTop: '1rem' }}>{comments.length === 0 ? <p className="muted">No comments yet.</p> : comments.map((entry) => <div className="comment-card" key={entry.id}><div className="muted">{new Date(entry.created_at).toLocaleString()}</div><p>{entry.content}</p></div>)}</div></div><div className="editor-card"><strong>Report app</strong><form className="wizard-step" onSubmit={handleReportSubmit} style={{ marginTop: '1rem' }}><select className="select" value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option value="broken">Broken</option><option value="phishing">Phishing</option><option value="malware">Malware</option><option value="login_wall">Login wall</option><option value="spam">Spam</option></select><textarea className="textarea" value={reportNotes} onChange={(event) => setReportNotes(event.target.value)} placeholder="Describe the issue" /><button className="ghost-button" type="submit">Submit report</button></form></div></div></section></main>;
}
