'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import StatsSection from '@/components/StatsSection';
import SystemOverview from '@/components/SystemOverview';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  // Wrapper function to protect functionality
  const handleProtectedAction = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Original HeroSection with protected actions */}
      <div onClick={handleProtectedAction}>
        <HeroSection />
      </div>

      {/* Original FeatureSection with protected actions */}
      <div onClick={handleProtectedAction}>
        <FeatureSection />
      </div>

      {/* Original StatsSection */}
      <StatsSection />

      {/* Original SystemOverview with protected actions */}
      <div onClick={handleProtectedAction}>
        <SystemOverview />
      </div>

      {/* Original CTASection with protected actions */}
      <div onClick={handleProtectedAction}>
        <CTASection />
      </div>

      {/* Original Footer */}
      <Footer />
    </div>
  );
}
