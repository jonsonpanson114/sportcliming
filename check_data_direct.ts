const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
console.log('DB Path:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });

  console.log('\n=== データベースの状態 ===\n');

  // 動画総数
  const videoCount = db.prepare('SELECT COUNT(*) as count FROM Video').get();
  console.log(`全動画数: ${videoCount.count}`);

  // 要約がある動画
  const withSummary = db.prepare('SELECT COUNT(*) as count FROM Video WHERE summary IS NOT NULL').get();
  console.log(`要約がある動画: ${withSummary.count}`);

  // 要約がない動画
  const withoutSummary = db.prepare('SELECT COUNT(*) as count FROM Video WHERE summary IS NULL').get();
  console.log(`要約がない動画: ${withoutSummary.count}`);

  // コツの数
  const tipCount = db.prepare('SELECT COUNT(*) as count FROM Tip').get();
  console.log(`コツ: ${tipCount.count}`);

  // サンプル動画を取得
  const sampleVideos = db.prepare(`
    SELECT youtubeId, title, summary, summaryData, difficultyLevel, publishedAt
    FROM Video
    WHERE summary IS NOT NULL
    ORDER BY publishedAt DESC
    LIMIT 3
  `).all();

  if (sampleVideos.length > 0) {
    console.log('\n=== 解析済み動画の例 ===\n');
    sampleVideos.forEach((v, i) => {
      console.log(`【動画 ${i + 1}】`);
      console.log(`  タイトル: ${v.title}`);
      console.log(`  YouTube ID: ${v.youtubeId}`);
      console.log(`  難易度: ${v.difficultyLevel || '未設定'}`);
      console.log(`\n  要約:`);
      console.log(`    ${v.summary}`);
      if (v.summaryData) {
        try {
          const data = JSON.parse(v.summaryData);
          console.log(`\n  キーポイント:`);
          data.keyPoints?.forEach((p, idx) => {
            console.log(`    ${idx + 1}. ${p}`);
          });
          console.log(`\n  テクニック:`);
          data.techniques?.forEach((t, idx) => {
            console.log(`    ${idx + 1}. ${t}`);
          });
        } catch (e) {
          console.log('\n  (summaryDataのパースに失敗)');
        }
      }
      console.log('\n' + '='.repeat(50));
    });
  }

  // 未解析の動画
  const unprocessed = db.prepare(`
    SELECT youtubeId, title
    FROM Video
    WHERE summary IS NULL
    LIMIT 3
  `).all();

  if (unprocessed.length > 0) {
    console.log('\n=== 未解析動画 ===\n');
    unprocessed.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.title} (${v.youtubeId})`);
    });
  }

  // コツも表示
  const tips = db.prepare(`
    SELECT title, content, category, difficulty
    FROM Tip
    LIMIT 3
  `).all();

  if (tips.length > 0) {
    console.log('\n=== コツ（Tips） ===\n');
    tips.forEach((t, i) => {
      console.log(`【Tip ${i + 1}】${t.title}`);
      console.log(`  カテゴリ: ${t.category}`);
      console.log(`  難易度: ${t.difficulty || '未設定'}`);
      console.log(`  内容: ${t.content.substring(0, 100)}...`);
      console.log('');
    });
  }

  db.close();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
