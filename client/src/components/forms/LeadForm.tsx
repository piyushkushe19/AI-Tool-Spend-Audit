import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveLead } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.coerce.number().int().min(1).optional(),
  website: z.string().max(0, "").optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

interface LeadFormProps {
  auditId: string;
  totalMonthlySavings: number;
  isOptimized: boolean;
  onSuccess: () => void;
}

export function LeadForm({ auditId, totalMonthlySavings, isOptimized, onSuccess }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    if (values.website) return; // honeypot
    setIsSubmitting(true);
    setError(null);
    try {
      await saveLead({
        auditId,
        email: values.email,
        companyName: values.companyName,
        role: values.role,
        teamSize: values.teamSize,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {isOptimized ? "Get notified when better options appear" : "Email me this report"}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {isOptimized
          ? "We'll ping you if pricing changes or better alternatives emerge for your stack."
          : "We'll send your full audit breakdown and follow up when further savings are available."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Honeypot - invisible to real users */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
          <input {...register("website")} type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register("companyName")}
            type="text"
            placeholder="Company (optional)"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            {...register("role")}
            type="text"
            placeholder="Role (optional)"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
          ) : (
            "Send me the report"
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">No spam. Unsubscribe anytime.</p>
      </form>
    </div>
  );
}
