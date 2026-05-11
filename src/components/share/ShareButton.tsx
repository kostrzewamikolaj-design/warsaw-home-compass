import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useCalcStore } from "@/store/useCalcStore";
import { encodeSettings } from "@/lib/urlState";
import { toast } from "sonner";

export function ShareButton() {
  const settings = useCalcStore((s) => s.settings);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const hash = encodeSettings(settings);
        const url = `${window.location.origin}${window.location.pathname}#${hash}`;
        window.history.replaceState(null, "", `#${hash}`);
        navigator.clipboard.writeText(url).then(
          () => toast.success("Link copied", { description: "Share-ready URL on your clipboard." }),
          () => toast.error("Couldn't copy"),
        );
      }}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}
