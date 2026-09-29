import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Circle,
  ExternalLink,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Result, Status } from '../shared/types';
import { Mascot } from './Mascot';
export function ResultPane({
  latest,
  status,
  dotState,
  onClose,
}: {
  latest?: Result | null;
  status?: Status;
  dotState: string;
  onClose: () => void;
}) {
  const [resultTab, setResultTab] = useState<'Brief' | 'Computer'>('Brief');
  return (
    <aside className="result-pane">
      <div className="pane-header">
        <div className="pane-tabs">
          <button
            className={resultTab === 'Brief' ? 'selected' : ''}
            onClick={() => setResultTab('Brief')}
          >
            <BookOpen size={15} />
            Brief
          </button>
          <button
            className={resultTab === 'Computer' ? 'selected' : ''}
            onClick={() => setResultTab('Computer')}
          >
            Computer
          </button>
        </div>
        <button
          className="icon-button"
          aria-label="Close result panel"
          onClick={() => onClose()}
        >
          <X size={16} />
        </button>
      </div>
      {latest ? (
        resultTab === 'Brief' ? (
          <div className="result-content">
            <div className="result-meta">
              <span className="eyebrow">
                {latest.sample ? 'FICTIONAL SAMPLE BRIEF' : 'RESEARCH BRIEF'}
              </span>
              <button
                className="icon-button"
                aria-label="Download brief"
                onClick={() => {
                  const blob = new Blob(
                    [
                      latest.text +
                        '\n\nSources\n' +
                        latest.sources
                          .map((s) => `${s.title}: ${s.url}`)
                          .join('\n'),
                    ],
                    { type: 'text/plain' },
                  );
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = 'opendots-brief.txt';
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <ArrowDownToLine size={16} />
              </button>
            </div>
            {latest.sample && (
              <div className="sample-note">
                An example of what Dot can do. The findings and sources below
                are invented.
              </div>
            )}
            <article className="brief">
              <ReactMarkdown
                components={{
                  img: ({ alt }) => (
                    <span>{alt ? `[Image: ${alt}]` : '[Image omitted]'}</span>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {latest.text}
              </ReactMarkdown>
            </article>
            <section className="sources">
              <h3>
                Source notes <span>{latest.sources.length}</span>
              </h3>
              {latest.sources.map((source) =>
                latest.sample ? (
                  <div className="source-card" key={source.url}>
                    <span className="source-icon">
                      <BookOpen size={15} />
                    </span>
                    <div>
                      <strong>{source.title}</strong>
                      <p>{source.excerpt}</p>
                      <small>Fictional source · not a live link</small>
                    </div>
                  </div>
                ) : (
                  <a
                    className="source-card"
                    href={source.url}
                    key={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="source-icon">
                      <ExternalLink size={15} />
                    </span>
                    <div>
                      <strong>{source.title}</strong>
                      <p>{source.excerpt}</p>
                      <small>{new URL(source.url).hostname}</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </a>
                ),
              )}
            </section>
          </div>
        ) : (
          <div className="computer-view">
            {latest.screenshot ? (
              <>
                <div className="browser-bar">
                  <Circle size={8} />
                  <Circle size={8} />
                  <Circle size={8} />
                  <span>{latest.sources[0]?.url}</span>
                </div>
                <img
                  src={latest.screenshot}
                  alt="Screenshot of the public source page captured during this research run"
                />
                <p>Read-only snapshot from the latest completed run.</p>
              </>
            ) : (
              <div className="pane-empty">
                <Mascot />
                <h3>No browser was opened.</h3>
                <p>
                  When your Dot reads a public page, its isolated browser
                  snapshot appears here.
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="pane-empty">
          <Mascot state={dotState} />
          <h3>A little space for your findings.</h3>
          <p>
            {status === 'failed'
              ? 'Resolve the error and retry to create a research brief.'
              : 'Your brief, sources, and browser snapshot will appear here after a successful run.'}
          </p>
        </div>
      )}
    </aside>
  );
}
