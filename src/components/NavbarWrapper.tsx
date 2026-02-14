'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const PUBLIC_ROUTES = ['/', '/login', '/about', '/features'];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!user || isPublicRoute) return null;

  return <Navbar />;
}
