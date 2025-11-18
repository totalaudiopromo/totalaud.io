'use client';

type InputType = 'pad' | 'encoder' | 'button' | 'fader' | 'strip' | 'key' | 'knob';

interface InputIconProps {
  inputType: InputType;
  inputId: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const INPUT_ICONS: Record<InputType, string> = {
  pad: '⬛',
  encoder: '⚙️',
  button: '🔘',
  fader: '🎚️',
  strip: '📏',
  key: '🎹',
  knob: '🎛️',
};

export function InputIcon({ inputType, inputId, active, size = 'md' }: InputIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex flex-col items-centre justify-centre transition-all ${
        active
          ? 'bg-[#3AA9BE] text-black border-2 border-[#3AA9BE]'
          : 'bg-[#1A1C20] text-white border border-[#2A2C30]'
      }`}
    >
      <div className="text-2xl">{INPUT_ICONS[inputType]}</div>
      <div className="font-mono text-[10px] opacity-70 mt-0.5">
        {inputId.split('-').pop()}
      </div>
    </div>
  );
}
