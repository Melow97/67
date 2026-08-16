window.ask67AI = async function(input, messages = []) {
  const client = get67AuthClient();
  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) throw new Error('Sign in to use 67 AI.');

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ input, messages })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '67 AI is unavailable.');
  return data;
};
