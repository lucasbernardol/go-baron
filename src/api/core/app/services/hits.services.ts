import { BadRequest } from 'http-errors';
import { paginate } from 'paging-util';

import { isObjectID } from '../../../../shared/utils/isObjectID.util';
import { Hits, Hit } from '../../../data/connections/monk.connection';

import { hash } from '../providers/publicHash.provider';
import { uuid } from '../providers/uuid.provider';

export type HitDTO = {
  title?: string;
  description?: string;
  website_url: string;
  website_name: string;
  allow_set: boolean;
  allow_negative?: boolean;
  allow_pinned?: boolean;
};

export type HitPagination = {
  page: number | any;
  limit?: number | any;
  sorting?: {
    /** collection field name  */
    order_by: string;
    sort_by: string;
  };
};

export type HitOptions = {
  onlyHitsPinned?: boolean;
  queries: HitPagination;
};

export type HitFindOptions = {
  setProtection?: boolean;
};

const isNullable = (value: any) => !value || typeof value === 'undefined';

/**
 * @class HitServices
 */
export class HitServices {
  private allowFields: Partial<keyof Hit>[] = [
    'title',
    'description',
    'website_url',
    'website_name',
    'hits',
    'created_at',
    'updated_at',
  ];

  private allowCollectionFields() {
    const collectionFields = this.allowFields.reduce((accumulator, key) => {
      const allowToReturn = 1;

      // Example: { title: 1, ... }
      return { ...accumulator, [key]: allowToReturn };
    }, {});

    return collectionFields;
  }

  private hitObjectToNormalized(hit: Hit) {
    const keys = Object.keys(hit);

    const object = keys.reduce((accumulator, key) => {
      // Replace: "_id" to "id".
      const propertyKey = key === '_id' ? 'id' : key;

      return { ...accumulator, [propertyKey]: hit[key] };
    }, {});

    return object as Partial<Hit>;
  }

  private async findByParams(
    filter: Partial<Hit>,
    { setProtection = true }: HitFindOptions = {}
  ) {
    const collectionProtectionFields = setProtection
      ? this.allowCollectionFields()
      : {};

    const hitPlain = await Hits.findOne(filter, {
      projection: collectionProtectionFields,
    });

    const hit = hitPlain ? this.hitObjectToNormalized(hitPlain) : hitPlain;

    return hit;
  }

  /** @public contructor */
  public constructor() {}

  async all(options: HitOptions) {
    const { onlyHitsPinned, queries } = options;

    const { page, limit, sorting } = queries;

    const allowCollectionFiledsToReturn = this.allowCollectionFields();

    // @TODO: "allow_pinned": true. And pagination
    const filter = onlyHitsPinned ? { allow_pinned: true } : {};

    const records = await Hits.count(filter);

    const { offset, pagination } = paginate({ records, page, limit });

    // @TODO: Pagination and Sorting.
    const { sort_by, order_by = 'asc' } = sorting || {};

    const order = order_by === 'desc' ? -1 : 1;

    const hitsPlainArray = await Hits.find(filter, {
      projection: allowCollectionFiledsToReturn,
      limit: pagination.limit,
      skip: offset,
      sort: {
        [sort_by || 'hits']: order,
      },
    });

    const hits = hitsPlainArray.map(({ _id: id, ...fields }) => {
      return { id, ...fields };
    });

    return { hits, pagination };
  }

  /** @method insert  */
  async insert(options: HitDTO): Promise<{ hit: Hit }> {
    const TOTAL_HITS_INITIAL = 0;

    const {
      title,
      description,
      website_name,
      website_url,
      allow_set = true,
      allow_negative = false,
      allow_pinned = false,
    } = options;

    // @TODO Fields: "created_at" and "updated_at"
    const date = new Date();

    // @TODO ID "public" and "private"
    const public_hash = hash();

    const private_hash = uuid();

    const hit = await Hits.insert({
      title,
      description,
      website_name,
      website_url,
      hits: TOTAL_HITS_INITIAL,
      public_hash,
      private_hash,
      allow_set,
      allow_negative,
      allow_pinned,
      created_at: date,
      updated_at: date,
    });

    return { hit };
  }

  async findByID(id: string) {
    const isParamIsObjectID = isObjectID(id);

    if (!isParamIsObjectID) {
      // @TODO: Is "ObjectID"?
      throw new BadRequest(`Provided HTTP param ERROR: "${id}"`);
    }

    const hit = await this.findByParams({ _id: id });

    return { hit };
  }

  async findByPrivateHash(hash: string) {
    const filter = { private_hash: hash };

    // @TODO: Return "all" data.
    const hit = await this.findByParams(filter, {
      setProtection: false,
    });

    return { hit };
  }

  /**
   * @method up
   * @example
   *  let hits = 10;
   *  hits += 1;
   */
  async up(public_hash: string) {
    const filter = { public_hash } as Hit;

    const hitCollection = await Hits.findOneAndUpdate(filter, {
      $inc: {
        hits: 1,
      },
    });

    const hits = hitCollection ? hitCollection.hits : null;

    return { hits };
  }

  /**
   * @method down
   * @example
   *  let hits = 10;
   *  hits -= 1;
   */
  async down(public_hash: string) {
    const filter = { public_hash } as Hit;

    // TODO: Into database find "hit" instance.
    const hitReturnedInstance = await Hits.findOne(filter);

    const isNullableHitInstance = isNullable(hitReturnedInstance);

    if (isNullableHitInstance) {
      throw new BadRequest(`Provided HTTP params ERROR: "${public_hash}"`);
    }

    // @TODO: down "hits" with "public_hash".
    const { allow_negative, hits: currentHits } = hitReturnedInstance;

    const DOWN_OPERATOR_VALUE = -1;

    const operator = allow_negative ? DOWN_OPERATOR_VALUE : 0;

    const hitsToDecrement = currentHits === 0 ? operator : DOWN_OPERATOR_VALUE;

    const { hits } = await Hits.findOneAndUpdate(filter, {
      $inc: {
        hits: hitsToDecrement,
      },
    });

    return { hits };
  }

  async set(private_hash: string, value: number) {
    const filter = { private_hash } as Hit;

    const hitReturnedPlainInstance = await Hits.findOne(filter);

    const isNullableHitPlainInstance = isNullable(hitReturnedPlainInstance);

    if (isNullableHitPlainInstance) {
      throw new BadRequest(`Provided HTTP param ERROR: "${private_hash}"`);
    }

    // @TODO: set value
    const {
      allow_set,
      allow_negative,
      hits: currentHits,
    } = hitReturnedPlainInstance;

    const hitsToSet = value <= 0 && !allow_negative ? currentHits : value;

    const hitsToSetInDatabase = allow_set ? hitsToSet : currentHits;

    const { hits } = await Hits.findOneAndUpdate(filter, {
      $set: {
        hits: hitsToSetInDatabase,
      },
    });

    return { hits };
  }

  /** @method delete */
  async delete(private_hash: string) {
    const hitCollectionDeleted = await Hits.remove({
      private_hash,
    });

    const { deletedCount: deleted_count } = hitCollectionDeleted;

    return { deleted_count };
  }
}
