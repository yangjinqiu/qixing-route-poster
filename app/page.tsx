'use client';

import { AppProvider } from '@/components/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PhotoUploader from '@/components/upload/PhotoUploader';
import TemplateSelector from '@/components/route/TemplateSelector';
import RouteCustomizer from '@/components/route/RouteCustomizer';
import PreviewPanel from '@/components/preview/PreviewPanel';
import WelcomeModal from '@/components/layout/WelcomeModal';

export default function Home() {
  return (
    <AppProvider>
      <WelcomeModal />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-6">
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <PhotoUploader />
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-5">
              <TemplateSelector />
              <hr className="border-gray-100" />
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">线路样式</h3>
                <RouteCustomizer />
              </div>
            </div>
            <PreviewPanel />
          </div>

          <div className="lg:hidden space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <PhotoUploader />
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-5">
              <TemplateSelector />
              <hr className="border-gray-100" />
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">线路样式</h3>
                <RouteCustomizer />
              </div>
            </div>
            <PreviewPanel />
          </div>
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}
