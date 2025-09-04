import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Terminal, FileInput } from "lucide-react";
import Editor from "./Editor";
import InputPanel from "./InputPanel";
import OutputConsole from "./Console";

interface MobileTabsProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onDetectLanguage: () => void;
  isDetecting: boolean;
  input: string;
  onInputChange: (input: string) => void;
  onClearInput: () => void;
  output: string[];
}

export default function MobileTabs({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onDetectLanguage,
  isDetecting,
  input,
  onInputChange,
  onClearInput,
  output,
}: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileInput className="h-4 w-4" />
            <span className="hidden sm:inline">Input</span>
          </TabsTrigger>
          <TabsTrigger value="console" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">Console</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 mt-0">
          <Editor
            code={code}
            onCodeChange={onCodeChange}
            language={language}
            onLanguageChange={onLanguageChange}
            onDetectLanguage={onDetectLanguage}
            isDetecting={isDetecting}
          />
        </TabsContent>
        
        <TabsContent value="input" className="flex-1 mt-0">
          <InputPanel
            input={input}
            onInputChange={onInputChange}
            onClearInput={onClearInput}
          />
        </TabsContent>
        
        <TabsContent value="console" className="flex-1 mt-0">
          <OutputConsole output={output} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
