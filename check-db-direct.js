const Database = require('better-sqlite3');

// Open the database file
const db = new Database('dev.db', { readonly: true });

try {
  // Get tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log('--- Tables ---');
  console.log(tables.map(t => t.name).join(', '));

  // Check Video table
  if (tables.some(t => t.name === 'Video')) {
    const videoCount = db.prepare("SELECT COUNT(*) as count FROM Video").get();
    const withSummary = db.prepare("SELECT COUNT(*) as count FROM Video WHERE summary IS NOT NULL").get();
    console.log('\n--- Video Stats ---');
    console.log(`Total Videos: ${videoCount.count}`);
    console.log(`Videos with Summary: ${withSummary.count}`);

    if (videoCount.count > 0) {
      const recent = db.prepare(`
        SELECT title, summary, updatedAt
        FROM Video
        ORDER BY updatedAt DESC
        LIMIT 5
      `).all();
      console.log('\n--- Recent Videos ---');
      recent.forEach((v, i) => {
        console.log(`${i+1}. ${v.title} (Summary: ${v.summary ? 'Yes' : 'No'}, Updated: ${v.updatedAt})`);
      });
    }
  }

  // Check Tip table
  if (tables.some(t => t.name === 'Tip')) {
    const tipCount = db.prepare("SELECT COUNT(*) as count FROM Tip").get();
    console.log(`\n--- Tip Stats ---`);
    console.log(`Total Tips: ${tipCount.count}`);
  }

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
