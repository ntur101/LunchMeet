import { createContext, useContext, useEffect, useState } from 'react';
import { auth, initializeAuth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          displayName: user.displayName || `User-${user.uid.slice(0, 6)}`,
          isAnonymous: user.isAnonymous
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Auto sign in if no user
    initializeAuth().catch((error) => {
      console.error('Failed to initialize auth:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
