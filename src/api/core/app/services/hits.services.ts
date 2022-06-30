import createHttpError, { BadRequest } from 'http-errors';
import { paginate } from 'paging-util';

import { hash } from '../providers/publicHash.provider';
import { uuid } from '../providers/uuid.provider';

import { Hits, Hit } from '../../../data/connections/monk.connection';

import { isObjectID } from '../../../../shared/utils/isObjectID.util';
import { likeRegexpOperator } from '../../../../shared/utils/regexp.utills';
import { descAndAscToDecimal } from '../../../../shared/utils/sorting.util';
import { isNullable } from '../../../../shared/utils/isNullable.util';

export type HitDTO = {
  title?: string;
  description?: string;
  website_url: string;
  website_name: string;
  allow_set: boolean;
  allow_negative?: boolean;
  allow_pinned?: boolean;
};

type MatchOptions = {
  allow_pinned?: boolean;
  title?: any;
};

export type HitPaginationQueries = {
  page: number | any;
  limit?: number | any;
  q?: string | any;
  sorting?: {
    order_by: string;
    sort_by: string;
  };
};

export type HitOptions = {
  onlyPinned?: boolean;
  queries: HitPaginationQueries;
};

export type HitFindOptions = {
  setProtection?: boolean;
};

type HitUpdateOptions = {
  private_hash: string;
  options: HitDTO;
};

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

  async all({ onlyPinned, queries }: HitOptions) {
    const { page, limit, sorting, q: queryString } = queries;

    // @TODO: Sorting, pagination and search by title/custom title.
    const { sort_by, order_by } = sorting;

    const match: MatchOptions = onlyPinned ? { allow_pinned: true } : {};

    if (queryString) {
      const queryStringRemovedSpaces = queryString.trim();

      const likeOperatorRegexp = likeRegexpOperator(queryStringRemovedSpaces);

      match['title'] = likeOperatorRegexp;
    }

    // @TODO: Records/count database.
    const records = await Hits.count(match);

    const { offset, pagination } = paginate({ records, page, limit });

    // @TODO: All records.
    const allowCollectionFiledsToReturn = this.allowCollectionFields();

    const hitsArray = await Hits.find(match, {
      projection: allowCollectionFiledsToReturn,
      limit: pagination.limit,
      skip: offset,
      sort: {
        [sort_by]: descAndAscToDecimal(order_by),
      },
    });

    const hits = hitsArray.map(({ _id: id, ...fields }) => ({ id, ...fields }));

    return {
      hits,
      pagination,
    };
  }

  /** @method create  */
  async create(options: HitDTO): Promise<{ hit: Hit }> {
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

    return {
      hit,
    };
  }

  /** @method update  */
  async update({ private_hash, options }: HitUpdateOptions) {
    const { title, description, website_name, website_url, ...other } = options;

    const match = {
      private_hash,
    } as Hit;

    const hitCollectionIn = await Hits.findOne(match);

    const isNullableCollectionInstance = isNullable(hitCollectionIn);

    if (isNullableCollectionInstance) {
      throw new BadRequest(`Provided HTTP param ERROR: "${private_hash}"`);
    }

    // @TODO: Set: "updated_at" field
    const updated_at = new Date();

    const hitCollectionUpdated = await Hits.update(match, {
      $set: {
        title,
        description,
        website_name,
        website_url,
        ...other,
        updated_at,
      },
    });

    const { nModified: updated_count } = hitCollectionUpdated;

    return {
      updated_count,
    };
  }

  async findByID(id: string) {
    const isParamIsObjectID = isObjectID(id);

    if (!isParamIsObjectID) {
      // @TODO: Is "ObjectID"?
      throw new BadRequest(`Provided HTTP param ERROR: "${id}"`);
    }

    const hit = await this.findByParams({ _id: id });

    return {
      hit,
    };
  }

  async findByPrivateHash(hash: string) {
    const filter = { private_hash: hash };

    // @TODO: Return "all" data.
    const hit = await this.findByParams(filter, {
      setProtection: false,
    });

    return {
      hit,
    };
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
