import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabActionParams } from '@/types/tabs';

export const useUrlParams = (onAdd: Function, onEdit: Function, onDelete?: Function) => {
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
    } else if (action === 'delete' && id && onDelete) {
      if (actionKey !== lastActionKey) {
        onDelete(parseInt(id));
        sessionStorage.setItem('lastTabActionKey', actionKey);
      }
      handledRef.current = true;
      router.replace('/');
    }
  }, [searchParams, router, onAdd, onEdit, onDelete]);
};