import { BadRequest } from 'http-errors';
import { paginate } from 'paging-util';

import { url } from '../providers/gravatar.provider';
import { Feedbacks, Feedback } from '../../../data/connections/monk.connection';

import { likeRegexpOperator } from '../../../../shared/utils/regexp.utills';
import { paginationNormalize } from '../../../../shared/utils/pagination.util';
import { descAndAscToDecimal } from '../../../../shared/utils/sorting.util';
import { isObjectID } from '../../../../shared/utils/isObjectID.util';

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

type FilterOptions = {
  allow_pinned?: boolean;
  title?: RegExp | string;
};

type FeedbackOptions = {
  onlyPinned: boolean;
  queries: {
    page: number;
    limit: number;
    q?: string;
    sorting: {
      sort_by: string;
      order_by: string;
    };
  };
};

type FeedbackUpdateOptions = {
  id: string;
  options: FeedbackDTO;
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

/** @class FeebackServices */
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

  private collectionFields(): object {
    const collectionFields = this.fields;

    return collectionFields.reduce((accumulator, field) => {
      return { ...accumulator, [field]: 1 };
    }, {});
  }

  /**
   * @public constructor
   **/
  public constructor() {}

  async all({ onlyPinned, queries }: FeedbackOptions) {
    const { sorting, q: titleFilter, page, limit } = queries;

    const protection = this.collectionFields();

    const filter: FilterOptions = onlyPinned ? { allow_pinned: true } : {};

    if (titleFilter) {
      const queryStrTrim = titleFilter.trim();

      const titleRegexpFilter = likeRegexpOperator(queryStrTrim);

      filter['title'] = titleRegexpFilter;
    }

    // All collections
    const records = await Feedbacks.count(filter);

    const { offset, pagination: P } = paginate({ records, page, limit });

    // Sorting: {}
    const { sort_by, order_by } = sorting;

    // Return: [Feedback, ....]
    const collections = await Feedbacks.find(filter, {
      limit: P.limit,
      skip: offset,
      sort: {
        [sort_by]: descAndAscToDecimal(order_by), // -1 OR 1
      },
      projection: protection,
    });

    // Return: [{ id: 'fa58...', ... }]
    const feedbacks = collections.map(({ _id: id, ...fields }) => {
      const { allow_gravatar, public_email, avatar_url: avatar } = fields;

      const avatar_url = allow_gravatar ? url(public_email) : avatar;

      return { id, ...fields, avatar_url };
    });

    // Use: "snake_case"
    const pagination = paginationNormalize({ pagination: P });

    return { feedbacks, pagination };
  }

  async findByPk(id: string) {
    const isPrimaryKeyParam = isObjectID(id);

    const isNotPrimaryKey = !isPrimaryKeyParam;

    if (isNotPrimaryKey) {
      throw new BadRequest(`Provided HTTP param ERROR: "${id}"`);
    }

    const collection = await Feedbacks.findOne({
      _id: id,
    });

    const feedback = collection ? normalize(collection) : null;

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
    allow_pinned,
    allow_gravatar,
    is_critical,
  }: FeedbackDTO) {
    // @TODO: Save current image
    const avatar_url = allow_gravatar ? url(public_email) : null;

    // @TODO: Create "feedback" && add timestamps
    const timestamp = new Date();

    const collection = await Feedbacks.insert({
      title,
      short_description,
      long_description,
      author_name,
      public_email,
      github_username,
      avatar_url,
      allow_gravatar,
      allow_pinned,
      is_critical,
      created_at: timestamp,
      updated_at: timestamp,
    });

    const feedback = normalize(collection);

    return { feedback };
  }

  async update({ id, options }: FeedbackUpdateOptions) {
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
    } = options;

    /** @TODO: Add "avatar_url" field */
    const avatar_url = allow_gravatar ? url(public_email) : null;

    const collectionFilter = {
      _id: id,
    } as Feedback;

    const collection = await Feedbacks.findOneAndUpdate(collectionFilter, {
      $set: {
        title,
        long_description,
        short_description,
        author_name,
        public_email,
        github_username,
        avatar_url,
        allow_pinned,
        allow_gravatar,
        is_critical,
        updated_at: new Date(),
      },
    });

    const feedback = collection ? normalize(collection) : null;

    return { feedback };
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
