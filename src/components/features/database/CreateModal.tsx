import React, { useState, useEffect } from 'react';
import {
  Input,
  Spinner,
  Button,
  ModalBody,
  ModalFooter,
  ModalContent,
  Modal,
  Link,
  ModalHeader,
  addToast,
} from '@heroui/react';
import { useFetchRT } from '@/hooks/useFetchData';
import { SelectionInput } from '@/components/features/database/SelectionInput';
import { Textarea } from '@heroui/input';

import { DatePicker, TimecodeInput } from '@/components/features/database/TimecodeInput';
import { CrossIcon } from '@/components/ui/icons';
import { inputConfigs, InputConfig } from '@/components/features/database/EditModal';
import MultipleInputs from './MultipleInputs';

interface User {}
class Omk {
  private key: string | undefined;
  private ident: string | undefined;
  private mail: string | undefined;
  private api: string | undefined;
  private vocabs: string[];
  private user: User | false;
  public props: any[] | undefined;
  private class: any[];
  public rts: any[];
  private perPage: number = 1000;

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

  public getPropId = (t: string): string | undefined => {
    if (!this.props) {
      return undefined;
    }
    const prop = this.props.find((prp) => prp['o:term'] === t);
    return prop ? prop['o:id'] : undefined;
  };

  public getPropByTerm = (t: string): any | undefined => {
    if (!this.props) {
      return undefined;
    }
    return this.props.find((prp) => prp['o:term'] === t);
  };

