import { getVideoById } from './lib/youtube/client';

async function main() {
  const video = await getVideoById('K4xO6fN6qXk');

  if (video) {
    console.log('=== YouTube APIから取得した情報 ===\n');
    console.log(`Title: ${video.title}`);
    console.log(`\nDescription length: ${video.description?.length || 0}`);
    console.log(`\nFull Description:\n${video.description}`);
  } else {
    console.log('Video not found');
  }
}

main().catch(console.error);
