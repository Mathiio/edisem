import React, { useState, useEffect } from 'react';
import { Input, Spinner, Button } from '@nextui-org/react';
import { useFetchDataDetails } from '@/hooks/useFetchData';

class Omk {
  private key: string | undefined;
  private ident: string | undefined;
  private mail: string | undefined;
  private api: string | undefined;
  private vocabs: string[];
  private user: User | false;
  private props: any[]; // Adapter le type si possible
  private class: any[]; // Adapter le type si possible
  private rts: any[]; // Adapter le type si possible
  private perPage: number = 1000;
  private types: { [key: string]: string } = { items: 'o:item', media: 'o:media' };

  constructor(params: { key?: string; ident?: string; mail?: string; api?: string; vocabs?: string[] }) {
    this.key = params.key || undefined;
    this.ident = params.ident || undefined;
    this.mail = params.mail || undefined;
    this.api = params.api || undefined;
    this.vocabs = params.vocabs || ['dcterms', 'foaf', 'fup8', 'bibo'];
    this.user = false;
    this.props = [];
    this.class = [];
    this.rts = [];
    this.init = this.init.bind(this);
  }

  public init = () => {
    this.vocabs.forEach((v) => {
      this.getProps(v);
      this.getClass(v);
    });
    this.getRT();
  };

  public getRT = async (cb: ((rts: any[]) => void) | false = false): Promise<void> => {
    try {
      const data = await this.syncRequest(this.api + 'resource_templates?per_page=1000');
      if (data) {
        this.rts = data;
        if (cb) cb(this.rts);
      } else {
        console.error('Failed to fetch resource templates');
      }
    } catch (error) {
      console.error('Error fetching resource templates:', error);
    }
  };

  public getRtId = (label: string): string => {
    return this.rts.filter((rt) => rt['o:label'] == label)[0]['o:id'];
  };

