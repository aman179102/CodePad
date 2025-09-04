export const codeSnippets: Record<string, string> = {
  javascript: `// Welcome to CodePad!
// Click the run button to execute your code.
// You can save your files locally.

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));`,

  typescript: `// Welcome to CodePad TypeScript!
// Click the run button to execute your code.

function greet(name: string): string {
  return "Hello, " + name + "!";
}

console.log(greet("TypeScript"));`,

  python: `a, b = 10, 20
sum = a + b

print("Hello Python!")
print("Sum =", sum)`,

  java: `public class Main {
    public static void main(String[] args) {
        // Hello World + Sum of 2 numbers
        int a = 10, b = 20;
        int sum = a + b;
        
        System.out.println("Hello Java!");
        System.out.println("Sum = " + sum);
    }
}`,

  c: `#include <stdio.h>

int main() {
    int a = 10, b = 20;
    int sum = a + b;

    printf("Hello C!\\n");
    printf("Sum = %d\\n", sum);

    return 0;
}`,

  'c++': `#include <iostream>
using namespace std;

int main() {
    int a = 10, b = 20;
    int sum = a + b;

    cout << "Hello C++!" << endl;
    cout << "Sum = " << sum << endl;

    return 0;
}`,


  rust: `fn main() {
    let a = 10;
    let b = 20;
    let sum = a + b;

    println!("Hello Rust!");
    println!("Sum = {}", sum);
}`,

  php: `<?php
$a = 10;
$b = 20;
$sum = $a + $b;

echo "Hello PHP!\\n";
echo "Sum = $sum\\n";
?>`,

  ruby: `a, b = 10, 20
sum = a + b

puts "Hello Ruby!"
puts "Sum = #{sum}"`,

  kotlin: `fun main() {
    val a = 10
    val b = 20
    val sum = a + b

    println("Hello Kotlin!")
    println("Sum = $sum")
}`,

  r: `a <- 10
b <- 20
sum <- a + b

cat("Hello R!\\n")
cat("Sum =", sum, "\\n")`,

  bash: `#!/bin/bash

a=10
b=20
sum=$((a + b))

echo "Hello Bash!"
echo "Sum = $sum"`
};

export function getSnippetForLanguage(language: string): string {
  return codeSnippets[language] || codeSnippets.javascript;
}
