// src/variables.ts
// ===============================
// 🎯 基本の型（number, string, boolean）
// ===============================

// 明示的に型を指定
let age: number = 40;
let name: string = "Takuya";
let isEngineer: boolean = true;

// 型推論も自動で働く
let message = "TypeScript is fun!";

// 出力確認
console.log("👤 名前:", name);
console.log("🎂 年齢:", age);
console.log("💼 エンジニア:", isEngineer);
console.log("💬 メッセージ:", message);