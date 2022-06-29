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

export type HitOptions = {
  onlyHitsPinned?: boolean;
};

export type HitFindOptions = {
  setProtection?: boolean;
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

  async all({ onlyHitsPinned }: HitOptions = {}): Promise<{ hits: Hit[] }> {
    const allowCollectionFiledsToReturn = this.allowCollectionFields();

    // @TODO: "allow_pinned": true
    const filter = onlyHitsPinned ? { allow_pinned: true } : {};

    const hitsPlainArray = await Hits.find(filter, {
      projection: allowCollectionFiledsToReturn,
    });

    // @TODO: Normalid id
    const hits = hitsPlainArray.map(({ _id: id, ...fields }) => {
      return { id, ...fields };
    });

    return { hits };
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
    const filter = { _id: id };

    const hit = await this.findByParams(filter);

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
}
