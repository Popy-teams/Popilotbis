import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { readImageFile } from '../../../utils/teamSpacePhotos';

interface PhotoPickerProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  compact?: boolean;
}

export function PhotoPicker({ value, onChange, label = 'Ajouter une photo', compact = false }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const dataUrl = await readImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  if (value) {
    return (
      <div className={`relative inline-block ${compact ? '' : 'w-full'}`}>
        <img
          src={value}
          alt=""
          className={`rounded-xl object-cover border-2 border-violet-200 shadow-md ${
            compact ? 'w-16 h-16' : 'w-full max-h-48'
          }`}
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-colors"
          aria-label="Retirer la photo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-violet-300/80 bg-violet-50/50 text-violet-700 font-medium hover:bg-violet-100/80 hover:border-violet-400 transition-all active:scale-95 disabled:opacity-60 ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm w-full justify-center'
        }`}
      >
        {loading ? <Loader2 className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin`} /> : <Camera className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
        {loading ? 'Compression…' : label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      {error ? <p className="text-xs text-rose-600 mt-1">{error}</p> : null}
    </div>
  );
}
