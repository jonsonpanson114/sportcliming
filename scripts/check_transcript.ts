import { getVideoCaptions } from './lib/youtube/transcript';

async function main() {
  const videoId = '3LYd-7IP44A';
  console.log(`Checking transcript for ${videoId}...`);

  try {
    const transcript = await getVideoCaptions(videoId);
    console.log('Transcript length:', transcript.length);
    console.log('Transcript:');
    console.log(transcript);
    console.log('\n---');

    // Check if it looks like description fallback
    if (transcript.includes('\n\n')) {
      console.log('Looks like description fallback (has \\n\\n)');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
