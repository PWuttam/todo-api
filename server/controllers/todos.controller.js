// server/controllers/todos.controller.js

// ============================================
// 🔹 役割：クライアントから来るリクエストを受け取り、
//   検証 → サービス呼び出し → 結果を返す、という流れを担当する
// ============================================

// express-validator: リクエスト内容をチェックするためのライブラリ
import { body, validationResult } from "express-validator";

// サービス層をインポート（DBとのやり取りはすべてここで実行）
import * as todoService from "../services/todos.service.js";


// ============================================
// 🔸 1. 入力チェック（バリデーションルール）
// ============================================

// 新規作成用
export const validateCreate = [
  body("title") // titleフィールドを確認
    .isString() // 文字列であること
    .trim() // 余計な空白を除去
    .notEmpty() // 空でないこと
    .withMessage("title is required"), // 条件を満たさなければエラーメッセージ

  body("status") // statusフィールドは任意
    .optional()
    .isIn(["pending", "in-progress", "completed"]), // 許可された文字列だけ
];

// 更新用
export const validateUpdate = [
  body("title").optional().isString().trim().notEmpty(),
  body("status").optional().isIn(["pending", "in-progress", "completed"]),
];


// ============================================
// 🔸 2. 共通バリデーションチェック
// ============================================
// ↑ のルールを通った後で、実際に問題があるか確認する関数。
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // エラーがある場合はHTTP 400（Bad Request）で返す
    return res.status(400).json({
      error: "Validation error",
      details: errors.array(),
    });
  }
  // 問題がなければ次の処理へ
  next();
};


// ============================================
// 🔸 3. CREATE（新しいTodoを追加）
// ============================================
export const createTodo = async (req, res) => {
  try {
    // サービス層に実際の作成処理を依頼
    const todo = await todoService.createTodo(req.body);
    // 成功したら 201（Created）で返す
    res.status(201).json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};


// ============================================
// 🔸 4. READ（Todo一覧を取得）
// ============================================
export const getTodos = async (req, res, next) => {
  try {
    // クエリパラメータから検索条件や並び順、ページ番号などを取得
    const { status, tag, q, sort = "createdAt:desc", page = "1", limit = "20" } = req.query;

    // ページネーション処理
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    // 並び替え対象フィールドを制限
    const allowSort = new Set(["createdAt", "updatedAt", "dueDate", "title", "status"]);
    const [rawField, rawDir] = String(sort).split(":");
    const sortField = allowSort.has(rawField) ? rawField : "createdAt";
    const sortDir = rawDir === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortDir };

    // 検索条件を組み立て
    const query = {};
    if (status) query.status = status;
    if (tag) {
      const tags = String(tag)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (tags.length) query.tags = { $in: tags };
    }
    if (q && String(q).trim()) {
      query.title = { $regex: String(q).trim(), $options: "i" };
    }

    // サービス層からデータ取得
    const { items, total } = await todoService.getTodos(query, { sortObj, pageNum, limitNum });

    // 結果を整形して返す
    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      sort: `${sortField}:${sortDir === 1 ? "asc" : "desc"}`,
      filters: { status: status || null, tag: tag || null, q: q || null },
    });
  } catch (e) {
    next(e); // エラーハンドラに渡す
  }
};


// ============================================
// 🔸 5. UPDATE（既存Todoを更新）
// ============================================
export const updateTodo = async (req, res) => {
  try {
    const updated = await todoService.updateTodo(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};


// ============================================
// 🔸 6. DELETE（Todoを削除）
// ============================================
export const deleteTodo = async (req, res) => {
  const deleted = await todoService.deleteTodo(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  // 削除成功時は 204 No Content
  res.status(204).end();
};