import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OutputConsoleProps {
  output: string[];
}

export default function OutputConsole({ output }: OutputConsoleProps) {
  return (
    <Card className="flex-1 flex flex-col h-full bg-card/50 border shadow-none">
      <CardHeader className="p-2 sm:p-4 border-b">
        <div className="text-lg font-semibold font-headline">Console</div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative">
        <ScrollArea className="absolute inset-0 w-full h-full">
          <pre className="p-4 font-code text-sm text-accent whitespace-pre-wrap break-words">
            {output.length > 0 ? output.join("\n") : <span className="text-muted-foreground">Output will appear here...</span>}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
