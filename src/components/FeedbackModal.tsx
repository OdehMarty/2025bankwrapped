import { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [notification, setNotification] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = { email, message, browser: navigator.userAgent };

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
                >
                    &times;
                </button>
                <h2 className="text-lg font-semibold mb-4">Feedback</h2>
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
                        required
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
        </div>
    );
}
