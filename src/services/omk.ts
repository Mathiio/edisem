export class Omk {
    modal: any;
    key: string | boolean;
    ident: string | boolean;
    mail: string | boolean;
    api: string;
    vocabs: string[];
    user: any;
    props: any[];
    class: any[];
    rts: any;

    constructor(params: any) {
        this.modal;
        this.key = params.key ? params.key : false;
        this.ident = params.ident ? params.ident : false;
        this.mail = params.mail ? params.mail : false;
        this.api = params.api ? params.api : '';
        this.vocabs = params.vocabs ? params.vocabs : ['dcterms', 'foaf', 'fup8', 'bibo'];
        this.user = false;
        this.props = [];
        this.class = [];
        this.rts;

        this.init();
    }

    init() {
        this.vocabs.forEach((v: string) => {
            this.getProps(v);
            this.getClass(v);
        });
        this.getRT();
    }

    getRT(cb: Function | boolean = false) {
        this.rts = this.syncRequest(this.api + 'resource_templates?per_page=1000');
        if (cb) (cb as Function)(this.rts);
    }

    getRtId(label: string) {
        return this.rts.filter((rt: any) => rt['o:label'] === label)[0]['o:id'];
    }

    getProps(prefix: string, cb: Function | boolean = false) {
        const url = this.api + 'properties?per_page=1000&vocabulary_prefix=' + prefix;
        const data = this.syncRequest(url);
        data.forEach((p: any) => this.props.push(p));
        if (cb) (cb as Function)(this.props);
    }

    getPropId(t: string) {
        return this.props.filter((prp: any) => prp['o:term'] === t)[0]['o:id'];
    }

    getPropByTerm(t: string) {
        return this.props.filter((prp: any) => prp['o:term'] === t)[0];
    }

    getClass(prefix: string, cb: Function | boolean = false) {
        const url = this.api + 'resource_classes?per_page=1000&vocabulary_prefix=' + prefix;
        const data = this.syncRequest(url);
        data.forEach((c: any) => this.class.push(c));
        if (cb) (cb as Function)(data);
    }

    getClassByName(cl: string) {
        const c = this.class.filter((c: any) => c['o:label'].toLowerCase() === cl.toLowerCase());
        return c[0];
    }

    getClassByTerm(cl: string) {
        const c = this.class.filter((c: any) => c['o:term'].toLowerCase() === cl.toLowerCase());
        return c[0];
    }

    getRandomItemByClass(cl: string, cb: Function | boolean = false) {
        let url: string;
        try {
            const classByName = this.getClassByName(cl);
            if (classByName) {
                url = this.api + 'items?resource_class_id=' + classByName['o:id'];
            } else {
                console.error('Class not found');
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
        const rs = this.syncRequest(url);
        const r = rs[Math.floor(Math.random() * rs.length)];
        if (cb) (cb as Function)(r);
        return r;
    }

    async getMedias(p: any, linkMedia: string = '') {
        p.medias = [];
        for (const m of p['o:media']) {
            p.medias.push(this.syncRequest(m['@id']));
        }
        if (linkMedia && p[linkMedia]) this.getLinkMedias(p, linkMedia);
    }

    getLinkMedias(p: any, linkMedia: string) {
        p.medias = p.medias ? p.medias : [];
        for (const i of p[linkMedia]) {
            const item = this.syncRequest(i['@id']);
            this.getMedias(item);
            item.medias.forEach((m: any) => {
                p.medias.push(m);
            });
        }
    }

    getItem(id: number, cb: Function | boolean = false) {
        const url = this.api + 'items/' + id;
        const rs = this.syncRequest(url);
        if (cb) (cb as Function)(rs);
        return rs;
    }

    getMedia(id: number, cb: Function | boolean = false) {
        const url = this.api + 'media/' + id;
        const rs = this.syncRequest(url);
        if (cb) (cb as Function)(rs);
        return rs;
    }

    getItemAdminLink(item: any) {
        if (typeof this.api === 'string') {
            return this.api.replace("/api/", "/admin/item/") + item['o:id'];
        }
        return '';
    }
    

    saveJson(data: any) {
        const filename = 'data.json';
        const jsonStr = JSON.stringify(data);

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    getAllItems(query: string, cb: Function | boolean = false) {
        const perPage = 1000;
        let url = this.api + 'items?per_page=' + perPage + '&' + query + '&page=';
        let fin = false;
        let rs: any[] = [];
        let data;
        let page = 1;
        while (!fin) {
            data = this.syncRequest(url + page);
            fin = data.length ? false : true;
            rs = rs.concat(data);
            page++;
        }
        if (cb) (cb as Function)(rs);
        return rs;
    }

    getAllMedias(query: string, cb: Function | boolean = false) {
        const perPage = 1000;
        let url = this.api + 'media?per_page=' + perPage + '&' + query + '&page=';
        let fin = false;
        let rs: any[] = [];
        let data;
        let page = 1;
        while (!fin) {
            data = this.syncRequest(url + page);
            fin = data.length ? false : true;
            rs = rs.concat(data);
            page++;
        }
        if (cb) (cb as Function)(rs);
        return rs;
    }

    searchItems(query: string, cb: Function | boolean = false) {
        const url = this.api + 'items?' + query;
        const rs = this.syncRequest(url);
        if (cb) (cb as Function)(rs);
        return rs;
    }

    getUser(cb: Function | boolean = false) {
        const url = this.api + 'users?email=' + this.mail + '&key_identity=' + this.ident + '&key_credential=' + this.key;
        fetch(url)
            .then(response => response.json())
            .then((data) => {
                this.user = data.length ? data[0] : false;
                if (cb) (cb as Function)(this.user);
            });
    }

    createRessource(data: any, cb: Function | boolean = false, type: string = 'items') {
        const url = this.api + type + '?key_identity=' + this.ident + '&key_credential=' + this.key;
        this.postData({ 'u': url, 'm': 'POST' }, this.formatData(data), data['file']).then((rs) => {
            if (cb) (cb as Function)(rs);
        });
    }

    async createItem(data: any, cb: Function | boolean = false) {
        const url = this.api + 'items?key_identity=' + this.ident + '&key_credential=' + this.key;
        return await this.postData({ 'u': url, 'm': 'POST' }, this.formatData(data)).then((rs) => {
            if (cb) (cb as Function)(rs);
        });
    }

    updateRessource(id: number, data: any, type: string = 'items', fd: FormData | null = null, m: string = 'PUT', cb: Function | boolean = false) {
        const url = `${this.api}${type}/${id}?key_identity=${this.ident}&key_credential=${this.key}`;
        let oriData, newData;
        if (data) {
            oriData = this.getItem(id);
            newData = this.formatData(data, type);
            for (const p in newData) {
                oriData[p] = newData[p];
            }
            data = oriData;
        }
    
        if (fd) {
            // Si FormData est fourni, ajoutez les données formatées
            fd.append('data', JSON.stringify(data));
    
            // Ajoutez les fichiers uniquement si fd n'est pas null
            if (data.file) {
                fd.append('file[1]', data.file);
            }
    
            // Envoyez la requête avec FormData
            this.postData({ u: url, m: m }, fd).then((rs) => {
                if (cb) (cb as Function)(rs);
            });
        } else {
            // Si FormData n'est pas fourni, envoyez les données formatées directement
            this.postData({ u: url, m: m }, data).then((rs) => {
                if (cb) (cb as Function)(rs);
            });
        }
    }
    

    formatData(data: any, type: string = 'items') {
        const fd: any = { "@type": type };
        for (const [k, v] of Object.entries(data)) {
            switch (k) {
                case 'o:item_set':
                    fd[k] = [{ 'o:id': v }];
                    break;
                case 'o:resource_class':
                    const classProp = this.class.filter(prp => prp['o:term'] === v)[0];
                    fd[k] = { 'o:id': classProp['o:id'] };
                    break;
                case 'o:resource_template':
                    const template = this.rts.filter((rt: any) => rt['o:label'] === v)[0];
                    fd[k] = { 'o:id': template['o:id'] };
                    break;
                case 'o:media':
                    if (!fd[k]) fd[k] = [];
                    fd[k].push({ "o:ingester": "url", "ingest_url": v as string });
                    break;
                case 'file':
                    fd['o:media'] = [{ "o:ingester": "upload", "file_index": "1" }];
                    break;
                case 'labels':
                    (v as any[]).forEach((d: any) => {
                        const prop = this.props.filter(prp => prp['o:label'] === d.p)[0];
                        if (!fd[prop.term]) fd[prop.term] = [];
                        fd[prop.term].push(this.formatValue(prop, d));
                    });
                    break;
                default:
                    if (!fd[k]) fd[k] = [];
                    const prop = this.props.filter(prp => prp['o:term'] === k)[0];
                    if (Array.isArray(v)) {
                        fd[k] = v.map(val => this.formatValue(prop, val));
                    } else {
                        fd[k].push(this.formatValue(prop, v));
                    }
                    break;
            }
        }
        return fd;
    }

    formatValue(p: any, v: any) {
        if (typeof v === 'object' && 'rid' in v)
            return { "property_id": p['o:id'], "value_resource_id": v.rid, "type": "resource" };
        else if (typeof v === 'object' && 'u' in v)
            return { "property_id": p['o:id'], "@id": v.u, "o:label": v.l, "type": "uri" };
        else if (typeof v === 'object')
            return { "property_id": p['o:id'], "@value": JSON.stringify(v), "type": "literal" };
        else
            return { "property_id": p['o:id'], "@value": v, "type": "literal" };
    }

    async postData(url: { u: string, m: string }, data: any = {}, file?: File) {
        const options: RequestInit = {
            method: url.m,
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            referrerPolicy: "no-referrer",
        };

        if (url.m === 'POST' || url.m === 'PUT' || url.m === 'PATCH') {
            let bodyData: FormData | string;
            if (file) {
                bodyData = new FormData();
                (bodyData as FormData).append('data', JSON.stringify(data));
                (bodyData as FormData).append('file[1]', file);
            } else {
                bodyData = JSON.stringify(data);
                options.headers = { "Content-Type": "application/json" };
            }
            options.body = bodyData;
        }
        const response = await fetch(url.u, options);
        return await response.json();
    }

    syncRequest(q: string) {
        const request = new XMLHttpRequest();
        request.open('GET', q, false);
        request.send(null);
        if (request.status === 200) {
            return JSON.parse(request.responseText);
        }
    }
}
