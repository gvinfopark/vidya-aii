import React, { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { admin } from "../../../services/api";
import { thCls, tdCls, iconBtnCls, inputCls, textareaCls, labelCls, primaryBtnCls, cardCls } from "../adminStyles";

export default function NotificationsTab() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", user_id: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [notifs, userList] = await Promise.all([admin.listNotifications(), admin.listUsers()]);
      setItems(notifs);
      setUsers(userList);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    setSentMsg("");
    try {
      const res = await admin.broadcastNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        user_id: form.user_id || null,
      });
      setSentMsg(res.detail || "Sent.");
      setForm({ title: "", message: "", type: "announcement", user_id: "" });
      await load();
    } catch (e) {
      alert(e.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await admin.deleteNotification(id);
      setItems(items.filter(n => n.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete notification.");
    }
  };

  const userName = (id) => users.find(u => u.id === id)?.name || id;

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className={cardCls}>
        <h3 className="font-black text-lg text-text mb-4">Send Notification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Send to</label>
            <select className={inputCls} value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}>
              <option value="">All students (broadcast)</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
        </div>
        <label className={labelCls}>Message</label>
        <textarea className={textareaCls} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
        {sentMsg && <div className="text-success text-[13px] mt-2">{sentMsg}</div>}
        <button className={`${primaryBtnCls} mt-3`} disabled={sending} onClick={send}>
          <Send size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />{sending ? "Sending…" : "Send"}
        </button>
      </div>

      {loading && <p className="text-text-muted">Loading notifications…</p>}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr><th className={thCls}>Recipient</th><th className={thCls}>Title</th><th className={thCls}>Message</th><th className={thCls}>Sent</th><th className={thCls}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(n => (
              <tr key={n.id} className="hover:bg-bg-secondary">
                <td className={tdCls}>{userName(n.user_id)}</td>
                <td className={tdCls}><strong>{n.title}</strong></td>
                <td className={tdCls}>{n.message}</td>
                <td className={tdCls}>{n.created_at ? new Date(n.created_at).toLocaleString() : "—"}</td>
                <td className={tdCls}>
                  <button className={`${iconBtnCls} bg-red-100 text-red-600`} title="Delete" onClick={() => remove(n.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && <tr><td className={tdCls} colSpan={5}>No notifications sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
