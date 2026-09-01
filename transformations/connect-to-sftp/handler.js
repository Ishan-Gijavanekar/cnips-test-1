import axios from "axios";
import { Logger } from "@cnips/simplelog";
import pako from 'pako';
import Client from 'pure-js-sftp';

interface Config {
  sshprivatekey: string;
  batchSize?: number;
  [key: string]: any;
}

function splitKundenBatches(kundenWrapper: KundenWrapper[], batchSize: number = 50): KundenWrapper[][] {
  const kundenWrapperArray: KundenWrapper[][] = [];

  for (let i = 0; i < kundenWrapper.length; i += batchSize) {
    let batchData: KundenWrapper[] = [];
    batchData = kundenWrapper.slice(i, i + batchSize);
    kundenWrapperArray.push(batchData);
  }
  return kundenWrapperArray;
}

export async function execute(event: any, config: Config, vars: any, LOG: Logger): Promise<CnipsOutgoingEventData[]> {
  try {
    LOG.info("Executing extractor");
    LOG.debug("Config: %j", config);
    LOG.debug("Vars: %j", vars);]
    const sftp = new Client();
    const sftpconfig = {
      host: 'ftp.aishwarya.de',
      port: 22,
      username: 'ciam',
      privateKey: "config.sshprivatekey",
    };

    let decompressed: Buffer | null = null;
    try {
      await sftp.connect(sftpconfig);
      LOG.info('SFTP connection established');
      const gzipBuffer = await sftp.get('/aishwarya.gzip');
      // Use pako to decompress gzip data
      const decompressedData = pako.inflate(gzipBuffer, { to: 'string' });
      decompressed = Buffer.from(decompressedData, 'utf-8');
      await sftp.end();
    } catch (err: any) {
      LOG.error('ftp.bad-gmbh.de SFTP connection error: %s - Aborting.', err.message);
      await sftp.end().catch(() => { }); // Try to close connection even if there was an error
      throw err;
    }

    if (decompressed == null) {
      LOG.error("Could not fetch and decompress JSON File! Aborting.");
      throw new Error("Could not fetch and decompress JSON File");
    }

    if (!decompressed) {
      LOG.warn("No json to process. Returning empty array.");
      return [];
    }

    LOG.debug('Decompressed data length: %d bytes', decompressed.length);

    const sapData = JSON.parse(decompressed.toString());
    if (!sapData) {
      LOG.error('No data to process. Returning empty array.');
      return [];
    }

    if (Array.isArray(sapData.data)) {
      const batchSize = config.batchSize || 200;
      const batches = splitKundenBatches(sapData.data, batchSize);
      LOG.info('Finished splitting into %d batches', batches.length);
      LOG.debug('Batch sizes: %j', batches.map(b => b.length));

      // Return array of batch objects
      const extractedData: CnipsOutgoingEventData[] = batches.map(batch => ({
        kunden: Array.isArray(batch) ? batch : []
      }));

      return extractedData;
    } else {
      LOG.warn("No JSON Array in data: %j", sapData);
      return [];
    }
  } catch (error) {
    LOG.error('Error running extractor:', error);
    throw error;
  }
}

export interface CnipsIncomingEventData {
  data: KundenWrapper[];
}

export interface CnipsOutgoingEventData {
  kunden: KundenWrapper[];
}

export interface KundenWrapper {
  kundeUber: Kunde;
  kundenBs: KundenB[];
}

export interface Kunde {
  kunnr: string;
  name1: null | string;
  name2: null | string;
  name3: null | string;
  stras: string;
  pstlz: string;
  ort01: string;
  land1: string;
  spras: string;
  telf1: null;
  wzsch: null | string;
  ktokd: string;
  kukla: string;
  katr7: null | string;
  bahne: null | string;
  vndat: null | string;
  oezent: string;
  oevam: string;
  vkbur: string;
  vkgrp: string;
  aufsd: null | string;
  admin: null | Admin;
  artikeln: Artikeln[] | null;
}

export interface Artikeln {
  matnr: string;
  maktx: string;
}

export interface KundenB {
  kundeBs: Kunde;
  kundenUbs: Kunde[];
}

export interface Admin {
  namen: string;
  namev: string;
  telfp: string;
  mailp: string;
  jPprsnr: string;
}
