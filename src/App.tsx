import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Copy, Check, RefreshCw, Key, Lock, Unlock, Github, Trash2, AlertTriangle } from 'lucide-react';

// Define the message type for history management
interface Message {
  id: string;
  input: string;
  output: string;
  mode: 'encrypt' | 'decrypt';
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthFeedback, setStrengthFeedback] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  // State for message history
  const [messageHistory, setMessageHistory] = useState<Message[]>(() => {
    // Load from localStorage on initial render
    const storedHistory = localStorage.getItem('messageHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Ref for confirmation dialog
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);

  const validateInput = (text: string) => {
    if (mode === 'encrypt') {  // Apply validation only in encrypt mode
      if (/[^\w\s.,?!]/.test(text)) {
        setInputError("Input contains invalid characters. Only alphanumeric characters, spaces, commas, periods, question marks and exclamation marks are allowed.");
        return false;
      }
    }
    setInputError(null);
    return true;
  };

  const validateKey = (text: string) => {
    if (text.length < 8) {
      setKeyError("Key must be at least 8 characters long.");
      return false;
    }
    setKeyError(null);
    return true;
  };

  const calculateStrength = (text: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (text.length > 8) score += 20;
    else feedback.push("Make the key longer (at least 8 characters).");

    if (text.match(/[A-Z]/)) score += 20;
    else feedback.push("Add uppercase letters.");

    if (text.match(/[a-z]/)) score += 20;
    else feedback.push("Add lowercase letters.");

    if (text.match(/[0-9]/)) score += 20;
    else feedback.push("Add numbers.");

    if (text.match(/[^A-Za-z0-9]/)) score += 20;
    else feedback.push("Add special characters (e.g., !@#$).");

    setStrength(score);
    setStrengthFeedback(feedback);
  };

  useEffect(() => {
    calculateStrength(key); // Calculate key strength
    validateKey(key); // Validate key on change
  }, [key]);

  // Save message history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const handleEncryptDecrypt = () => {
    if (!input || !key) {
      if (!input) setInputError("Input is required.");
      if (!key) setKeyError("Key is required.");
      return;
    }

    const isValidInput = validateInput(input);
    if (mode === 'encrypt' && !isValidInput) return; // Conditionally validate input

    if (!validateKey(key)) return;

    const result = Array.from(input)
      .map((char, index) => {
        const keyChar = key[index % key.length];
        const inputCode = char.charCodeAt(0);
        const keyCode = keyChar.charCodeAt(0);

        if (mode === 'encrypt') {
          return String.fromCharCode(inputCode + keyCode);
        } else {
          return String.fromCharCode(inputCode - keyCode);
        }
      })
      .join('');

    setOutput(result);

    // Add message to history
    const newMessage: Message = {
      id: Date.now().toString(), // Generate a unique ID
      input,
      output: result,
      mode,
      timestamp: new Date(),
    };
    setMessageHistory((prevHistory) => [...prevHistory, newMessage]);

    // Clear Input after Encrypt/Decrypt
    setInput('');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRandomKey = () => {
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomKey = Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setKey(randomKey);
  };

  // Function to delete a single message from history
  const deleteMessage = (id: string) => {
    setMessageHistory((prevHistory) => prevHistory.filter((message) => message.id !== id));
  };

  // Function to clear all message history
  const clearMessageHistory = () => {
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.showModal();
    }
  };

  const confirmClearHistory = () => {
    setMessageHistory([]);
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.close();
    }
  };

  const cancelClearHistory = () => {
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Use max-w-md for smaller screens, and max-w-4xl for larger screens */}
        <div className="max-w-md mx-auto sm:max-w-lg lg:max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-emerald-400 mr-3" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">SecureMSG</h1>
                <span className="text-xs text-gray-400 ml-2 block" style={{textAlign: "right"}}>v2</span>
              </div>
              {/* Adjusted font size for responsiveness */}
            </div>
            <div className="flex items-center justify-center text-gray-300">
              <span className="mr-2">by Shoaib Shaikh</span>
              <a
                href="https://github.com/shoaibbshaikhh/SecureMSG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center"
              >
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </a>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 mb-8"> {/* Added padding for smaller screens */}
            {/* Adjusted button layout to be more mobile-friendly */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-2">
              <button
                onClick={() => setMode('encrypt')}
                className={`flex items-center px-4 py-2 rounded-lg w-full sm:w-auto ${
                  mode === 'encrypt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Encrypt
              </button>
              <button
                onClick={() => setMode('decrypt')}
                className={`flex items-center px-4 py-2 rounded-lg w-full sm:w-auto ${
                  mode === 'decrypt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="input-text" className="block text-sm font-medium mb-2">
                  Enter text to {mode}:
                </label>
                <textarea
                  id="input-text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    validateInput(e.target.value);
                  }}
                  className={`w-full h-32 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none ${inputError ? 'border-red-500' : ''}`} // Added resize:none
                  placeholder={`Enter text to ${mode}...`}
                  aria-invalid={!!inputError}
                />
                {inputError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {inputError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
                  <label htmlFor="key-input" className="block text-sm font-medium">
                    Encryption Key:
                  </label>
                  <button
                    onClick={generateRandomKey}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center text-sm order-first sm:order-last"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Generate Random Key
                  </button>
                </div>
                {/* Adjusted input and button layout for mobile */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    id="key-input"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className={`flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${keyError ? 'border-red-500' : ''}`}
                    placeholder="Enter encryption key..."
                    aria-invalid={!!keyError}
                  />
                  <button
                    onClick={handleEncryptDecrypt}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center"
                    aria-label={mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  </button>
                </div>
                {keyError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {keyError}
                  </p>
                )}
                {/* Key Strength Meter */}
                {mode === 'encrypt' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Key Strength:</span>
                      <span>{strength}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          strength > 80
                            ? 'bg-emerald-500'
                            : strength > 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    {/* Key Strength Feedback */}
                    {strengthFeedback.length > 0 && (
                      <div className="mt-2 text-sm text-yellow-400">
                        <p>Suggestions:</p>
                        <ul className="list-disc list-inside">
                          {strengthFeedback.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {output && (
                <div>
                  <label htmlFor="output-text" className="block text-sm font-medium mb-2">
                    Result:
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      id="output-text"
                      value={output}
                      className="w-full h-32 px-4 py-2 bg-gray-700 rounded-lg resize-none" // Added resize:none
                      aria-label="Encrypted/Decrypted Result"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                      aria-label="Copy to Clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message History Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Message History</h2>
              <button
                onClick={clearMessageHistory}
                className="text-red-400 hover:text-red-300 text-sm"
                disabled={messageHistory.length === 0}
                aria-label="Clear Message History"
              >
                Clear All
              </button>
            </div>
            {messageHistory.length === 0 ? (
              <p className="text-gray-400">No messages in history.</p>
            ) : (
              <div className="space-y-3">
                {messageHistory.map((message) => (
                  <div key={message.id} className="p-3 bg-gray-700 rounded-lg relative overflow-hidden"> {/* Added overflow-hidden */}
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Mode:</span> {message.mode}
                    </p>
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Input:</span> {message.input}
                    </p>
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Output:</span> {message.output}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleString()}
                    </p>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                      aria-label="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6"> {/* Added padding for smaller screens */}
            <div className="flex items-center space-x-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Security Tips</h2> {/* Adjusted font size */}
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm"> {/* Adjusted font size */}
              <li>Use a strong, unique encryption key for each message</li>
              <li>Never share your encryption key through the same channel as the encrypted message</li>
              <li>For maximum security, use a combination of letters, numbers, and special characters</li>
              <li>Remember that the same key is needed for both encryption and decryption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <dialog ref={confirmationDialogRef} className="bg-gray-700 rounded-lg p-6">
        <p className="text-lg mb-4">Are you sure you want to clear the message history?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={cancelClearHistory} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancel</button>
          <button onClick={confirmClearHistory} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg">Clear All</button>
        </div>
      </dialog>
    </div>
  );
}

export default App;import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Copy, Check, RefreshCw, Key, Lock, Unlock, Github, Trash2, AlertTriangle } from 'lucide-react';

// Define the message type for history management
interface Message {
  id: string;
  input: string;
  output: string;
  mode: 'encrypt' | 'decrypt';
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthFeedback, setStrengthFeedback] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  // State for message history
  const [messageHistory, setMessageHistory] = useState<Message[]>(() => {
    // Load from localStorage on initial render
    const storedHistory = localStorage.getItem('messageHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Ref for confirmation dialog
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);

  const validateInput = (text: string) => {
    if (mode === 'encrypt') {  // Apply validation only in encrypt mode
      if (/[^\w\s.,?!]/.test(text)) {
        setInputError("Input contains invalid characters. Only alphanumeric characters, spaces, commas, periods, question marks and exclamation marks are allowed.");
        return false;
      }
    }
    setInputError(null);
    return true;
  };

  const validateKey = (text: string) => {
    if (text.length < 8) {
      setKeyError("Key must be at least 8 characters long.");
      return false;
    }
    setKeyError(null);
    return true;
  };

  const calculateStrength = (text: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (text.length > 8) score += 20;
    else feedback.push("Make the key longer (at least 8 characters).");

    if (text.match(/[A-Z]/)) score += 20;
    else feedback.push("Add uppercase letters.");

    if (text.match(/[a-z]/)) score += 20;
    else feedback.push("Add lowercase letters.");

    if (text.match(/[0-9]/)) score += 20;
    else feedback.push("Add numbers.");

    if (text.match(/[^A-Za-z0-9]/)) score += 20;
    else feedback.push("Add special characters (e.g., !@#$).");

    setStrength(score);
    setStrengthFeedback(feedback);
  };

  useEffect(() => {
    calculateStrength(key); // Calculate key strength
    validateKey(key); // Validate key on change
  }, [key]);

  // Save message history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const handleEncryptDecrypt = () => {
    if (!input || !key) {
      if (!input) setInputError("Input is required.");
      if (!key) setKeyError("Key is required.");
      return;
    }

    const isValidInput = validateInput(input);
    if (mode === 'encrypt' && !isValidInput) return; // Conditionally validate input

    if (!validateKey(key)) return;

    const result = Array.from(input)
      .map((char, index) => {
        const keyChar = key[index % key.length];
        const inputCode = char.charCodeAt(0);
        const keyCode = keyChar.charCodeAt(0);

        if (mode === 'encrypt') {
          return String.fromCharCode(inputCode + keyCode);
        } else {
          return String.fromCharCode(inputCode - keyCode);
        }
      })
      .join('');

    setOutput(result);

    // Add message to history
    const newMessage: Message = {
      id: Date.now().toString(), // Generate a unique ID
      input,
      output: result,
      mode,
      timestamp: new Date(),
    };
    setMessageHistory((prevHistory) => [...prevHistory, newMessage]);

    // Clear Input after Encrypt/Decrypt
    setInput('');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRandomKey = () => {
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomKey = Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setKey(randomKey);
  };

  // Function to delete a single message from history
  const deleteMessage = (id: string) => {
    setMessageHistory((prevHistory) => prevHistory.filter((message) => message.id !== id));
  };

  // Function to clear all message history
  const clearMessageHistory = () => {
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.showModal();
    }
  };

  const confirmClearHistory = () => {
    setMessageHistory([]);
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.close();
    }
  };

  const cancelClearHistory = () => {
    if (confirmationDialogRef.current) {
      confirmationDialogRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Use max-w-md for smaller screens, and max-w-4xl for larger screens */}
        <div className="max-w-md mx-auto sm:max-w-lg lg:max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-emerald-400 mr-3" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">SecureMSG</h1>
                <span className="text-xs text-gray-400 ml-2 block" style={{textAlign: "right"}}>v2</span>
              </div>
              {/* Adjusted font size for responsiveness */}
            </div>
            <div className="flex items-center justify-center text-gray-300">
              <span className="mr-2">by Shoaib Shaikh</span>
              <a
                href="https://github.com/shoaibbshaikhh/SecureMSG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center"
              >
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </a>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 mb-8"> {/* Added padding for smaller screens */}
            {/* Adjusted button layout to be more mobile-friendly */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-2">
              <button
                onClick={() => setMode('encrypt')}
                className={`flex items-center px-4 py-2 rounded-lg w-full sm:w-auto ${
                  mode === 'encrypt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Encrypt
              </button>
              <button
                onClick={() => setMode('decrypt')}
                className={`flex items-center px-4 py-2 rounded-lg w-full sm:w-auto ${
                  mode === 'decrypt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="input-text" className="block text-sm font-medium mb-2">
                  Enter text to {mode}:
                </label>
                <textarea
                  id="input-text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    validateInput(e.target.value);
                  }}
                  className={`w-full h-32 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none ${inputError ? 'border-red-500' : ''}`} // Added resize:none
                  placeholder={`Enter text to ${mode}...`}
                  aria-invalid={!!inputError}
                />
                {inputError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {inputError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
                  <label htmlFor="key-input" className="block text-sm font-medium">
                    Encryption Key:
                  </label>
                  <button
                    onClick={generateRandomKey}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center text-sm order-first sm:order-last"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Generate Random Key
                  </button>
                </div>
                {/* Adjusted input and button layout for mobile */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    id="key-input"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className={`flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${keyError ? 'border-red-500' : ''}`}
                    placeholder="Enter encryption key..."
                    aria-invalid={!!keyError}
                  />
                  <button
                    onClick={handleEncryptDecrypt}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center"
                    aria-label={mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  </button>
                </div>
                {keyError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {keyError}
                  </p>
                )}
                {/* Key Strength Meter */}
                {mode === 'encrypt' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Key Strength:</span>
                      <span>{strength}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          strength > 80
                            ? 'bg-emerald-500'
                            : strength > 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    {/* Key Strength Feedback */}
                    {strengthFeedback.length > 0 && (
                      <div className="mt-2 text-sm text-yellow-400">
                        <p>Suggestions:</p>
                        <ul className="list-disc list-inside">
                          {strengthFeedback.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {output && (
                <div>
                  <label htmlFor="output-text" className="block text-sm font-medium mb-2">
                    Result:
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      id="output-text"
                      value={output}
                      className="w-full h-32 px-4 py-2 bg-gray-700 rounded-lg resize-none" // Added resize:none
                      aria-label="Encrypted/Decrypted Result"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                      aria-label="Copy to Clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message History Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Message History</h2>
              <button
                onClick={clearMessageHistory}
                className="text-red-400 hover:text-red-300 text-sm"
                disabled={messageHistory.length === 0}
                aria-label="Clear Message History"
              >
                Clear All
              </button>
            </div>
            {messageHistory.length === 0 ? (
              <p className="text-gray-400">No messages in history.</p>
            ) : (
              <div className="space-y-3">
                {messageHistory.map((message) => (
                  <div key={message.id} className="p-3 bg-gray-700 rounded-lg relative overflow-hidden"> {/* Added overflow-hidden */}
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Mode:</span> {message.mode}
                    </p>
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Input:</span> {message.input}
                    </p>
                    <p className="text-sm text-gray-300 break-words"> {/* Added break-words */}
                      <span className="font-medium">Output:</span> {message.output}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleString()}
                    </p>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-400"
                      aria-label="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6"> {/* Added padding for smaller screens */}
            <div className="flex items-center space-x-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Security Tips</h2> {/* Adjusted font size */}
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm"> {/* Adjusted font size */}
              <li>Use a strong, unique encryption key for each message</li>
              <li>Never share your encryption key through the same channel as the encrypted message</li>
              <li>For maximum security, use a combination of letters, numbers, and special characters</li>
              <li>Remember that the same key is needed for both encryption and decryption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <dialog ref={confirmationDialogRef} className="bg-gray-700 rounded-lg p-6">
        <p className="text-lg mb-4">Are you sure you want to clear the message history?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={cancelClearHistory} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancel</button>
          <button onClick={confirmClearHistory} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg">Clear All</button>
        </div>
      </dialog>
    </div>
  );
}

export default App;