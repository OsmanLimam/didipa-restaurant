'use client';

import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KNUST_LAT = 6.6745;
const KNUST_LNG = -1.5715;
const MAPS_EMBED_URL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1582.5!2d${KNUST_LNG}!3d${KNUST_LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfb7c7c7c7c7c7c7%3A0x7c7c7c7c7c7c7c7c!2sKNUST+Campus%2C+Kumasi!5e0!3m2!1sen!2sgh!4v1`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${KNUST_LAT},${KNUST_LNG}`;

export function GoogleMapEmbed({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden relative ${className}`}>
      <iframe
        src={MAPS_EMBED_URL}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="DidiPa location at KNUST Campus, Kumasi"
        className="absolute inset-0"
      />
      <div className="absolute bottom-2 right-2 z-10">
        <Button size="sm" variant="secondary" className="gap-1 shadow-md text-xs" asChild>
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-3 w-3" />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}
