export const createTabParams = (action: 'add' | 'edit', data: any) => {
  return new URLSearchParams({
    action,
    title: data.title,
    instructions: data.instructions,
    code: data.code
  });
};

export const navigateToHome = (router: any) => {
  router.push('/');
};

export const navigateWithParams = (router: any, path: string, params: URLSearchParams) => {
  router.push(`${path}?${params.toString()}`);
};