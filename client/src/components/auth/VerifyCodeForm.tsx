import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, ArrowLeft } from "lucide-react";

const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyCodeFormProps {
  email: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function VerifyCodeForm({ email, onSubmit, onResend, onBack, isLoading }: VerifyCodeFormProps) {
  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = (data: VerifyFormData) => {
    onSubmit(data.code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="h-12 text-center text-2xl font-mono tracking-widest"
                      data-testid="input-code"
                      autoFocus
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
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
              data-testid="button-verify"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <button
            onClick={onResend}
            className="text-sm text-primary hover:underline"
            data-testid="button-resend"
          >
            Didn't receive the code? Resend
          </button>
        </div>
      </div>
    </div>
  );
}
