// src/classes/Engineer.ts

class User {
  constructor(
    public name: string,
    protected age: number
  ) {}

  introduce(): void {
    console.log(`👋 Hi, I'm ${this.name}. I'm ${this.age} years old.`);
  }
}

class Engineer extends User {
  constructor(
    name: string,
    age: number,
    private languages: string[],
    private role: string,
    private project: string
  ) {
    super(name, age);
  }

  code(): void {
    const langs = this.languages.join(', ');
    console.log(`💻 ${this.name} is coding in ${langs}.`);
  }

  describeWork(): void {
    console.log(`🛠 ${this.name} is a ${this.role} working on ${this.project}.`);
  }

  birthday(): void {
    console.log(`🎂 ${this.name} will turn ${this.age + 1} next year.`);
  }
}

// 実行例
const engineer = new Engineer(
  'Takuya',
  40,
  ['TypeScript', 'Go'],
  'Backend Engineer',
  'AI-powered workflow optimizer'
);

engineer.introduce(); // 👋 Hi, I'm Takuya. I'm 40 years old.
engineer.code(); // 💻 Takuya is coding in TypeScript, Go.
engineer.describeWork(); // 🛠 Takuya is a Backend Engineer working on AI-powered workflow optimizer.
engineer.birthday(); // 🎂 Takuya will turn 41 next year.
