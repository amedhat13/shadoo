import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, updateVisit } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, Check, X, RefreshCw } from 'lucide-react';

export default function AgentPhotoCapture() {
  const { visitId, taskId } = useParams();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  const task = mission?.photoTasks.find((p) => p.id === taskId);
  if (!visit || !mission || !task) return null;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const usePhoto = () => {
    updateVisit(visit.id, { photos: { ...(visit.photos || {}), [task.id]: preview || task.sample } });
    nav(`/agent-app/active/${visit.id}`);
  };

  const useSample = () => {
    // Demo shortcut — use the sample image as the "captured" photo
    updateVisit(visit.id, { photos: { ...(visit.photos || {}), [task.id]: task.sample } });
    nav(`/agent-app/active/${visit.id}`);
  };

  return (
    <>
      <AgentTopBar title={task.title} showBack />
      <div className="p-4 pb-28 space-y-4">
        <div className="rounded-2xl overflow-hidden border relative">
          <div className="aspect-[4/3] bg-black">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <img src={task.sample} className="w-full h-full object-cover opacity-40" alt="Sample overlay" />
                <div className="absolute inset-4 border-2 border-dashed border-white/80 rounded-xl flex items-center justify-center">
                  <div className="text-white text-xs font-semibold bg-black/50 rounded-full px-3 py-1">Frame like this</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm">{task.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mb-2">Tips</div>
          <ul className="text-xs space-y-1">
            {task.tips.map((t) => <li key={t}>• {t}</li>)}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5">
            <div className="flex items-center gap-1 text-emerald-700 text-[10px] font-bold uppercase"><Check className="h-3 w-3" /> Do</div>
            <ul className="text-[11px] mt-1 space-y-0.5 text-emerald-900">
              {task.dos.map((d) => <li key={d}>· {d}</li>)}
            </ul>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-2.5">
            <div className="flex items-center gap-1 text-red-700 text-[10px] font-bold uppercase"><X className="h-3 w-3" /> Don't</div>
            <ul className="text-[11px] mt-1 space-y-0.5 text-red-900">
              {task.donts.map((d) => <li key={d}>· {d}</li>)}
            </ul>
          </div>
        </div>

        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 space-y-2">
        {preview ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setPreview(null)}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retake
            </Button>
            <Button className="flex-1" onClick={usePhoto}>
              <Check className="h-4 w-4 mr-1" /> Use photo
            </Button>
          </div>
        ) : (
          <>
            <Button className="w-full" size="lg" onClick={() => inputRef.current?.click()}>
              <Camera className="h-4 w-4 mr-2" /> Take photo
            </Button>
            <Button variant="outline" className="w-full" onClick={useSample}>
              <ImageIcon className="h-4 w-4 mr-2" /> Use sample (demo)
            </Button>
          </>
        )}
      </div>
    </>
  );
}
