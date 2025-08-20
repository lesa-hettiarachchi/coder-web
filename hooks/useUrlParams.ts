import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabActionParams } from '@/types/tabs';

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

    if (action === 'add' && title && instructions && code) {
      onAdd({ title, instructions, code });
      handledRef.current = true;
      router.replace('/');
    } else if (action === 'edit' && id && title && instructions && code) {
      onEdit(parseInt(id), { title, instructions, code });
      handledRef.current = true;
      router.replace('/');
    }
  }, [searchParams, router, onAdd, onEdit]);
};