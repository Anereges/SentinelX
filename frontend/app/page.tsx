import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-3xl">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">SX</span>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">
          SentinelX
        </h1>
        
        <p className="text-xl text-gray-400 mb-4">
          Security Operations Center Platform
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="/demo"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            🚀 Try Demo
          </Link>
          <Link
            href="/auth/login"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Real-time Monitoring</span>
            </div>
            <p className="text-xs text-gray-400">Live security event tracking and alerting</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">AI-Powered Detection</span>
            </div>
            <p className="text-xs text-gray-400">Intelligent threat detection and analysis</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Incident Response</span>
            </div>
            <p className="text-xs text-gray-400">Full incident lifecycle management</p>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500 border-t border-gray-800 pt-4">
          <p>🔐 Demo credentials available — No registration required</p>
        </div>
      </div>
    </div>
  );
}