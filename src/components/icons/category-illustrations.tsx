'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Cone,
  Trash2,
  Waves,
  Droplets,
  Lightbulb,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

export interface CategoryIconConfig {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const CATEGORY_WEBP_MAP: Record<string, string> = {
  road_damage: '/icons/road_damage.webp',
  garbage: '/icons/garbage.webp',
  drainage: '/icons/drainage.webp',
  water_supply: '/icons/water_supply.webp',
  streetlight: '/icons/streetlight.webp',
  other: '/icons/other.webp',
};

export const CATEGORY_ICON_CONFIGS: Record<string, CategoryIconConfig> = {
  road_damage: {
    icon: Cone,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-100',
  },
  garbage: {
    icon: Trash2,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  drainage: {
    icon: Waves,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
  },
  water_supply: {
    icon: Droplets,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  streetlight: {
    icon: Lightbulb,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-100',
  },
  other: {
    icon: AlertCircle,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-100',
  },
};

export function CategoryIllustration({
  categoryId,
  size = 52,
  className = '',
}: {
  categoryId: string;
  size?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const webpSrc = CATEGORY_WEBP_MAP[categoryId] || CATEGORY_WEBP_MAP.other;
  const config = CATEGORY_ICON_CONFIGS[categoryId] || CATEGORY_ICON_CONFIGS.other;
  const IconComponent = config.icon;
  const iconPixelSize = Math.max(18, Math.round(size * 0.48));

  if (!imgError && webpSrc) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center flex-shrink-0 transition-transform ${className}`}
      >
        <Image
          src={webpSrc}
          alt={categoryId}
          width={size * 2}
          height={size * 2}
          className="object-contain w-full h-full drop-shadow-sm"
          onError={() => setImgError(true)}
          priority
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl flex items-center justify-center transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} border flex-shrink-0 ${className}`}
    >
      <IconComponent
        style={{ width: iconPixelSize, height: iconPixelSize }}
        strokeWidth={2.2}
      />
    </div>
  );
}

// Backwards-compatible named exports
export function RoadDamageIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="road_damage" {...props} />;
}

export function GarbageIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="garbage" {...props} />;
}

export function DrainageIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="drainage" {...props} />;
}

export function WaterSupplyIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="water_supply" {...props} />;
}

export function StreetlightIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="streetlight" {...props} />;
}

export function OtherIssueIllustration(props: { size?: number; className?: string }) {
  return <CategoryIllustration categoryId="other" {...props} />;
}
