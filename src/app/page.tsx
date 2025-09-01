"use client";

import { useState, useEffect } from "react";
import type { CodeFile } from "@/types";
import { detectLanguageAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import CodePadHeader from "@/components/codepad/Header";
import Editor from "@/components/codepad/Editor";
import OutputConsole from "@/components/codepad/Console";
import { FileSaveDialog, FileOpenDialog } from "@/components/codepad/FileManagement";

const defaultCode = `// Welcome to CodePad!
// Click the run button to execute your code.
// You can save your files locally.

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
`;

export default function Home() {
  const [code, setCode] = useState<string>(defaultCode);
  const [output, setOutput] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("javascript");
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem("codepad_files");
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      }
    } catch (error) {
      console.error("Failed to load files from local storage", error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: "Could not load files from local storage.",
      });
    }
  }, [toast]);

  const handleRunCode = () => {
    setOutput([]);
    const capturedLogs: string[] = [];
    const oldLog = console.log;
    console.log = (...args: any[]) => {
      capturedLogs.push(
        args.map((arg) => {
          try {
            if (typeof arg === 'object' && arg !== null) {
              return JSON.stringify(arg, null, 2);
            }
            return String(arg);
          } catch {
            return String(arg);
          }
        }).join(" ")
      );
    };

    try {
      switch (language) {
        case "javascript":
          try {
            // Using a sandboxed function to execute the code
            new Function(code)();
          } catch (e: any) {
            capturedLogs.push(`Error: ${e.message}`);
          }
          break;
        case "python":
          capturedLogs.push("Simulating Python execution...");
          capturedLogs.push("This is a UI demo and does not actually run Python code.");
          break;
        default:
          capturedLogs.push(`Execution for '${language}' is not supported.`);
      }
    } catch (error: any) {
      capturedLogs.push(`Error: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message,
      });
    } finally {
      setOutput(capturedLogs);
      console.log = oldLog;
    }
  };

  const handleSaveFile = (fileName: string) => {
    try {
      const newFile: CodeFile = { name: fileName, content: code, language, lastModified: Date.now() };
      let updatedFiles = [...files];
      const existingFileIndex = files.findIndex((f) => f.name === fileName);

      if (existingFileIndex > -1) {
        updatedFiles[existingFileIndex] = newFile;
      } else {
        updatedFiles.push(newFile);
      }
      
      setFiles(updatedFiles);
      localStorage.setItem("codepad_files", JSON.stringify(updatedFiles));
      setActiveFile(fileName);
      setIsSaveDialogOpen(false);
    } catch (error) {
       console.error("Failed to save file", error);
       toast({
        variant: "destructive",
        title: "Error saving file",
        description: "Could not save file to local storage.",
      });
    }
  };

  const handleLoadFile = (file: CodeFile) => {
    setCode(file.content);
    setLanguage(file.language);
    setActiveFile(file.name);
    setIsOpenDialogOpen(false);
  };

  const handleNewFile = () => {
    setCode("");
    setLanguage("javascript");
    setOutput([]);
    setActiveFile(null);
  };
  
  const handleDetectLanguage = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Empty code",
        description: "Cannot detect language of empty code snippet.",
      });
      return;
    }
    setIsDetecting(true);
    try {
      const result = await detectLanguageAction({ code });
      if (result && result.language) {
        const detectedLang = result.language.toLowerCase().split(' ')[0];
        const supportedLangs = ["javascript", "python", "html", "css", "typescript", "json"];
        if(supportedLangs.includes(detectedLang)) {
          setLanguage(detectedLang);
        } else {
            setLanguage("plaintext");
        }
      } else {
        throw new Error("Could not determine language.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <CodePadHeader
        onNew={handleNewFile}
        onOpen={() => setIsOpenDialogOpen(true)}
        onSave={() => setIsSaveDialogOpen(true)}
        onRun={handleRunCode}
        activeFile={activeFile}
      />
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 lg:w-3/5 min-w-0">
          <Editor
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            onDetectLanguage={handleDetectLanguage}
            isDetecting={isDetecting}
          />
        </div>
        <div className="flex-1 flex flex-col gap-4 lg:w-2/5 min-w-0 h-full">
          <OutputConsole output={output} />
        </div>
      </main>

      <FileSaveDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveFile}
        defaultFileName={activeFile}
      />
      <FileOpenDialog
        isOpen={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        files={files}
        onLoad={handleLoadFile}
        setFiles={setFiles}
      />
    </div>
  );
}
