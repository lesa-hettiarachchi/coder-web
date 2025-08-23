import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export const useNavigationCookies = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side and when component mounts
    if (typeof window === 'undefined') return;

    // Read the activePage cookie to restore previous navigation
    const lastVisitedPage = Cookies.get('activePage');
    
    if (lastVisitedPage && lastVisitedPage !== pathname) {
      // Check if the stored path is valid
      const validPaths = ['/', '/about', '/coding-races', '/escape-rooms', '/court-rooms'];
      if (validPaths.includes(lastVisitedPage)) {
        // Only redirect if we're on the home page and have a valid stored path
        if (pathname === '/') {
          router.push(lastVisitedPage);
        }
      }
    }
  }, [router, pathname]);

  const setActivePage = (href: string) => {
    Cookies.set('activePage', href, { expires: 7 });
  };

  return { setActivePage };
};
