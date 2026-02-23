import { KurrentDBClient } from '@kurrent/kurrentdb-client';

let kurrentClient: KurrentDBClient;

async function initializeKurrentClient(): Promise<void> {
  if (kurrentClient) {
    return;
  }

  const connectionString =
    process.env.KURRENT_URL ||
    'kurrentdb://admin:changeit@localhost:2113?tls=false';
  kurrentClient = KurrentDBClient.connectionString`${connectionString}`;
}

async function getKurrentClient(): Promise<KurrentDBClient> {
  if (!kurrentClient) {
    await initializeKurrentClient();
  }

  return kurrentClient;
}

export { getKurrentClient, initializeKurrentClient };
