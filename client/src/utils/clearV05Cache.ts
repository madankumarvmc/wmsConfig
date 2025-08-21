/**
 * Utility functions to clear V0.5 configuration cache
 */

// Clear all V0.5 localStorage data
export function clearV05LocalStorage() {
  const keysToRemove = [
    'outboundV05Draft.lineSplit',
    'outboundV05Draft.taskSequence', 
    'outboundV05Draft.taskStrategy',
    'outboundV05Draft.binSearch',
    'outboundV05.lineSplit',
    'outboundV05.taskSequence',
    'outboundV05.taskStrategy', 
    'outboundV05.binSearch'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared localStorage key: ${key}`);
  });
  
  console.log('✅ All V0.5 localStorage cache cleared');
}

// Clear all localStorage data (more aggressive)
export function clearAllLocalStorage() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('outbound') || key.includes('V05') || key.includes('v05')) {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    }
  });
  
  console.log('✅ All outbound-related localStorage cache cleared');
}

// Make functions available globally for console access
declare global {
  interface Window {
    clearV05Cache: () => void;
    clearAllCache: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.clearV05Cache = clearV05LocalStorage;
  window.clearAllCache = clearAllLocalStorage;
}