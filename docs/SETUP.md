# Running the template

OpenDots runs a React app and a Node server. The server stores pages, Space and Dot configuration, and thread bindings in SQLite and connects to your configured conversation, model, and messaging services.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://127.0.0.1:5173. The API runs on port 4310. Without service credentials, the app shows its setup state; it does not generate simulated replies.

For a built local app:

```sh
npm run build
npm start
```

Open http://127.0.0.1:4310. Keep the server running for background work.

## Conversation services

Edit `.env` on the server and restart after changes:

| Variable                                      | Purpose                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| `INTELLIGENCE_API_KEY`                        | Project credential for conversation persistence           |
| `INTELLIGENCE_API_URL`, `INTELLIGENCE_WS_URL` | Endpoint overrides for your Intelligence deployment       |
| `OPENAI_API_KEY`, `OPENAI_MODEL`              | Model credential and model identifier                     |
| `OPENAI_BASE_URL`                             | Compatible model API endpoint                             |
| `OWNER_ID`                                    | Stable identity used for this deployment's conversations  |
| `DATABASE_PATH`                               | SQLite file containing pages, workspace and work metadata |
| `OWNER_TOKEN`                                 | Application access token; required for external bindings  |
| `APP_ORIGIN`                                  | Exact browser origin when using a proxy or custom domain  |

The model environment variable names follow the configured provider adapter. Provider credentials belong in `.env`, not client-side variables or source code. Conversation history lives in the configured Intelligence project; copying the SQLite file alone does not back up that history.

## Pages and page conversations

Select a Space to open its document workspace. Create a page or subpage, edit its title and Markdown, preview the result, and save. Pages can move under another page in the same Space. Manual editing works without conversation credentials.

Open a page's chat and choose a specialist from that Space. The server creates or reuses a CopilotKit Thread for that page and specialist. The Dot receives the current saved page as context and can read, create, and edit pages in its own Space. Save your manual edits before asking it to revise the document. Revision checks reject stale writes; a conflict keeps your local draft available for recovery.

Use the conversation's save-to-page action to create a document from its saved text history. This requires a working conversation service. Pages retain a link to the source conversation, and page links in chat open the document workspace.

Back up both storage layers: SQLite contains page content and thread bindings; the Intelligence project contains conversation history. The template does not include multi-user page sharing, realtime collaboration, file uploads, or arbitrary interactive embeds.

## Browser tool

The browser service reads a supplied public URL and returns page text and a capture. Configure `BROWSER_URL` and `BROWSER_SECRET`, then run:

```sh
npx playwright install chromium
npm run browser
```

Use the same secret on the app and browser processes. Browser navigation is read-only with JavaScript disabled. Private addresses, redirects, and authenticated pages are unsupported; provide a canonical public URL. This is a bounded research tool, not a general desktop or shell.

## Slack

Provision a managed Slack connection for your Intelligence project, then configure:

- `SLACK_CHANNEL_NAME`: the Channels SDK declaration name, matching the Intelligence channel code.
- `SLACK_TEAM_ID`: the permitted Slack workspace.
- `SLACK_USER_IDS`: the explicitly permitted Slack users, separated by commas.
- `SLACK_DOT_ID`: the Specialist Dot handling the channel; defaults to the initial Dot. Find Dot IDs in the authenticated `/api/workspace` response.

These are configuration identifiers, not Slack bot tokens. Use the [Channels SDK documentation](https://github.com/CopilotKit/channels-sdk) for managed connection setup. Verify the selected Dot and audience before using private workspace context in Slack.

## Calls

The included speech adapter uses the Realtime API at `api.openai.com`. Set `VOICE_API_KEY` to a key with access to that API and `VOICE_MODEL` to a supported Realtime model; `VOICE_NAME` selects the voice. `OPENAI_BASE_URL` changes the compute model endpoint only, not speech. Calls use browser microphone access and WebRTC. Hosted deployments need HTTPS. The server mediates provider setup and delegates compute to the selected Dot's conversation.

A configured key is not evidence of a successful call. Verify microphone access, audio playback, compute delegation, interruption, hangup, and the saved receipt with your deployment before relying on voice workflows.

## Containers

Set `OWNER_TOKEN` and `BROWSER_SECRET` to different random secrets of at least 24 characters in `.env`, then run:

```sh
docker compose up --build -d
```

Open http://localhost:4310. The app port binds to loopback; the browser service has no published port. Application metadata lives in the `opendots-data` volume.

```sh
# Stop services while retaining saved data.
docker compose down
```

For remote hosting, configure an HTTPS reverse proxy and the matching `APP_ORIGIN`. See [Security](../SECURITY.md) for the template's deployment boundary.

## Development checks

```sh
npm run check-format
npm run lint
npm run typecheck
npm test
npm run build
```

Automated tests use service fixtures. Live model, Intelligence, Slack, and voice verification requires your own configured services.
