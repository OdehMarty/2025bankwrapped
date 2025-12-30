import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseFile } from './utils/parser';
import { processTransactions } from './utils/classifier';
import type { ProcessedTransaction } from './utils/analytics';
import { Loader2 } from 'lucide-react';

function App() {
  const [data, setData] = useState<ProcessedTransaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feedback modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Notification state
  const [notification, setNotification] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const rawTransactions = await parseFile(file);
      if (rawTransactions.length === 0) {
        throw new Error("No valid transactions found in file.");
      }
      const processed = processTransactions(rawTransactions);
      await new Promise(resolve => setTimeout(resolve, 800));
      setData(processed);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      setNotification("Please enter feedback.");
      return;
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbx_7u6C0BWPM1WxRlAE2qZx86BgoGgyAGAdqat5eiBRt2dqEcZqv94ufJawoPOr0iBxhw/exec", {
        method: "POST",
        body: JSON.stringify({ feedback: feedbackText }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (result.result === "success") {
        setNotification("Thanks! Your feedback was received.");
        setFeedbackText("");
        setIsFeedbackOpen(false);
      } else {
        setNotification("Failed to submit feedback. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setNotification("Failed to submit feedback. Try again later.");
    }

    // Auto-hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

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

          <div className="mt-12 text-center text-xs text-gray-400 space-y-2">
            <p>Your data never leaves your device.</p>
            <p>Supports .csv, .xls, .xlsx, .json</p>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="mt-2 text-blue-500 hover:underline text-sm"
            >
              Encountered a problem? Give Feedback
            </button>
          </div>
        </div>
      ) : (
        <Dashboard transactions={data} onReset={handleReset} />
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Report an issue</h2>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Describe the problem you encountered..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
