'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingCart, Menu, X, Home } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cart-store';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ scale: 1.08, rotate: 3 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Image src="/logo.png" alt="Mama's Kitchen" width={36} height={36} className="rounded-lg" />
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-none">Mama&apos;s Kitchen</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Authentic Ghanaian Cuisine</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/cart" className="relative ml-2">
            <Button
              variant={pathname === '/cart' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              <AnimatePresence mode="wait">
                {cartItemCount > 0 && (
                  <motion.div
                    key={cartItemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -right-2 -top-2"
                  >
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {cartItemCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <AnimatePresence mode="wait">
                {cartItemCount > 0 && (
                  <motion.div
                    key={cartItemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -right-1 -top-1"
                  >
                    <Badge className="h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground">
                      {cartItemCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex items-center gap-2 px-2">
                  <Image src="/logo.png" alt="Mama's Kitchen" width={32} height={32} className="rounded-lg" />
                  <p className="font-bold">Mama&apos;s Kitchen</p>
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/cart'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                    {cartItemCount > 0 && (
                      <Badge className="ml-auto bg-primary text-primary-foreground">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
