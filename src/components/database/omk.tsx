interface Item {
  // Définissez ici la structure d'un item si nécessaire
}

interface Media {
  // Définissez ici la structure d'un média si nécessaire
}

interface User {
  // Définissez ici la structure d'un utilisateur si nécessaire
}
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

  public getRT = (cb: ((rts: any[]) => void) | false = false): void => {
    this.rts = this.syncRequest(this.api + 'resource_templates?per_page=1000');
    if (cb) cb(this.rts);
  };

  public getRtId = (label: string): string => {
    return this.rts.filter((rt) => rt['o:label'] == label)[0]['o:id'];
  };

  public getProps = (prefix: string, cb: ((props: any[]) => void) | false = false): void => {
    let url = this.api + 'properties?per_page=1000&vocabulary_prefix=' + prefix,
      data = this.syncRequest(url);
    data.forEach((p: any) => this.props.push(p));
    if (cb) cb(this.props);
  };

  public getPropId = (t: string): string => {
    return this.props.filter((prp) => prp['o:term'] == t)[0]['o:id'];
  };

  public getPropByTerm = (t: string): any => {
    return this.props.filter((prp) => prp['o:term'] == t)[0];
  };

  public getClass = (prefix: string, cb: ((data: any[]) => void) | false = false): void => {
    let url = this.api + 'resource_classes?per_page=1000&vocabulary_prefix=' + prefix,
      data = this.syncRequest(url);
    data.forEach((c: any) => this.class.push(c));
    if (cb) cb(data);
  };

  public getClassByName = (cl: string): any => {
    let c = this.class.filter((c) => c['o:label'].toLowerCase() == cl.toLowerCase());
    return c[0];
  };

  public getClassByTerm = (cl: string): any => {
    let c = this.class.filter((c) => c['o:term'].toLowerCase() == cl.toLowerCase());
    return c[0];
  };

  public getRandomItemByClass = (cl: string, cb: ((r: any) => void) | false = false): any => {
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
      return; // Exit early or handle the error case
    }

    if (url) {
      let rs = this.syncRequest(url),
        r = rs[Math.floor(Math.random() * rs.length)];
      if (cb) cb(r);
      return r;
    } else {
      console.error('URL is undefined or invalid');
      return; // Exit early or handle the error case
    }
  };

  public getMedias = (p: any, linkMedia: string = ''): void => {
    p.medias = [];
    p['o:media'].forEach((m: any) => {
      p.medias.push(this.syncRequest(m['@id']));
    });
    if (linkMedia && p[linkMedia]) this.getLinkMedias(p, linkMedia);
  };

  public getLinkMedias = (p: any, linkMedia: string): void => {
    p.medias = p.medias ? p.medias : [];
    p[linkMedia].forEach((i: any) => {
      let item = this.syncRequest(i['@id']);
      this.getMedias(item);
      item.medias.forEach((m: any) => {
        p.medias.push(m);
      });
    });
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

  public getAllItems = (query: string, cb: ((rs: any[]) => void) | false = false): any[] => {
    let url = this.api + 'items?per_page=' + this.perPage + '&' + query + '&page=',
      fin = false,
      rs: any[] = [],
      data,
      page = 1;
    while (!fin) {
      data = this.syncRequest(url + page);
      fin = data.length ? false : true;
      rs = rs.concat(data);
      page++;
    }
    if (cb) cb(rs);
    return rs;
  };

  public getAllMedias = (query: string, cb: ((rs: any[]) => void) | false = false): any[] => {
    let url = this.api + 'media?per_page=' + this.perPage + '&' + query + '&page=',
      fin = false,
      rs: any[] = [],
      data,
      page = 1;
    while (!fin) {
      data = this.syncRequest(url + page);
      fin = data.length ? false : true;
      rs = rs.concat(data);
      page++;
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
    m: string = 'PUT',
    cb: ((rs: any) => void) | false = false,
  ): void => {
    let oriData,
      newData,
      url = this.api + type + '/' + id + '?key_identity=' + this.ident + '&key_credential=' + this.key;
    if (data) {
      (oriData = this.getItem(id)), (newData = this.formatData(data, this.types[type]));
      for (const p in newData) {
        if (p != '@type') {
          if (oriData[p]) oriData[p] = oriData[p].concat(newData[p]);
          else oriData[p] = newData[p];
        }
      }
    }
    this.postData({ u: url, m: m }, fd ? fd : oriData).then((rs: any) => {
      if (cb) cb(rs);
    });
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
          if (!fd[k]) fd[k] = [];
          p = this.props.find((prp: any) => prp['o:term'] == k);
          if (p) {
            if (Array.isArray(v)) {
              fd[k] = v.map((val: any) => this.formatValue(p, val));
            } else {
              fd[k].push(this.formatValue(p, v));
            }
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
        options.headers = {
          'Content-Type': 'application/json',
        };
      }
      options.body = bodyData;
    }
    const response = await fetch(url.u, options);
    return await response.json();
  };

  private syncRequest = (q: string): any => {
    const request = new XMLHttpRequest();
    request.open('GET', q, false);
    request.send(null);
    if (request.status === 200) {
      return JSON.parse(request.response);
    }
  };
}
