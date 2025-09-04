import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InputPanelProps {
  input: string;
  onInputChange: (input: string) => void;
  onClearInput: () => void;
}

export default function InputPanel({ input, onInputChange, onClearInput }: InputPanelProps) {
  return (
    <Card className="flex-1 flex flex-col h-full bg-card/50 border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-2 sm:p-4 border-b">
        <div className="text-lg font-semibold font-headline">Input</div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClearInput}
          className="h-8 w-8"
          title="Clear Input"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter input for your program here..."
          className="absolute inset-0 w-full h-full p-4 font-code text-base bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Program Input"
        />
      </CardContent>
    </Card>
  );
}