  public getClass = async (prefix: string, cb: ((data: any[]) => void) | false = false): Promise<void> => {
    try {
      const data = await this.syncRequest(this.api + 'resource_classes?per_page=1000&vocabulary_prefix=' + prefix);

      if (data && Array.isArray(data)) {
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
      return null;
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
          return null;
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
        return null;
      }
    } else {
      console.error('URL is undefined or invalid');
      return null;
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
        fin = true;
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
        fin = true;
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

  public createItem = async (data: any = null, cb: ((rs: any) => void) | false = false): Promise<any> => {
    let url = this.api + 'items?key_identity=' + this.ident + '&key_credential=' + this.key;
    return await this.postData({ u: url, m: 'POST' }, data).then((rs: any) => {
      if (cb) cb(rs);
      return rs;
    });
  };

  public buildObject = (resourceTemplate: any, formValues: any): any => {
    let RT = resourceTemplate[0]['o:resource_template_property'];
    let result: any = {
      '@type': ['o:Item', resourceTemplate[0]['o:resource_class']['@id']],
      'o:resource_class': {
        'o:id': resourceTemplate[0]['o:resource_class']['o:id'],
        '@id': resourceTemplate[0]['o:resource_class']['@id'],
      },
      'o:resource_template': { '@id': resourceTemplate[0]['@id'], 'o:id': resourceTemplate[0]['o:id'] },
    };

    for (let property of RT) {
      let term = this.props?.find((prp: any) => prp['o:id'] === property['o:property']['o:id']);
      if (!term) {
        continue;
      }

      let formValueKey = Object.keys(formValues).find((key) => key.split('.')[0] === term['o:term']);
      if (!formValueKey) {
        continue;
      }

      let formattedValue;
      let formValue = formValues[formValueKey];

      if (isArray(formValue)) {
        if (formValue.length > 1) {
          for (let index = 0; index < formValue.length; index++) {
            if (term['o:id'] === 1716) {
              formattedValue = this.formatValue(term, formValue[index].values, formValue[index].language);
            } else {
              formattedValue = this.formatValue(term, formValue[index]);
            }
            if (!result[term['o:term']]) {
              result[term['o:term']] = [];
            }
            result[term['o:term']].push(formattedValue);
          }
        } else {
          if (term['o:id'] === 1716) {
            formattedValue = this.formatValue(term, formValue[0].values, formValue[0].language);
          } else if (term['o:id'] === 1720 || term['o:id'] === 1721) {
            formattedValue = this.formatValue(term, formValue[0]);
          } else {
            formattedValue = this.formatValue(term, formValue[0][0]);
          }

          if (!result[term['o:term']]) {
            result[term['o:term']] = [];
          }
          result[term['o:term']].push(formattedValue);
        }
      } else {
        formattedValue = this.formatValue(term, formValue);

        if (!result[term['o:term']]) {
          result[term['o:term']] = [];
        }
        result[term['o:term']].push(formattedValue);
      }
    }
    return result;
  };

  public formatValue = (p: any, v: any, language: string = 'fr'): any => {
    let baseValue: any = { property_id: p['o:id'], is_public: true };

    if (p['o:id'] == 1517) {
      baseValue['@id'] = v;
      baseValue.type = 'uri';
    } else if (p['o:id'] == 630) {
      baseValue['@value'] = v;
      baseValue.type = 'numeric:interval';
    } else if (p['o:id'] == 7) {
      baseValue['@value'] = v;
      baseValue.type = 'numeric:timestamp';
    } else if (typeof v === 'number' && (p['o:id'] == 1417 || p['o:id'] == 735)) {
      baseValue['@value'] = v;
      baseValue.type = 'numeric:integer';
    } else if (typeof v === 'number') {
      baseValue.value_resource_id = v;
      baseValue.type = 'resource';
    } else if (typeof v === 'object' && v.u) {
      baseValue['@id'] = v.u;
      baseValue['o:label'] = v.l;
      baseValue.type = 'uri';
    } else if (typeof v === 'object') {
      baseValue['@value'] = JSON.stringify(v);
      baseValue.type = 'literal';
    } else {
      baseValue['@value'] = v;
      baseValue.type = 'literal';
    }

    if (p['o:id'] == 1716 && language) {
      baseValue['@language'] = language;
    }
    return baseValue;
  };

  public updateRessource = (
    id: string,
    data: any,
    type: string = 'items',
    fd: any | null = null,
    m: string = 'PUT',
    cb: ((rs: any) => void) | false = false,
  ): void => {
    if (this.ident !== undefined && this.key !== undefined) {
      let url = `${this.api}${type}/${id}?key_identity=${encodeURIComponent(
        this.ident,
      )}&key_credential=${encodeURIComponent(this.key)}`;

      if (data) {
        this.getItem(id).then((oriData: any) => {
          this.updateOriDataWithNewValues(oriData, data);
          this.postData({ u: url, m: m }, fd ? fd : oriData).then((rs: any) => {
            if (cb) cb(rs);
          });
        });
      } else {
        console.error('Invalid data provided');
      }
    } else {
      console.error('this.ident or this.key is undefined');
    }
  };

  private updateOriDataWithNewValues = (oriData: any, data: any): void => {
    const updateValue = (obj: any, path: string[], value: any): void => {
      if (path.length === 1) {
        obj[path[0]] = value;
      } else {
        if (obj.hasOwnProperty(path[0])) {
          updateValue(obj[path[0]], path.slice(1), value);
        } else {
          console.error(`Path ${path[0]} not found in the object.`);
        }
      }
    };

    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const path = key.split('.');
        const value = data[key];

        if (key === 'schema:agent') {
          const resourceObjects = value.map((id: number) => ({
            type: 'resource',
            property_id: 386,
            property_label: 'agent',
            is_public: true,
            '@id': `https://tests.arcanes.ca/omk/api/items/${id}`,
            value_resource_id: id,
            value_resource_name: 'items',
          }));
          updateValue(oriData, path, resourceObjects);
        } else if (key === 'schema:addressCountry') {
          const resourceObjects = value.map((id: number) => ({
            type: 'customvocab:27',
            property_id: 377,
            property_label: 'addressCountry',
            is_public: true,
            '@id': `https://tests.arcanes.ca/omk/api/items/${id}`,
            value_resource_id: id,
            value_resource_name: 'items',
          }));

          updateValue(oriData, path, resourceObjects);
        } else {
          updateValue(oriData, path, value);
        }
      }
    }
  };

