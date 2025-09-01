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
    <header className="flex items-center h-16 px-4 border-b shrink-0 z-10 bg-background">
      <div className="flex items-center gap-2">
        <Code2 className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight font-headline">CodePad</h1>
      </div>
      {activeFile && (
        <>
          <Separator orientation="vertical" className="h-6 mx-4" />
          <span className="text-sm text-muted-foreground truncate max-w-xs">{activeFile}</span>
        </>
      )}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={onNew} aria-label="New File">
          <FilePlus2 />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpen} aria-label="Open File">
          <FolderOpen />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSave} aria-label="Save File">
          <Save />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button onClick={onRun}>
          <Play className="mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Run</span>
        </Button>
      </div>
    </header>
  );
}
