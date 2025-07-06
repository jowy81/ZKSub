// client/src/components/CreatorDashboard.tsx
import { useState } from 'react';
import axios from 'axios';

// Interface for content data
interface Content {
  id: string;
  name: string;
  description: string;
  file: File | null;
  price: number;
}

// Component for creators to upload and manage content
export const CreatorDashboard = ({ client }: { client: any }) => {
  const [content, setContent] = useState<Content>({
    id: '',
    name: '',
    description: '',
    file: null,
    price: 0.25,
  });
  const [uploading, setUploading] = useState(false);
  const [contents, setContents] = useState<Content[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContents, setShowContents] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setContent((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  // Upload content to backend
  const uploadContent = async () => {
    if (!content.file || !content.name || !content.description) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', content.file);
      formData.append('name', content.name);
      formData.append('description', content.description);
      formData.append('price', content.price.toString());
      formData.append('creatorAddress', client.address);
      const response = await axios.post('http://localhost:3000/upload-content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setContents((prev) => [...prev, { ...content, id: response.data.id }]);
      setContent({ id: '', name: '', description: '', file: null, price: 0.25 });
      setShowModal(false);
    } catch (err) {
      console.error('Content upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Delete content
  const deleteContent = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/content/${id}`);
      setContents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Content deletion failed:', err);
    }
  };

  // Fetch creator's contents
  const fetchContents = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/contents/${client.address}`);
      setContents(response.data.map((item: any) => ({ ...item, file: null })));
      setShowContents(true);
    } catch (err) {
      console.error('Failed to fetch contents:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Creator Dashboard</h2>
      <p className="text-gray-700 mb-4">Address: <code>{client.address}</code></p>
      <div className="flex space-x-4 mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Upload New Content
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={fetchContents}
        >
          View My Contents
        </button>
      </div>

      {/* Modal for uploading content */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Upload Content</h3>
            <input
              type="text"
              name="name"
              placeholder="Content Name"
              value={content.name}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="description"
              placeholder="Short Description"
              value={content.description}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf"
              className="w-full mb-4"
            />
            <select
              name="price"
              value={content.price}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.05}>$0.05 / day</option>
              <option value={0.25}>$0.25 / day</option>
              <option value={1}>$1 / day</option>
            </select>
            <div className="flex space-x-4">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded cursor-not-allowed"
                disabled
              >
                +18 Content
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={uploadContent}
                disabled={uploading || !content.file || !content.name || !content.description}
              >
                {uploading ? 'Uploading...' : 'Upload Content'}
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display uploaded contents */}
      {showContents && (
        <div>
          <h3 className="text-xl font-semibold text-blue-600 mb-4">Your Contents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-600">Price: ${item.price} / day ({(item.price / 2500).toFixed(6)} ETH)</p>
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => deleteContent(item.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};