  public formatData = (data: any, type: string = 'o:Item'): any => {
    let fd: any = { '@type': type },
      p: any;
    for (let [k, v] of Object.entries(data)) {
      switch (k) {
        case 'o:item_set':
          fd[k] = [{ 'o:id': v }];
          break;
        case 'o:resource_class':
          p = this.class?.find((prp: any) => prp['o:term'] === v);
          if (p) {
            fd[k] = { 'o:id': p['o:id'] };
          } else {
            console.warn(`Resource class "${v}" not found.`);
          }
          break;
        case 'dcterms:title':
          p = this.props?.find((prp: any) => prp['o:term'] === k);
          if (p) {
            fd[k] = this.formatValue(p, v);
          } else {
            console.warn(`Property "${k}" not found in props. Adding it directly.`);
            fd[k] = { type: 'literal', '@value': v };
          }
          break;
        case 'o:resource_template':
          p = this.rts?.find((rt: any) => rt['o:label'] === v);
          if (p) {
            fd[k] = { 'o:id': p['o:id'] };
          } else {
            console.warn(`Resource template "${v}" not found.`);
          }
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
              p = this.props?.find((prp: any) => prp['o:label'] === d.p);
              if (p) {
                if (!fd[p.term]) fd[p.term] = [];
                fd[p.term].push(this.formatValue(p, d));
              } else {
                console.warn(`Label property "${d.p}" not found in props.`);
              }
            });
          }
          break;
        default:
          p = this.props?.find((prp: any) => prp['o:term'] === k);
          if (p) {
            if (Array.isArray(v)) {
              fd[k] = v.map((val: any) => this.formatValue(p, val));
            } else {
              fd[k] = this.formatValue(p, v);
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

  private async syncRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const responseData = await response.text();
      const data = JSON.parse(responseData);
      return data;
    } catch (error) {
      console.error('Failed to fetch or parse JSON:', error);
      return null;
    }
  }
}

function isArray(variable: any): variable is any[] {
  return variable instanceof Array;
}

export default Omk;

interface NewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  activeConfig: string | null;
  itemPropertiesData: any;
  propertiesLoading: boolean;
}

