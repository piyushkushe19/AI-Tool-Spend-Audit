import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TOOL_DISPLAY_NAMES,
  TOOL_PLANS,
  USE_CASE_LABELS,
} from "@/lib/utils";
import type { AuditInput } from "@/types";

const STORAGE_KEY = "spendlens_form_v2";

const toolSchema = z.object({
  id: z.string(),
  tool: z.string().min(1),
  plan: z.string().min(1),
  monthlySpend: z.coerce.number().min(0, "Must be ≥ 0").max(100000),
  seats: z.coerce.number().int().min(1, "Min 1 seat").max(10000),
});

const formSchema = z.object({
  tools: z.array(toolSchema).min(1, "Add at least one tool"),
  teamSize: z.coerce.number().int().min(1, "Min 1").max(100000),
  useCase: z.enum(["coding", "writing", "research", "mixed", "data_analysis"]),
});

type FormValues = z.infer<typeof formSchema>;

interface SpendFormProps {
  onSubmit: (input: AuditInput) => void;
  isLoading: boolean;
}

const TOOL_KEYS = Object.keys(TOOL_DISPLAY_NAMES);

export function SpendForm({ onSubmit, isLoading }: SpendFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tools: [{ id: uuidv4(), tool: "cursor", plan: "pro", monthlySpend: 0, seats: 1 }],
      teamSize: 5,
      useCase: "coding",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tools" });

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: FormValues = JSON.parse(saved);
        if (parsed.tools?.length) {
          setValue("tools", parsed.tools);
          setValue("teamSize", parsed.teamSize ?? 5);
          setValue("useCase", parsed.useCase ?? "coding");
        }
      }
    } catch {/* ignore */}
  }, [setValue]);

  // Persist to localStorage
  const watched = watch();
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watched)); } catch {/* ignore */}
  }, [watched]);

  const onFormSubmit = (values: FormValues) => onSubmit(values as AuditInput);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Global settings */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Total team size
              </label>
              <input
                {...register("teamSize")}
                type="number"
                min={1}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g. 12"
              />
              {errors.teamSize && (
                <p className="mt-1 text-xs text-red-500">{errors.teamSize.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Primary use case
              </label>
              <div className="relative">
                <select
                  {...register("useCase")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                >
                  {Object.entries(USE_CASE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Column headers (desktop) */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50/50 dark:bg-transparent border-b border-gray-100 dark:border-gray-700">
          <div className="col-span-3">Tool</div>
          <div className="col-span-3">Plan</div>
          <div className="col-span-3">Monthly spend</div>
          <div className="col-span-2">Seats</div>
          <div className="col-span-1" />
        </div>

        {/* Tool rows */}
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {fields.map((field, index) => {
            const currentTool = watch(`tools.${index}.tool`);
            const plans = TOOL_PLANS[currentTool] ?? [];

            return (
              <div
                key={field.id}
                className="p-4 sm:p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 items-start"
              >
                {/* Tool */}
                <div className="sm:col-span-3">
                  <label className="sm:hidden block text-xs text-gray-400 mb-1">Tool</label>
                  <div className="relative">
                    <select
                      {...register(`tools.${index}.tool`)}
                      onChange={(e) => {
                        setValue(`tools.${index}.tool`, e.target.value as any);
                        const firstPlan = TOOL_PLANS[e.target.value]?.[0]?.value ?? "";
                        setValue(`tools.${index}.plan`, firstPlan);
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                    >
                      {TOOL_KEYS.map((key) => (
                        <option key={key} value={key}>{TOOL_DISPLAY_NAMES[key]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Plan */}
                <div className="sm:col-span-3">
                  <label className="sm:hidden block text-xs text-gray-400 mb-1">Plan</label>
                  <div className="relative">
                    <select
                      {...register(`tools.${index}.plan`)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                    >
                      {plans.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.tools?.[index]?.plan && (
                    <p className="mt-1 text-xs text-red-500">{errors.tools[index]?.plan?.message}</p>
                  )}
                </div>

                {/* Monthly spend */}
                <div className="sm:col-span-3">
                  <label className="sm:hidden block text-xs text-gray-400 mb-1">Monthly spend ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                    <input
                      {...register(`tools.${index}.monthlySpend`)}
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-6 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.tools?.[index]?.monthlySpend && (
                    <p className="mt-1 text-xs text-red-500">{errors.tools[index]?.monthlySpend?.message}</p>
                  )}
                </div>

                {/* Seats */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden block text-xs text-gray-400 mb-1">Seats</label>
                  <input
                    {...register(`tools.${index}.seats`)}
                    type="number"
                    min={1}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1"
                  />
                  {errors.tools?.[index]?.seats && (
                    <p className="mt-1 text-xs text-red-500">{errors.tools[index]?.seats?.message}</p>
                  )}
                </div>

                {/* Remove */}
                <div className="sm:col-span-1 flex items-center justify-end sm:justify-center pt-0 sm:pt-0.5">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                      aria-label="Remove tool"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add tool */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() =>
              append({
                id: uuidv4(),
                tool: "chatgpt",
                plan: "plus",
                monthlySpend: 0,
                seats: 1,
              })
            }
            className="w-full flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-500 font-medium py-2.5 border border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add another tool
          </button>
          {errors.tools?.root && (
            <p className="mt-2 text-xs text-red-500 text-center">{errors.tools.root.message}</p>
          )}
        </div>

        {/* Submit footer */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Data stays private. We never sell it.
          </p>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing…
              </>
            ) : (
              "Run free audit →"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
