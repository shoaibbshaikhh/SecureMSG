import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Copy, Check, RefreshCw, Key, Lock, Unlock, Github } from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (text: string) => {
    let score = 0;
    if (text.length > 8) score += 20;
    if (text.match(/[A-Z]/)) score += 20;
    if (text.match(/[a-z]/)) score += 20;
    if (text.match(/[0-9]/)) score += 20;
    if (text.match(/[^A-Za-z0-9]/)) score += 20;
    setStrength(score);
  };

  useEffect(() => {
    calculateStrength(input);
  }, [input]);

  const handleEncryptDecrypt = () => {
    if (!input || !key) return;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Use max-w-md for smaller screens, and max-w-4xl for larger screens */}
        <div className="max-w-md mx-auto sm:max-w-lg lg:max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-emerald-400 mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold">SecureMSG</h1> {/* Adjusted font size for responsiveness */}
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
                <label className="block text-sm font-medium mb-2">
                  Enter text to {mode}:
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-32 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none" // Added resize:none
                  placeholder={`Enter text to ${mode}...`}
                />
                {mode === 'encrypt' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Strength:</span>
                      <span>{strength}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          strength > 60
                            ? 'bg-emerald-500'
                            : strength > 30
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
                  <label className="block text-sm font-medium">
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
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter encryption key..."
                  />
                  <button
                    onClick={handleEncryptDecrypt}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                  </button>
                </div>
              </div>

              {output && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Result:
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={output}
                      className="w-full h-32 px-4 py-2 bg-gray-700 rounded-lg resize-none" // Added resize:none
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
}

export default App;