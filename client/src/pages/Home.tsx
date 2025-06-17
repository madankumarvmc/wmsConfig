import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to step 1 when accessing the home page
    setLocation('/step1');
  }, [setLocation]);

  return null;
}
