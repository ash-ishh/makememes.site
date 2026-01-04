'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import TemplateGrid from '@/components/TemplateGrid';
import { apiClient } from '@/lib/api';
import type { Template } from '@/types';

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await apiClient.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (key: string) => {
    apiClient.setApiKey(key);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onApiKeyChange={handleApiKeyChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Templates</h1>
          <p className="text-gray-600 text-lg">
            Pick a template, customize it and generate video memes instantly. Check out the{' '}
            <Link href="/meme-bank" className="text-purple-600 font-semibold hover:underline">
              Meme Bank
            </Link>{' '}
            for popular source videos.
          </p>
        </div>

        {/* Template Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No templates available yet. Check back soon!</p>
          </div>
        ) : (
          <TemplateGrid templates={templates} />
        )}
      </main>
    </div>
  );
}
