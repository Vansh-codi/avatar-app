// components/ui/CustomizePanel.tsx
// Avatar customization sidebar with live preview updates

'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { AvatarConfig } from '@/types';

const SKIN_TONES = ['#FFDBB4', '#F5CBA7', '#E8A87C', '#C68642', '#8D5524', '#4A3728'];
const HAIR_COLORS = ['#2C1810', '#6B4423', '#C49A6C', '#E6B800', '#FF6B6B', '#9B59B6', '#2ECC71', '#95A5A6', '#FFFFFF'];
const EYE_COLORS = ['#4A90D9', '#2ECC71', '#8B4513', '#1ABC9C', '#9B59B6', '#E67E22', '#2C3E50', '#AAB7B8'];

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}

function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-white/40 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer
          bg-white/10"
      />
    </div>
  );
}

function ColorPicker({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#00fff0' : 'transparent',
              boxShadow: value === color ? `0 0 0 1px #00fff0` : 'none',
            }}
            title={color}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-6 h-6 rounded-full cursor-pointer border-0 p-0"
          title="Custom color"
        />
      </div>
    </div>
  );
}

function SelectPill<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all
              ${value === opt
                ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-400'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all relative
          ${value ? 'bg-cyan-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all
          ${value ? 'left-5.5 left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30">{title}</h4>
      {children}
    </div>
  );
}

export function CustomizePanel() {
  const { avatarConfig, setAvatarConfig, resetAvatarConfig } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-5 h-full overflow-y-auto pr-1
        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
    >
      <Section title="Appearance">
        <ColorPicker
          label="Skin Tone"
          value={avatarConfig.skinTone}
          options={SKIN_TONES}
          onChange={v => setAvatarConfig({ skinTone: v })}
        />
        <ColorPicker
          label="Hair Color"
          value={avatarConfig.hairColor}
          options={HAIR_COLORS}
          onChange={v => setAvatarConfig({ hairColor: v })}
        />
        <SelectPill
          label="Hair Style"
          value={avatarConfig.hairStyle}
          options={['short', 'medium', 'long', 'ponytail', 'bald']}
          onChange={v => setAvatarConfig({ hairStyle: v })}
        />
        <ColorPicker
          label="Eye Color"
          value={avatarConfig.eyeColor}
          options={EYE_COLORS}
          onChange={v => setAvatarConfig({ eyeColor: v })}
        />
        <SelectPill
          label="Face Shape"
          value={avatarConfig.faceShape}
          options={['oval', 'round', 'square', 'heart']}
          onChange={v => setAvatarConfig({ faceShape: v })}
        />
      </Section>

      <div className="border-t border-white/10" />

      <Section title="Body">
        <SelectPill
          label="Body Type"
          value={avatarConfig.bodyType}
          options={['slim', 'average', 'athletic', 'curvy']}
          onChange={v => setAvatarConfig({ bodyType: v })}
        />
        <Slider
          label="Height"
          value={avatarConfig.height}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={v => setAvatarConfig({ height: v })}
        />
      </Section>

      <div className="border-t border-white/10" />

      <Section title="Outfit">
        <SelectPill
          label="Style"
          value={avatarConfig.outfitStyle}
          options={['casual', 'formal', 'sporty', 'fantasy']}
          onChange={v => setAvatarConfig({ outfitStyle: v })}
        />
        <ColorPicker
          label="Top Color"
          value={avatarConfig.topColor}
          options={['#2C3E50', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#ECF0F1']}
          onChange={v => setAvatarConfig({ topColor: v })}
        />
        <ColorPicker
          label="Bottom Color"
          value={avatarConfig.bottomColor}
          options={['#1A252F', '#2C3E50', '#34495E', '#95A5A6', '#7F8C8D', '#2980B9', '#16A085', '#2C2C2C']}
          onChange={v => setAvatarConfig({ bottomColor: v })}
        />
      </Section>

      <div className="border-t border-white/10" />

      <Section title="Accessories">
        <Toggle
          label="Glasses"
          value={avatarConfig.glasses}
          onChange={v => setAvatarConfig({ glasses: v })}
        />
        {avatarConfig.glasses && (
          <SelectPill
            label="Frame Style"
            value={avatarConfig.glassesStyle}
            options={['round', 'square', 'aviator']}
            onChange={v => setAvatarConfig({ glassesStyle: v })}
          />
        )}
        <Toggle
          label="Hat"
          value={avatarConfig.hat}
          onChange={v => setAvatarConfig({ hat: v })}
        />
        {avatarConfig.hat && (
          <SelectPill
            label="Hat Style"
            value={avatarConfig.hatStyle}
            options={['cap', 'beanie', 'fedora']}
            onChange={v => setAvatarConfig({ hatStyle: v })}
          />
        )}
      </Section>

      <div className="border-t border-white/10" />

      <Section title="Tracking">
        <Slider
          label="Expression Intensity"
          value={avatarConfig.expressionIntensity}
          onChange={v => setAvatarConfig({ expressionIntensity: v })}
        />
        <Slider
          label="Motion Smoothing"
          value={avatarConfig.motionSmoothing}
          onChange={v => setAvatarConfig({ motionSmoothing: v })}
        />
      </Section>

      <button
        onClick={resetAvatarConfig}
        className="mt-2 w-full py-2 rounded-lg text-xs text-white/30 hover:text-white/60
          border border-white/10 hover:border-white/20 transition-all"
      >
        Reset to Default
      </button>
    </motion.div>
  );
}
