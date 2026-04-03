export interface PaperclipConfig {
  baseUrl: string;
  apiKey?: string;
}

export async function paperclipFetch(
  config: PaperclipConfig,
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Paperclip API error ${res.status}: ${text}`);
  }
  return res.json();
}