  public getProps = async (prefix: string, cb: ((props: any[]) => void) | false = false): Promise<void> => {
    try {
      const url = this.api + 'properties?per_page=1000&vocabulary_prefix=' + prefix;
      const data = await this.syncRequest(url);

      // Manipulez les données comme nécessaire
      if (data && Array.isArray(data)) {
        data.forEach((p: any) => this.props.push(p));
        if (cb) cb(this.props);
      } else {
        throw new Error('Failed to fetch properties or received invalid data');
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);

      //throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  };

  public getPropId = (t: string): string => {
    return this.props.filter((prp) => prp['o:term'] == t)[0]['o:id'];
  };

  public getPropByTerm = (t: string): any => {
    return this.props.filter((prp) => prp['o:term'] == t)[0];
  };

  public getClass = async (prefix: string, cb: ((data: any[]) => void) | false = false): Promise<void> => {
    try {
      const data = await this.syncRequest(this.api + 'resource_classes?per_page=1000&vocabulary_prefix=' + prefix);
      //console.log('Fetched data:', data); // Log des données reçues

      if (data && Array.isArray(data)) {
        // Vérifiez que les données sont un tableau
        data.forEach((c: any) => this.class.push(c));
        if (cb) cb(data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching resource classes:', error);
    }
  };

  public getClassByName = (cl: string): any => {
    let c = this.class.filter((c) => c['o:label'].toLowerCase() == cl.toLowerCase());
    return c[0];
  };

  public getClassByTerm = (cl: string): any => {
    let c = this.class.filter((c) => c['o:term'].toLowerCase() == cl.toLowerCase());
    return c[0];
  };

  public getRandomItemByClass = async (cl: string, cb: ((r: any) => void) | false = false): Promise<any> => {
    let url;
    try {
      const classId = this.getClassByName(cl)?.['o:id'];
      if (classId !== undefined) {
        url = this.api + 'items?resource_class_id=' + classId;
      } else {
        throw new Error('Failed to get class ID for ' + cl);
      }
    } catch (error) {
      console.error(error);
      return null; // Exit early or handle the error case
    }

    if (url) {
      try {
        const rs = await this.syncRequest(url);
        if (rs && Array.isArray(rs)) {
          const r = rs[Math.floor(Math.random() * rs.length)];
          if (cb) cb(r);
          return r;
        } else {
          console.error('Received data is not an array or is invalid');
          return null; // Exit early or handle the error case
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
        return null; // Exit early or handle the error case
      }
    } else {
      console.error('URL is undefined or invalid');
      return null; // Exit early or handle the error case
    }
  };

  public getMedias = (p: any, linkMedia: string = ''): void => {
    p.medias = [];
    p['o:media'].forEach((m: any) => {
      p.medias.push(this.syncRequest(m['@id']));
    });
    if (linkMedia && p[linkMedia]) this.getLinkMedias(p, linkMedia);
  };

  public getLinkMedias = async (p: any, linkMedia: string): Promise<void> => {
    p.medias = p.medias ? p.medias : [];

    if (p[linkMedia] && Array.isArray(p[linkMedia])) {
      for (const i of p[linkMedia]) {
        try {
          const item = await this.syncRequest(i['@id']);
          await this.getMedias(item);

          if (item.medias && Array.isArray(item.medias)) {
            item.medias.forEach((m: any) => {
              p.medias.push(m);
            });
          } else {
            console.error('Item medias is not an array or is invalid');
          }
        } catch (error) {
          console.error('Failed to fetch item or its medias:', error);
        }
      }
    } else {
      console.error('LinkMedia is not an array or is invalid');
    }
  };

  public getItem = (id: string, cb: ((rs: any) => void) | false = false): any => {
    let url = this.api + 'items/' + id,
      rs = this.syncRequest(url);
    if (cb) cb(rs);
    return rs;
  };

  public getMedia = (id: string, cb: ((rs: any) => void) | false = false): any => {
    let url = this.api + 'media/' + id,
      rs = this.syncRequest(url);
    if (cb) cb(rs);
    return rs;
  };

  public getItemAdminLink = (item: any): string => {
    if (this.api) {
      return this.api.replace('/api/', '/admin/item/') + item['o:id'];
    }
    return '';
  };

  public saveJson = (data: any): void => {
    const filename = 'data.json';
    const jsonStr = JSON.stringify(data);

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  public getAllItems = async (query: string, cb: ((rs: any[]) => void) | false = false): Promise<any[]> => {
    let url = `${this.api}items?per_page=${this.perPage}&${query}&page=`,
      fin = false,
      rs: any[] = [],
      page = 1;

    while (!fin) {
      try {
        const data = await this.syncRequest(url + page);
        if (data && data.length) {
          rs = rs.concat(data);
          page++;
        } else {
          fin = true;
        }
      } catch (error) {
        console.error('Failed to fetch data for page', page, error);
        fin = true; // Stop the loop on error
      }
    }

    if (cb) cb(rs);
    return rs;
  };

  public getAllMedias = async (query: string, cb: ((rs: any[]) => void) | false = false): Promise<any[]> => {
    let url = `${this.api}media?per_page=${this.perPage}&${query}&page=`,
      fin = false,
      rs: any[] = [],
      page = 1;

    while (!fin) {
      try {
        const data = await this.syncRequest(url + page);
        if (data && data.length) {
          rs = rs.concat(data);
          page++;
        } else {
          fin = true;
        }
      } catch (error) {
        console.error('Failed to fetch data for page', page, error);
        fin = true; // Stop the loop on error
      }
    }

    if (cb) cb(rs);
    return rs;
  };

  public searchItems = (query: string, cb: ((rs: any) => void) | false = false): any => {
    let url = this.api + 'items?' + query,
      rs = this.syncRequest(url);
    if (cb) cb(rs);
    return rs;
  };

  public getUser = (cb: ((user: User | false) => void) | false = false): void => {
    let url = this.api + 'users?email=' + this.mail + '&key_identity=' + this.ident + '&key_credential=' + this.key;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.user = data.length ? data[0] : false;
        if (cb) cb(this.user);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        if (cb) cb(false);
      });
  };

  public createRessource = (data: any, cb: ((rs: any) => void) | false = false, type: string = 'items'): void => {
    let url = this.api + type + '?key_identity=' + this.ident + '&key_credential=' + this.key;
    this.postData({ u: url, m: 'POST' }, this.formatData(data), data['file']).then((rs: any) => {
      if (cb) cb(rs);
    });
  };

  public createItem = async (data: any, cb: ((rs: any) => void) | false = false): Promise<any> => {
    let url = this.api + 'items?key_identity=' + this.ident + '&key_credential=' + this.key;
    return await this.postData({ u: url, m: 'POST' }, this.formatData(data)).then((rs: any) => {
      if (cb) cb(rs);
      return rs;
    });
  };

  public updateRessource = (
    id: string,
    data: any,
    type: string = 'items',
    fd: any | null = null,
    m: string = 'PATCH',
    cb: ((rs: any) => void) | false = false,
  ): void => {
    let oriData: { [key: string]: any } = {}; // Initialisation avec un objet vide par défaut
    let newData: { [key: string]: any };
  
    if (this.ident !== undefined && this.key !== undefined) {
      let url = `${this.api}${type}/${id}?key_identity=${encodeURIComponent(
        this.ident,
      )}&key_credential=${encodeURIComponent(this.key)}`;
  
      if (data) {
        oriData = this.getItem(id);
        newData = this.formatData(data, this.types[type]);
        
        if (oriData) {
          // Vérifiez que oriData n'est pas null avant de continuer
          // Fusion correcte des données
          for (const p in newData) {
            if (newData.hasOwnProperty(p) && p !== '@type') {
              if (
                Array.isArray(newData[p]) &&
                newData[p].length > 0 &&
                typeof newData[p][0] === 'object' &&
                '@id' in newData[p][0]
              ) {
                console.log('Original Data:', oriData);
                console.log('New Data:', newData);
                oriData[p] = oriData[p] || []; // Assurez-vous que oriData[p] est initialisé comme tableau s'il est null ou undefined
                newData[p].forEach((newItem: any) => {
                  const index = oriData[p]?.findIndex((oriItem: any) => oriItem && oriItem['@id'] === newItem['@id']);
                  if (index !== undefined && index !== -1) {
                    oriData[p][index] = newItem;
                  } else {
                    oriData[p].push(newItem);
                  }
                });
              } else {
                oriData[p] = newData[p];
              }
            }
          }
          console.log('Merged Data:', oriData);
        } else {
          console.error('Original data is null');
        }
      }
  
      this.postData({ u: url, m: m }, fd ? fd : oriData).then((rs: any) => {
        if (cb) cb(rs);
      });
    } else {
      console.error('this.ident or this.key is undefined');
    }
  };
  
  
  

  private formatData = (data: any, type: string = 'o:Item'): any => {
    let fd: any = { '@type': type },
      p: any;
  
    for (let [k, v] of Object.entries(data)) {
      switch (k) {
        case 'o:item_set':
          fd[k] = [{ 'o:id': v }];
          break;
        case 'o:resource_class':
          p = this.class.filter((prp: any) => prp['o:term'] == v)[0];
          fd[k] = { 'o:id': p['o:id'] };
          break;
        case 'o:resource_template':
          p = this.rts.filter((rt: any) => rt['o:label'] == v)[0];
          fd[k] = { 'o:id': p['o:id'] };
          break;
        case 'o:media':
          if (!fd[k]) fd[k] = [];
          fd[k].push({ 'o:ingester': 'url', ingest_url: v });
          break;
        case 'file':
          fd['o:media'] = [{ 'o:ingester': 'upload', file_index: '1' }];
          break;
        case 'labels':
          if (Array.isArray(v)) {
            v.forEach((d: any) => {
              p = this.props.find((prp: any) => prp['o:label'] == d.p);
              if (p && !fd[p.term]) fd[p.term] = [];
              if (p) fd[p.term].push(this.formatValue(p, d));
            });
          }
          break;
          default:
            p = this.props.find((prp: any) => prp['o:term'] == k);
            if (p) {
              if (!fd[k]) fd[k] = [];
              if (Array.isArray(v)) {
                fd[k] = v.map((val: any) => this.formatValue(p, val));
              } else {
                fd[k].push(this.formatValue(p, v));
              }
            } else {
              console.warn(`Property "${k}" not found in props. Adding it directly.`);
              fd[k] = Array.isArray(v) ? v : [v];
            }
            break;
          
      }
    }
  
    return fd;
  };
  




  private formatValue = (p: any, v: any): any => {
    if (typeof v === 'object' && v.rid) return { property_id: p['o:id'], value_resource_id: v.rid, type: 'resource' };
    else if (typeof v === 'object' && v.u) return { property_id: p['o:id'], '@id': v.u, 'o:label': v.l, type: 'uri' };
    else if (typeof v === 'object') return { property_id: p['o:id'], '@value': JSON.stringify(v), type: 'literal' };
    else return { property_id: p['o:id'], '@value': v, type: 'literal' };
  };

  private postData = async (url: any, data: any = {}, file: any = null): Promise<any> => {
    let bodyData: any,
      options: any = {
        method: url.m,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer',
      };

    if (url.m == 'POST' || url.m == 'PUT' || url.m == 'PATCH') {
      if (file) {
        bodyData = new FormData();
        bodyData.append('data', JSON.stringify(data));
        bodyData.append('file[1]', file);
      } else {
        bodyData = JSON.stringify(data);
        console.log("bodydata",bodyData);
        options.headers = {
          'Content-Type': 'application/json',
        };
      }
      options.body = bodyData;
    }
    const response = await fetch(url.u, options);
    return await response.json();
  };

  private async syncRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const responseData = await response.text(); // Lire la réponse comme texte brut
      //console.log('Raw response:', responseData); // Log de la réponse brute
      const data = JSON.parse(responseData); // Tenter de parser la réponse
      return data;
    } catch (error) {
      console.error('Failed to fetch or parse JSON:', error);
      return null;
    }
  }
}

interface EditModalProps {
  itemUrl: string;
  activeConfig: string | null;
  onClose: () => void;
}

interface ColumnConfig {
  key: string;
  label: string;
  dataPath: string;
}

const inputConfigs: { [key: string]: ColumnConfig[] } = {
  conferences: [
    { key: 'o:id', label: 'ID', dataPath: 'o:id' },
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
  ],
  conferenciers: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'jdc:hasUniversity', label: 'Université', dataPath: 'jdc:hasUniversity.0.display_title' },
  ],
};

