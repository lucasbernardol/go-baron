import monk from 'monk';
import { env } from '../../config/environment.config';

const monkConnection = monk(env.DATABASE_URI, {
  appname: 'hits',
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export type Hit = {
  _id?: string;
  title?: string;
  description?: string;
  website_url: string;
  website_name: string;
  hits: number;
  public_hash: string;
  private_hash: string;
  allow_set: boolean;
  allow_negative?: boolean;
  allow_pinned?: boolean;
  created_at: Date;
  updated_at: Date;
};

const Hits = monkConnection.get<Hit>('hits');

export { Hits, monkConnection as monk };
