import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabActionParams } from '@/types/tabs';

// Store last processed action in sessionStorage to avoid duplicate tab addition
export const useUrlParams = (onAdd: Function, onEdit: Function) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const action = searchParams.get('action') as TabActionParams['action'];
    const title = searchParams.get('title');
    const instructions = searchParams.get('instructions');
    const code = searchParams.get('code');
    const id = searchParams.get('id');

    // Create a unique key for this action
    const actionKey = `${action}-${id ?? ''}-${title ?? ''}-${instructions ?? ''}-${code ?? ''}`;
    const lastActionKey = sessionStorage.getItem('lastTabActionKey');

    if (action === 'add' && title && instructions && code) {
      if (actionKey !== lastActionKey) {
        onAdd({ title, instructions, code });
        sessionStorage.setItem('lastTabActionKey', actionKey);
      }
      handledRef.current = true;
      router.replace('/');
    } else if (action === 'edit' && id && title && instructions && code) {
      if (actionKey !== lastActionKey) {
        onEdit(parseInt(id), { title, instructions, code });
        sessionStorage.setItem('lastTabActionKey', actionKey);
      }
      handledRef.current = true;
      router.replace('/');
    }
  }, [searchParams, router, onAdd, onEdit]);
};