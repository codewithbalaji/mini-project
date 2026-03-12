import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  otp: z.string().length(6, "Enter the 6-digit verification code"),
});

type FormData = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const state = location.state as { userId: string; email: string } | null;

  useEffect(() => {
    if (!state?.userId) {
      navigate("/register", { replace: true });
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      authService.verifyEmail({ userId: state?.userId ?? "", otp: data.otp }),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      toast.success("Email verified! Welcome aboard.");
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Verification failed");
    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () => authService.resendOtp({ userId: state?.userId ?? "" }),
    onSuccess: () => toast.success("New verification code sent to your email"),
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Could not resend code"),
  });

  if (!state?.userId) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <div className="flex justify-center mb-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Mail className="h-7 w-7" />
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{state.email}</span>
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    className="text-center text-2xl font-mono tracking-widest h-14"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </Form>

      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={() => resend()}
            disabled={isResending}
            className="text-indigo-500 hover:underline font-medium disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Code expires in 30 minutes
        </p>
      </div>
    </div>
  );
}
