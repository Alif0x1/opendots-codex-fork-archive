import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

// Slack chrome adapted from the supplied OpenTag Slack mock; all messages are authored demo copy.
// This is illustrative footage, not a connected Slack session; see ../README.md.
export const SLACK_FRAMES = 930;
const B = {
  type: 16,
  typed: 112,
  send: 126,
  reply: 148,
  clickThread: 164,
  open: 168,
  ack: 207,
  work: 239,
  read: 294,
  draft: 363,
  save: 429,
  result: 465,
  maya: 609,
  alex: 714,
  reactions: 797,
};
const W = { x: 0, y: 0, w: 1920, h: 1080, rail: 68, side: 220, thread: 996 };
const C = {
  bg: '#1a1d21',
  panel: '#222529',
  border: '#393d43',
  fg: '#eeeef0',
  muted: '#a8abb2',
  link: '#88bcf5',
  side: '#261b2b',
  rail: '#1f1624',
  mint: '#91dec2',
};
const ASK =
  '@Scout turn these release notes into a launch brief. Save it to Launch studio and share it here.';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
const ICONS: Record<string, string> = {
  home: 'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',
  chat: 'M4 4h16v12H9l-5 4z',
  bell: 'M6 16h12l-2-3V8a4 4 0 0 0-8 0v5z M10 20h4',
  more: 'M5 12h.1 M12 12h.1 M19 12h.1',
  search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  chevron: 'M8 10l4 4 4-4',
  plus: 'M12 4v16 M4 12h16',
  headphones: 'M4 15v-3a8 8 0 0 1 16 0v3 M4 13h4v7H4z M16 13h4v7h-4z',
  send: 'M3 3l18 9-18 9 4-9z M7 12h14',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2',
  file: 'M6 2h8l4 4v16H6z M14 2v5h4 M9 12h6 M9 16h6',
  check: 'M4 12l5 5L20 6',
  close: 'M6 6l12 12 M18 6L6 18',
  arrow: 'M7 17L17 7 M7 7h10v10',
  code: 'M8 6l-6 6 6 6 M16 6l6 6-6 6',
};
const Icon = ({
  name,
  size = 22,
  color = 'currentColor',
}: {
  name: string;
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={ICONS[name] ?? ICONS.more} />
  </svg>
);
type Person = 'jerel' | 'scout' | 'maya' | 'alex';
const people = {
  jerel: 'Jerel Velarde',
  scout: 'Scout',
  maya: 'Maya Chen',
  alex: 'Alex Rivera',
};
const Avatar = ({ person, size = 48 }: { person: Person; size?: number }) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: 10,
      background:
        person === 'scout'
          ? '#32293f'
          : person === 'maya'
            ? '#b9d4c4'
            : '#c9bfdc',
      display: 'grid',
      placeItems: 'center',
      fontWeight: 750,
      fontSize: size * 0.38,
      color: '#2d3139',
    }}
  >
    {person === 'jerel' ? (
      <Img
        src={staticFile('assets/slack-demo/jerel.png')}
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    ) : person === 'scout' ? (
      <Img
        src={staticFile('assets/opendots-original-cast.png')}
        style={{
          position: 'absolute',
          width: size * 4,
          maxWidth: 'none',
          height: (size * 4) / 3,
          left: -size * 3,
          top: -size / 6,
        }}
      />
    ) : person === 'maya' ? (
      'MC'
    ) : (
      'AR'
    )}
  </div>
);
const Mention = () => (
  <span
    style={{
      padding: '1px 4px',
      background: '#193f55',
      color: '#a1d3ff',
      borderRadius: 4,
    }}
  >
    @Scout
  </span>
);
const Enter = ({
  at,
  frame,
  children,
}: {
  at: number;
  frame: number;
  children: React.ReactNode;
}) => (
  <div
    style={{
      opacity: ramp(frame, at, at + 10),
      transform: `translateY(${ramp(frame, at, at + 14, 8, 0)}px)`,
    }}
  >
    {children}
  </div>
);
const Message = ({
  person,
  children,
  time = '10:42',
  compact = false,
}: {
  person: Person;
  children: React.ReactNode;
  time?: string;
  compact?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      gap: compact ? 12 : 15,
      alignItems: 'flex-start',
    }}
  >
    <Avatar person={person} size={compact ? 42 : 48} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{ height: 28, display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <strong style={{ fontSize: compact ? 22 : 24 }}>
          {people[person]}
        </strong>
        {person === 'scout' && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 650,
              color: '#c6c7cd',
              padding: '2px 5px',
              background: '#40434a',
              borderRadius: 3,
            }}
          >
            APP
          </span>
        )}
        <span style={{ fontSize: 16, color: C.muted }}>{time}</span>
      </div>
      <div
        style={{ fontSize: compact ? 22 : 24, lineHeight: 1.42, marginTop: 5 }}
      >
        {children}
      </div>
    </div>
  </div>
);
const Attachment = ({ compact = false }: { compact?: boolean }) => (
  <div
    style={{
      width: compact ? 308 : 342,
      height: 65,
      marginTop: 13,
      border: `1px solid ${C.border}`,
      borderRadius: 9,
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '9px 13px',
      background: '#22262c',
    }}
  >
    <div
      style={{
        width: 37,
        height: 43,
        display: 'grid',
        placeItems: 'center',
        background: '#36435a',
        borderRadius: 6,
        color: '#bad1ff',
      }}
    >
      <Icon name="file" size={25} />
    </div>
    <div>
      <div style={{ fontSize: 21, fontWeight: 650 }}>release-notes.md</div>
      <div style={{ color: C.muted, fontSize: 16, marginTop: 1 }}>
        Markdown · 3.2 KB
      </div>
    </div>
  </div>
);
const Reaction = ({
  emoji,
  count,
  at,
  frame,
}: {
  emoji: string;
  count: number;
  at: number;
  frame: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      border: '1px solid #657cad',
      background: '#243046',
      borderRadius: 18,
      height: 34,
      padding: '0 12px',
      fontSize: 19,
      opacity: ramp(frame, at, at + 8),
      transform: `scale(${ramp(frame, at, at + 12, 0.88, 1)})`,
    }}
  >
    <span>{emoji}</span>
    <span style={{ fontSize: 17, color: '#c8dcff' }}>{count}</span>
  </div>
);

