import  { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants';

import NewspaperIcon     from '@mui/icons-material/Newspaper';

interface Update {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export const icon = <NewspaperIcon />; // Icon for the widget

export default function AzureUpdateWidget() {
  const [updates, setUpdates] = useState<Update[]>([]);   // state for the list :contentReference[oaicite:9]{index=9}
  const [loading, setLoading] = useState(true);

  useEffect(() => {                                       // run once on mount :contentReference[oaicite:10]{index=10}
    async function load() {
      try {
        const rssUrl = `${API_BASE_URL}/dashboard/rssproxy?rssUrl=https://www.microsoft.com/releasecommunications/api/v2/azure/rss`;
      
        const res = await fetch(rssUrl)
     
        const xmlText = await res.text(); // Read the response as text
        console.log('Azure updates XML:', xmlText); // Log the raw XML response
        const doc = new DOMParser().parseFromString(xmlText, 'application/xml');

        const items = Array.from(doc.querySelectorAll('item')).map(item => ({
          title: item.querySelector('title')?.textContent || '',
          link:  item.querySelector('link')?.textContent  || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          description: item.querySelector('description')?.textContent || '',
        }));

        setUpdates(items);
      } catch (err) {
        console.error('Failed to fetch Azure updates:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading latest Azure services…</div>;

  return (
    <ul>
      {updates.slice(0, 10).map((u, i) => (
        <li key={i}>
          <a href={u.link} target="_blank" rel="noopener">
            {u.title}
          </a>
          <br/>
          <small>{new Date(u.pubDate).toLocaleDateString()}</small>
          <p>{u.description}</p>
        </li>
      ))}
    </ul>
  );
}
