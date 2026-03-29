export const columnConfigs = {
  conferences: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:agent', label: 'Conférenciers', dataPath: 'schema:agent.0.display_title', multiple: true },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  conferenciers: [
    { key: 'nom', label: 'Nom', dataPath: 'foaf:lastName.0.@value' },
    { key: 'prenom', label: 'Prénom', dataPath: 'foaf:firstName.0.@value' },
    { key: 'jdc:hasUniversity', label: 'Université', dataPath: 'jdc:hasUniversity.0.display_title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  citations: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'cito:isCitedBy', label: 'Conférenciers', dataPath: 'cito:isCitedBy.0.display_title', multiple: true },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  pays: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  laboratoire: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@id' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  ecolesdoctorales: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@id' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  universites: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@id' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  motcles: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  // Ajoutez d'autres configurations selon vos besoins
};

// Fonction utilitaire pour accéder à une propriété dans un objet par chemin d'accès
export function getValuesByPath<T>(object: T, path: string): string {
  if (!path) return '';

  // Adjust path by removing specific indices
  const adjustedPath = path.replace(/\.\d+\./g, '.');

  const keys = adjustedPath.split('.');
  const value: any = object;
  const result: string[] = [];

  const traverse = (obj: any, keyParts: string[], index: number = 0) => {
    if (index >= keyParts.length) {
      if (obj !== undefined && obj !== null) {
        result.push(obj.toString());
      }
      return;
    }

    const key = keyParts[index];

    if (Array.isArray(obj?.[key])) {
      for (const item of obj[key]) {
        traverse(item, keyParts, index + 1);
      }
    } else if (obj?.[key] !== undefined && obj?.[key] !== null) {
      traverse(obj[key], keyParts, index + 1);
    }
  };

  traverse(value, keys);
  return result.join(', ');
}

export function getValueByPath<T>(object: T, path: string): any {
  if (!path) return undefined;
  const keys = path.split('.');
  let value: any = object;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}