// Native Block Kit spacing: sections and context live directly on the message
// surface. Only action elements receive borders; there is no custom app card.
const BlockDivider = () => (
  <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
);
const BlockContext = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 18, lineHeight: '24px', color: C.muted }}>
    {children}
  </div>
);
const BlockButton = ({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) => (
  <div
    style={{
      height: 39,
      padding: '0 17px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${primary ? '#4b9c70' : '#777a7e'}`,
      borderRadius: 4,
      background: primary ? '#007a5a' : 'transparent',
      color: '#f8f8f8',
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);
const WorkBlocks = ({ frame }: { frame: number }) => {
  const steps = [
    ['Read release-notes.md', B.work, B.read],
    ['Write the launch brief', B.read, B.draft],
    ['Save to Launch studio', B.draft, B.save],
  ] as const;
  const collapse = ramp(frame, B.save + 14, B.save + 32);
  return (
    <div
      style={{
        position: 'relative',
        height: 164 - collapse * 120,
        overflow: 'hidden',
        marginTop: 15,
      }}
    >
      <div style={{ opacity: 1 - collapse, paddingTop: 2 }}>
        {steps.map(([label, start, done]) => (
          <div
            key={label}
            style={{
              height: 49,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color:
                frame >= done ? '#c4c7cc' : frame >= start ? C.fg : '#858991',
              fontSize: 21,
            }}
          >
            {frame >= done ? (
              <span style={{ width: 23, fontSize: 20 }}>✅</span>
            ) : (
              <div style={{ width: 23, display: 'grid', placeItems: 'center' }}>
                <div
                  style={{
                    width: 17,
                    height: 17,
                    border: `2px solid ${frame >= start ? '#666a72' : '#50545b'}`,
                    borderTopColor: frame >= start ? '#d6d9df' : '#50545b',
                    borderRadius: '50%',
                    transform: `rotate(${frame >= start ? (frame - start) * 7 : 0}deg)`,
                  }}
                />
              </div>
            )}
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 8,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          opacity: collapse,
        }}
      >
        <span style={{ fontSize: 19 }}>✅</span>
        <BlockContext>Brief saved to Launch studio</BlockContext>
      </div>
    </div>
  );
};
const PageBlocks = () => (
  <div style={{ marginTop: 14, width: '100%', lineHeight: 1.25 }}>
    <div style={{ fontSize: 26, lineHeight: '32px', fontWeight: 700 }}>
      📄 OpenDots launch brief
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginTop: 12,
        fontSize: 21,
        lineHeight: '26px',
      }}
    >
      <div>
        <strong>Space</strong>
        <div>Launch studio</div>
      </div>
      <div>
        <strong>Status</strong>
        <div>Ready for review</div>
      </div>
    </div>
    <BlockDivider />
    <div style={{ fontSize: 21, lineHeight: '28px' }}>
      <div>• Bring any agent through AG-UI.</div>
      <div>• Give your Dot its own computer.</div>
      <div>• Keep the work in Spaces and Pages.</div>
    </div>
    <div style={{ display: 'flex', gap: 12, marginTop: 15 }}>
      <BlockButton primary>Open page</BlockButton>
      <BlockButton>View in space</BlockButton>
    </div>
    <div style={{ marginTop: 10 }}>
      <BlockContext>Created by Scout · OpenDots</BlockContext>
    </div>
  </div>
);
const Composer = ({
  thread = false,
  typed = '',
  typing = false,
  frame,
}: {
  thread?: boolean;
  typed?: string;
  typing?: boolean;
  frame: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 27,
      right: 27,
      bottom: 24,
      height: thread ? 105 : 125,
      border: '1px solid #616670',
      borderRadius: 9,
      background: '#222529',
      overflow: 'hidden',
    }}
  >
    {!thread && (
      <div
        style={{
          height: 33,
          background: '#292d34',
          padding: '5px 15px',
          color: '#b3b7c0',
          fontSize: 18,
          letterSpacing: 12,
        }}
      >
        <b>B</b> <i>I</i> <u>U</u>
        <span>≡</span>
      </div>
    )}
    <div
      style={{
        padding: '10px 15px 3px',
        height: thread ? 60 : 54,
        fontSize: 22,
        color: typed ? C.fg : '#969ba4',
        whiteSpace: 'nowrap',
      }}
    >
      {typed || (thread ? 'Reply…' : 'Message #launch-studio')}
      {typing && frame % 25 < 15 && (
        <span style={{ borderRight: '2px solid #eee', marginLeft: 1 }} />
      )}
    </div>
    <div
      style={{
        padding: '0 15px',
        display: 'flex',
        alignItems: 'center',
        gap: 17,
        color: '#bcc1ca',
        height: 33,
      }}
    >
      <Icon name="plus" size={21} />
      <span style={{ fontSize: 21 }}>Aa</span>
      <span style={{ fontSize: 25 }}>☺</span>
      <span style={{ fontSize: 23 }}>@</span>
      <div
        style={{
          marginLeft: 'auto',
          background: typed ? '#237950' : 'transparent',
          width: 51,
          height: 31,
          borderRadius: 5,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon name="send" size={21} />
      </div>
    </div>
  </div>
);

const Cursor = ({ frame }: { frame: number }) => {
  const path = [
    { f: 0, x: W.w - 452, y: W.h - 96 },
    { f: 110, x: W.w - 452, y: W.h - 96 },
    { f: 125, x: W.w - 58, y: W.h - 43 },
    { f: 138, x: W.w - 58, y: W.h - 43 },
    { f: 161, x: 450, y: 506 },
    { f: 182, x: 450, y: 506 },
  ];
  let x = path[0].x,
    y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    if (frame >= path[i].f) {
      x = path[i].x;
      y = path[i].y;
      continue;
    }
    const q = ramp(frame, path[i - 1].f, path[i].f);
    x = path[i - 1].x + (path[i].x - path[i - 1].x) * q;
    y = path[i - 1].y + (path[i].y - path[i - 1].y) * q;
    break;
  }
  const click = [B.send, B.clickThread].find(
    (f) => frame >= f && frame < f + 12,
  );
  const q = click === undefined ? 0 : (frame - click) / 12;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 1 - ramp(frame, 185, 200),
      }}
    >
      {click !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: x - 18,
            top: y - 18,
            width: 36,
            height: 36,
            border: '2px solid #eee',
            borderRadius: '50%',
            opacity: 1 - q,
            transform: `scale(${0.4 + q})`,
          }}
        />
      )}
      <svg
        width={25}
        height={33}
        viewBox="0 0 26 33"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          filter: 'drop-shadow(0 2px 3px #0008)',
        }}
      >
        <path
          d="M2 1L22 19L13 20L9 29L2 1Z"
          fill="white"
          stroke="#171717"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export const SlackDotDemo = () => {
  const f = useCurrentFrame();
  const open = ramp(f, B.open, B.open + 24);
  const mainWidth = W.w - W.rail - W.side;
  const channelWidth = mainWidth - W.thread * open;
  const typed =
    f >= B.send
      ? ''
      : ASK.slice(
          0,
          Math.floor(
            interpolate(f, [B.type, B.typed], [0, ASK.length], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          ),
        );
  const resultTop = 347 + (164 - ramp(f, B.save + 14, B.save + 32) * 120);
  const scroll =
    ramp(f, B.result + 8, B.result + 35, 0, 218) +
    ramp(f, B.maya - 5, B.maya + 18, 0, 99) +
    ramp(f, B.alex - 5, B.alex + 18, 0, 65);
  const replies = f >= B.alex ? 4 : f >= B.maya ? 3 : f >= B.result ? 2 : 1;
  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: C.fg,
        background: C.bg,
      }}
    >
      <style>{`*{box-sizing:border-box}`}</style>
      <div
        style={{
          position: 'absolute',
          left: W.x,
          top: W.y,
          width: W.w,
          height: W.h,
          overflow: 'hidden',
          background: C.bg,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 50,
            background: C.rail,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 19,
          }}
        >
          <div
            style={{ position: 'absolute', left: 22, display: 'flex', gap: 8 }}
          >
            {['#e46b63', '#dfb95e', '#65b888'].map((color) => (
              <div
                key={color}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 8,
                  background: color,
                }}
              />
            ))}
          </div>
          <Icon name="clock" size={21} />
          <div
            style={{
              width: 700,
              height: 32,
              border: '1px solid #6b546f',
              borderRadius: 6,
              background: '#44314b',
              color: '#d9cedc',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '0 12px',
              fontSize: 17,
            }}
          >
            <Icon name="search" size={17} />
            Search CopilotKit
          </div>
          <span
            style={{
              position: 'absolute',
              right: 23,
              color: '#c7b9cc',
              fontSize: 20,
            }}
          >
            ?
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 50,
            bottom: 0,
            width: W.rail,
            background: C.rail,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 27,
            paddingTop: 18,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              display: 'grid',
              placeItems: 'center',
              background: '#d6cee5',
              color: '#31273e',
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            C
          </div>
          {[
            ['home', 'Home'],
            ['chat', 'DMs'],
            ['bell', 'Activity'],
            ['more', 'More'],
          ].map(([icon, name], i) => (
            <div key={name} style={{ textAlign: 'center', color: '#d5c9da' }}>
              <div
                style={{
                  padding: 9,
                  borderRadius: 10,
                  height: 42,
                  background: i === 0 ? '#5c4166' : 'transparent',
                }}
              >
                <Icon name={icon} />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{name}</div>
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 20 }}>
            <Avatar person="jerel" size={39} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: W.rail,
            top: 50,
            bottom: 0,
            width: W.side,
            background: C.side,
            borderRight: '1px solid #4c3c53',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '0 18px',
              borderBottom: '1px solid #4a3b50',
              fontSize: 24,
              fontWeight: 750,
            }}
          >
            CopilotKit
            <Icon name="chevron" size={17} />
          </div>
          <div
            style={{
              padding: '17px 18px',
              fontSize: 20,
              lineHeight: 1.85,
              color: '#d1c6d7',
            }}
          >
            <div>◉ &nbsp; Threads</div>
            <div>☷ &nbsp; Drafts & sent</div>
          </div>
          <div style={{ padding: '8px 18px', fontSize: 17, color: '#ac9fb5' }}>
            ⌄ &nbsp; Channels
          </div>
          {['general', 'launch-studio', 'engineering', 'product', 'random'].map(
            (name) => (
              <div
                key={name}
                style={{
                  padding: '9px 18px',
                  fontSize: 19,
                  background:
                    name === 'launch-studio' ? '#245a7e' : 'transparent',
                  color: name === 'launch-studio' ? '#fff' : '#c9bdd1',
                }}
              >
                # &nbsp; {name}
              </div>
            ),
          )}
          <div
            style={{
              padding: '24px 18px 12px',
              fontSize: 17,
              color: '#ac9fb5',
            }}
          >
            ⌄ &nbsp; Direct messages
          </div>
          {['Maya Chen', 'Alex Rivera'].map((name) => (
            <div
              key={name}
              style={{ padding: '8px 18px', color: '#c9bdd1', fontSize: 19 }}
            >
              <span style={{ color: '#65b690', fontSize: 12 }}>●</span> &nbsp;{' '}
              {name}
            </div>
          ))}
          <div
            style={{
              padding: '24px 18px 12px',
              fontSize: 17,
              color: '#ac9fb5',
            }}
          >
            ⌄ &nbsp; Apps
          </div>
          <div
            style={{
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 19,
            }}
          >
            <Avatar person="scout" size={28} />
            Scout
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: W.rail + W.side,
            top: 50,
            bottom: 0,
            width: channelWidth,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 64,
              padding: '0 26px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 26,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: C.muted }}>#</span>launch-studio
            <Icon name="chevron" size={18} />
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: 21,
                color: C.muted,
              }}
            >
              <Icon name="headphones" />
              <Icon name="search" />
            </div>
          </div>
          <div
            style={{
              height: 43,
              padding: '10px 26px',
              borderBottom: `1px solid ${C.border}`,
              color: '#a6abb5',
              fontSize: 17,
            }}
          >
            Messages &nbsp;&nbsp; Files &nbsp;&nbsp; +
          </div>
          <div
            style={{
              position: 'absolute',
              top: 107,
              left: 0,
              right: 0,
              bottom: 166,
              overflow: 'hidden',
              padding: '0 26px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                margin: '18px 0',
                color: '#a2a6af',
                fontSize: 15,
              }}
            >
              <div style={{ height: 1, background: C.border, flex: 1 }} />
              Today
              <div style={{ height: 1, background: C.border, flex: 1 }} />
            </div>
            <div style={{ opacity: 0.66 }}>
              <Message person="alex" time="10:40" compact>
                <span>
                  Release notes are ready.
                  <br />
                  Let’s turn them into the launch brief.
                </span>
              </Message>
            </div>
            {f >= B.send && (
              <div
                style={{ position: 'absolute', top: 183, left: 26, right: 26 }}
              >
                <Enter at={B.send} frame={f}>
                  <Message person="jerel" time="10:41" compact>
                    <div style={{ maxWidth: 990 }}>
                      <Mention /> turn these release notes into a launch brief.
                      Save it to Launch studio and share it here.
                    </div>
                    <Attachment compact />
                    {f >= B.reply && (
                      <div
                        style={{
                          marginTop: 13,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          color: C.link,
                          fontSize: 19,
                        }}
                      >
                        <Avatar person="scout" size={24} />
                        <strong>
                          {replies} {replies === 1 ? 'reply' : 'replies'}
                        </strong>
                        <span style={{ fontSize: 15, color: '#9298a4' }}>
                          Last reply just now
                        </span>
                      </div>
                    )}
                  </Message>
                </Enter>
              </div>
            )}
          </div>
          <Composer
            typed={typed}
            typing={f >= B.type && f < B.send}
            frame={f}
          />
        </div>
        {f >= B.open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 50,
              bottom: 0,
              width: W.thread,
              transform: `translateX(${(1 - open) * W.thread}px)`,
              background: C.bg,
              borderLeft: '1px solid #52505c',
              boxShadow: '-12px 0 35px #0002',
            }}
          >
            <div
              style={{
                height: 64,
                borderBottom: `1px solid ${C.border}`,
                padding: '0 29px',
                display: 'flex',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <strong style={{ fontSize: 27 }}>Thread</strong>
              <span style={{ color: C.muted, fontSize: 20 }}>
                # launch-studio
              </span>
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  gap: 22,
                  color: C.muted,
                }}
              >
                <Icon name="more" />
                <Icon name="close" />
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                top: 64,
                left: 0,
                right: 0,
                bottom: 148,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 30,
                  right: 32,
                  top: 20 - scroll,
                }}
              >
                <Message person="jerel" time="10:41">
                  <Mention /> turn these release notes into a launch brief.
                  <br />
                  Save it to Launch studio and share it here.
                  <Attachment />
                </Message>
                <div
                  style={{
                    position: 'absolute',
                    top: 184,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    color: '#8d939e',
                    fontSize: 16,
                  }}
                >
                  {replies} {replies === 1 ? 'reply' : 'replies'}
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                {f >= B.ack && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 215,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <Enter at={B.ack} frame={f}>
                      <Message person="scout">
                        On it — I’ll read the notes, write the brief, and save a
                        Page.
                        {f >= B.work && (
                          <Enter at={B.work} frame={f}>
                            <WorkBlocks frame={f} />
                          </Enter>
                        )}
                      </Message>
                    </Enter>
                  </div>
                )}
                {f >= B.result && (
                  <div
                    style={{
                      position: 'absolute',
                      top: resultTop,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <Enter at={B.result} frame={f}>
                      <Message person="scout" time="10:43">
                        Done. The launch brief is saved in{' '}
                        <strong>Launch studio</strong>.<PageBlocks />
                        {f >= B.reactions && (
                          <div
                            style={{ display: 'flex', gap: 8, marginTop: 12 }}
                          >
                            <Reaction
                              emoji="🙌"
                              count={3}
                              at={B.reactions}
                              frame={f}
                            />
                            <Reaction
                              emoji="🔥"
                              count={2}
                              at={B.reactions + 12}
                              frame={f}
                            />
                          </div>
                        )}
                      </Message>
                    </Enter>
                  </div>
                )}
                {f >= B.maya && (
                  <div
                    style={{
                      position: 'absolute',
                      top: resultTop + 432,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <Enter at={B.maya} frame={f}>
                      <Message person="maya" time="10:43">
                        This is exactly what we needed. Ready for the launch!
                        {f >= B.reactions + 25 && (
                          <div style={{ display: 'flex', marginTop: 8 }}>
                            <Reaction
                              emoji="💜"
                              count={2}
                              at={B.reactions + 25}
                              frame={f}
                            />
                          </div>
                        )}
                      </Message>
                    </Enter>
                  </div>
                )}
                {f >= B.alex && (
                  <div
                    style={{
                      position: 'absolute',
                      top: resultTop + 557,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <Enter at={B.alex} frame={f}>
                      <Message person="alex" time="10:44">
                        All from this thread. Love it, Scout. 🙌
                      </Message>
                    </Enter>
                  </div>
                )}
              </div>
            </div>
            {f >= B.maya - 35 && f < B.maya && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 135,
                  left: 31,
                  fontSize: 16,
                  color: C.muted,
                }}
              >
                Maya is typing…
              </div>
            )}
            {f >= B.alex - 35 && f < B.alex && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 135,
                  left: 31,
                  fontSize: 16,
                  color: C.muted,
                }}
              >
                Alex is typing…
              </div>
            )}
            <Composer thread frame={f} />
          </div>
        )}
        <Cursor frame={f} />
      </div>
    </AbsoluteFill>
  );
};
