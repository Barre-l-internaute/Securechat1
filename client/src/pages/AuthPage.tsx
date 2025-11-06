import { useState } from "react";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { ProfileSetupForm } from "@/components/auth/ProfileSetupForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

type AuthStep = "email" | "verify" | "profile" | "login-verify";

interface ProfileData {
  username: string;
  password: string;
  status?: string;
}

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const sendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/auth/send-code", { email });
    },
    onSuccess: () => {
      toast({
        title: "Code sent!",
        description: "Check your email for the verification code.",
      });
      setStep("verify");
    },
    onError: (error: any) => {
      const message = error.message || "Failed to send verification code";
      
      if (message.includes("already registered")) {
        setStep("login-verify");
        toast({
          title: "Welcome back!",
          description: "Enter the verification code sent to your email.",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/auth/verify-code", { email, code });
    },
    onSuccess: (data: any) => {
      if (data.needsProfile) {
        toast({
          title: "Email verified!",
          description: "Now let's set up your profile.",
        });
        setStep("profile");
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        setLocation("/chat");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      return await apiRequest("POST", "/api/auth/complete-registration", {
        email,
        ...data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile created!",
        description: "Welcome to SecureChat.",
      });
      setLocation("/chat");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = (emailAddress: string) => {
    setEmail(emailAddress);
    sendCodeMutation.mutate(emailAddress);
  };

  const handleVerifyCode = (code: string) => {
    verifyCodeMutation.mutate(code);
  };

  const handleProfileSetup = (data: ProfileData) => {
    createProfileMutation.mutate(data);
  };

  const handleResend = () => {
    sendCodeMutation.mutate(email);
  };

  const handleBack = () => {
    setStep("email");
    setEmail("");
  };

  if (step === "email") {
    return (
      <EmailAuthForm
        onSubmit={handleEmailSubmit}
        isLoading={sendCodeMutation.isPending}
      />
    );
  }

  if (step === "verify" || step === "login-verify") {
    return (
      <VerifyCodeForm
        email={email}
        onSubmit={handleVerifyCode}
        onResend={handleResend}
        onBack={handleBack}
        isLoading={verifyCodeMutation.isPending}
      />
    );
  }

  if (step === "profile") {
    return (
      <ProfileSetupForm
        onSubmit={handleProfileSetup}
        isLoading={createProfileMutation.isPending}
      />
    );
  }

  return null;
}
