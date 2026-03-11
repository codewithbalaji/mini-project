import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import { organizationService } from "@/services/organizationService";

const schema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient();

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: organizationService.getOrganization,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", industry: "" },
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (org) {
      form.reset({ name: org.name, industry: org.industry ?? "" });
    }
  }, [org, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: organizationService.updateOrganization,
    onSuccess: (updated) => {
      queryClient.setQueryData(["organization"], updated);
      toast.success("Organization settings saved");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to save settings"),
  });

  return (
    <div>
      <PageHeader
        title="Organization Settings"
        description="Update your organization's profile."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">General Information</CardTitle>
          <CardDescription>
            This information is visible to all members of your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => mutate(data))}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Technology, Healthcare" {...field} />
                      </FormControl>
                      <FormDescription>Optional. Helps categorize your workspace.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
