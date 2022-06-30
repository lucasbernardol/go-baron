import monk from 'monk';
import { env } from '../../config/environment.config';

const monkConnection = monk(env.DATABASE_URI, {
  appname: 'hits',
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export type Feedback = {
  _id?: string;
  title: string;
  short_description?: string;
  long_description: string;
  public_email: string;
  github_username: string;
  is_critical?: boolean;
  allow_pinned?: boolean;
  created_at: Date;
  updated_at: Date;
};

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

const Feedbacks = monkConnection.get<Feedback>('feedbacks');

export { Hits, Feedbacks, monkConnection as monk };
