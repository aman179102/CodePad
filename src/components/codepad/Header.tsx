import { Play, Save, FolderOpen, FilePlus2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CodePadHeaderProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onRun: () => void;
  activeFile: string | null;
}

export default function CodePadHeader({ onNew, onOpen, onSave, onRun, activeFile }: CodePadHeaderProps) {
  return (
    <header className="flex items-center h-16 px-2 md:px-4 border-b shrink-0 z-10 bg-background">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={onRun} aria-label="Run Code">
            <Play />
          </Button>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Code2 className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight font-headline">CodePad</h1>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center items-center px-2 min-w-0">
        {activeFile && (
          <span className="text-sm text-muted-foreground truncate" title={activeFile}>{activeFile}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onNew} aria-label="New File">
          <FilePlus2 />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpen} aria-label="Open File">
          <FolderOpen />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSave} aria-label="Save File">
          <Save />
        </Button>
        <div className="hidden md:flex items-center">
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button onClick={onRun}>
            <Play className="mr-2" />
            <span>Run</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
