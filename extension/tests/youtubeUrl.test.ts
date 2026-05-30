import assert from 'node:assert/strict';
import { isSupportedYouTubeVideoUrl } from '../src/shared/youtubeUrl.ts';

assert.equal(isSupportedYouTubeVideoUrl('https://www.youtube.com/watch?v=symK56rhKeU&t=775s'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://youtube.com/watch?v=symK56rhKeU'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://www.youtube.com/shorts/abc123XYZ'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://youtube.com/shorts/abc123XYZ?feature=share'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://m.youtube.com/watch?v=symK56rhKeU'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://m.youtube.com/shorts/abc123XYZ'), true);
assert.equal(isSupportedYouTubeVideoUrl('https://www.youtube.com/feed/subscriptions'), false);
assert.equal(isSupportedYouTubeVideoUrl('https://example.com/watch?v=symK56rhKeU'), false);
assert.equal(isSupportedYouTubeVideoUrl(undefined), false);

console.log('youtubeUrl tests passed');
