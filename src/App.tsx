import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseFile } from './utils/parser';
import { processTransactions } from './utils/classifier';
import type { ProcessedTransaction } from './utils/analytics';
import { Loader2 } from 'lucide-react';
import { FeedbackModal } from './components/FeedbackModal';

function App() {
  const [data, setData] = useState<ProcessedTransaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const rawTransactions = await parseFile(file);
      if (rawTransactions.length === 0) {
        throw new Error('No valid transactions found in file.');
      }
      const processed = processTransactions(rawTransactions);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData(processed);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {!data ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
              Bank <span className="text-blue-500">Wrapped</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Visualize your yearly expenses in seconds.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />

            {loading && (
              <div className="mt-8 flex items-center justify-center gap-2 text-blue-600 animate-pulse">
                <Loader2 className="animate-spin" />
                Processing your data...
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Your data never leaves your device.</p>
            <p>Supports .csv, .xls, .xlsx, .json</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-blue-500 underline text-sm hover:text-blue-700"
            >
              Encountered a problem? Give Feedback
            </button>
          </div>

          <FeedbackModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      ) : (
        <Dashboard transactions={data} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
