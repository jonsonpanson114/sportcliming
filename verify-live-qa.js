async function verifyLive() {
  const url = 'https://sportcliming.vercel.app/api/qa';
  const question = "ダイノのコツを教えて";

  console.log(`Calling live API: ${url}`);
  console.log(`Question: ${question}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();
    console.log('\n--- Answer from Live Coach ---');
    console.log(data.answer);
    console.log('\nSources:', data.sources);
    
    if (data.answer.includes('呼吸') || data.answer.includes('バネ') || data.answer.includes('足')) {
      console.log('\n✅ Specific advice detected!');
    } else {
      console.log('\n⚠️ Advice might still be generic.');
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

verifyLive();
