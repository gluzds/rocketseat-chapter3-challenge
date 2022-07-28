import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export interface PrismicConfig {
  req?: HttpRequestLike;
}

const repositoryName = 'chapter3-challenge'

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_API_ENDPOINT,
  })

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}