import React, { useState } from 'react';
import { Download, Link, Image, AlertCircle, CheckCircle } from 'lucide-react';

export default function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const extractInstagramImageUrl = async (instagramUrl) => {
    // Validate Instagram URL format
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?/;
    if (!instagramRegex.test(instagramUrl)) {
      throw new Error('Please enter a valid Instagram post URL');
    }

    try {
      // Call the backend API to extract Instagram image
      const response = await fetch('http://localhost:3001/api/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: instagramUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract image');
      }
      
      const data = await response.json();
      return data.imageUrl;
      
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Backend server not running. Please start the Node.js server on port 3001.');
      }
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setImageData(null);

    try {
      // Extract image URL from Instagram post (requires backend)
      const imageUrl = await extractInstagramImageUrl(url);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(blob);
      
      setImageData({
        url: imageObjectUrl,
        originalUrl: imageUrl,
        filename: `instagram-image-${Date.now()}.jpg`
      });

      setSuccess('Image loaded successfully! Click download to save.');
    } catch (err) {
      setError(err.message || 'Failed to download image. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageData) return;

    const link = document.createElement('a');
    link.href = imageData.url;
    link.download = imageData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('Image downloaded successfully!');
  };

  const resetForm = () => {
    setUrl('');
    setImageData(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full">
              <Image className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Instagram Downloader
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Download Instagram images easily by pasting the post URL
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Backend Setup Instructions */}
            <div className="mb-8 bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-200 mb-3">🚀 Backend Setup Required</h3>
              <p className="text-blue-100 mb-3">
                To use real Instagram images, you need to run the Node.js backend server:
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-green-300">
                <div>1. npm install</div>
                <div>2. npm start</div>
                <div>3. Server runs on http://localhost:3001</div>
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4">
                <Link className="inline w-5 h-5 mr-2" />
                Instagram Post URL
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="flex-1 px-6 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm text-lg"
                  disabled={loading}
                />
                <button
                  onClick={handleDownload}
                  disabled={loading || !url.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    'Get Image'
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <span className="text-red-200">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-green-200">{success}</span>
              </div>
            )}

            {/* Image Preview and Download */}
            {imageData && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-center">
                  <img
                    src={imageData.url}
                    alt="Instagram image"
                    className="max-w-full max-h-96 mx-auto rounded-xl shadow-lg mb-6"
                  />
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={downloadImage}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Image
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      Download Another
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">How to use:</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <span>Copy the Instagram post URL from your browser or Instagram app</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <span>Paste the URL in the input field above</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <span>Click "Get Image" to load the image</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <span>Click "Download Image" to save it to your device</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}