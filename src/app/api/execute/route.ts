import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
}

interface ExecuteResponse {
  output: string[];
  error: string[];
  success: boolean;
}

interface LanguageConfig {
  extension: string;
  command: string;
  args: (...args: string[]) => string[];
  runCommand?: string | ((path: string) => string);
  runArgs?: (arg: string) => string[];
  needsCompilation?: boolean;
  needsProject?: boolean;
}

// Language configurations
const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: (filePath: string) => [filePath],
  },
  typescript: {
    extension: '.ts',
    command: 'tsx',
    args: (filePath: string) => [filePath],
  },
  python: {
    extension: '.py',
    command: 'python3',
    args: (filePath: string) => [filePath],
  },
  java: {
    extension: '.java',
    command: 'javac',
    args: (filePath: string) => [filePath],
    runCommand: 'java',
    runArgs: (className: string) => [className],
    needsCompilation: true,
  },
  c: {
    extension: '.c',
    command: 'gcc',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  'c++': {
    extension: '.cpp',
    command: 'g++',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath, '-std=c++14'],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  rust: {
    extension: '.rs',
    command: 'rustc',
    args: (filePath: string, outputPath: string) => [filePath, '-o', outputPath],
    runCommand: (outputPath: string) => outputPath,
    needsCompilation: true,
  },
  php: {
    extension: '.php',
    command: 'php',
    args: (filePath: string) => [filePath],
  },
  ruby: {
    extension: '.rb',
    command: 'ruby',
    args: (filePath: string) => [filePath],
  },
  kotlin: {
    extension: '.kt',
    command: 'kotlinc',
    args: (filePath: string, outputPath: string) => [filePath, '-include-runtime', '-d', outputPath],
    runCommand: 'java',
    runArgs: (jarPath: string) => ['-jar', jarPath],
    needsCompilation: true,
  },
  r: {
    extension: '.r',
    command: 'Rscript',
    args: (filePath: string) => [filePath],
  },
  bash: {
    extension: '.sh',
    command: 'bash',
    args: (filePath: string) => [filePath],
  },
};

function executeCommand(command: string, args: string[], cwd?: string, input?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const process = spawn(command, args, { 
      cwd,
      shell: true,
      timeout: 30000, // 30 second timeout
    });
    
    let stdout = '';
    let stderr = '';
    
    // Send input to the process if provided
    if (input && process.stdin) {
      process.stdin.write(input);
      process.stdin.end();
    }
    
    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code || 0 });
    });
    
    process.on('error', (error) => {
      // Handle command not found errors gracefully
      if (error.message.includes('ENOENT')) {
        resolve({ 
          stdout, 
          stderr: `Error: Command '${command}' not found. This language runtime may not be installed on the server.\nAvailable commands: node, python3, java, gcc, g++, php, ruby, tsx, go, rustc, kotlinc, dotnet, bash, Rscript`, 
          exitCode: 127 
        });
      } else {
        resolve({ stdout, stderr: error.message, exitCode: 1 });
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, input }: ExecuteRequest = await request.json();
    
    if (!code || !language) {
      return NextResponse.json(
        { error: ['Code and language are required'], output: [], success: false },
        { status: 400 }
      );
    }
    
    const config = languageConfigs[language as keyof typeof languageConfigs];
    if (!config) {
      return NextResponse.json(
        { error: [`Language '${language}' is not supported`], output: [], success: false },
        { status: 400 }
      );
    }
    
    // Create temporary directory
    const tempDir = join(tmpdir(), `codepad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    mkdirSync(tempDir, { recursive: true });
    
    try {
      const fileName = `main${config.extension}`;
      const filePath = join(tempDir, fileName);
      
      // Handle C# project setup
      if (config.needsProject && language === 'c#') {
        // Create a simple console project
        const projectResult = await executeCommand('dotnet', ['new', 'console', '--force'], tempDir);
        if (projectResult.exitCode !== 0) {
          return NextResponse.json({
            error: ['Failed to create C# project: ' + projectResult.stderr],
            output: [],
            success: false
          });
        }
        
        // Write the code to Program.cs
        writeFileSync(join(tempDir, 'Program.cs'), code);
      } else {
        // Write code to file
        writeFileSync(filePath, code);
      }
      
      let result: { stdout: string; stderr: string; exitCode: number };
      
      if (config.needsCompilation) {
        // Compilation step
        let outputPath: string;
        let compileArgs: string[];
        
        if (language === 'java') {
          // Extract class name from code for Java
          const classNameMatch = code.match(/public\s+class\s+(\w+)/);
          const className = classNameMatch ? classNameMatch[1] : 'Main';
          const javaFileName = `${className}.java`;
          const javaFilePath = join(tempDir, javaFileName);
          
          // Write Java code with correct filename
          writeFileSync(javaFilePath, code);
          
          // Java compilation
          compileArgs = config.args(javaFilePath);
          result = await executeCommand(config.command, compileArgs, tempDir);
          
          if (result.exitCode !== 0) {
            return NextResponse.json({
              error: result.stderr.split('\n').filter(line => line.trim()),
              output: [],
              success: false
            });
          }
          
          // Run Java
          result = await executeCommand(config.runCommand as string, config.runArgs!(className), tempDir, input);
        } else if (language === 'kotlin') {
          // Kotlin compilation
          outputPath = join(tempDir, 'main.jar');
          compileArgs = config.args(filePath, outputPath);
          result = await executeCommand(config.command, compileArgs, tempDir);
          
          if (result.exitCode !== 0) {
            return NextResponse.json({
              error: result.stderr.split('\n').filter(line => line.trim()),
              output: [],
              success: false
            });
          }
          
          // Run Kotlin
          result = await executeCommand(config.runCommand as string, config.runArgs!(outputPath), tempDir, input);
        } else {
          // C/C++/Rust compilation
          outputPath = join(tempDir, 'main');
          compileArgs = config.args(filePath, outputPath);
          result = await executeCommand(config.command, compileArgs, tempDir);
          
          if (result.exitCode !== 0) {
            return NextResponse.json({
              error: result.stderr.split('\n').filter(line => line.trim()),
              output: [],
              success: false
            });
          }
          
          // Run compiled binary
          const runCmd = typeof config.runCommand === 'function' ? config.runCommand(outputPath) : config.runCommand!;
          result = await executeCommand(runCmd, [], tempDir, input);
        }
      } else {
        // Direct execution
        const args = config.args(filePath);
        result = await executeCommand(config.command, args, tempDir, input);
      }
      
      const output = result.stdout.split('\n').filter(line => line.trim());
      const error = result.stderr.split('\n').filter(line => line.trim());
      
      return NextResponse.json({
        output,
        error,
        success: result.exitCode === 0
      });
      
    } finally {
      // Cleanup temporary files
      try {
        const { execSync } = require('child_process');
        execSync(`rm -rf "${tempDir}"`, { timeout: 5000 });
      } catch (cleanupError) {
        console.error('Failed to cleanup temp directory:', cleanupError);
      }
    }
    
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { 
        error: ['Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')], 
        output: [], 
        success: false 
      },
      { status: 500 }
    );
  }
}
