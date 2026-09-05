import { ReactNode, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InfoHint } from '@/components/common/InfoHint';
import { Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChartFrameProps {
  title: string;
  /** Short explanation shown in the (i) hint. */
  hint?: string;
  /** Right-hand side controls (selects, toggles). */
  actions?: ReactNode;
  /** Small line under the title, e.g. sample size. */
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Serialises the first SVG inside the node into a PNG download. */
async function downloadChart(node: HTMLElement | null, name: string) {
  const svg = node?.querySelector('svg');
  if (!svg) {
    toast.error('This chart cannot be downloaded yet.');
    return;
  }
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  clone.setAttribute('width', String(Math.max(rect.width, 400)));
  clone.setAttribute('height', String(Math.max(rect.height, 260)));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const styles = getComputedStyle(document.body);
  const bg = styles.getPropertyValue('background-color') || '#ffffff';
  const data = new XMLSerializer().serializeToString(clone);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('render failed'));
    img.src = url;
  }).catch(() => { /* handled below */ });

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(rect.width, 400) * scale;
  canvas.height = Math.max(rect.height, 260) * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx || !img.width) {
    toast.error('Could not create the image.');
    return;
  }
  ctx.fillStyle = bg.includes('rgb') ? bg : '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Card shell every report chart sits in: title, hint, expand and image download. */
export function ChartFrame({ title, hint, actions, meta, className, children }: ChartFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm flex items-center gap-1.5">
              {title}
              {hint && <InfoHint label={hint} />}
            </CardTitle>
            {meta && <div className="text-[11px] text-muted-foreground mt-0.5">{meta}</div>}
          </div>
          <div className="flex items-center gap-1.5">
            {actions}
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Download as image" onClick={() => downloadChart(ref.current, title)}>
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Expand" onClick={() => setOpen(true)}>
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={ref}>{children}</CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{title}</span>
              <Button variant="outline" size="sm" className="gap-1.5 me-8" onClick={() => downloadChart(bigRef.current, title)}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div ref={bigRef} className="h-[60vh]">{children}</div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
