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
import { Textarea } from "@/components/ui/textarea";
import { CopyIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

export interface GoogleFormTriggerData extends Record<string, unknown> {
  customWebhookUrl?: string;
  customScript?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: GoogleFormTriggerData) => void;
  defaultValues?: Partial<GoogleFormTriggerData>;
};

export const GoogleFormTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const params = useParams();
  const workflowId = (params?.workflowId as string) || "demo-workflow-id";

  // Construct the default webhook URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultWebhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

  const [webhookUrl, setWebhookUrl] = useState(defaultValues.customWebhookUrl || defaultWebhookUrl);
  const [scriptContent, setScriptContent] = useState(
    defaultValues.customScript || generateGoogleFormScript(defaultValues.customWebhookUrl || defaultWebhookUrl)
  );

  // Sync state when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      const currentUrl = defaultValues.customWebhookUrl || defaultWebhookUrl;
      setWebhookUrl(currentUrl);
      setScriptContent(defaultValues.customScript || generateGoogleFormScript(currentUrl));
    }
  }, [open, defaultValues, defaultWebhookUrl]);

  const handleUrlChange = (newUrl: string) => {
    setWebhookUrl(newUrl);
    // Dynamically regenerate script with the new URL unless custom script was modified extensively
    setScriptContent(generateGoogleFormScript(newUrl));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const copyScriptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      toast.success("Script copied to clipboard");
    } catch {
      toast.error("Failed to copy script to clipboard");
    }
  };

  const handleReset = () => {
    setWebhookUrl(defaultWebhookUrl);
    setScriptContent(generateGoogleFormScript(defaultWebhookUrl));
    toast.success("Reset to default URL and script");
  };

  const handleSave = () => {
    if (onSubmit) {
      onSubmit({
        customWebhookUrl: webhookUrl,
        customScript: scriptContent,
      });
    }
    toast.success("Google Form trigger settings saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form's Apps Script to trigger
            this workflow when a form is submitted. You can edit the URL or customize the script below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-sm font-medium">
              Webhook URL (Editable for local testing / ngrok / custom domain)
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://your-domain.com/api/webhooks/google-form?workflowId=..."
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
              <li>Open your Google Form</li>
              <li>Click the three dots menu → Script editor</li>
              <li>Copy and paste the script below into the Google Apps Script editor</li>
              <li>Save the project and click "Triggers" (alarm clock icon) → Add Trigger</li>
              <li>Choose: function <code className="bg-background px-1 py-0.5 rounded">onFormSubmit</code> → From form → On form submit → Save</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Google Apps Script (Interactive & Editable):</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyScriptToClipboard}
              >
                <CopyIcon className="size-4 mr-2" />
                Copy Script
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can view, edit, and add custom Javascript/Apps Script logic directly below:
            </p>
            <Textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="font-mono text-xs min-h-[220px] bg-background/90"
              placeholder="function onFormSubmit(e) { ... }"
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables in Downstream Nodes</h4>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">
                  {"{{googleForm.respondentEmail}}"}
                </code>
                {" "}- Respondent's email address
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">
                  {"{{googleForm.responses['Question Name']}}"}
                </code>
                {" "}- Specific answer by question title
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">
                  {"{{json googleForm.responses}}"}
                </code>{" "}
                - All form responses formatted as JSON
              </li>
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
