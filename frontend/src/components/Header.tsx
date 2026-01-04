'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onApiKeyChange: (key: string) => void;
}

export default function Header({ onApiKeyChange }: HeaderProps) {
  const [apiKey, setApiKey] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Load API key from session storage
    const stored = sessionStorage.getItem('videodb-api-key');
    if (stored) {
      setApiKey(stored);
      onApiKeyChange(stored);
    }
  }, [onApiKeyChange]);

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    sessionStorage.setItem('videodb-api-key', value);
    onApiKeyChange(value);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start gap-6 mb-4">
          <div>
            <Link href="/" className="hover:opacity-80">
              <h1 className="text-2xl font-bold text-gray-900">makememes.site</h1>
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              Code-first meme generator with popular source videos.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[300px]">
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
              VideoDB API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Paste your key"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <small className="text-gray-500 text-xs">Stored only in this tab.</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-accent text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Templates
          </Link>
          <Link
            href="/meme-bank"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/meme-bank')
                ? 'bg-accent text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏦 Meme Bank
          </Link>
        </nav>
      </div>
    </header>
  );
}
