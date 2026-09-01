import axios from 'axios';
import { Logger } from "@cnips/simplelog";

export const IMANSYSFILTERS = [{
  title: "gs_badg_saas_iManSys_Mass-Pflicht_Admin",
  importKey: "gs_badg_saas_iManSys_Mass-Pflicht_Admin",
  filterType: 0,
},
{
  title: "gs_badg_saas_iManSys_Mass-Pflicht_Autor",
  importKey: "gs_badg_saas_iManSys_Mass-Pflicht_Autor",
  filterType: 0,
},
{
  title: "gs_badg_saas_iManSys_Mass-Pflicht_Zuweiser",
  importKey: "gs_badg_saas_iManSys_Mass-Pflicht_Zuweiser",
  filterType: 0,
},
{
  title: "gs_badg_saas_iManSys_Risik-Gefahr_Admin",
  importKey: "gs_badg_saas_iManSys_Risik-Gefahr_Admin",
  filterType: 0,
},
{
  title: "gs_badg_saas_iManSys_Risik-Gefahr_Autor",
  importKey: "gs_badg_saas_iManSys_Risik-Gefahr_Autor",
  filterType: 0,
},
{
  title: "gs_badg_saas_iManSys_Risik-Gefahr_Lesen",
  importKey: "gs_badg_saas_iManSys_Risik-Gefahr_Lesen",
  filterType: 0,
}
]

interface Config {
  [key: string]: any;
}

export async function execute(event: CnipsIncomingEventData, config: Config, vars: any, LOG: Logger): Promise<CnipsOutgoingEventData> {
  try {
    LOG.info(`Executing Imansys user import for ${event.kunden?.length || 0} kunden`);
    LOG.info(`Config: %j`, config);
        LOG.info("Initial event: %j", event);


    if (!event.tokenResponse || !event.tokenResponse.token) {
      LOG.error('Imansys token not found in event data');
      throw new Error('Imansys token not found in event data');
    }

    if (!event.kunden || event.kunden.length === 0) {
      LOG.error('No KUNDEN found in event data');
      return event;
    }

    await collectUser(event.kunden, event.tokenResponse.token, null, [], LOG, config);

    LOG.info("Finished Imansys User Import processing");
    LOG.info("Final event: %j", event);

    event.statusObject.success = true;
    event.statusObject.message = "Finished Imansys User Import processing.";

    return event;
  } catch (error) {
    LOG.error('Error executing Imansys user import:', error);
    throw error;
  }
}

function isSmallBusiness(kunde: Kunde): boolean {
  // kukla dient der Indentifikation, Kleinstkunde (KBB) = 1 sonst 0
  // Handle cases where kukla might be "1", "0001", "01", etc. (leading zeros)
  if (kunde.kukla) {
    const kuklaValue = kunde.kukla.trim();
    // Check if value equals "1" or ends with "1" with only zeros before it
    if (kuklaValue === "1" || /^0*1$/.test(kuklaValue)) {
      return true;
    }
  }
  return false;
}


