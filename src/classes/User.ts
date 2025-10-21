// src/classes/User.ts
class User {
  constructor(public name: string, private age: number) {}

  introduce(): void {
    console.log(`👋 Hi, I'm ${this.name}. I'm ${this.age} years old.`);
  }
}

const user = new User("Takuya", 40);
user.introduce();