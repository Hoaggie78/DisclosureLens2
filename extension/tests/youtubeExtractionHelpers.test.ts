import assert from 'node:assert/strict';
import {
  cleanGenericYouTubeDescription,
  extractShortsChannelNameFromText,
} from '../src/content/youtubeExtractionHelpers.ts';

assert.equal(
  cleanGenericYouTubeDescription(
    'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
  ),
  null,
);

assert.equal(cleanGenericYouTubeDescription('AI Videos is getting CRAZY 😵‍💫 #shorts'), 'AI Videos is getting CRAZY 😵‍💫 #shorts');

assert.equal(
  extractShortsChannelNameFromText(
    'Skip navigation\nSign in\nHome\nShorts\nSubscriptions\nYou\n@itssimannn\nSubscribe\nAI Videos is getting SCARY 😵‍💫 #shorts',
  ),
  '@itssimannn',
);

assert.equal(extractShortsChannelNameFromText('Skip navigation\nSign in\nHome'), null);

console.log('youtubeExtractionHelpers tests passed');
