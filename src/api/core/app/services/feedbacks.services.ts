import { BadRequest } from 'http-errors';

import { Feedbacks, Feedback } from '../../../data/connections/monk.connection';
import { isObjectID } from '../../../../shared/utils/isObjectID.util';
import { url } from '../providers/gravatar.provider';

type FeedbackDTO = {
  title: string;
  short_description?: string;
  long_description: string;
  author_name: string;
  public_email: string;
  github_username: string;
  allow_pinned?: boolean;
  allow_gravatar?: boolean;
  is_critical?: boolean;
};

type FeedbackOptions = {
  onlyPinned: boolean;
  queries?: any;
};

type FeedbackUpdateOptions = {
  id: string;
  feedback: FeedbackDTO;
};

function normalize<T>(instance: T) {
  const keys = Object.keys(instance);

  const object = keys.reduce((accumulator, key) => {
    const itemKey = key === '_id' ? 'id' : key;

    return { ...accumulator, [itemKey]: instance[key] };
  }, {} as any);

  const { id, ...fields } = object;

  return { id, ...fields } as Partial<T>;
}

/** @class  FeebackServices*/
export class FeedbackServices {
  private readonly fields: Array<keyof Feedback> = [
    'title',
    'short_description',
    'long_description',
    'author_name',
    'public_email',
    'github_username',
    'avatar_url',
    'allow_gravatar',
    'is_critical',
    'created_at',
    'updated_at',
  ];

  private collectionFields() {
    const collectionFields = this.fields;

    return collectionFields.reduce((accumulator, field) => {
      return { ...accumulator, [field]: 1 };
    }, {});
  }

  /** @public constructor */
  public constructor() {}

  async all({ onlyPinned, queries }: FeedbackOptions) {
    const collectionFields = this.collectionFields();

    // filter
    const match = onlyPinned ? { allow_pinned: true } : {};

    const collections = await Feedbacks.find(match, {
      projection: collectionFields,
    });

    const feedbacks = collections.map(({ _id: id, ...fields }) => {
      const { allow_gravatar, public_email, avatar_url: avatar } = fields;

      const avatar_url = allow_gravatar
        ? url(public_email, { d: 'retro' })
        : avatar;

      // Example: { id: "af525...", ... }
      return { id, ...fields, avatar_url };
    });

    return { feedbacks };
  }

  async findByPk(id: string) {
    const isPrimaryKeyParam = isObjectID(id);

    const isNotPrimaryKey = !isPrimaryKeyParam;

    if (isNotPrimaryKey) {
      throw new BadRequest(`Provided HTTP param ERROR: "${id}"`);
    }

    const collection = await Feedbacks.findOne({ _id: id });

    /**  @TODO: Add "avatar_url" */
    const feedback = collection ? normalize(collection) : null;

    if (feedback) {
      const { allow_gravatar, public_email, avatar_url: avatar } = feedback;

      const avatar_url = allow_gravatar ? url(public_email) : avatar;

      feedback['avatar_url'] = avatar_url;
    }

    return { feedback };
  }

  /** @method create */
  async create({
    title,
    short_description,
    long_description,
    public_email,
    author_name,
    github_username,
    allow_pinned = true,
    allow_gravatar = true,
    is_critical = false,
  }: FeedbackDTO) {
    // @TODO: Create "feedback" && add timestamps
    const timestamp = new Date();

    const feedbackCollection = await Feedbacks.insert({
      title,
      short_description,
      long_description,
      author_name,
      public_email,
      github_username,
      avatar_url: null,
      allow_gravatar,
      allow_pinned,
      is_critical,
      created_at: timestamp,
      updated_at: timestamp,
    });

    const feedback = normalize(feedbackCollection);

    return { feedback };
  }

  async update({ id, feedback }: FeedbackUpdateOptions) {
    const {
      title,
      long_description,
      short_description,
      author_name,
      public_email,
      github_username,
      allow_pinned,
      allow_gravatar,
      is_critical,
    } = feedback;

    const collectionFilter = {
      _id: id,
    } as Feedback;

    /** @TODO: Add "updated_at" field */
    const updated_at = new Date();

    const collection = await Feedbacks.findOneAndUpdate(collectionFilter, {
      $set: {
        title,
        long_description,
        short_description,
        author_name,
        public_email,
        github_username,
        allow_pinned,
        allow_gravatar,
        is_critical,
        updated_at,
      },
    });

    const collectionUpdated = normalize(collection) ?? null;

    return {
      feedback: collectionUpdated,
    };
  }

  /** @method delete */
  async delete(id: string) {
    const collectionDeleted = await Feedbacks.remove({
      _id: id,
    });

    const { deletedCount: deleted_count } = collectionDeleted;

    return {
      deleted_count,
    };
  }
}
