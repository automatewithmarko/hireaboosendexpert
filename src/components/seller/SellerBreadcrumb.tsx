import Link from 'next/link';

export function SellerBreadcrumb({ name }: { name: string }) {
  return (
    <div className="provider-breadcrumb">
      <Link href="/">Marketplace</Link>
      <span className="separator">/</span>
      <span>{name}</span>
    </div>
  );
}
