import React, { useRef, useState } from 'react';
import { Upload, FileType, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (validTypes.includes(fileExtension)) {
            setSelectedFile(file);
            onFileSelect(file);
        } else {
            alert("Invalid file type. Please upload .csv, .xlsx, .xls, or .json");
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                    dragActive ? "border-blue-500 bg-blue-50/10" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50/5",
                    isLoading && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleChange}
                    disabled={isLoading}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                                <FileType size={32} />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                title="Remove file"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        <p className="font-medium text-gray-700">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6 space-y-3 pointer-events-none">
                        <div className={`p-4 rounded-full bg-blue-50 text-blue-500 mb-2 transition-transform duration-300 ${dragActive ? 'scale-110' : ''}`}>
                            <Upload size={32} />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">
                            Drag & drop your bank statement
                        </p>
                        <p className="text-sm text-gray-400">
                            Supports .csv, .xlsx, .xls, .json
                        </p>
                        <button className="px-4 py-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors pointer-events-auto">
                            Or browse files
                        </button>
                    </div>
                )}

                {dragActive && (
                    <div className="absolute inset-0 z-10 bg-blue-500/10 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none">
                        <p className="text-blue-600 font-bold text-lg">Drop file here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