async function collectUser(kunden: (KundenWrapper[] | KundenB[] | Kunde[]), token: string, tenantImportKey: string | null, import_users: ImansysUser[], LOG: Logger, config) {
  LOG.info("collectUser called for %d customers, tenantImportKey: %s", kunden.length, tenantImportKey || 'null');


  for (const kunde of kunden) {
    // Check which level we are processing
    let workingKunde!: Kunde;
    if ('kundeUber' in kunde) {
      // This is a top-level kunde wrapper, initialize the import users as empty array
      import_users = [];
      workingKunde = kunde.kundeUber;
      tenantImportKey = kunde.kundeUber.kunnr;
    } else if ('kundeBs' in kunde) {
      workingKunde = kunde.kundeBs;
      // tenantImportKey is the given one
    } else {
      workingKunde = kunde;
    }
    let admin: Admin | null = null;
    if (workingKunde.admin) {
      admin = workingKunde.admin;
    }
    if (admin) {
      if (!isSmallBusiness(workingKunde)) {
        continue;
      }

      if (!canAdminBeImported(admin)) {
        LOG.info("Skipping import for customer %s due to incomplete ADMIN data", workingKunde.kunnr);
        continue; // Skip this iteration if ADMIN data is incomplete
      }

      LOG.info("collectUser processing admin: %s", admin.namen);
      const title = [
        admin.namen?.trim(),
        admin.namev?.trim(),
        admin.jPprsnr?.trim()
      ].filter(Boolean).join("-");

      const filters: UserFilterReference[] = IMANSYSFILTERS.map(filter => ({
        importKey: filter.importKey,
      }));

      let user: ImansysUser = {
        title: title,
        importKey: admin.jPprsnr,
        isActive: true,
        roles: 1,
        firstname: admin.namev,
        lastname: admin.namen,
        login: admin.mailp, //TODO: Muss geändert werden auf cidaas sub ()
        email: admin.mailp,
        filters: filters,
        hierarchyNode: {
          importKey: workingKunde.kunnr// ImportKey der Hierarchienode hier einfügen
        }
      };

      LOG.info("Pushing user to be imported: %j", user);
      import_users.push(user);
    }

    if ('kundeUber' in kunde) {
      // Top-level kunde, check for kundenBs
      if (kunde.kundenBs && kunde.kundenBs.length > 0) {
        // Recursive call to collectUser for BSN customers
        await collectUser(kunde.kundenBs, token, tenantImportKey, import_users, LOG, config);
      }
    }
    if ('kundeBs' in kunde) {
      // BSN level kunde, check for UNTERBSN
      if (kunde.kundenUbs && kunde.kundenUbs.length > 0) {
        // Recursive call to collectUser for UNTERBSN customers
        await collectUser(kunde.kundenUbs, token, tenantImportKey, import_users, LOG, config);
      }
    }

    if ('kundeUber' in kunde) {
      // Back in recursion at top-level, import all users
      LOG.info("Importing %d users for tenant %s", import_users.length, tenantImportKey);
      LOG.info("Users to import: %j", import_users);
      await importUsers(import_users, tenantImportKey!, token, LOG, config);
    }
  }
}

function canAdminBeImported(admin: Admin | null): boolean {
  if (!admin) {
    return false;
  }

  // Might look like this: EMAIL: Array [ "\n        " ] - this is also not valid data
  const emailValue = admin.mailp.trim();
  const nameValue = admin.namen?.trim();
  const vornameValue = admin.namev?.trim();
  const personnrValue = admin.jPprsnr?.trim();

  // Check that all of the fields NAME, VORNAME, PERSONNR, EMAIL are present and non-empty, and not just whitespace, and also not empty-string
  if (!emailValue || emailValue === "") {
    return false;
  }
  if (!nameValue || nameValue === "") {
    return false;
  }
  if (!vornameValue || vornameValue === "") {
    return false;
  }
  if (!personnrValue || personnrValue === "") {
    return false;
  }


  return true;
}