function getValueByPath<T>(object: T[], path: string): any {
  if (!path) return undefined;
  if (!Array.isArray(object) || object.length === 0) return undefined;

  const keys = path.split('.');
  let value: any = object[0];

  for (const key of keys) {
    if (Array.isArray(value)) {
      value = value[parseInt(key)];
    } else if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

export const EditModal: React.FC<EditModalProps> = ({ itemUrl, activeConfig, onClose }) => {
  const { data: itemDetailsData, loading: detailsLoading, error: detailsError } = useFetchDataDetails(itemUrl);
  const [itemData, setItemData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const pa = {
    mail: 'erwan.tbd@gmail.com',
    api: 'https://tests.arcanes.ca/omk/api/',
    ident: 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj',
    key: import.meta.env.VITE_API_KEY,
  };

  const omks = new Omk(pa);
  omks.init();

  useEffect(() => {
    if (itemDetailsData) {
      setItemData(itemDetailsData);
    }
  }, [itemDetailsData]);

  useEffect(() => {
    if (detailsError) {
      console.error('Error fetching item details:', detailsError);
    }
  }, [detailsError]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!itemUrl) {
        throw new Error('Item URL is not defined or empty');
      }

      const segments = itemUrl.split('/');
      if (segments.length === 0) {
        throw new Error('Invalid item URL format');
      }

      const itemId = segments.pop();
      if (!itemId) {
        throw new Error('Failed to extract item ID');
      }
      console.log(itemData);
      await omks.updateRessource(itemId, itemData);

      setSaving(false);
      onClose(); // Fermer le modal après la sauvegarde réussie
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('An unknown error occurred');
      }
      setSaving(false);
    }
  };

  //console.log(itemDetailsData);

  return (
    <div className='edit-modal'>
      <button onClick={onClose}>Retour au tableau</button>

      {activeConfig && !detailsLoading ? (
        itemDetailsData &&
        inputConfigs[activeConfig]?.map((col: ColumnConfig) => {
          const value = getValueByPath(itemDetailsData, col.dataPath);
          return (
            <Input
              key={col.key}
              size='lg'
              classNames={{
                label: 'text-semibold',
                inputWrapper: 'bg-default-100',
                input: 'h-[50px]',
              }}
              className='min-h-[50px]'
              type='text'
              label={col.label}
              labelPlacement='outside'
              placeholder={`Entrez ${col.label}`}
              isRequired
              defaultValue={value}
              onChange={(e) => setItemData({ ...itemData, [col.dataPath]: e.target.value })}
            />
          );
        })
      ) : (
        <Spinner />
      )}

      {saveError && <div className='error'>{saveError}</div>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};
