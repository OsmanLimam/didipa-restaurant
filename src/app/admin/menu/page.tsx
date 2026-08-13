"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Flame } from "lucide-react";
import { formatPriceShort } from "@/lib/constants";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number | null;
  category: { id: string; name: string };
  extras: { id: string; name: string; price: number }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [menuRes, catRes] = await Promise.all([
      fetch("/api/admin/menu"),
      fetch("/api/categories"),
    ]);
    const menuData = await menuRes.json();
    const catData = await catRes.json();
    setMenuItems(menuData);
    setCategories(catData);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/admin/menu"),
        fetch("/api/categories"),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();
      if (!cancelled) {
        setMenuItems(menuData);
        setCategories(catData);
        setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const toggleAvailable = async (id: string, isAvailable: boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    toast.success(isAvailable ? "Item marked unavailable" : "Item marked available");
    fetchData();
  };

  const togglePopular = async (id: string, isPopular: boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPopular: !isPopular }),
    });
    toast.success(isPopular ? "Removed from popular" : "Marked as popular");
    fetchData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    toast.success("Item deleted");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <AddMenuItemDialog categories={categories} onSuccess={fetchData} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{item.name}</p>
                        {item.isPopular && (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <Flame className="h-3 w-3 text-primary" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.category.name} • {formatPriceShort(item.price)}
                        {item.extras.length > 0 &&
                          ` • ${item.extras.length} extras`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Available</Label>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() =>
                          toggleAvailable(item.id, item.isAvailable)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Popular</Label>
                      <Switch
                        checked={item.isPopular}
                        onCheckedChange={() =>
                          togglePopular(item.id, item.isPopular)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddMenuItemDialog({
  categories,
  onSuccess,
}: {
  categories: Category[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !price || !categoryId) {
      toast.error("Please fill in required fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          description,
          categoryId,
          isPopular,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Menu item created");
      setOpen(false);
      setName("");
      setPrice("");
      setDescription("");
      setCategoryId("");
      setIsPopular(false);
      onSuccess();
    } catch {
      toast.error("Failed to create item");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jollof Rice & Chicken"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (GH₵) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPopular} onCheckedChange={setIsPopular} />
            <Label>Mark as popular</Label>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
