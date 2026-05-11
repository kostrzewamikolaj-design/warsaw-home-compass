import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export function ExportPdfButton({ targetId }: { targetId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        const el = document.getElementById(targetId);
        if (!el) return;
        toast.info("Generating PDF…");
        try {
          const canvas = await html2canvas(el, {
            backgroundColor: "#1a1f2e",
            scale: 2,
            useCORS: true,
          });
          const img = canvas.toDataURL("image/png");
          const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const ratio = canvas.height / canvas.width;
          const w = pageW - 32;
          const h = Math.min(w * ratio, pageH - 32);
          pdf.addImage(img, "PNG", 16, 16, w, h);
          pdf.save("rent-vs-buy.pdf");
          toast.success("PDF saved");
        } catch (e) {
          console.error(e);
          toast.error("PDF export failed");
        }
      }}
    >
      <FileDown className="h-4 w-4" />
      PDF
    </Button>
  );
}
