import { CustomerHeader } from '@/components/customer/header';
import { CustomerFooter } from '@/components/customer/footer';
import { PageTransition } from '@/components/customer/page-transition';
import { AntiFraudBanner } from '@/components/customer/anti-fraud-banner';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AntiFraudBanner />
      <CustomerHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <CustomerFooter />
    </div>
  );
}
