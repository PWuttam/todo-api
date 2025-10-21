type TimeOfDay = "morning" | "afternoon" | "evening";
type Language = "en" | "ja";

function detectTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function greet(name: string, options?: { time?: TimeOfDay; language?: Language }): string {
  const now = new Date();
  const time: TimeOfDay = options?.time ?? detectTimeOfDay(now);
  const language: Language = options?.language ?? "en";

  const greetings: Record<Language, Record<TimeOfDay, string>> = {
    en: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    ja: {
      morning: "おはようございます",
      afternoon: "こんにちは",
      evening: "こんばんは",
    },
  };

  return `${greetings[language][time]}, ${name}!`;
}

console.log(greet("Takuya")); // 時間帯と言語は自動判定（例: "Good morning, Takuya!"）
console.log(greet("Takuya", { language: "ja" })); // 日本語で時間帯自動判定（例: "おはようございます, Takuya!"）
console.log(greet("Takuya", { time: "evening", language: "en" })); // 明示的に指定（例: "Good evening, Takuya!"）