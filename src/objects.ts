// src/objects.ts
// ===============================
// 🎯 オブジェクトと interface の基本
// ===============================

// 型のテンプレート（インターフェース）
interface User {
  name: string;
  age: number;
  isEngineer: boolean;
}

// オブジェクトを型に沿って作成
const user: User = {
  name: "Takuya",
  age: 40,
  isEngineer: true,
};

// プロパティにアクセス
console.log("👤 ユーザー情報:", user);
console.log("名前:", user.name);
console.log("年齢:", user.age);
console.log("エンジニア:", user.isEngineer);