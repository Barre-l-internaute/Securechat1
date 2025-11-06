import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyChatState } from "@/components/chat/EmptyChatState";
import { AddContactModal } from "@/components/modals/AddContactModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { User, Contact as ContactType, Message } from "@shared/schema";

interface ContactWithUser extends ContactType {
  contact: User;
}

export default function ChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: contacts = [] } = useQuery<ContactWithUser[]>({
    queryKey: ["/api/contacts"],
    enabled: !!currentUser,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedContactId],
    enabled: !!selectedContactId,
  });

  const selectedContact = contacts.find((c) => c.contactId === selectedContactId);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/messages", {
        receiverId: selectedContactId,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (invitationCode: string) => {
      return await apiRequest("POST", "/api/contacts", { invitationCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsAddContactOpen(false);
      toast({
        title: "Contact added!",
        description: "You can now start chatting.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("DELETE", `/api/messages/${messageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
      toast({
        title: "Message deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      setLocation("/");
      return;
    }
    
    if (!currentUser) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [currentUser, selectedContactId, setLocation, isLoadingUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    setLocation("/");
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const contactsWithDetails = contacts.map((contact) => ({
    id: contact.contactId,
    username: contact.contact.username,
    avatarUrl: contact.contact.avatarUrl || undefined,
    status: contact.contact.status || undefined,
  }));

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentUser={{
            id: currentUser.id,
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl || undefined,
            status: currentUser.status || undefined,
          }}
          contacts={contactsWithDetails}
          selectedContactId={selectedContactId || undefined}
          onSelectContact={setSelectedContactId}
          onAddContact={() => setIsAddContactOpen(true)}
          onSettings={() => {}}
          onLogout={handleLogout}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 p-2 border-b border-border bg-background sticky top-0 z-20">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>

          {selectedContact ? (
            <div className="flex-1 flex flex-col min-h-0">
              <ChatHeader
                contact={{
                  username: selectedContact.contact.username,
                  avatarUrl: selectedContact.contact.avatarUrl || undefined,
                  status: selectedContact.contact.status || undefined,
                }}
              />

              <ScrollArea className="flex-1 px-6">
                <div className="max-w-4xl mx-auto py-6 space-y-1">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-12">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        id={message.id}
                        content={message.content}
                        sentAt={new Date(message.sentAt)}
                        isSent={message.senderId === currentUser.id}
                        onDelete={
                          message.senderId === currentUser.id
                            ? deleteMessageMutation.mutate
                            : undefined
                        }
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <MessageInput
                onSendMessage={(content) => sendMessageMutation.mutate(content)}
                disabled={sendMessageMutation.isPending}
              />
            </div>
          ) : (
            <EmptyChatState />
          )}
        </div>

        <AddContactModal
          open={isAddContactOpen}
          onClose={() => setIsAddContactOpen(false)}
          onAddContact={addContactMutation.mutate}
          myInvitationCode={currentUser.invitationCode}
          isLoading={addContactMutation.isPending}
        />
      </div>
    </SidebarProvider>
  );
}
