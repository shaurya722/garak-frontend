// src/components/log/LogDetailDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/lib/utils';
import { Log } from '@/types';

interface LogDetailDialogProps {
  log: Log | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailDialog({ log, open, onOpenChange }: LogDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Log ID</label>
              <p className="text-sm font-mono break-all">{log.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={log.status === 'pass' ? 'default' : 'destructive'}>
                {log.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Policy Name</label>
              <p className="text-sm">{log.policyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="text-sm">{formatDate(log.createdAt)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">User Prompt</label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{log.userPrompt}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
