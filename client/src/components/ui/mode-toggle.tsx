import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// Light theme only toggle - no functionality, just shows light theme is active
export function ModeToggle() {
  return (
    <Button variant="outline" size="icon" className="bg-white hover:bg-gray-50 border-gray-200" disabled>
      <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      <span className="sr-only">Light theme active</span>
    </Button>
  );
}