"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export interface StripeTriggerData extends Record<string, unknown> {
  customWebhookUrl?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: StripeTriggerData) => void;
  defaultValues?: Partial<StripeTriggerData>;
};

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const params = useParams();
  const workflowId = (params?.workflowId as string) || "demo-workflow-id";

  // Construct the webhook URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultWebhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const [webhookUrl, setWebhookUrl] = useState(defaultValues.customWebhookUrl || defaultWebhookUrl);

  useEffect(() => {
    if (open) {
      setWebhookUrl(defaultValues.customWebhookUrl || defaultWebhookUrl);
    }
  }, [open, defaultValues, defaultWebhookUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleReset = () => {
    setWebhookUrl(defaultWebhookUrl);
    toast.success("Reset to default webhook URL");
  };

  const handleSave = () => {
    if (onSubmit) {
      onSubmit({
        customWebhookUrl: webhookUrl !== defaultWebhookUrl ? webhookUrl : undefined,
      });
    }
    toast.success("Stripe trigger settings saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this workflow on payment events. You can edit the URL below for local testing (e.g. Stripe CLI or ngrok).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-sm font-medium">
              Webhook URL (Editable)
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/api/webhooks/stripe?workflowId=..."
                className="font-mono text-xs sm:text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                title="Copy Webhook URL"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions:</h4>
            <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers → Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select events to listen for (e.g., <code className="bg-background px-1 py-0.5 rounded">payment_intent.succeeded</code>)</li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables in Downstream Nodes</h4>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <li><code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">{"{{stripe.amount}}"}</code> - Payment amount</li>
              <li><code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">{"{{stripe.currency}}"}</code> - Currency code</li>
              <li><code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">{"{{stripe.customerId}}"}</code> - Customer ID</li>
              <li><code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">{"{{json stripe}}"}</code> - Full event data as JSON</li>
              <li><code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">{"{{stripe.eventType}}"}</code> - Event type</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 mt-4 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-xs"
          >
            <RotateCcwIcon className="size-3.5 mr-1.5" />
            Reset to Default
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="text-xs sm:text-sm"
          >
            <SaveIcon className="size-3.5 mr-1.5" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
