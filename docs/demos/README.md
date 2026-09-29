# Recorded walkthroughs

Recorded from the local OpenDots app on September 29, 2026. The recordings use a dedicated `opendots` Intelligence project, a live `gpt-5.4-mini` model, and example content in a separate Launch studio Space. No customer data or credentials are shown.

| Recording                                    | Flow                                                                                         | Duration     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------ |
| [Specialist chat](specialist-chat.mp4)       | Select Scout, send a launch-planning question, receive a live response                       | 12.5 seconds |
| [Spaces and page chat](spaces-page-chat.mp4) | Create a page, insert a heading with the block menu, write a brief, ask about the saved page | 20 seconds   |

The README embeds compact GIF versions. MP4 versions are included for playback and reuse. These are screen-capture walkthroughs, with pauses between recording segments omitted; no assistant responses are fabricated or replaced. The captures are sampled at four frames per second, so they are intended to show workflows rather than animation performance. They have no audio.

## What was verified

- The provided model credential authenticated successfully.
- A dedicated hosted Intelligence project and project-scoped runtime key were provisioned through the CopilotKit CLI.
- Specialist chat returned a live model response.
- The page assistant received the saved document context and returned relevant milestones.
- The launch brief remained saved after a browser reload.
- The page conversation and its model response reloaded from Intelligence after refreshing the browser.

Slack, realtime calls, and Dot computers are not demonstrated. Their service configuration and live checks remain separate. A successful text demo does not establish those integrations work.

## Re-recording

Use a separate example Space and specialist. Verify the model and Intelligence connection before recording. Keep Settings, environment files, credential pages, and unrelated windows out of the capture. Record the actual app, inspect every segment, and update the verification date and scope when replacing the assets. Never replace failed or missing responses with scripted output.
