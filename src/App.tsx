import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseFile } from './utils/parser';
import { processTransactions } from './utils/classifier';
import type { ProcessedTransaction } from './utils/analytics';
import { Loader2 } from 'lucide-react';

function FeedbackForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = { email, message };

    try {
      const res = await fetch('https://formspree.io/f/mregvvvj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNotification('Thanks! Your feedback was received.');
        setEmail('');
        setMessage('');
      } else {
        setNotification('Failed to submit feedback. Try again later.');
      }
    } catch (err) {
      console.error(err);
      setNotification('Failed to submit feedback. Try again later.');
    }

    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Your email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your feedback"
          className="w-full border rounded p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Feedback
        </button>
      </form>
      {notification && (
        <div className="mt-2 text-sm text-blue-600">{notification}</div>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState<ProcessedTransaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

          <div className="mt-12 text-center text-xs text-gray-400">
            <p>Your data never leaves your device.</p>
            <p>Supports .csv, .xls, .xlsx, .json</p>

            {/* Feedback form */}
            <FeedbackForm />
          </div>
        </div>
      ) : (
        <Dashboard transactions={data} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
