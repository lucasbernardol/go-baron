import monk, { IMonkManager, ICollection } from 'monk';
import { env } from '../../config/environment.config';

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

export type Feedback = {
  _id?: string;
  title: string;
  short_description?: string;
  long_description: string;
  author_name: string;
  public_email: string;
  github_username: string;
  avatar_url?: string;
  allow_pinned?: boolean;
  allow_gravatar?: boolean;
  is_critical?: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Collections = {
  Hits: ICollection<Hit>;
  Feedbacks: ICollection<Feedback>;
};

/** @class MonkConnection */
class MonkConnection {
  private static instance: MonkConnection = null;

  public monk: Promise<IMonkManager> & IMonkManager;

  public static getInstance(): MonkConnection {
    const monkConnectionInstanceNotExists = !this.instance;

    if (monkConnectionInstanceNotExists) {
      this.instance = new MonkConnection();
    }

    return this.instance;
  }

  /** @private constructor */
  public constructor() {}

  public connect(): MonkConnection {
    const monkConnectionInstance = monk(env.DATABASE_URI, {
      appname: 'hits',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.monk = monkConnectionInstance;

    return this;
  }

  public collections(): Collections {
    const Hits = this.monk.get<Hit>('hits');

    const Feedbacks = this.monk.get<Feedback>('feedbacks');

    return { Hits, Feedbacks };
  }
}

const monkConnection = MonkConnection.getInstance();

// Collections/MongoDB connection
const { Hits, Feedbacks } = monkConnection.connect().collections();

const connection = monkConnection.monk;

export { Hits, Feedbacks, connection };
