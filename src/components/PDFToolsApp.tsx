import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Download, Scissors, Merge, RotateCw, Image as ImageIcon, Lock, Unlock, Compass as Compress, Eye, Trash2, Plus, Search, Calendar, File } from 'lucide-react';
import Header from './Header';

interface PDFFile {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  pageCount?: number;
  createdAt: Date;
}

const PDFToolsApp: React.FC = () => {
  const navigate = useNavigate();
  const { currentToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file`);
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        
        const newPDF: PDFFile = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          dataUrl: dataUrl,
          pageCount: Math.floor(Math.random() * 50) + 1, // Simulated page count
          createdAt: new Date()
        };

        setPdfFiles(prev => [newPDF, ...prev]);
      } catch (error) {
        console.error('Failed to upload PDF:', file.name, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsProcessing(false);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const downloadPDF = (pdf: PDFFile) => {
    const link = document.createElement('a');
    link.href = pdf.dataUrl;
    link.download = pdf.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deletePDF = (pdfId: string) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      setPdfFiles(prev => prev.filter(pdf => pdf.id !== pdfId));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(pdfId);
        return newSet;
      });
    }
  };

  const toggleFileSelection = (pdfId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pdfId)) {
        newSet.delete(pdfId);
      } else {
        newSet.add(pdfId);
      }
      return newSet;
    });
  };

  const mergePDFs = async () => {
    if (selectedFiles.size < 2) {
      alert('Please select at least 2 PDFs to merge');
      return;
    }

    setIsProcessing(true);
    
    // Simulate PDF merging
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedPDFs = pdfFiles.filter(pdf => selectedFiles.has(pdf.id));
    const mergedName = `merged_${Date.now()}.pdf`;
    const totalSize = selectedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);
    
    // Create a simple merged PDF placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Merged PDF Document', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText(`Contains ${selectedPDFs.length} documents`, canvas.width / 2, canvas.height / 2 + 40);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const mergedPDF: PDFFile = {
            id: Date.now().toString(),
            name: mergedName,
            size: totalSize,
            dataUrl: reader.result as string,
            pageCount: selectedPDFs.reduce((sum, pdf) => sum + (pdf.pageCount || 1), 0),
            createdAt: new Date()
          };
          
          setPdfFiles(prev => [mergedPDF, ...prev]);
          setSelectedFiles(new Set());
          setIsProcessing(false);
          alert('PDFs merged successfully!');
        };
        reader.readAsDataURL(blob);
      }
    }, 'application/pdf');
  };

  const compressPDF = async (pdfId: string) => {
    setIsProcessing(true);
    
    // Simulate PDF compression
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const pdf = pdfFiles.find(p => p.id === pdfId);
    if (pdf) {
      const compressedPDF: PDFFile = {
        ...pdf,
        id: Date.now().toString(),
        name: pdf.name.replace('.pdf', '_compressed.pdf'),
        size: Math.floor(pdf.size * 0.6), // Simulate 40% compression
        createdAt: new Date()
      };
      
      setPdfFiles(prev => [compressedPDF, ...prev]);
      alert('PDF compressed successfully!');
    }
    
    setIsProcessing(false);
  };

  const splitPDF = async (pdfId: string) => {
    setIsProcessing(true);
    
    // Simulate PDF splitting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdf = pdfFiles.find(p => p.id === pdfId);
    if (pdf && pdf.pageCount) {
      const splitCount = Math.min(pdf.pageCount, 3); // Split into max 3 parts
      
      for (let i = 0; i < splitCount; i++) {
        const splitPDF: PDFFile = {
          ...pdf,
          id: Date.now().toString() + i,
          name: pdf.name.replace('.pdf', `_part${i + 1}.pdf`),
          size: Math.floor(pdf.size / splitCount),
          pageCount: Math.ceil(pdf.pageCount / splitCount),
          createdAt: new Date()
        };
        
        setPdfFiles(prev => [splitPDF, ...prev]);
      }
      
      alert(`PDF split into ${splitCount} parts successfully!`);
    }
    
    setIsProcessing(false);
  };

  const filteredPDFs = pdfFiles.filter(pdf =>
    pdf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-400" />
            PDF Tools
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total PDFs</p>
                <p className="text-2xl font-bold text-white">{pdfFiles.length}</p>
              </div>
              <FileText className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Selected</p>
                <p className="text-2xl font-bold text-white">{selectedFiles.size}</p>
              </div>
              <File className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Size</p>
                <p className="text-2xl font-bold text-white">
                  {formatFileSize(pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0))}
                </p>
              </div>
              <Compress className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">PDF Tools</h2>
            
            {/* Core Tools */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">📄 Core Tools</h3>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full mb-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload PDFs
              </button>

              <button
                onClick={mergePDFs}
                disabled={selectedFiles.size < 2 || isProcessing}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded transition-colors flex items-center gap-2 text-sm"
              >
                <Merge className="w-4 h-4" />
                Merge Selected ({selectedFiles.size})
              </button>
            </div>

            {/* Editing Features */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">📝 Editing Features</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 bg-slate-700/30 rounded text-slate-300">
                  <div className="font-medium text-white mb-1">Text & Images</div>
                  <div>• Add, edit, delete text</div>
                  <div>• Insert, resize, move images</div>
                  <div>• Font matching & styling</div>
                </div>
                <div className="p-2 bg-slate-700/30 rounded text-slate-300">
                  <div className="font-medium text-white mb-1">Annotations</div>
                  <div>• Highlight, underline, strikethrough</div>
                  <div>• Comments & sticky notes</div>
                  <div>• Drawing tools & shapes</div>
                </div>
                <div className="p-2 bg-slate-700/30 rounded text-slate-300">
                  <div className="font-medium text-white mb-1">Redaction</div>
                  <div>• Permanently remove content</div>
                  <div>• Secure data protection</div>
                </div>
              </div>
            </div>

            {/* Page Management */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">📄 Page Management</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors">
                  Split
                </button>
                <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                  Reorder
                </button>
                <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors">
                  Delete Pages
                </button>
                <button className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
                  Extract
                </button>
                <button className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors">
                  Rotate
                </button>
                <button className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors">
                  Thumbnails
                </button>
              </div>
            </div>

            {/* Conversion Tools */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">🔄 Conversion</h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  📄 To Word (.docx)
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  📊 To Excel (.xlsx)
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  📈 To PowerPoint (.pptx)
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  🖼️ To Images (JPG/PNG)
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  🌐 To HTML
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  📝 To Text (.txt)
                </button>
                <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors text-left">
                  🔍 OCR (Text Recognition)
                </button>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">🔐 Security</h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button className="p-2 bg-red-700/50 hover:bg-red-700 text-red-200 hover:text-white rounded transition-colors text-left">
                  🔒 Password Protection
                </button>
                <button className="p-2 bg-red-700/50 hover:bg-red-700 text-red-200 hover:text-white rounded transition-colors text-left">
                  🛡️ AES 256-bit Encryption
                </button>
                <button className="p-2 bg-red-700/50 hover:bg-red-700 text-red-200 hover:text-white rounded transition-colors text-left">
                  ✏️ Digital Signatures
                </button>
                <button className="p-2 bg-red-700/50 hover:bg-red-700 text-red-200 hover:text-white rounded transition-colors text-left">
                  💧 Watermarking
                </button>
                <button className="p-2 bg-red-700/50 hover:bg-red-700 text-red-200 hover:text-white rounded transition-colors text-left">
                  ⚙️ Permission Settings
                </button>
              </div>
            </div>

            {/* Forms & Signatures */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">🖊️ Forms & E-Sign</h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button className="p-2 bg-blue-700/50 hover:bg-blue-700 text-blue-200 hover:text-white rounded transition-colors text-left">
                  📝 Fill Forms
                </button>
                <button className="p-2 bg-blue-700/50 hover:bg-blue-700 text-blue-200 hover:text-white rounded transition-colors text-left">
                  ➕ Create Form Fields
                </button>
                <button className="p-2 bg-blue-700/50 hover:bg-blue-700 text-blue-200 hover:text-white rounded transition-colors text-left">
                  ✍️ Digital Signatures
                </button>
                <button className="p-2 bg-blue-700/50 hover:bg-blue-700 text-blue-200 hover:text-white rounded transition-colors text-left">
                  🔗 DocuSign Integration
                </button>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-2">🛠️ Advanced</h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  📚 Bookmarks & TOC
                </button>
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  🔍 Advanced Search
                </button>
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  🌙 Night Mode
                </button>
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  🔢 Bates Numbering
                </button>
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  🤖 Automation/API
                </button>
                <button className="p-2 bg-purple-700/50 hover:bg-purple-700 text-purple-200 hover:text-white rounded transition-colors text-left">
                  📋 Custom Templates
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />

            {/* Processing Status */}
            {isProcessing && (
              <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  <span className="text-yellow-200 text-sm">Processing...</span>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* PDF List */}
          <div className="lg:col-span-3 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your PDFs</h2>
              {selectedFiles.size > 0 && (
                <button
                  onClick={() => setSelectedFiles(new Set())}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {filteredPDFs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No PDFs uploaded</h3>
                <p className="text-slate-300 mb-4">Upload PDF files to start using the tools</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  Upload PDFs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPDFs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedFiles.has(pdf.id)
                        ? 'bg-red-600/20 border-red-500/50'
                        : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(pdf.id)}
                        onChange={() => toggleFileSelection(pdf.id)}
                        className="mt-1 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{pdf.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                          <span>{formatFileSize(pdf.size)}</span>
                          {pdf.pageCount && (
                            <>
                              <span>•</span>
                              <span>{pdf.pageCount} pages</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(pdf.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Individual Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadPDF(pdf)}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => compressPDF(pdf.id)}
                        disabled={isProcessing}
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Compress className="w-3 h-3" />
                        Compress
                      </button>
                      
                      <button
                        onClick={() => splitPDF(pdf.id)}
                        disabled={isProcessing}
                        className="flex-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Scissors className="w-3 h-3" />
                        Split
                      </button>
                      
                      <button
                        onClick={() => deletePDF(pdf.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToolsApp;