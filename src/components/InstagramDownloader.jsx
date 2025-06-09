import React, { useState } from 'react';
import { Download, Link, Image, AlertCircle, CheckCircle, Server } from 'lucide-react';

export default function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const extractInstagramImageUrl = async (instagramUrl) => {
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?/;
    if (!instagramRegex.test(instagramUrl)) {
      throw new Error('Please enter a valid Instagram post URL');
    }

    try {
      const response = await fetch('http://localhost:3001/api/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: instagramUrl,
          fullResolution: true,
          extractFullImage: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract image');
      }
      
      const data = await response.json();
      const imageUrl = data.fullImageUrl || data.highResUrl || data.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No full image URL found');
      }
      
      return imageUrl;
      
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
      const imageUrl = await extractInstagramImageUrl(url);
      
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.instagram.com/',
        }
      });
      
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

      setSuccess('Image loaded successfully!');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-6">
            <Image className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Instagram Downloader
          </h1>
          <p className="text-lg text-gray-600">
            Download high-quality images from Instagram posts
          </p>
        </div>



        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Instagram Post URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/example"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleDownload}
                  disabled={loading || !url.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading
                    </div>
                  ) : (
                    'Get Image'
                  )}
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-800">{success}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {imageData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <div className="mb-6">
                <img
                  src={imageData.url}
                  alt="Instagram image"
                  className="max-w-full h-auto max-h-96 object-contain mx-auto rounded-xl shadow-md"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={downloadImage}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Image
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                >
                  Download Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How to use</h3>
          <div className="space-y-4">
            {[
              'Copy the Instagram post URL from your browser or app',
              'Paste the URL in the input field above',
              'Click "Get Image" to load the high-resolution image',
              'Click "Download Image" to save it to your device'
            ].map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  {index + 1}
                </div>
                <p className="text-gray-700 mt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}