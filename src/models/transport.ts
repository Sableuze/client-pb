import { IMetaContext } from '@app/models';

export interface ITransport extends IMetaContext {
  name: string;
  typeId: number | string;
  regNumber?: string;
  avgConsumption: number;
  organisationId?: number;
  unit?: 'Kv' | 'L';
  mileage?: string;
}

export interface ITransportHeaders {}
