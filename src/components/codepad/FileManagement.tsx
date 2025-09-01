"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CodeFile } from "@/types";
import { File, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface FileSaveDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (fileName: string) => void;
  defaultFileName?: string | null;
}

export function FileSaveDialog({
  isOpen,
  onOpenChange,
  onSave,
  defaultFileName,
}: FileSaveDialogProps) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (defaultFileName) {
        setFileName(defaultFileName);
      } else {
        setFileName("");
      }
    }
  }, [defaultFileName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      onSave(fileName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save File</DialogTitle>
            <DialogDescription>
              Enter a name for your file. If the name already exists, it will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                Filename
              </Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="col-span-3"
                placeholder="my-awesome-script.js"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


interface FileOpenDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  files: CodeFile[];
  onLoad: (file: CodeFile) => void;
  setFiles: (files: CodeFile[]) => void;
}

export function FileOpenDialog({
  isOpen,
  onOpenChange,
  files,
  onLoad,
  setFiles,
}: FileOpenDialogProps) {
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    try {
      const updatedFiles = files.filter(f => f.name !== fileName);
      setFiles(updatedFiles);
      localStorage.setItem("codepad_files", JSON.stringify(updatedFiles));
    } catch(error) {
      console.error("Failed to delete file", error);
       toast({
        variant: "destructive",
        title: "Error deleting file",
        description: "Could not delete file from local storage.",
      });
    }
  };

  const sortedFiles = [...files].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open File</DialogTitle>
          <DialogDescription>
            Select a file to load into the editor.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96 -mx-6 px-6">
          <div className="flex flex-col gap-1 py-2">
            {sortedFiles.length > 0 ? (
              sortedFiles.map((file) => (
                <div key={file.name} className="flex items-center gap-2 group rounded-md hover:bg-muted/50"
                  onClick={() => onLoad(file)}
                >
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start gap-2 h-auto py-2"
                  >
                    <File className="h-5 w-5 mt-1 self-start shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.language} &middot; modified {file.lastModified ? formatDistanceToNow(file.lastModified, { addSuffix: true }) : 'N/A'}
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                    onClick={(e) => handleDelete(e, file.name)}
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No saved files.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
