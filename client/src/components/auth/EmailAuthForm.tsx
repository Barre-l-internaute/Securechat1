import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailAuthFormProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

export function EmailAuthForm({ onSubmit, isLoading }: EmailAuthFormProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (data: EmailFormData) => {
    onSubmit(data.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Welcome to SecureChat</h1>
          <p className="text-muted-foreground">
            Ultra-secure messaging with complete privacy. Enter your email to get started.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      className="h-12"
                      data-testid="input-email"
                      autoFocus
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
              data-testid="button-continue"
            >
              {isLoading ? "Sending code..." : "Continue with Email"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>No phone number required. No tracking. No ads.</p>
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
