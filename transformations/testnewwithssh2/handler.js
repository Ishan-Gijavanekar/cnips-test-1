import axios from "axios";
import { Logger } from "@cnips/simplelog";
import pako from "pako";
import { Client as SSHClient } from "ssh2";

interface Config {
  sshprivatekey: string;
  batchSize?: number;
  [key: string]: any;
}

function getFileViaSftp(
  sftp: any,
  remotePath: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    sftp.readFile(remotePath, (err: Error, data: Buffer) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export async function execute(
  config: Config,
  vars: any,
  LOG: Logger
): Promise<CnipsOutgoingEventData[]> {
  LOG.info("Executing extractor");
  LOG.debug("Config: %j", config);
  LOG.debug("Vars: %j", vars);

  const conn = new SSHClient();
  let decompressed: Buffer | null = null;

  try {
    decompressed = await new Promise<Buffer>((resolve, reject) => {
      conn
        .on("ready", () => {
          LOG.info("SFTP connection established");

          conn.sftp(async (err, sftp) => {
            if (err) return reject(err);

            try {
              const gzipBuffer = await getFileViaSftp(
                sftp,
                "/aishwarya.gzip"
              );

              const inflated = pako.inflate(gzipBuffer, {
                to: "string",
              });

              resolve(Buffer.from(inflated, "utf-8"));
            } catch (e) {
              reject(e);
            } finally {
              conn.end();
            }
          });
        })
        .on("error", reject)
        .connect({
          host: "ftp.aishwarya.de",
          port: 22,
          username: "ciam",
          privateKey: config.sshprivatekey,
        });
    });
  } catch (err: any) {
    LOG.error(
      "ftp.aishwarya.de SFTP connection error: %s - Aborting.",
      err.message
    );
    throw err;
  }

  if (!decompressed) {
    LOG.warn("No json to process. Returning empty array.");
    return [];
  }

  LOG.debug("Decompressed data length: %d bytes", decompressed.length);

  const sapData = JSON.parse(decompressed.toString());
  if (!Array.isArray(sapData?.data)) {
    LOG.warn("No JSON Array in data: %j", sapData);
    return [];
  }

  const batchSize = config.batchSize || 200;
  return sapData.data;

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
