import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, CheckCircle2 } from "lucide-react";

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

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => setSubmitted(true),
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Something went wrong"),
  });

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            If that email is registered, you&apos;ll receive a password reset
            link shortly. The link expires in 1 hour.
          </p>
        </div>
        <Link
          to="/login"
          className="block text-sm text-indigo-500 hover:underline font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex justify-center mb-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <KeyRound className="h-7 w-7" />
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-center">
          Forgot your password?
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/login" className="text-indigo-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
