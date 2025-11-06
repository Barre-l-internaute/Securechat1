import { Shield, Plus, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  id: string;
  username: string;
  avatarUrl?: string;
  status?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
}

interface AppSidebarProps {
  currentUser: {
    id: string;
    username: string;
    avatarUrl?: string;
    status?: string;
  };
  contacts: Contact[];
  selectedContactId?: string;
  onSelectContact: (contactId: string) => void;
  onAddContact: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function AppSidebar({
  currentUser,
  contacts,
  selectedContactId,
  onSelectContact,
  onAddContact,
  onSettings,
  onLogout,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Shield className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="text-lg font-semibold text-sidebar-foreground truncate">
              SecureChat
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onAddContact}
            data-testid="button-add-contact"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <SidebarMenu>
                {contacts.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="text-xs mt-2">Add a contact to start chatting</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <SidebarMenuItem key={contact.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectContact(contact.id)}
                        isActive={selectedContactId === contact.id}
                        className="h-18 px-3 py-3 gap-3 hover-elevate active-elevate-2"
                        data-testid={`contact-${contact.id}`}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contact.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {contact.unread && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">
                              {contact.username}
                            </span>
                            {contact.lastMessageTime && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {contact.lastMessageTime}
                              </span>
                            )}
                          </div>
                          {contact.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {contact.lastMessage}
                            </p>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            {currentUser.avatarUrl && <AvatarImage src={currentUser.avatarUrl} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.username}</p>
            {currentUser.status && (
              <p className="text-xs text-muted-foreground truncate">{currentUser.status}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="flex-1"
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
