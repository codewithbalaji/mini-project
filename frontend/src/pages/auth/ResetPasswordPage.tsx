import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

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

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      authService.resetPassword(token!, { password: data.password }),
    onSuccess: () => {
      toast.success("Password reset successfully. You can now sign in.");
      navigate("/login");
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Reset link is invalid or has expired"
      ),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex justify-center mb-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <ShieldCheck className="h-7 w-7" />
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-center">
          Create new password
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Your new password must be at least 6 characters.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Resetting password..." : "Reset password"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link to="/login" className="text-indigo-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
