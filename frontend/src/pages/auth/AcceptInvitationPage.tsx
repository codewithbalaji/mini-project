import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BrainCircuit } from "lucide-react";

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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      authService.acceptInvitation(token!, {
        name: data.name,
        password: data.password,
      }),
    onSuccess: ({ user, token: authToken }) => {
      setAuth(user, authToken);
      toast.success("Welcome to the team!");
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Invalid or expired invitation link"
      );
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrainCircuit className="h-10 w-10 text-indigo-500" />
          <h2 className="text-2xl font-bold tracking-tight">Accept Invitation</h2>
          <p className="text-sm text-muted-foreground">
            Set up your account to join the organization
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Setting up account..." : "Join Organization"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