export const CreateModal: React.FC<NewModalProps> = ({
  isOpen,
  onClose,
  itemId,
  activeConfig,
  itemPropertiesData,
  propertiesLoading,
}) => {
  const {
    data: itemDetailsData,
    loading: detailsLoading,
    error: detailsError,
    refetch: refetchItemDetails,
  } = useFetchRT(itemId);

  const [itemData, setItemData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const clearState = () => {
    setItemData({});
  };

  const clearDetailsState = () => {
    refetchItemDetails();
  };

  const pa = {
    mail: 'erwan.tbd@gmail.com',
    api: 'https://edisem.arcanes.ca/omk/api/',
    ident: 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj',
    key: import.meta.env.VITE_API_KEY,
  };

  const omks = new Omk(pa);
  omks.init();

  useEffect(() => {
    if (detailsError) {
      console.error('Error fetching item details:', detailsError);
    }
  }, [detailsError]);

  const handleInputChange = (path: string, value: any) => {
    setItemData((prevData: any) => {
      const newData = { ...prevData };
      const keys = path;
      let current = newData;

      if (Array.isArray(value)) {
        if (Array.isArray(current[keys])) {
          current[keys] = value;
        } else {
          current[keys] = [value];
        }
      } else {
        current[keys] = value;
      }

      return newData;
    });
  };

  // Version avec toast de promisse + résultat
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!itemId) {
        throw new Error('Item URL is not defined or empty');
      }

      omks.props = itemPropertiesData;
      let object = omks.buildObject(itemDetailsData, itemData);

      // Toast avec promesse pour montrer le loading
      const savePromise = omks.createItem(object);

      addToast({
        title: "Création de l'item",
        description: 'Création en cours...',
        promise: savePromise,
      });

      await savePromise;

      // Toast de succès
      addToast({
        title: 'Succès',
        description: "L'item a été créé avec succès",
        color: 'success',
      });

      setSaving(false);
      refetchItemDetails();
      onClose();
    } catch (error) {
      // Toast d'erreur
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      addToast({
        title: 'Erreur',
        description: `Échec de la création : ${errorMessage}`,
        color: 'danger',
      });

      setSaveError(errorMessage);
      setSaving(false);
    }
  };

  if (propertiesLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <Spinner color='secondary' />
          <p>Chargement...</p>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        backdrop='blur'
        className='bg-c2'
        size='2xl'
        isOpen={isOpen}
        onClose={() => {
          clearState();
          clearDetailsState();
          onClose();
        }}
        hideCloseButton={true}
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-between p-25 '>
                <h2 className='text-c6 text-32 font-semibold'>Nouvel item</h2>
                <Link onPress={onClose}>
                  <CrossIcon
                    className='text-c6 cursor-pointer hover:text-action transition-all ease-in-out duration-200'
                    size={24}
                  />
                </Link>
              </ModalHeader>
              <ModalBody className='flex p-25'>
                <div className='flex flex-col gap-50 items-start scroll-y-auto'>
                  {activeConfig && !detailsLoading ? (
                    itemDetailsData &&
                    inputConfigs[activeConfig]?.map((col: InputConfig) => {
                      if (col.type === 'input') {
                        return (
                          <>
                            <Input
                              key={col.key}
                              size='lg'
                              classNames={{
                                label: 'text-semibold',
                                inputWrapper: 'bg-c1',
                                input: 'h-[50px]',
                              }}
                              className='min-h-[50px]'
                              type='text'
                              label={col.label}
                              labelPlacement='outside'
                              placeholder={`Entrez ${col.label}`}
                              isRequired
                              onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                            />
                          </>
                        );
                      } else if (col.type === 'textarea') {
                        return (
                          <Textarea
                            key={col.key}
                            size='lg'
                            classNames={{
                              label: 'text-semibold text-c6 text-24',
                              inputWrapper: 'bg-c1 shadow-none border-1 border-200 rounded-8',
                              input: 'h-[50px]',
                            }}
                            className='min-h-[50px]'
                            type='text'
                            label={col.label}
                            labelPlacement='outside'
                            placeholder={`Entrez ${col.label}`}
                            isRequired
                            onChange={(e) => handleInputChange(col.dataPath, e.target.value)}
                          />
                        );
                      } else if (col.type === 'time') {
                        return (
                          <>
                            <TimecodeInput
                              label={col.label}
                              handleInputChange={(value) => handleInputChange(col.dataPath, value)}
                            />
                          </>
                        );
                      } else if (col.type === 'date') {
                        return (
                          <>
                            <DatePicker
                              key={col.key}
                              label={col.label}
                              handleInputChange={(value) => handleInputChange(col.dataPath, value)}
                            />
                          </>
                        );
                      } else if (col.type === 'selection') {
                        return <SelectionInput key={col.key} col={col} handleInputChange={handleInputChange} />;
                      } else if (col.type === 'inputs') {
                        return (
                          <MultipleInputs
                            key={col.key}
                            col={col}
                            actualData={itemDetailsData}
                            handleInputChange={handleInputChange}
                          />
                        );
                      } else {
                        return null;
                      }
                    })
                  ) : (
                    <Spinner color='secondary' />
                  )}

                  {saveError && <div className='error'>{saveError}</div>}
                </div>
              </ModalBody>
              <ModalFooter className='flex items-center justify-end p-25 '>
                <div className='flex flex-row gap-25'>
                  <Button
                    onPress={onClose}
                    onClick={handleSave}
                    disabled={saving}
                    radius='none'
                    className={`h-[32px] px-10 text-16 rounded-8 text-selected bg-action transition-all ease-in-out duration-200 navfilter flex items-center`}>
                    Créer
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
