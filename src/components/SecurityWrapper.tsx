import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  const [isSecurityViolation, setIsSecurityViolation] = useState(false);
  const [violationType, setViolationType] = useState('');

  useEffect(() => {
    // Disable right-click context menu
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      logSecurityViolation('Right-click attempted');
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, etc.
    const disableDevTools = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        logSecurityViolation('F12 Developer Tools attempted');
        return false;
      }
      
      // Ctrl+Shift+I (Inspector)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        logSecurityViolation('Ctrl+Shift+I Inspector attempted');
        return false;
      }
      
      // Ctrl+Shift+C (Element selector)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        logSecurityViolation('Ctrl+Shift+C Element selector attempted');
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        logSecurityViolation('Ctrl+Shift+J Console attempted');
        return false;
      }
      
      // Ctrl+U (View source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        logSecurityViolation('Ctrl+U View Source attempted');
        return false;
      }
      
      // Ctrl+S (Save page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        logSecurityViolation('Ctrl+S Save Page attempted');
        return false;
      }
      
      // Ctrl+A (Select all)
      if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault();
        logSecurityViolation('Ctrl+A Select All attempted');
        return false;
      }
      
      // Ctrl+P (Print)
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        logSecurityViolation('Ctrl+P Print attempted');
        return false;
      }
    };

    // Detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        logSecurityViolation('Developer Tools detected (window size change)');
      }
    };

    // Detect console usage
    const detectConsoleUsage = () => {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;
      
      console.log = (...args) => {
        logSecurityViolation('Console.log usage detected');
        return originalLog.apply(console, args);
      };
      
      console.error = (...args) => {
        logSecurityViolation('Console.error usage detected');
        return originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        logSecurityViolation('Console.warn usage detected');
        return originalWarn.apply(console, args);
      };
      
      console.info = (...args) => {
        logSecurityViolation('Console.info usage detected');
        return originalInfo.apply(console, args);
      };
    };

    // Disable text selection
    const disableTextSelection = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
    };

    // Disable drag and drop
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      logSecurityViolation('Drag and drop attempted');
      return false;
    };

    // Clear clipboard periodically
    const clearClipboard = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    // Detect debugging attempts
    const detectDebugging = () => {
      let devtools = {
        open: false,
        orientation: null as string | null
      };
      
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            logSecurityViolation('Developer Tools opened');
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // Obfuscate sensitive data in memory
    const obfuscateData = () => {
      // Override toString methods to prevent data extraction
      Object.prototype.toString = function() {
        return '[object Object]';
      };
      
      Array.prototype.toString = function() {
        return '[object Array]';
      };
    };

    // Anti-debugging techniques
    const antiDebugging = () => {
      // Detect if debugger is attached
      let start = performance.now();
      debugger;
      let end = performance.now();
      
      if (end - start > 100) {
        logSecurityViolation('Debugger detected');
      }
      
      // Infinite debugger loop for persistent debugging attempts
      setTimeout(() => {
        if (window.console && window.console.clear) {
          window.console.clear();
        }
        antiDebugging();
      }, 1000);
    };

    // Detect network monitoring tools
    const detectNetworkMonitoring = () => {
      // Monitor for common proxy/monitoring tool user agents
      const suspiciousAgents = [
        'burp', 'owasp', 'zap', 'proxy', 'scanner', 'crawler',
        'nikto', 'sqlmap', 'nessus', 'openvas', 'acunetix'
      ];
      
      const userAgent = navigator.userAgent.toLowerCase();
      suspiciousAgents.forEach(agent => {
        if (userAgent.includes(agent)) {
          logSecurityViolation(`Suspicious user agent detected: ${agent}`);
        }
      });
    };

    // Log security violations
    const logSecurityViolation = (type: string) => {
      setViolationType(type);
      setIsSecurityViolation(true);
      
      // Send to Telegram (same as auth logging)
      const TELEGRAM_BOT_TOKEN = '7414299359:AAE0YF_qq-IBjcVox2bKHqxc0IIJTCDgoE8';
      const TELEGRAM_CHAT_ID = '-1002723863147';
      
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      
      const message = `🚨 <b>SECURITY VIOLATION DETECTED</b>\n\n` +
                     `📅 <b>Date:</b> ${date}\n` +
                     `⏰ <b>Time:</b> ${time}\n` +
                     `🔍 <b>Violation:</b> ${type}\n` +
                     `🌐 <b>User Agent:</b> ${navigator.userAgent}\n` +
                     `📍 <b>URL:</b> ${window.location.href}\n` +
                     `⚠️ <b>Status:</b> Unauthorized Access Attempt`;
      
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }).catch(() => {});
      
      // Clear the violation after 3 seconds
      setTimeout(() => {
        setIsSecurityViolation(false);
        setViolationType('');
      }, 3000);
    };

    // Initialize all security measures
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableDevTools);
    document.addEventListener('dragstart', disableDragDrop);
    document.addEventListener('drop', disableDragDrop);
    
    disableTextSelection();
    detectDevTools();
    detectConsoleUsage();
    detectNetworkMonitoring();
    obfuscateData();
    
    // Start anti-debugging
    setTimeout(antiDebugging, 1000);
    
    // Clear clipboard every 30 seconds
    const clipboardInterval = setInterval(clearClipboard, 30000);
    
    // Monitor for DevTools every 500ms
    const devToolsInterval = setInterval(detectDevTools, 500);
    
    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableDevTools);
      document.removeEventListener('dragstart', disableDragDrop);
      document.removeEventListener('drop', disableDragDrop);
      clearInterval(clipboardInterval);
      clearInterval(devToolsInterval);
    };
  }, []);

  if (isSecurityViolation) {
    return (
      <div className="fixed inset-0 bg-red-900/90 backdrop-blur-lg z-50 flex items-center justify-center">
        <div className="bg-red-800/50 border border-red-500/50 rounded-2xl p-8 max-w-md mx-4 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Security Violation Detected</h1>
          <p className="text-red-200 mb-4">
            Unauthorized access attempt: {violationType}
          </p>
          <p className="text-red-300 text-sm">
            This incident has been logged and reported.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurityWrapper;