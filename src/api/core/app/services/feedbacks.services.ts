import { BadRequest } from 'http-errors';

import { Feedbacks, Feedback } from '../../../data/connections/monk.connection';
import { isObjectID } from '../../../../shared/utils/isObjectID.util';

type FeedbackDTO = {
  title: string;
  short_description?: string;
  long_description: string;
  public_email: string;
  github_username: string;
  is_critical?: boolean;
  allow_pinned?: boolean;
};

type FeedbackOptions = {
  onlyPinned: boolean;
  queries?: any;
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
    'public_email',
    'github_username',
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
    // fields
    const collectionProtectionFields = this.collectionFields();

    const match = onlyPinned ? { allow_pinned: true } : {};

    const feedbackCollections = await Feedbacks.find(match, {
      projection: collectionProtectionFields,
    });

    const feedbacks = feedbackCollections.map(({ _id: id, ...fields }) => {
      // Example: { id: "af525...", ... }
      return { id, ...fields };
    });

    return {
      feedbacks,
    };
  }

  async findByPk(primaryKey: string) {
    const isPrimaryKeyParam = isObjectID(primaryKey);

    const isNotPrimaryKey = !isPrimaryKeyParam;

    if (isNotPrimaryKey) {
      throw new BadRequest(`Provided HTTP param ERROR: "${primaryKey}"`);
    }

    const feedbackCollection = await Feedbacks.findOne({
      _id: primaryKey,
    });

    const feedback = feedbackCollection ? normalize(feedbackCollection) : null;

    return {
      feedback,
    };
  }

  /** @method create */
  async create({
    title,
    short_description,
    long_description,
    public_email,
    github_username,
    is_critical = false,
    allow_pinned = true,
  }: FeedbackDTO) {
    // @TODO: Create "feedback" && add timestamps
    const timestamp = new Date();

    const feedbackCollection = await Feedbacks.insert({
      title,
      short_description,
      long_description,
      public_email,
      github_username,
      is_critical,
      allow_pinned,
      created_at: timestamp,
      updated_at: timestamp,
    });

    const feedback = normalize(feedbackCollection);

    return {
      feedback,
    };
  }

  async update() {}

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
