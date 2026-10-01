import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { SlackDotDemo, SLACK_FRAMES } from './SlackDotDemo';
registerRoot(() => (
  <Composition
    id="OpenDots-Slack-Thread"
    component={SlackDotDemo}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={SLACK_FRAMES}
  />
));
