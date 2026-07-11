import { Volume2 } from "lucide-react";
import { useCallback, useState } from "react";

type PronounceButtonProps = {
  word: string;
  className?: string;
  size?: number;
};

export function PronounceButton({
  word,
  className = "",
  size = 18,
}: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis || speaking) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [word, speaking]);

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={`Pronounce ${word}`}
      title="Pronounce"
      className={`inline-flex items-center justify-center rounded-full p-2 transition hover:bg-white/20 active:scale-95 ${speaking ? "opacity-60" : ""} ${className}`.trim()}
    >
      <Volume2 size={size} />
    </button>
  );
}
