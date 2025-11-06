import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Lock, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  contact: {
    username: string;
    avatarUrl?: string;
    status?: string;
  };
  onOpenMenu?: () => void;
}

export function ChatHeader({ contact, onOpenMenu }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-background sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 flex-shrink-0">
          {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
          <AvatarFallback className="bg-primary/10 text-primary">
            {contact.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground truncate" data-testid="text-contact-name">
            {contact.username}
          </h2>
          {contact.status && (
            <p className="text-xs text-muted-foreground truncate">{contact.status}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypted</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          data-testid="button-chat-menu"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
