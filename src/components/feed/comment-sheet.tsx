import { FormEvent, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { addComment, listComments } from "@/lib/data";

type CommentRecord = { id: string; content: string; created_at: string; user_id: string };

export function CommentSheet({ appId, appSlug, onClose }: { appId: string; appSlug: string; onClose: () => void }) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [value, setValue] = useState("");
  const [sort, setSort] = useState<"Top" | "New">("New");

  useEffect(() => {
    listComments(appId).then((rows) => setComments(rows as CommentRecord[]));
  }, [appId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    await addComment(appSlug, value.trim());
    const rows = await listComments(appId);
    setComments(rows as CommentRecord[]);
    setValue("");
  }

  const ordered = [...comments].sort((a, b) => sort === "New" ? +new Date(b.created_at) - +new Date(a.created_at) : a.content.length - b.content.length);

  return <div className="modal-overlay" role="dialog" aria-modal="true"><div className="comment-sheet"><div className="split"><div className="row"><MessageCircle size={18} /><strong>Comments</strong></div><button className="ghost-button" onClick={onClose} type="button"><X size={16} /> Close</button></div><div className="row"><button className="chip" onClick={() => setSort("Top")} style={{ opacity: sort === "Top" ? 1 : 0.6 }} type="button">Top</button><button className="chip" onClick={() => setSort("New")} style={{ opacity: sort === "New" ? 1 : 0.6 }} type="button">New</button></div><div className="comment-stack">{ordered.length === 0 ? <p className="muted">No comments yet.</p> : ordered.map((entry) => <div className="comment-card" key={entry.id}><div className="muted">{new Date(entry.created_at).toLocaleString()}</div><p>{entry.content}</p></div>)}</div><form className="comment-form" onSubmit={handleSubmit}><textarea className="textarea" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Say something useful..." /><button className="button" type="submit">Post comment</button></form></div></div>;
}
