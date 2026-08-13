'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Store } from 'lucide-react';
import { toast } from 'sonner';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface RestaurantSettings {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  deliveryFee: number;
  minimumOrder: number;
  freeDeliveryMin: number;
  preparationTime: number;
  status: string;
  hours: {
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Settings saved');
      const updated = await res.json();
      setSettings(updated);
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const updateField = (field: string, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateHour = (id: string, field: string, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      hours: settings.hours.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!settings) return <div className="text-center py-16">Failed to load settings</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Restaurant Info</CardTitle>
            <CardDescription>Basic information about your restaurant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={settings.name} onChange={(e) => updateField('name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={settings.description || ''} onChange={(e) => updateField('description', e.target.value)} className="mt-1" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={settings.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input value={settings.whatsappNumber || ''} onChange={(e) => updateField('whatsappNumber', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={settings.address || ''} onChange={(e) => updateField('address', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={settings.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery & Orders</CardTitle>
            <CardDescription>Configure delivery and order settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Delivery Fee (GH₵)</Label>
                <Input type="number" value={settings.deliveryFee} onChange={(e) => updateField('deliveryFee', parseFloat(e.target.value) || 0)} className="mt-1" />
              </div>
              <div>
                <Label>Min Order (GH₵)</Label>
                <Input type="number" value={settings.minimumOrder} onChange={(e) => updateField('minimumOrder', parseFloat(e.target.value) || 0)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Free Delivery Min (GH₵)</Label>
                <Input type="number" value={settings.freeDeliveryMin} onChange={(e) => updateField('freeDeliveryMin', parseFloat(e.target.value) || 0)} className="mt-1" />
              </div>
              <div>
                <Label>Prep Time (min)</Label>
                <Input type="number" value={settings.preparationTime} onChange={(e) => updateField('preparationTime', parseInt(e.target.value) || 30)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Opening Hours</CardTitle>
            <CardDescription>Set your restaurant operating hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settings.hours.map((hour) => (
                <div key={hour.id} className="flex items-center gap-4 py-2">
                  <div className="w-24">
                    <Label className="font-medium">{DAYS_OF_WEEK[hour.dayOfWeek]}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hour.isClosed}
                      onCheckedChange={(checked) => updateHour(hour.id, 'isClosed', !checked)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {hour.isClosed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  {!hour.isClosed && (
                    <>
                      <Input
                        type="time"
                        value={hour.openTime}
                        onChange={(e) => updateHour(hour.id, 'openTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) => updateHour(hour.id, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
