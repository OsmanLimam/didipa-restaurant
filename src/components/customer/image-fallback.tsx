'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { UtensilsCrossed } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackIcon?: React.ReactNode;
}

export function ImageWithFallback({ fallbackIcon, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted h-full w-full ${props.className || ''}`}>
        {fallbackIcon || <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />}
      </div>
    );
  }

  return <Image alt={alt} {...props} onError={() => setError(true)} />;
}
