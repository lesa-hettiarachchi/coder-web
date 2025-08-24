import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export const useNavigationCookies = () => {
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hasNavigatedRef.current) return;

    const lastVisitedPage = Cookies.get('activePage');
    
    if (lastVisitedPage && lastVisitedPage !== pathname) {
      const validPaths = ['/', '/about', '/coding-races', '/escape-rooms', '/court-rooms'];
      if (validPaths.includes(lastVisitedPage)) {
        if (pathname === '/' && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          router.push(lastVisitedPage);
        }
      }
    }
  }, [router, pathname]);

  const setActivePage = (href: string) => {
    Cookies.set('activePage', href, { expires: 7 });
    hasNavigatedRef.current = true;
  };

  return { setActivePage };
};
