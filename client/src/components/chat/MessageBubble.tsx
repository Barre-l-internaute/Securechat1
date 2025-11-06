import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  id: string;
  content: string;
  sentAt: Date;
  isSent: boolean;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ id, content, sentAt, isSent, onDelete }: MessageBubbleProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3 group`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      data-testid={`message-${id}`}
    >
      <div className={`flex items-end gap-2 max-w-[65%] ${isSent ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`px-4 py-3 ${
            isSent
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
              : "bg-card text-card-foreground rounded-2xl rounded-bl-md border border-card-border"
          }`}
        >
          <p className="text-[15px] leading-relaxed break-words">{content}</p>
          <p
            className={`text-xs mt-1.5 ${
              isSent ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            {format(sentAt, "HH:mm")}
          </p>
        </div>

        {showDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(id)}
            data-testid={`button-delete-${id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
