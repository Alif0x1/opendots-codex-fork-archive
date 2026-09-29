import { PageChatRequests } from './page-chat-requests';
import { openPageLink } from './page-navigation';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Plus, Save, MessageCircle } from 'lucide-react';
import type { Page } from '../server/pages';
import type { Conversation, Space, WorkspaceState } from '../shared/types';
import { api } from './api';
import { Chat } from './Chat';
export function SpaceWorkspace({
  space,
  pageId,
  workspace,
  paused,
  onPage,
  onDirty,
  onRefresh,
  onSchedule,
  onThread,
}: {
  space: Space;
  pageId?: string;
  workspace: WorkspaceState;
  paused: boolean;
  onPage: (id: string) => void;
  onDirty: (value: boolean) => void;
  onRefresh: () => void;
  onSchedule: (threadId: string) => void;
  onThread: (threadId: string) => void;
}) {
  const activePageId = useRef(pageId);
  activePageId.current = pageId;
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState<Page>();
  const [draft, setDraft] = useState({
    title: '',
    content: '',
    parentId: null as string | null,
  });
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');
  const dirty =
    !!page &&
    (draft.title !== page.title ||
      draft.content !== page.content ||
      draft.parentId !== page.parentId);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const [remote, setRemote] = useState<Page>();
  const [dotId, setDotId] = useState('');
  const [thread, setThread] = useState<Conversation>();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const chatRequests = useRef(new PageChatRequests());
  const dots = workspace.dots.filter((dot) => dot.spaceId === space.id);
  const dot = dots.find((dot) => dot.id === dotId) ?? dots[0];
  const chatScope = `${space.id}:${pageId ?? ''}:${dot?.id ?? ''}`;
  chatRequests.current.select(chatScope);
  useEffect(() => {
    setChatBusy(false);
    setThread(undefined);
    setChatOpen(false);
  }, [chatScope]);
  useEffect(() => {
    const requests = chatRequests.current;
    return () => requests.select('');
  }, []);
  const configured = !workspace.setup.missing.length;
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
  useEffect(() => {
    let active = true;
    setPage(undefined);
    setRemote(undefined);
    const load = async () => {
      try {
        const next = await api<Page[]>(`/spaces/${space.id}/pages`);
        if (!active) return;
        setPages(next);
        const nextPage = next.find((p) => p.id === pageId);
        if (nextPage) {
          setRemote(nextPage);
          setPage((current) => {
            if (current?.id === nextPage.id && dirtyRef.current) return current;
            setDraft({
              title: nextPage.title,
              content: nextPage.content,
              parentId: nextPage.parentId,
            });
            return nextPage;
          });
        } else {
          setPage(undefined);
          setRemote(undefined);
        }
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : 'Could not load pages.');
      }
    };
    void load();
    const timer = setInterval(() => void load(), 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [space.id, pageId]);
  useEffect(() => {
    setThread(undefined);
    setChatOpen(false);
    setSaved('');
  }, [pageId, space.id]);
  const newPage = async (parentId: string | null) => {
    setError('');
    try {
      const created = await api<Page>(`/spaces/${space.id}/pages`, 'POST', {
        title: 'Untitled page',
        content: '',
        parentId,
      });
      setPages((previous) => [...previous, created]);
      onPage(created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create page.');
    }
  };
  const save = async () => {
    if (!page) return;
    setBusy(true);
    setError('');
    try {
      const next = await api<Page>(
        `/spaces/${space.id}/pages/${page.id}`,
        'PATCH',
        { ...draft, expectedRevision: page.revision },
      );
      if (activePageId.current !== next.id) return;
      setPage(next);
      setRemote(next);
      setDraft({
        title: next.title,
        content: next.content,
        parentId: next.parentId,
      });
      setPages((previous) =>
        previous.map((p) => (p.id === next.id ? next : p)),
      );
      setSaved('Saved');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save. Your draft is still here.',
      );
    } finally {
      setBusy(false);
    }
  };
  const openChat = async () => {
    if (!page || !dot || page.id !== pageId) return;
    setError('');
    setChatBusy(true);
    await chatRequests.current.run(
      chatScope,
      () =>
        api<Conversation>(
          `/spaces/${space.id}/pages/${page.id}/conversation`,
          'POST',
          { dotId: dot.id },
        ),
      {
        success: (next) => {
          setThread(next);
          setChatOpen(true);
          onRefresh();
        },
        failure: (e) =>
          setError(
            e instanceof Error
              ? e.message
              : 'Could not open page conversation.',
          ),
        settled: () => setChatBusy(false),
      },
    );
  };
  const descendants = new Set<string>();
  if (page) {
    let changed = true;
    descendants.add(page.id);
    while (changed) {
      changed = false;
      for (const item of pages)
        if (
          item.parentId &&
          descendants.has(item.parentId) &&
          !descendants.has(item.id)
        ) {
          descendants.add(item.id);
          changed = true;
        }
    }
  }
  const tree = (parentId: string | null, depth = 0): React.ReactNode =>
    pages
      .filter((p) => p.parentId === parentId)
      .map((p) => (
        <div key={p.id}>
          <button
            className={`page-tree-item ${p.id === pageId ? 'active' : ''}`}
            style={{ paddingLeft: 12 + depth * 14 }}
            onClick={() => onPage(p.id)}
          >
            <FileText size={14} />
            <span>{p.title}</span>
          </button>
          {tree(p.id, depth + 1)}
        </div>
      ));
  return (
    <main className={`space-workspace ${chatOpen ? 'with-page-chat' : ''}`}>
      <aside className="page-tree">
        <div className="page-tree-heading">
          <strong>{space.name}</strong>
          <button
            className="icon-button"
            aria-label="New page"
            onClick={() => void newPage(null)}
          >
            <Plus size={16} />
          </button>
        </div>
        <p>
          {space.description || 'Documents, ideas, and a little room to think.'}
        </p>
        {tree(null)}
        {!pages.length && <p>No pages yet. Add your first document.</p>}
      </aside>
      <section className="page-document">
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {!page ? (
          <div className="page-empty">
            <FileText size={34} />
            <h1>A space for your ideas.</h1>
            <p>
              Write a page, nest your notes, and work with a specialist beside
              your document.
            </p>
            <button
              className="primary-button"
              onClick={() => void newPage(null)}
            >
              Create a page
            </button>
          </div>
        ) : (
          <>
            <div className="page-toolbar">
              <span>
                {dirty ? 'Unsaved draft' : saved || `Revision ${page.revision}`}
              </span>
              <button onClick={() => setPreview(!preview)}>
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button onClick={() => void newPage(page.id)}>New subpage</button>
              <button disabled={!dirty || busy} onClick={() => void save()}>
                <Save size={14} /> Save
              </button>
            </div>
            {remote && remote.revision !== page.revision && (
              <div className="notice">
                A newer revision is available. Your draft is preserved.{' '}
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Replace this draft with the latest saved revision? Copy any text you want to keep first.',
                      )
                    ) {
                      setPage(remote);
                      setDraft({
                        title: remote.title,
                        content: remote.content,
                        parentId: remote.parentId,
                      });
                      setError('');
                    }
                  }}
                >
                  Reload latest
                </button>
              </div>
            )}
            <input
              className="page-title-input"
              aria-label="Page title"
              disabled={busy}
              maxLength={160}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <div className="page-meta">
              <label>
                Move under{' '}
                <select
                  aria-label="Parent page"
                  disabled={busy}
                  value={draft.parentId ?? ''}
                  onChange={(e) =>
                    setDraft({ ...draft, parentId: e.target.value || null })
                  }
                >
                  <option value="">Space root</option>
                  {pages
                    .filter((p) => !descendants.has(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </label>
              {page.sourceThreadId && (
                <button onClick={() => onThread(page.sourceThreadId!)}>
                  Source conversation ↗
                </button>
              )}
            </div>
            {preview ? (
              <article className="page-preview">
                <ReactMarkdown
                  components={{
                    img: ({ alt }) => <span>{alt}</span>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        onClick={(e) => {
                          if (href?.startsWith('/#/spaces/')) {
                            e.preventDefault();
                            openPageLink(href);
                          }
                        }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {draft.content || '*This page is empty.*'}
                </ReactMarkdown>
              </article>
            ) : (
              <textarea
                className="page-content-editor"
                aria-label="Page Markdown"
                disabled={busy}
                placeholder="Start writing in Markdown…"
                maxLength={100000}
                value={draft.content}
                onChange={(e) =>
                  setDraft({ ...draft, content: e.target.value })
                }
              />
            )}
            <footer className="page-chat-launch">
              <MessageCircle size={17} />
              <select
                aria-label="Page specialist"
                value={dot?.id ?? ''}
                onChange={(e) => {
                  setDotId(e.target.value);
                  setThread(undefined);
                  setChatOpen(false);
                }}
              >
                {dots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                disabled={!configured || !dot || chatBusy || paused}
                onClick={() => void openChat()}
              >
                {chatOpen ? 'Reconnect page chat' : 'Chat about this page'}
              </button>
              <small>
                {!configured
                  ? 'Configure Intelligence and model settings to chat.'
                  : dirty
                    ? 'Save your draft before asking your Dot to use it.'
                    : 'Your Dot sees the latest saved page. Chat history is stored in CopilotKit Threads.'}
              </small>
            </footer>
          </>
        )}
      </section>
      {chatOpen && thread && dot && thread.dotId === dot.id && (
        <aside className="page-chat-panel">
          <button
            className="page-chat-close"
            onClick={() => setChatOpen(false)}
          >
            Close page chat
          </button>
          <Chat
            key={thread.id}
            thread={thread}
            dot={dot}
            onConsumed={() => {}}
            voiceReady={workspace.setup.voice}
            calls={workspace.calls.filter((c) => c.threadId === thread.id)}
            paused={paused}
            onSaved={onRefresh}
            onSchedule={() => onSchedule(thread.id)}
          />
        </aside>
      )}
    </main>
  );
}
