import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error Message Component
 * Display error states with retry option
 */
export function ErrorMessage({
  title = "Error",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="font-medium text-destructive">{title}</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline Error Message (smaller variant)
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