async function importUsers(tmp_users: ImansysUser[], tenantkey: string, token: string, LOG: Logger, config) {
  if (tmp_users.length === 0) {
    return;
  }
  const requestData: ImansysUserImportRequest = {
    title:
      'cnips SAP User Import for ' + tenantkey + ' ' +
      new Date().toISOString(),
    users: tmp_users,
    tenant: {
      importkey: tenantkey
    },
    options: 16 //Options 16 needs to be set for the filters to be added to the users.
  };

  try {
    LOG.info("User import request data: %j", requestData);

    const response = await axios.post(config.imansys_user_url, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    LOG.info("Imansys user import successful for tenant: %s", tenantkey);
    LOG.info("Imansys import response status: %s", response.status);
    LOG.info("Imansys import response data: %j", response.data);
    
    // Log important response fields if available
    if (response.data) {
      if (response.data.id) {
        LOG.info("Imansys import job ID: %s", response.data.id);
      }
      if (response.data.jobId) {
        LOG.info("Imansys import jobId: %s", response.data.jobId);
      }
      if (response.data.status) {
        LOG.info("Imansys import status: %s", response.data.status);
      }
    }
    
    LOG.info("Full Imansys import response: %j", response);

  } catch (error: any) {
    LOG.error('Error importing Imansys users for tenant %s: %s', tenantkey, error.message);
    LOG.info('Error details: %j', {
      requestData: requestData,
      response: error.response?.data,
      stack: error.stack
    });
    throw error;
  }
}

export interface CnipsOutgoingEventData extends CnipsIncomingEventData {
}
export interface CnipsIncomingEventData {
  kunden: KundenWrapper[];
  statusObject: StatusObject;
  tokenResponse?: ImansysTokenResponse;
}

interface StatusObject {
  success: boolean;
  message: string;
  data?: ProccessedGroups;
}

export interface HierarchyNode {
  importKey: string;
  title: string;
  parent?: Parent;
  customFields?: CustomFields;
}

export interface Field {
  key: string;
  value: string;
}

interface StatusObject {
  success: boolean;
  message: string;
  data?: ProccessedGroups;
}

interface ProccessedGroups {
  groupsCreatedorUpdated: GroupIdsProcessed;
  adminsCreated: string[];
  adminsAlreadyExisting: string[];
  failedAdmins: string[];
}

interface GroupIdsProcessed {
  topLevelKunden: string[];
  kundenBs: string[];
  kundenUBs: string[];
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

export interface ImansysTokenResponse {
  user: User;
  token: string;
  expirationDate: Date;
  issuedAtDate: Date;
  hasMultipleTenants: boolean;
  resourceVersion: number;
}

export interface Tenant {
  importkey: string;
  customerNumber: string;
  name: string;
  contact: Contact;
  isactive: boolean;
  matchcode: string;
  isAvailableForAllUsersOfSystemTenant: boolean;
  customFields: CustomFields;
}

export interface Contact {
  firstName: string;
  lastName: string;
  street: string;
  additionalAddress: string;
  zipCode: string;
  city: string;
  countryCode: string;
  phone: string;
  fax: string;
  email: string;
  mobile: string;
}

export interface CustomFields {
  fields: Field[];
}

export interface Field {
  key: string;
  value: string;
}

// old

export interface ImansysUserImportRequest {
  title: string;
  options: number;
  tenant: UserImportTenant;
  users: ImansysUser[];
}

export interface ImansysUser {
  importKey: string;
  isActive: boolean;
  title: string;
  login: string;
  roles: number;
  firstname: string;
  lastname: string;
  email: string;
  filters?: UserFilterReference[];
  hierarchyNode: HierarchieNodeImportKeyRef;
}

export interface HierarchieNodeImportKeyRef {
  importKey: string;
}

export interface UserFilterReference {
  importKey?: string;
  id?: number;
  title?: string;
}

export interface ImansysFilter {
  importKey: string;
  title: string;
  filterType: number;
}
export interface HierarchyImportTenant {
  id: string;
  importKey?: string;
}

export interface HierarchyNode {
  importKey: string;
  title: string;
  parent?: Parent;
  customFields?: CustomFields;
}

export interface CustomFields {
  fields: Field[];
}

export interface Field {
  key: string;
  value: string;
}

export interface Parent {
  importKey: string;
  title: string;
}


/** Incoming Event Data **/


export interface TokenResponse {
  user: User;
  token: string;
  expirationDate: Date;
  issuedAtDate: Date;
  hasMultipleTenants: boolean;
  resourceVersion: number;
}

export interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  languageName: string;
  isPasswordChangeRequired: boolean;
  roles: number;
  applicationRoles: ApplicationRole[];
  logoUrl: string;
  isVisit: boolean;
  tenantId: number;
  tenantName: string;
  hierarchyId: number;
  mainTenantId: number;
}

export interface ApplicationRole {
  application: number;
  roles: number;
}


export interface UserImportTenant {
  importkey: string;
}

export interface Field {
  key: string;
  value: string;
}