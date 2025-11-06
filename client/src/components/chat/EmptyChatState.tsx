import { MessageSquare, Shield } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Select a conversation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Choose a contact from the sidebar to start a secure, encrypted conversation.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>All messages are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
