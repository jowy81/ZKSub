// client/src/components/SubscriberDashboard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface for content data
interface Content {
  id: string;
  name: string;
  description: string;
  price: number;
  creatorAddress: string;
  filePath: string;
}

// Interface for subscription data
interface Subscription {
  contentId: string;
  expiresAt: number;
}

// Component for subscribers to browse and subscribe to content
export const SubscriberDashboard = ({ client, paySubscription }: { client: any; paySubscription: (creatorAddress: string, amount: number) => Promise<any> }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available contents
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/contents');
      setContents(response.data);
    } catch (err) {
      console.error('Failed to fetch contents:', err);
      setError('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/subscriptions/${client.address}`);
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      setError('Failed to load subscriptions');
    }
  };

  useEffect(() => {
    fetchContents();
    if (client.address) fetchSubscriptions();
  }, [client.address]);

  // Handle subscription payment
  const handleSubscribe = async (content: Content) => {
    setLoading(true);
    setError(null);
    const tx = await paySubscription(content.creatorAddress, content.price);
    if (tx) {
      try {
        const response = await axios.post('http://localhost:3000/validate-payment', {
          subscriberAddress: client.address,
          creatorAddress: content.creatorAddress,
          amount: content.price / 2500, // Convert USD to ETH
          txHash: tx.hash,
          contentId: content.id,
        });
        if (response.data.valid) {
          setSubscriptions((prev) => [...prev, { contentId: content.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }]);
        } else {
          setError(response.data.error || 'Payment validation failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment validation failed';
        setError(errorMessage);
        console.error('Payment validation failed:', err);
      }
    } else {
      setError('Transaction failed');
    }
    setLoading(false);
  };

  // Check if content is accessible
  const isContentAccessible = (contentId: string) => {
    const sub = subscriptions.find((s) => s.contentId === contentId);
    return sub && sub.expiresAt > Date.now();
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Subscriber Dashboard</h2>
      <p className="text-gray-700 mb-4">Address: <code>{client.address}</code></p>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <h3 className="text-xl font-semibold text-blue-600 mb-4">Available Contents</h3>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map((content) => (
            <div key={content.id} className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-bold text-gray-800">{content.name}</h4>
              <p className="text-gray-600">{content.description}</p>
              <p className="text-gray-600">Price: ${content.price} / day ({(content.price / 2500).toFixed(6)} ETH)</p>
              {isContentAccessible(content.id) ? (
                <iframe src={content.filePath} title={content.name} className="w-full h-48 mt-2" />
              ) : (
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  onClick={() => handleSubscribe(content)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Subscribe for $${content.price}`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};