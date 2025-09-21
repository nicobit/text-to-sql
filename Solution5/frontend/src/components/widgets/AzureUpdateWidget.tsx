// src/components/AzureUpdateWidget.tsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants';
import { Newspaper } from 'lucide-react';

interface Update {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

// Icon for the widget
export const icon = <Newspaper className="w-6 h-6 text-blue-500" />;

export default function AzureUpdateWidget() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const rssUrl =
          `${API_BASE_URL}/dashboard/rssproxy?rssUrl=` +
          encodeURIComponent(
            'https://www.microsoft.com/releasecommunications/api/v2/azure/rss'
          );

        const res = await fetch(rssUrl);
        const xmlText = await res.text();
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');

        const items: Update[] = Array.from(doc.querySelectorAll('item')).map(
          (item) => ({
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
          })
        );

        setUpdates(items);
      } catch (err) {
        console.error('Failed to fetch Azure updates:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-600 dark:text-gray-300">
        Loading latest Azure services…
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {updates.slice(0, 10).map((u, i) => (
        <li
          key={i}
          className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow"
        >
          <a
            href={u.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {u.title}
          </a>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {new Date(u.pubDate).toLocaleDateString()}
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {u.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
