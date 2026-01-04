'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import MemeBank from '../../components/MemeBank';
import { apiClient } from '../../lib/api-client';

export default function MemeBankPage() {
  const handleApiKeyChange = (key: string) => {
    apiClient.setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onApiKeyChange={handleApiKeyChange} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-2xl">
              ←
            </Link>
            <h1 className="text-4xl font-bold">🏦 Meme Bank</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Your collection of popular meme source videos. Check availability in your VideoDB collection or upload with one click.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How It Works</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Click "Check Availability" to see which memes are already in your VideoDB collection</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>For missing memes with configured sources, click "One-Click Sync to VideoDB"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Copy the asset ID and use it in your template parameters</span>
            </li>
          </ol>
        </div>

        {/* Meme Bank Component */}
        <MemeBank />
      </main>
    </div>
  );
}
