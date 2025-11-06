import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { useState } from "react";

const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.string().max(100, "Status must be at most 100 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

export function ProfileSetupForm({ onSubmit, isLoading }: ProfileSetupFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      password: "",
      status: "",
    },
  });

  const handleSubmit = (data: ProfileFormData) => {
    onSubmit(data);
  };

  const username = form.watch("username");
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold text-foreground">Create Your Profile</h1>
          <p className="text-muted-foreground">
            Set up your identity. You can always change this later.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-32 w-32">
              {avatarPreview && <AvatarImage src={avatarPreview} />}
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {initials || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover-elevate active-elevate-2 border border-primary-border"
              data-testid="button-upload-avatar"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="johndoe"
                      className="h-12"
                      data-testid="input-username"
                      autoFocus
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    This is how others will find you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="h-12"
                      data-testid="input-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Status (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What's on your mind?"
                      className="resize-none"
                      rows={2}
                      data-testid="input-status"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
              data-testid="button-create-profile"
            >
              {isLoading ? "Creating..." : "Create Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
