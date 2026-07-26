import Vivi from './Vivi';

interface ViviMessageProps {
  message: string;
  mood?: 'happy' | 'excited' | 'thinking' | 'proud' | 'waving' | 'love';
  size?: number;
}

export default function ViviMessage({ message, mood = 'happy', size = 64 }: ViviMessageProps) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-soft">
      <div className="flex-shrink-0">
        <Vivi size={size} mood={mood} />
      </div>
      <div className="flex-1 pt-2">
        <p className="text-sm text-text-primary leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
