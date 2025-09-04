
"use client";

import { useState, useEffect } from "react";
import type { CodeFile } from "@/types";
import { detectLanguageAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { getSnippetForLanguage } from "@/utils/codeSnippets";

import CodePadHeader from "@/components/codepad/Header";
import Editor from "@/components/codepad/Editor";
import OutputConsole from "@/components/codepad/Console";
import InputPanel from "@/components/codepad/InputPanel";
import MobileTabs from "@/components/codepad/MobileTabs";
import { FileSaveDialog, FileOpenDialog } from "@/components/codepad/FileManagement";

export default function Home() {
  const [code, setCode] = useState<string>(getSnippetForLanguage("javascript"));
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
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

  const handleRunCode = async () => {
    setOutput(['Executing code...']);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result = await response.json();
      
      // Combine output and error messages
      const combinedOutput = [
        ...(result.output || []).filter((line: string) => line.trim() !== ''),
        ...(result.error || []).filter((line: string) => line.trim() !== '').map((line: string) => `Error: ${line}`)
      ];
      
      setOutput(combinedOutput.length > 0 ? combinedOutput : ['Code executed successfully.']);
    } catch (error: any) {
      console.error('Execution error:', error);
      setOutput([`Error: ${error.message || 'Failed to execute code'}`]);
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message || 'Failed to execute code',
      });
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
    setCode(getSnippetForLanguage("javascript"));
    setLanguage("javascript");
    setOutput([]);
    setInput("");
    setActiveFile(null);
  };

  const handleClearInput = () => {
    setInput("");
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Always load snippet when switching languages (unless there's an active file)
    if (!activeFile) {
      setCode(getSnippetForLanguage(newLanguage));
    }
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
        const supportedLangs = [
          "javascript", "typescript", "python", "java", "c", "c++", "c#", 
          "go", "rust", "php", "ruby", "kotlin", "r", "bash"
        ];
        
        // Handle common language variations
        let normalizedLang = detectedLang;
        if (detectedLang === "js") normalizedLang = "javascript";
        if (detectedLang === "ts") normalizedLang = "typescript";
        if (detectedLang === "py") normalizedLang = "python";
        if (detectedLang === "cpp" || detectedLang === "cxx") normalizedLang = "c++";
        if (detectedLang === "csharp") normalizedLang = "c#";
        if (detectedLang === "golang") normalizedLang = "go";
        if (detectedLang === "shell" || detectedLang === "sh") normalizedLang = "bash";
        
        if(supportedLangs.includes(normalizedLang)) {
          setLanguage(normalizedLang);
        } else {
          setLanguage("javascript"); // Default to JavaScript instead of plaintext
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
      {/* Mobile Layout - Tab Switching */}
      <main className="flex-1 lg:hidden p-4 overflow-hidden">
        <MobileTabs
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={handleLanguageChange}
          onDetectLanguage={handleDetectLanguage}
          isDetecting={isDetecting}
          input={input}
          onInputChange={setInput}
          onClearInput={handleClearInput}
          output={output}
        />
      </main>

      {/* Desktop Layout - Side by Side */}
      <main className="hidden lg:grid lg:grid-cols-3 gap-4 p-4 overflow-hidden flex-1">
        <div className="flex flex-col min-h-0 min-w-0 lg:col-span-2">
          <Editor
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onDetectLanguage={handleDetectLanguage}
            isDetecting={isDetecting}
          />
        </div>
        <div className="flex flex-col gap-4 min-h-0 min-w-0">
          <div className="flex-1">
            <InputPanel
              input={input}
              onInputChange={setInput}
              onClearInput={handleClearInput}
            />
          </div>
          <div className="flex-1">
            <OutputConsole output={output} />
          </div>
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
