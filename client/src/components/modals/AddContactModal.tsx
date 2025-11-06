import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { QrCode, Link as LinkIcon, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const inviteSchema = z.object({
  invitationCode: z.string().min(1, "Please enter an invitation code"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onAddContact: (invitationCode: string) => void;
  myInvitationCode: string;
  isLoading?: boolean;
}

export function AddContactModal({
  open,
  onClose,
  onAddContact,
  myInvitationCode,
  isLoading,
}: AddContactModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invitationCode: "",
    },
  });

  const handleSubmit = (data: InviteFormData) => {
    onAddContact(data.invitationCode);
    form.reset();
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/invite/${myInvitationCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with someone to add them as a contact.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-add-contact">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Contact</DialogTitle>
          <DialogDescription>
            Add contacts securely using invitation codes. No phone numbers required.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" data-testid="tab-add-contact">
              Add Contact
            </TabsTrigger>
            <TabsTrigger value="share" data-testid="tab-share-code">
              My Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="invitationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter invitation code"
                          className="h-12 font-mono"
                          data-testid="input-invitation-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading}
                  data-testid="button-submit-contact"
                >
                  {isLoading ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </Form>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Or scan a QR code (coming soon)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-48 w-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                    <p className="text-xs text-muted-foreground">(Coming soon)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Invitation Code</label>
                <div className="flex gap-2">
                  <Input
                    value={myInvitationCode}
                    readOnly
                    className="h-12 font-mono text-center text-lg"
                    data-testid="text-my-code"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 flex-shrink-0"
                    onClick={handleCopyLink}
                    data-testid="button-copy-code"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                <LinkIcon className="h-5 w-5 mr-2" />
                {copied ? "Link Copied!" : "Copy Invitation Link"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Share this code or link with someone you trust to add them as a contact.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
