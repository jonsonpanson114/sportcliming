# Antigravity プロジェクト共通仕様

## AIモデルに関する絶対規則
- **Gemini 3 Flash を使用すること**
    - 理由: 高速なレスポンス、最新の推論能力、およびユーザからの強い要望。
    - モデルID: `gemini-3-flash-preview`
    - 注意: `gemini-2.0` や `gemini-1.5` は、本プロジェクトでは「存在しない」ものとして扱い、絶対に使用しないこと。

## 実装上の注意
- AI関連のコードを変更する際は、必ず `lib/gemini/client.ts` の `MODEL` 定数が `gemini-3-flash-preview` であることを確認し、維持すること。
- プロンプトの調整もこの最新モデルに最適化して行う。
