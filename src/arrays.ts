// src/arrays.ts
// ===============================
// 🎯 配列と型
// ===============================

// 文字列の配列
let tasks: string[] = [
  "Setup TypeScript",
  "Learn Basics",
  "Commit Changes",
];

// 要素追加
tasks.push("Close issue #27");

// 配列をループで出力
console.log("📝 今日のタスク:");
for (const task of tasks) {
  console.log(" -", task);
}

// number の配列（型を変更）
let scores: number[] = [95, 88, 76];
console.log("🎯 スコア平均:", scores.reduce((a, b) => a + b) / scores.length);