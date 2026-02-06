<?php

namespace CartoAffect\View\Helper;

use Laminas\View\Helper\AbstractHelper;

class QuerySqlViewHelper extends AbstractHelper
{
    protected $api;
    protected $conn;
    protected $cardHelper;
    protected $statsHelper;
    protected $narrativeStatsHelper;

    // Templates autorisés pour la création de ressources
    private $allowedTemplates = [

        123 => 'Edisem Commentaire'
    ];

    private $jinaApiKey = 'jina_82c06f5a04ad40e983f4fd011b60b64do8EwYJGWalWsjB1pR7rGPjzwr9J0';

    public function __construct($api, $conn)
    {
        $this->api = $api;
        $this->conn = $conn;
        
        // Initialize helpers
        $this->cardHelper = new QueryCardHelper($conn);
        $this->statsHelper = new QueryStatsHelper($conn);
        $this->narrativeStatsHelper = new NarrativeStatsHelper($conn, $this->statsHelper);
    }

    /**
     * Execution de requêtes sql directement dans la base sql
     *
     * @param array     $params paramètre de l'action
     * @return array
     */
    public function __invoke($params = [])
    {
        // Debug logging
        error_log('QuerySqlViewHelper __invoke called with params: ' . print_r($params, true));

        if ($params == []) {
            error_log('QuerySqlViewHelper: No params provided, returning empty array');
            return [];
        }

        $result = null;
        switch ($params['action']) {
            case 'statResourceTemplate':
                $result = $this->statResourceTemplate($params['id']);
                break;
            case 'getTemplateProperties':
                $result = $this->getTemplateProperties($params);
                break;
            case 'getDistinctPropertyVal':
                $result = $this->getDistinctPropertyVal($params['idRT'], $params['idP']);
                break;
            case 'statValueResourceClass':
                $result = $this->statValueResourceClass($params);
                break;
            case 'cooccurrenceValueResource':
                $result = $this->cooccurrenceValueResource($params);
                break;
            case 'statClassUsed':
                $result = $this->statClassUsed($params);
                break;
            case 'statResUsed':
                $result = $this->statResUsed($params);
                break;
            case 'tagUses':
                $result = $this->tagUses($params);
                break;
            case 'propValueResource':
                $result = $this->propValueResource($params);
                break;
            case 'complexityNbValue':
                $result = $this->complexityNbValue($params);
                break;
            case 'complexityUpdateValue':
                $result = $this->complexityUpdateValue($params);
                break;
            case 'complexityInsertValue':
                $result = $this->complexityInsertValue($params);
                break;
            case 'getActants':
                $result = $this->getActants();
                break;
            case 'getStudents':
                $result = $this->getStudents();
                break;
            case 'getStudyDayConfs':
                $result = $this->getStudyDayConfs();
                break;
            case 'getSeminarConfs':
                $result = $this->getSeminarConfs();
                break;
            case 'getColloqueConfs':
                $result = $this->getColloqueConfs();
                break;
            case 'getCitations':
                $result = $this->getCitations();
                break;
            case 'getUniversities':
                $result = $this->getUniversities();
                break;
            case 'getLaboratories':
                $result = $this->getLaboratories();
                break;
            case 'getDoctoralSchools':
                $result = $this->getDoctoralSchools();
                break;
            case 'getBibliographies':
                $result = $this->getBibliographies();
                break;
            case 'getMediagraphies':
                $result = $this->getMediagraphies();
                break;
            case 'getKeywords':
                $result = $this->getKeywords();
                break;
            case 'getCollections':
                $result = $this->getCollections();
                break;
            case 'getRecherches':
                $result = $this->getRecherches();
                break;
            case 'getAnnotations':
                $result = $this->getAnnotations();
                break;
            case 'getExperimentations':
                $result = $this->getExperimentations();
                break;
            case 'getExperimentationsStudents':
                $result = $this->getExperimentationsStudents();
                break;
            case 'getTools':
                $result = $this->getTools();
                break;
            case 'getFeedbacks':
                $result = $this->getFeedbacks();
                break;
            case 'getOeuvres':
                $result = $this->getOeuvres();
                break;
            case 'getPersonnes':
                $result = $this->getPersonnes();
                break;
            case 'getElementNarratifs':
                $result = $this->getElementNarratifs();
                break;
            case 'getExperimentationCards':
                $result = $this->getExperimentationCards();
                break;
            case 'getRecitsCitoyensCards':
                $result = $this->getRecitsCitoyensCards();
                break;
            case 'getRecitsMediatiquesCards':
                $result = $this->getRecitsMediatiquesCards();
                break;
            case 'getRecitsScientifiquesCards':
                $result = $this->getRecitsScientifiquesCards();
                break;
            case 'getRecitsTechnoCards':
                $result = $this->getRecitsTechnoCards();
                break;
            case 'getRecitsArtistiquesCards':
                $result = $this->getRecitsArtistiquesCards();
                break;
            case 'getCardsByEdition':
                $editionId = $params['editionId'] ?? null;
                $result = $this->getCardsByEdition($editionId);
                break;
            case 'getCardsByActant':
                $actantId = $params['actantId'] ?? null;
                $types = isset($params['types']) ? explode(',', $params['types']) : [];
                $result = $this->getCardsByActant($actantId, $types);
                break;
            case 'getCardsByKeyword':
                $keywordId = $params['keywordId'] ?? null;
                $limit = $params['limit'] ?? 8;
                $result = $this->getCardsByKeyword($keywordId, $limit);
                break;
            
            // Stats & Metrics Routes
            case 'getNarrativePracticesStats':
                $result = $this->narrativeStatsHelper->getNarrativePracticesStats();
                break;
            case 'getNarrativeTopKeywords':
                $limit = $params['limit'] ?? 8;
                $result = $this->narrativeStatsHelper->getTopKeywords($limit);
                break;
            case 'getRecitTypeBreakdown':
                $result = $this-> narrativeStatsHelper->getRecitTypeBreakdown();
                break;
            case 'getNavbarEditions':
                $result = $this->getNavbarEditions();
                break;
            case 'getElementEsthetique':
                $result = $this->getElementEsthetique();
                break;
            case 'createResource':
                $result = $this->createResource($params);
                break;
            case 'updateResource':
                $result = $this->updateResource($params);
                break;
            case 'deleteResource':
                $result = $this->deleteResource($params);
                break;
            case 'uploadMedia':
                $result = $this->uploadMedia($params);
                break;
            case 'getComments':
                $result = $this->getComments();
                break;
            case 'getTools':
                $result = $this->getTools();
                break;
            case 'getMicroResumes':
                $result = $this->getMicroResumes();
                break;
            case 'getRecitsScientifiques':
                $result = $this->getRecitsScientifiques();
                break;
            case 'getRecitsTechnoIndustriels':
                $result = $this->getRecitsTechnoIndustriels();
                break;
            case 'getRecitsMediatiques':
                $result = $this->getRecitsMediatiques();
                break;
            case 'getRecitsCitoyens':
                $result = $this->getRecitsCitoyens();
                break;
            case 'generateEmbeddings':
                $result = $this->generateEmbeddings($params);
                break;
            case 'searchEmbeddings':
                $result = $this->searchEmbeddings($params);
                break;
            case 'getActantsGlobalStats':
                $result = $this->getActantsGlobalStats();
                break;
            case 'getActantsByCountry':
                $result = $this->getActantsByCountry();
                break;
            case 'getActantDetails':
                $result = $this->getActantDetails($params['id']);
                break;
            case 'getActantNetwork':
                $result = $this->getActantNetwork($params['id']);
                break;
            case 'getEditionDetails':
                $result = $this->getEditionDetails($params['id']);
                break;
            case 'getRandomActants':
                $limit = isset($params['limit']) ? (int)$params['limit'] : 10;
                $result = $this->getRandomActants($limit);
                break;
            case 'getEditionsByType':
                $type = isset($params['type']) ? $params['type'] : 'seminaire';
                $result = $this->getEditionsByType($type);
                break;
            default:
                error_log('QuerySqlViewHelper: Unknown action: ' . ($params['action'] ?? 'null'));
                $result = [];
                break;
        }

        // S'assurer que le résultat est toujours un tableau
        if ($result === null) {
            error_log('QuerySqlViewHelper: result is null for action: ' . ($params['action'] ?? 'null'));
            return ['debug' => ['__invoke: result was null'], 'result' => []];
        }

        return $result;
    }

    /**
     * Helper paramétrable pour récupérer la base des actants
     */
    private function getActantBasicInfo($ids = [], $limit = null, $orderBy = 'r.title', $random = false)
    {
        $idFilter = '';
        if (!empty($ids)) {
            $idFilter = "AND r.id IN (" . implode(',', array_map('intval', $ids)) . ")";
        }

        $orderClause = $random ? "ORDER BY RAND()" : "ORDER BY $orderBy";
        $limitClause = $limit ? "LIMIT " . intval($limit) : "";

        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id IN (72)
            $idFilter
            $orderClause
            $limitClause
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        $idList = implode(',', $resourceIds);
        
        // 1. Récupérer toutes les valeurs raw pour ces actants
        // Propriétés NEW: 1 (Title), 139 (Fn), 140 (Ln), 73 (Uni), 91 (Lab), 94 (Country), 12 (Bio), 11 (Image), 74 (DocSchool)
        // Propriétés LEGACY: 3038 (Uni), 3044 (Lab), 3043 (DocSchool)
        $valueQuery = "
            SELECT 
                v.resource_id, 
                v.property_id, 
                v.value, 
                v.value_resource_id, 
                v.uri,
                m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN ($idList)
            AND v.property_id IN (139, 140, 73, 91, 74, 94, 11, 3038, 3044, 3043)
        ";
        $values = $this->conn->fetchAllAssociative($valueQuery);

        // 2. Récupérer les détails des affiliations (Univ, Labo, École Doc)
        // On collecte tous les IDs d'affiliation
        $affilIds = [];
        foreach ($values as $v) {
            // University (73/3038), Lab (91/3044), DocSchool (74/3043)
            if (in_array($v['property_id'], [73, 3038, 91, 3044, 74, 3043]) && $v['value_resource_id']) {
                $affilIds[] = $v['value_resource_id'];
            }
        }
        
        $affilNames = [];
        $affilLogos = [];
        $affilUrls = []; // Optional, if they have websites

        if (!empty($affilIds)) {
            $affilIdsUnique = implode(',', array_unique($affilIds));
            // Fetch name (Prop 1), Shortname (Prop 17), Logo, and URL (Prop 1517)
            $affilQuery = "
                SELECT 
                    r.id, 
                    MAX(CASE WHEN v.property_id = 1 THEN v.value END) as name,
                    MAX(CASE WHEN v.property_id = 17 THEN v.value END) as shortName,
                    MAX(CASE WHEN v.property_id = 1517 THEN v.uri END) as url,
                    MAX(CONCAT(m.storage_id, '.', m.extension)) as logo
                FROM resource r
                LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (1, 17, 1517)
                LEFT JOIN media m ON r.id = m.item_id AND m.position = 1
                WHERE r.id IN ($affilIdsUnique)
                GROUP BY r.id
            ";
            $affilData = $this->conn->fetchAllAssociative($affilQuery);
            foreach($affilData as $a) {
                 $affilNames[$a['id']] = $a['shortName'] ?: $a['name']; // Prefer shortname if available
                 if ($a['logo']) {
                     $affilLogos[$a['id']] = "https://tests.arcanes.ca/omk/files/original/" . $a['logo'];
                 }
                 if ($a['url']) {
                     $affilUrls[$a['id']] = $a['url'];
                 }
            }
        }

        // 3. Récupérer le nombre d'interventions pour ces actants
        $countQuery = "
            SELECT v.value_resource_id as actant_id, COUNT(DISTINCT r.id) as count 
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE v.property_id IN (2095, 386, 235, 581)
            AND r.resource_template_id IN (71, 121, 122, 108)
            AND v.value_resource_id IN ($idList)
            GROUP BY v.value_resource_id
        ";
        $counts = $this->conn->fetchAllAssociative($countQuery);
        $countMap = [];
        foreach($counts as $c) {
            $countMap[$c['actant_id']] = $c['count'];
        }
        
        // 4. Actant Thumbnails directly linked
        $imgQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN ($idList)
        ";
        $imgs = $this->conn->fetchAllAssociative($imgQuery);
        $imgMap = [];
        foreach($imgs as $img) {
             $imgMap[$img['item_id']] = "https://tests.arcanes.ca/omk/files/original/" . $img['logo'];
        }

        // Build Result
        $results = [];
        foreach($resources as $res) {
             $actant = [
                 'id' => $res['id'],
                 //'title' => '',
                 'firstname' => '',
                 'lastname' => '',
                 'picture' => $imgMap[$res['id']] ?? null, 
                 'interventions' => $countMap[$res['id']] ?? 0,
                 'universities' => [],
                 'laboratories' => [],
                 'doctoralSchools' => [],
                 'countries' => [],
                 //'bio' => ''
             ];
             
             foreach($values as $val) {
                 if ($val['resource_id'] != $res['id']) continue;
                 
                 switch($val['property_id']) {
                     //case 1: $actant['title'] = $val['value']; break;
                     case 139: $actant['firstname'] = $val['value']; break;
                     case 140: $actant['lastname'] = $val['value']; break;
                     //case 12: $actant['bio'] = $val['value']; break;
                     
                     // Gestion de l'image
                     case 11: 
                         if ($val['storage_id']) {
                              $actant['picture'] = "https://tests.arcanes.ca/omk/files/original/" . $val['storage_id'] . "." . $val['extension'];
                         } else {
                             if (!$actant['picture']) $actant['picture'] = $val['uri'] ?? $val['value']; 
                         }
                         break;

                     case 73: // University
                     case 3038: // Legacy University
                         if ($val['value_resource_id']) {
                             $uid = $val['value_resource_id'];
                             $actant['universities'][] = [
                                 'id' => $uid,
                                 'name' => $affilNames[$uid] ?? '',
                                 'shortName' => $affilNames[$uid] ?? '',
                                 'logo' => $affilLogos[$uid] ?? null,
                                 'url' => $affilUrls[$uid] ?? ''
                             ];
                         }
                         break;
                     
                     case 91: // Property 91 can be Lastname OR Laboratory
                     case 3044: // Legacy Laboratory
                         if ($val['value_resource_id']) {
                             $lid = $val['value_resource_id'];
                             $actant['laboratories'][] = [
                                 'id' => $lid,
                                 'name' => $affilNames[$lid] ?? 'Laboratoire',
                                 'logo' => $affilLogos[$lid] ?? null,
                                 'url' => $affilUrls[$lid] ?? ''
                             ];
                         } elseif ($val['property_id'] == 91) {
                             if (!$actant['lastname']) $actant['lastname'] = $val['value'];
                         }
                         break;
                    
                     case 74: // École doctorale
                     case 3043: // Legacy Doc School
                         if ($val['value_resource_id']) {
                            $did = $val['value_resource_id'];
                            $actant['doctoralSchools'][] = [
                                'id' => $did,
                                'name' => $affilNames[$did] ?? 'École Doctorale',
                                'logo' => $affilLogos[$did] ?? null,
                                'url' => $affilUrls[$did] ?? ''
                            ];
                        }
                        break;

                     case 94: // Pays
                        if ($val['value']) $actant['countries'][] = $val['value'];
                        break;
                 }
             }

             // Fallback names
             // Fallback names
             /*
             if (!$actant['title'] && $actant['firstname'] && $actant['lastname']) {
                 $actant['title'] = $actant['firstname'] . ' ' . $actant['lastname'];
             }
             if ($actant['title'] && (!$actant['firstname'] || !$actant['lastname'])) {
                 $parts = explode(' ', $actant['title']);
                 if (!$actant['firstname']) $actant['firstname'] = $parts[0];
                 if (!$actant['lastname']) $actant['lastname'] = isset($parts[1]) ? end($parts) : '';
             }
             */

             $results[] = $actant;
        }

        return $results;
    }

    /**
     * Retrieves actants grouped by country and affiliation (University/Laboratory)
     * Used for the World Map visualization.
     */
    function getActantsByCountry() {
        // Le Pays est lié à l'Université/Labo via la property 377 (qui pointe vers une ressource Pays)
        // On doit faire: Actant -> (Prop 73/3038/91/3044) -> Affiliation -> (Prop 377) -> Pays Resource -> (Prop 1) -> Nom Pays
        
        $structureSql = "
            SELECT 
                r.id as actant_id,
                r.title as actant_name,
                v_country_name.value as country,
                affil.id as affil_id,
                affil.title as affil_name,
                m.storage_id as affil_logo_id,
                m.extension as affil_logo_ext,
                -- Image Actant via Property 11 or Media
                (SELECT CONCAT(media.storage_id, '.', media.extension) FROM media WHERE media.item_id = r.id LIMIT 1) as actant_picture,
                -- Compte Interventions (Conférences, Expérimentations, Colloques, Journées d'études, Séminaires)
                (SELECT COUNT(DISTINCT r_conf.id) 
                 FROM value v_conf 
                 JOIN resource r_conf ON v_conf.resource_id = r_conf.id 
                 WHERE v_conf.value_resource_id = r.id 
                 AND v_conf.property_id = 386
                 AND r_conf.resource_template_id IN (71, 108, 121, 122)
                ) as intervention_count
            FROM resource r
            
            -- 1. Lien Actant -> Affiliation (Université ou Labo)
            -- Props: 73 (Uni), 3038 (Legacy Uni), 91 (Lab), 3044 (Legacy Lab)
            JOIN value v_affil ON r.id = v_affil.resource_id AND v_affil.property_id IN (73, 3038, 91, 3044)
            JOIN resource affil ON v_affil.value_resource_id = affil.id
            
            -- 2. Lien Affiliation -> Pays (Prop 377)
            JOIN value v_country_ref ON affil.id = v_country_ref.resource_id AND v_country_ref.property_id = 377
            
            -- 3. Lien Pays Resource -> Nom du Pays (Prop 1)
            JOIN value v_country_name ON v_country_ref.value_resource_id = v_country_name.resource_id AND v_country_name.property_id = 1
            
            -- 4. Logo de l'affiliation (pour l'affichage)
            LEFT JOIN media m ON (affil.id = m.item_id AND m.position = 1)
            
            WHERE r.resource_template_id IN (72)
            ORDER BY country ASC, affil_name ASC
        ";
        
        $rows = $this->conn->fetchAllAssociative($structureSql);
        $countriesData = [];

        foreach($rows as $row) {
             $c = $row['country'];
             if (!$c) continue;
             
             if (!isset($countriesData[$c])) {
                 $countriesData[$c] = ['name' => $c, 'count' => 0, 'universities' => []];
             }
             
             // Group by Affiliation (University or Lab)
             $affilKey = $row['affil_id'];
             
             if (!isset($countriesData[$c]['universities'][$affilKey])) {
                 $countriesData[$c]['universities'][$affilKey] = [
                     'id' => $row['affil_id'],
                     'name' => $row['affil_name'] ?? 'Institution inconnue',
                     'logo' => $row['affil_logo_id'] ? "https://tests.arcanes.ca/omk/files/original/" . $row['affil_logo_id'] . "." . $row['affil_logo_ext'] : null,
                     'actants' => []
                 ];
             }

             // Avoid duplicate actants in same institution (defensive)
             $actantExists = false;
             foreach ($countriesData[$c]['universities'][$affilKey]['actants'] as $a) {
                 if ($a['id'] === $row['actant_id']) { $actantExists = true; break; }
             }
             
             if (!$actantExists) {
                 $countriesData[$c]['universities'][$affilKey]['actants'][] = [
                     'id' => $row['actant_id'],
                     'name' => $row['actant_name'],
                     // Use fallback picture logic if needed, but SQL should catch media linked to Actant item
                     'picture' => $row['actant_picture'] ? "https://tests.arcanes.ca/omk/files/original/" . $row['actant_picture'] : null,
                     'interventions' => (int)$row['intervention_count']
                 ];
                 $countriesData[$c]['count']++;
             }
        }

        // Clean up keys
        foreach($countriesData as &$data) {
             $data['universities'] = array_values($data['universities']);
        }
        
        return array_values($countriesData);
    }

    /**
     * Calcule le réseau de proximité pour un intervenant donné.
     * Logique migrée du frontend (IntervenantNetwork.tsx).
     */
    public function getActantNetwork($actantId) {
        $actantId = (int)$actantId;
        
        // 1. Récupérer les données de l'actant cible
        $targetData = $this->getActantTerms([$actantId]);
        if (!isset($targetData[$actantId])) {
            return ['nodes' => [], 'links' => []];
        }
        $targetTerms = $targetData[$actantId];

        // 2. Récupérer les données de TOUS les autres actants
        $allActantsSql = "SELECT id FROM resource WHERE resource_template_id IN (72, 96)";
        $allIdsFn = $this->conn->fetchAllAssociative($allActantsSql);
        $allIds = array_column($allIdsFn, 'id');
        $allIds = array_diff($allIds, [$actantId]);
        
        // Fetch terms pour tous
        $othersData = $this->getActantTerms($allIds);
        
        $similarities = [];
        
        foreach ($othersData as $otherId => $otherTerms) {
            $sK = $this->jaccard($targetTerms['keywords'], $otherTerms['keywords']);
            $sU = $this->jaccard($targetTerms['unis'], $otherTerms['unis']);
            $sL = $this->jaccard($targetTerms['labs'], $otherTerms['labs']);
            $sS = $this->jaccard($targetTerms['schools'], $otherTerms['schools']);
            $sE = $this->jaccard($targetTerms['events'], $otherTerms['events']);
            $sR = $this->jaccard($targetTerms['refs'], $otherTerms['refs']);
            
            $sInst = ($sU + $sL + $sS) / 3;
            $score = ($sK * 0.40) + ($sE * 0.30) + ($sR * 0.20) + ($sInst * 0.10);
            
            if ($score > 0.05) {
                $sharedEvents = count(array_intersect($targetTerms['events'], $otherTerms['events']));
                $sharedRefs = count(array_intersect($targetTerms['refs'], $otherTerms['refs']));
                
                $similarities[] = [
                    'id' => $otherId,
                    'score' => $score,
                    'details' => [
                        'k' => $sK, 'u' => $sU, 'l' => $sL, 's' => $sS, 'e' => $sE, 'r' => $sR,
                        'sharedEventsCount' => $sharedEvents,
                        'sharedRefsCount' => $sharedRefs
                    ]
                ];
            }
        }
        
        usort($similarities, function($a, $b) {
            return ($b['score'] <=> $a['score']);
        });
        
        $topSimilar = array_slice($similarities, 0, 20);
        
        $idsToFetch = array_merge([$actantId], array_column($topSimilar, 'id'));
        $basicInfos = $this->getActantBasicInfo($idsToFetch);
        $infosMap = [];
        foreach($basicInfos as $info) { 
            $infosMap[$info['id']] = $info; 
        }

        $centerInfo = $infosMap[$actantId] ?? ['firstname' => '?', 'lastname' => '?', 'picture' => null];
        $nodes = [[
            'id' => (string)$actantId,
            'name' => $centerInfo['firstname'] . ' ' . $centerInfo['lastname'],
            'picture' => $centerInfo['picture'],
            'similarity' => 1,
            'type' => 'current',
            'fx' => 0, 'fy' => 0,
            'orbitIndex' => -1,
            'sharedKeywords' => count($targetTerms['keywords'])
        ]];
        
        $links = [];
        $totalNeighbors = count($topSimilar);
        
        foreach($topSimilar as $index => $sim) {
            $nid = $sim['id'];
            $nInfo = $infosMap[$nid] ?? ['firstname' => '?', 'lastname' => '?', 'picture' => null];
            
            $orbitIndex = 0;
            if ($totalNeighbors > 3) {
                if ($index < $totalNeighbors / 3) $orbitIndex = 0;
                else if ($index < ($totalNeighbors * 2) / 3) $orbitIndex = 1;
                else $orbitIndex = 2;
            }
            
            $nodes[] = [
                'id' => (string)$nid,
                'name' => $nInfo['firstname'] . ' ' . $nInfo['lastname'],
                'picture' => $nInfo['picture'],
                'similarity' => $sim['score'],
                'type' => 'neighbor',
                'details' => $sim['details'],
                'orbitIndex' => $orbitIndex,
                'sharedKeywords' => 0
            ];
            
            $links[] = [
                'source' => (string)$actantId,
                'target' => (string)$nid,
                'value' => $sim['score']
            ];
        }
        
        return ['nodes' => $nodes, 'links' => $links];
    }
    
    private function jaccard($arr1, $arr2) {
        if (empty($arr1) || empty($arr2)) return 0;
        $intersection = count(array_intersect($arr1, $arr2));
        $union = count(array_unique(array_merge($arr1, $arr2)));
        if ($union == 0) return 0;
        return $intersection / $union;
    }

    private function getActantTerms($actantIds) {
        if (empty($actantIds)) return [];
        $idsStr = implode(',', $actantIds);
        
        $result = [];
        foreach($actantIds as $id) {
            $result[$id] = [
                'keywords' => [], 'unis' => [], 'labs' => [], 'schools' => [], 'events' => [], 'refs' => []
            ];
        }

        $affilSql = "
            SELECT resource_id, property_id, value_resource_id 
            FROM value 
            WHERE resource_id IN ($idsStr) 
            AND property_id IN (73, 3038, 91, 3044, 74, 3043)
            AND value_resource_id IS NOT NULL
        ";
        $affils = $this->conn->fetchAllAssociative($affilSql);
        foreach($affils as $row) {
            $rid = $row['resource_id'];
            $vid = $row['value_resource_id'];
            $pid = $row['property_id'];
            
            if (in_array($pid, [73, 3038])) $result[$rid]['unis'][] = $vid;
            if (in_array($pid, [91, 3044])) $result[$rid]['labs'][] = $vid;
            if (in_array($pid, [74, 3043])) $result[$rid]['schools'][] = $vid;
        }

        $confLinkSql = "
            SELECT v.resource_id as conf_id, v.value_resource_id as actant_id
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE v.value_resource_id IN ($idsStr)
            AND v.property_id IN (2095, 386, 235, 581)
            AND r.resource_template_id IN (71, 121, 122, 108)
        ";
        $confLinks = $this->conn->fetchAllAssociative($confLinkSql);
        
        $actantConfs = [];
        $allConfIds = [];
        foreach($confLinks as $row) {
            $actantConfs[$row['actant_id']][] = $row['conf_id'];
            $allConfIds[$row['conf_id']] = true;
            $result[$row['actant_id']]['events'][] = $row['conf_id']; 
        }
        $confIdsUnique = array_keys($allConfIds);
        
        if (!empty($confIdsUnique)) {
            $confIdsStr = implode(',', $confIdsUnique);
            $confPropsSql = "
                SELECT v.resource_id as conf_id, v.property_id, v.value_resource_id, r.resource_template_id as target_template
                FROM value v
                JOIN resource r ON v.value_resource_id = r.id
                WHERE v.resource_id IN ($confIdsStr)
            ";
            $confProps = $this->conn->fetchAllAssociative($confPropsSql);
            
            $confKeywords = [];
            $confRefs = [];
            
            foreach($confProps as $row) {
                $cid = $row['conf_id'];
                $tid = $row['target_template'];
                $vid = $row['value_resource_id'];
                $pid = $row['property_id'];
                
                if ($pid == 2097 || $tid == 34) {
                    $confKeywords[$cid][] = $vid;
                }
                if ($tid == 81) $confRefs[$cid][] = "bib-$vid";
                if ($tid == 80) $confRefs[$cid][] = "cit-$vid";
            }
            
            foreach($actantConfs as $aid => $cids) {
                foreach($cids as $cid) {
                    if (isset($confKeywords[$cid])) {
                        foreach($confKeywords[$cid] as $k) $result[$aid]['keywords'][] = $k;
                    }
                    if (isset($confRefs[$cid])) {
                        foreach($confRefs[$cid] as $r) $result[$aid]['refs'][] = $r;
                    }
                }
            }
        }
        
        foreach($result as $id => &$terms) {
            $terms['keywords'] = array_unique($terms['keywords']);
            $terms['unis'] = array_unique($terms['unis']);
            $terms['labs'] = array_unique($terms['labs']);
            $terms['schools'] = array_unique($terms['schools']);
            $terms['events'] = array_unique($terms['events']);
            $terms['refs'] = array_unique($terms['refs']);
        }
        
        return $result;
    }

    /**
     * Récupère les détails d'une édition et ses conférences enrichies.
     * Remplace la logique frontend de ConfsByEdition.tsx.
     */
    public function getEditionDetails($editionId) {
        $editionId = (int)$editionId;

        // 1. Fetch Edition Metadata
        // Template 77
        // Props: 1 (Title), 7 (Year), 1662 (Season), 8 (Type)
        
        $editionSql = "
            SELECT 
                r.id, 
                r.title,
                MAX(CASE WHEN v.property_id = 7 THEN v.value END) as year,
                MAX(CASE WHEN v.property_id = 1662 THEN v.value END) as season,
                MAX(CASE WHEN v.property_id = 8 THEN v.value_resource_id END) as type_id
            FROM resource r
            LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (7, 1662, 8)
            WHERE r.id = ? AND r.resource_template_id = 77
            GROUP BY r.id
        ";
        $editionRaw = $this->conn->fetchAssociative($editionSql, [$editionId]);
        
        if (!$editionRaw) {
             error_log("getEditionDetails: Edition not found or wrong template for ID $editionId");
             return null;
        }
        
        // Resolve Edition Type Name
        $editionType = "";
        if ($editionRaw['type_id']) {
            $typeSql = "SELECT title FROM resource WHERE id = ?";
            $typeRes = $this->conn->fetchOne($typeSql, [$editionRaw['type_id']]);
            $editionType = strtolower($typeRes);
        }

        $edition = [
            'id' => (string)$editionRaw['id'],
            'title' => $editionRaw['title'],
            'year' => $editionRaw['year'],
            'season' => $editionRaw['season'],
            'editionType' => $editionType
        ];

        // 2. Fetch Conferences
        // Link: Edition --(937)--> Conference
        $confsSql = "
            SELECT v_link.value_resource_id as id
            FROM value v_link
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 937
        ";
        $confsRaw = $this->conn->fetchAllAssociative($confsSql, [$editionId]);
        
        $confIds = array_column($confsRaw, 'id');
        
        // Use cardHelper for standardized card data
        $conferences = $this->cardHelper->fetchCards($confIds);

        return [
            'edition' => $edition,
            'conferences' => $conferences
        ];
    }

    function getActantsGlobalStats() {
        // 1. Global Counts
        $counts = [
            'actants' => $this->conn->fetchOne("SELECT COUNT(*) FROM resource WHERE resource_template_id IN (72)"),
            'universities' => $this->conn->fetchOne("SELECT COUNT(*) FROM resource WHERE resource_template_id = 73"),
            'laboratories' => $this->conn->fetchOne("SELECT COUNT(*) FROM resource WHERE resource_template_id = 91"),
            'doctoralSchools' => $this->conn->fetchOne("SELECT COUNT(*) FROM resource WHERE resource_template_id = 74"),
            'countries' => $this->conn->fetchOne("SELECT COUNT(*) FROM resource WHERE resource_template_id = 94"),
        ];

        // 2. Intervention Counts over Years
        $heatmapSql = "
            SELECT 
                SUBSTRING(v.value, 1, 4) as year, 
                COUNT(*) as count
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE r.resource_template_id IN (71, 121, 122, 108)
            AND v.property_id IN (1457, 7) -- Date (1457 for Confs, 7 for Experimentations/Colloques)
            GROUP BY year
            ORDER BY year ASC
        ";
        $heatmap = $this->conn->fetchAllAssociative($heatmapSql);

        // 3. Top Actants (Interventions count)
        $topActantsQuery = "
            SELECT 
                v.value_resource_id as actant_id,
                COUNT(DISTINCT r.id) as intervention_count
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE v.property_id IN (386, 2095, 235, 581) -- Actant connection properties
            AND r.resource_template_id IN (71, 121, 122, 108)
            GROUP BY v.value_resource_id
            ORDER BY intervention_count DESC
            LIMIT 3
        ";
        $topIds = $this->conn->fetchAllAssociative($topActantsQuery);
        $topActantDetails = $this->getActantBasicInfo(array_column($topIds, 'actant_id'));

        $topActantsMap = [];
        foreach ($topActantDetails as $actant) {
             $topActantsMap[$actant['id']] = $actant;
        }
        
        // Merge counts
        $topActantsSorted = [];
        foreach ($topIds as $top) {
            if (isset($topActantsMap[$top['actant_id']])) {
                $actant = $topActantsMap[$top['actant_id']];
                $actant['intervention_count'] = $top['intervention_count'];
                $topActantsSorted[] = $actant;
            }
        }

        // 3. Keywords Stats
        $keywordsQuery = "
            SELECT 
                kw.id as keyword_id,
                kw.title as keyword_label,
                COUNT(*) as count
            FROM value v_act
            JOIN value v_kw ON v_act.resource_id = v_kw.resource_id 
            JOIN resource kw ON v_kw.value_resource_id = kw.id
            WHERE v_act.property_id IN (386, 2095, 235, 581) -- Actant connection
            AND v_kw.property_id = 2097 -- Keyword connection
            GROUP BY kw.id, kw.title
            ORDER BY count DESC
            LIMIT 7
        ";
        
        $keywordsStats = $this->conn->fetchAllAssociative($keywordsQuery);

        return [
            'counts' => $counts,
            'topActants' => $topActantsSorted,
            'keywords' => $keywordsStats
        ];
    }

    /**
     * Helper to fetch standardized data for ResourceCards (Conf, Exp, Recit, etc.)
     * Returns: [ id, title, type, date, url, thumbnail, actants: [...] ]
     */
    private function fetchResourceCardData(array $resourceIds) {
        if (empty($resourceIds)) return [];
        
        $idsStr = implode(',', array_map('intval', $resourceIds));
        
        // 1. Fetch Basic Info & Metadata
        // Prop 1 (Title), 561 (Description), 1457 (Date), 1517 (URL), 7 (Year - fallback for Date)
        // PLUS: Associated Video URL logic (Prop 438 'associatedMedia' -> Item -> Prop 121 'URL')
        $sql = "
            SELECT 
                r.id, 
                r.title, 
                r.resource_template_id,
                MAX(CASE WHEN v.property_id = 561 THEN v.value END) as description,
                COALESCE(
                    MAX(CASE WHEN v.property_id = 23 THEN v.value END),   -- dcterms:issued (Priority)
                    MAX(CASE WHEN v.property_id = 1457 THEN v.value END), -- date (Legacy)
                    MAX(CASE WHEN v.property_id = 7 THEN v.value END)     -- year (Fallback)
                ) as date,
                (SELECT uri FROM value WHERE resource_id = r.id AND property_id = 1517 LIMIT 1) as url,
                (SELECT CONCAT(m.storage_id, '.', m.extension) FROM media m WHERE m.item_id = r.id LIMIT 1) as media_logo,
                -- Try to fetch associated video URL (YouTube)
                (SELECT v_url.uri 
                 FROM value v_assoc 
                 JOIN value v_url ON v_assoc.value_resource_id = v_url.resource_id 
                 WHERE v_assoc.resource_id = r.id 
                 AND v_assoc.property_id = 438 
                 AND v_url.property_id = 121 
                 LIMIT 1) as associated_video_url
            FROM resource r
            LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (1457, 7, 561, 23)
            WHERE r.id IN ($idsStr)
            GROUP BY r.id
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql);
        
        // 2. Fetch Linked Actants for these resources
        // Prop 2095 (Has Actant) or 386 (Creator) OR 2 (Legacy Creator/Source for Recits)
        $actantMap = [];
        $resToActants = [];
        
        // Create Map of ID -> TemplateID for filtering
        $templateMap = [];
        foreach ($rows as $r) {
            $templateMap[$r['id']] = $r['resource_template_id'];
        }

        $contribSql = "
            SELECT 
                v.resource_id as res_id,
                v.value_resource_id as actant_id,
                v.property_id
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.property_id IN (2095, 386, 581, 1418, 86, 2145, 1606, 2) 
            AND v.resource_id IN ($idsStr)
            AND v.value_resource_id IS NOT NULL
            AND r.resource_template_id IN (72, 96)
        ";
        $contribs = $this->conn->fetchAllAssociative($contribSql);
        
        if (!empty($contribs)) {
            $allActantIds = array_unique(array_column($contribs, 'actant_id'));
            
            // Fully hydrate actants (Names, Pics, etc.)
            $actantDetails = $this->getActantBasicInfo($allActantIds, null);
            
            foreach ($actantDetails as $ad) {
                $actantMap[$ad['id']] = $ad;
            }

            // Identify missing IDs (non-Actant creators, e.g. Organizations or legacy)
            $foundIds = array_keys($actantMap);
            $missingIds = array_diff($allActantIds, $foundIds);

            if (!empty($missingIds)) {
                // 1. Initialize ALL missing IDs to ensure they are not skipped
                foreach ($missingIds as $mid) {
                    $actantMap[$mid] = [
                        'id' => (string)$mid,
                        'name' => 'Contributor', // Default label if Title is missing
                        'firstname' => '',
                        'lastname' => '',
                        'picture' => null,
                        'details' => 'Contributor'
                    ];
                }

                $missingIdsStr = implode(',', $missingIds);
                
                // 2. Fetch Titles (Prop 1) to update name
                $fallbackSql = "
                    SELECT r.id, v.value as title
                    FROM resource r
                    JOIN value v ON r.id = v.resource_id
                    WHERE r.id IN ($missingIdsStr)
                    AND v.property_id = 1
                ";
                $fallbackRows = $this->conn->fetchAllAssociative($fallbackSql);
                
                // 3. Update Names
                foreach ($fallbackRows as $row) {
                    $actantMap[$row['id']]['name'] = $row['title'];
                }

                // 4. Fetch Thumbnails (Media)
                $fallbackImgSql = "
                    SELECT item_id, CONCAT(storage_id, '.', extension) as logo
                    FROM media
                    WHERE item_id IN ($missingIdsStr)
                ";
                $fallbackImgs = $this->conn->fetchAllAssociative($fallbackImgSql);
                
                // 5. Update Pictures
                foreach ($fallbackImgs as $img) {
                    $logo = "https://tests.arcanes.ca/omk/files/original/" . $img['logo'];
                    $actantMap[$img['item_id']]['picture'] = $logo;
                }
            }
            
            foreach ($contribs as $c) {
                $resId = $c['res_id'];
                $propId = $c['property_id'];
                $actantId = $c['actant_id'];
                $tmplId = $templateMap[$resId] ?? 0;

                // STRICT FILTERING RULES
                // Recit Citoyen (119) -> ONLY Prop 2 (Creator)
                if ($tmplId == 119 && $propId != 2) {
                    continue;
                }

                if (isset($actantMap[$actantId])) {
                    $resToActants[$resId][] = $actantMap[$actantId];
                }
            }
        }
        
        // 2b. Fetch Keywords (Prop 2097)
        $keywordsMap = [];
        $kwSql = "
            SELECT resource_id, value_resource_id
            FROM value
            WHERE resource_id IN ($idsStr)
            AND property_id = 2097
        ";
        $kwRows = $this->conn->fetchAllAssociative($kwSql);
        foreach ($kwRows as $row) {
            $keywordsMap[$row['resource_id']][] = $row['value_resource_id'];
        }
        
        // 3. Mapping Templates to Types
        $typeMap = [
            121 => 'journee_etudes',
            122 => 'colloque',
            71 => 'seminaire',
            108 => 'experimentation',
            119 => 'recit_citoyen',
            120 => 'recit_mediatique',
            124 => 'recit_scientifique',
            117 => 'recit_techno_industriel',
            131 => 'recit_artistique',
            103 => 'recit_artistique'
        ];

        // 4. Assemble Final Data
        $results = [];
        foreach ($rows as $row) {
            $id = $row['id'];
            $typeKey = $typeMap[$row['resource_template_id']] ?? 'default';
            
            $thumbnail = null;
            if ($row['media_logo']) {
                 $thumbnail = "https://tests.arcanes.ca/omk/files/original/" . $row['media_logo'];
            }
            
            $finalUrl = $row['url'] ?: $row['associated_video_url'];

            // Construct Associated Media Stub for logic consistency
            $associatedMedia = [];
            if ($row['associated_video_url']) {
                $associatedMedia[] = ['url' => $row['associated_video_url']];
            }

            $results[] = [
                'id' => (string)$id,
                'title' => $row['title'],
                'date' => $row['date'],
                'url' => $finalUrl,
                'type' => $typeKey,
                'thumbnail' => $thumbnail,
                'actants' => $resToActants[$id] ?? [],
                'motcles' => $keywordsMap[$id] ?? [],
                'associatedMedia' => $associatedMedia
            ];
        }
        
        return $results;
    }

    public function getEditionsByType($typeKey) {
        // Mapping key -> DB Title (lowercase checks)
        $map = [
            'seminaire' => 'séminaire',
            'colloque' => 'colloque',
            'journee_etudes' => 'journée d’études'
        ];
        
        $targetType = $map[$typeKey] ?? null;
        if (!$targetType) return [];
        
        // 1. Find Editions (Template 77) of this type
        $sql = "
            SELECT 
                r.id, 
                r.title,
                MAX(CASE WHEN v.property_id = 7 THEN v.value END) as year,
                MAX(CASE WHEN v.property_id = 1662 THEN v_linked.value END) as season
            FROM resource r
            JOIN value v_type ON r.id = v_type.resource_id AND v_type.property_id = 8
            JOIN resource r_type ON v_type.value_resource_id = r_type.id
            LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (7, 1662)
            LEFT JOIN value v_linked ON v.value_resource_id = v_linked.resource_id AND v_linked.property_id = 1
            WHERE r.resource_template_id = 77
            AND LOWER(r_type.title) LIKE ?
            GROUP BY r.id
            ORDER BY year DESC
        ";
        
        // Use LIKE for safer string matching
        $searchParam = $targetType;
        if ($typeKey === 'journee_etudes') $searchParam = 'journée d%';
        
        $rows = $this->conn->fetchAllAssociative($sql, [$searchParam]);
        
        // 2. Enrich with Conferences using Standard Helper
        $results = [];
        $editionIds = array_column($rows, 'id');
        
        $conferencesByEdition = [];
        if (!empty($editionIds)) {
            $editionIdsStr = implode(',', $editionIds);
            
            // 2a. Find all conference IDs for these editions
            $confsSql = "
                SELECT v.value_resource_id as id, v.resource_id as edition_id
                FROM value v
                JOIN resource r ON v.value_resource_id = r.id
                WHERE v.resource_id IN ($editionIdsStr)
                AND v.property_id = 937
                ORDER BY r.id ASC
            ";
            $confLinks = $this->conn->fetchAllAssociative($confsSql);
            
            $allConfIds = array_column($confLinks, 'id');
            
            // 2b. Fetch standardized card data
            $cardsData = $this->fetchResourceCardData($allConfIds);
            $cardsMap = [];
            foreach ($cardsData as $card) {
                $cardsMap[$card['id']] = $card;
            }
            
            // 2c. Group by Edition
            foreach ($confLinks as $link) {
                $cId = $link['id'];
                $eId = $link['edition_id'];
                if (isset($cardsMap[$cId])) {
                    $conferencesByEdition[$eId][] = $cardsMap[$cId];
                }
            }
        }
        
        foreach($rows as $row) {
            $eId = $row['id'];
            $results[] = [
                'id' => (string)$eId,
                'title' => $row['title'],
                'year' => $row['year'],
                'season' => $row['season'],
                'editionType' => $targetType,
                'conferences' => $conferencesByEdition[$eId] ?? []
            ];
        }
        
        return $results;
    }

    function getRandomActants($limit = 10) {
        return $this->getActantBasicInfo([], $limit, null, true);
    }

    function getActantDetails($id) {
         $basic = $this->getActantBasicInfo([$id]);
         if (empty($basic)) return null;
         
         $actant = $basic[0];
         
         // Fetch Interventions (Conferences + Experimentations)
         // Link properties: 386 (Creator), 2095 (Has Actant), 581 (Collaborator)
         // Templates: 71 (Seminar), 121 (StudyDay), 122 (Colloque), 108 (Experimentation)
         
         $linkSql = "
            SELECT DISTINCT r.id
            FROM value v_link
            JOIN resource r ON v_link.resource_id = r.id
            WHERE v_link.value_resource_id = ?
            AND v_link.property_id IN (386, 2095, 581)
            AND r.resource_template_id IN (71, 121, 122, 108)
         ";
         
         $linkedRes = $this->conn->fetchAllAssociative($linkSql, [$id]);
         $linkedIds = array_column($linkedRes, 'id');
         
         // Use Standard Helper
         $interventions = $this->fetchResourceCardData($linkedIds);
         
         // Sort by date DESC
         usort($interventions, function($a, $b) {
             return strtotime($b['date'] ?? '0') - strtotime($a['date'] ?? '0');
         });
         
         $actant['interventionsList'] = $interventions;

         return $actant;
    }



    private function callJinaEmbeddingAPI($apiKey, $text, $retries = 3)
    {
        $url = "https://api.jina.ai/v1/embeddings";

        for ($attempt = 0; $attempt < $retries; $attempt++) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                "model" => "jina-embeddings-v3",
                "task" => "retrieval.passage",
                "dimensions" => 384,
                "input" => [$text]
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $apiKey,
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode === 200) {
                $decoded = json_decode($result, true);

                // Jina retourne: {"data": [{"embedding": [...]}]}
                if (isset($decoded['data'][0]['embedding']) && is_array($decoded['data'][0]['embedding'])) {
                    return $decoded['data'][0]['embedding'];
                }

                $errorMsg = "Invalid Jina response structure: " . json_encode($decoded);
                error_log($errorMsg);
                return ['error' => $errorMsg, 'http_code' => $httpCode];
            } elseif ($httpCode === 429) {
                if ($attempt < $retries - 1) {
                    sleep(2 * ($attempt + 1));
                    continue;
                }
                return ['error' => 'Rate limit exceeded', 'http_code' => $httpCode];
            } elseif ($httpCode === 503) {
                if ($attempt < $retries - 1) {
                    sleep(3);
                    continue;
                }
                return ['error' => 'Service unavailable', 'http_code' => $httpCode];
            } else {
                $errorMsg = "Jina API Error: $curlError HTTP: $httpCode Response: $result";
                error_log($errorMsg);
                return ['error' => $errorMsg, 'http_code' => $httpCode];
            }
        }

        return ['error' => 'Max retries exceeded', 'http_code' => 0];
    }

    private function generateEmbeddings($params)
    {
        // Increase execution time for batch processing
        set_time_limit(300); // 5 minutes

        // 1. Vérifier la clé API Jina depuis la config de la classe
        if (!$this->jinaApiKey || $this->jinaApiKey === 'VOTRE_CLE_JINA_ICI') {
            return ['error' => 'Jina API key not configured. Get one free at https://jina.ai'];
        }
        $apiKey = $this->jinaApiKey;

        // Option pour traiter par lots
        $batchSize = intval($params['batchSize'] ?? 10);
        $offset = intval($params['offset'] ?? 0);

        // 2. Définir les resource_template_id des conférences
        $conferenceTemplates = [71, 121, 122];



        // 4. Récupérer le nombre total de conférences
        $totalSql = "
        SELECT COUNT(*) as total
        FROM resource
        WHERE resource.resource_template_id IN (" . implode(",", $conferenceTemplates) . ")
    ";
        $totalResult = $this->conn->fetchAssociative($totalSql);
        $total = $totalResult['total'];

        // 5. Récupérer un lot de conférences
        $sql = "
        SELECT r.id, r.title
        FROM resource r
        LEFT JOIN semantic_embeddings se ON r.id = se.resource_id
        WHERE r.resource_template_id IN (" . implode(",", $conferenceTemplates) . ")
        ORDER BY
            CASE WHEN se.updated_at IS NULL THEN 0 ELSE 1 END,
            se.updated_at ASC,
            r.id ASC
        LIMIT :limit OFFSET :offset
    ";

        $items = $this->conn->fetchAllAssociative($sql, [
            'limit' => $batchSize,
            'offset' => $offset
        ], [
            'limit' => \Doctrine\DBAL\ParameterType::INTEGER,
            'offset' => \Doctrine\DBAL\ParameterType::INTEGER
        ]);

        $processed = 0;
        $skipped = 0;
        $errors = [];
        $startTime = microtime(true);

        foreach ($items as $item) {
            // $resourceId = intval($item['id']);

            //     // 6. Récupérer TOUT le texte de la ressource
            //     $values = $this->conn->fetchAllAssociative("
            //     SELECT value.value
            //     FROM value
            //     WHERE value.resource_id = ?
            //       AND value.value IS NOT NULL
            //       AND LENGTH(value.value) > 0
            // ", [$resourceId]);

            // $text = $item['title'] . "\n";





            // foreach ($values as $v) {
            //     // Strip HTML tags and decode entities
            //     $cleanValue = html_entity_decode(strip_tags($v['value']), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            //     $text .= $cleanValue . "\n";
            // }

            // // Nettoyer et limiter la longueur
            // $text = preg_replace('/\s+/', ' ', trim($text));
            // $text = substr($text, 0, 5000); // all-MiniLM-L6-v2 works best with shorter texts

            // if (strlen($text) < 10) {
            //     $skipped++;
            //     continue;
            // }



            $resourceId = intval($item['id']);

            // ➜ On utilise uniquement le titre
            $text = trim($item['title']);

            // Nettoyer et limiter la longueur
            $text = preg_replace('/\s+/', ' ', $text);
            $text = substr($text, 0, 5000); // toujours utile pour éviter un texte trop long

            if (strlen($text) < 3) {  // un titre trop court ne sert à rien
                $skipped++;
                continue;
            }


            // 7. Appel API Jina pour générer l'embedding
            $embedding = $this->callJinaEmbeddingAPI($apiKey, $text);

            if (!$embedding || isset($embedding['error'])) {
                $errorDetail = isset($embedding['error']) ? $embedding['error'] : 'Unknown error';
                $httpCode = isset($embedding['http_code']) ? ' (HTTP: ' . $embedding['http_code'] . ')' : '';
                $errors[] = "Resource $resourceId: $errorDetail$httpCode";
                continue;
            }

            // 8. Enregistrement dans MySQL
            try {
                $this->conn->executeStatement("
                INSERT INTO semantic_embeddings (resource_id, embedding, updated_at)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    embedding = VALUES(embedding),
                    updated_at = NOW()
            ", [
                    $resourceId,
                    json_encode($embedding, JSON_UNESCAPED_UNICODE)
                ]);
                $processed++;
            } catch (\Exception $e) {
                $errors[] = "Erreur DB pour resource $resourceId: " . $e->getMessage();
            }

            // Rate limiting: petit délai entre chaque requête
            usleep(200000); // 0.1 second
        }

        $duration = round(microtime(true) - $startTime, 2);
        $hasMore = ($offset + $batchSize) < $total;

        return [
            'success' => true,
            'processed' => $processed,
            'skipped' => $skipped,
            'errors' => $errors,
            'total' => $total,
            'offset' => $offset,
            'batchSize' => $batchSize,
            'hasMore' => $hasMore,
            'nextOffset' => $hasMore ? ($offset + $batchSize) : null,
            'duration' => $duration . 's'
        ];
    }

    /**
     * Créer une ressource générique avec validation
     *
     * @param array $params
     * @return array
     */
    function createResource($params)
    {
        try {
            // Debug logging
            error_log('createResource called with params: ' . print_r($params, true));

            // Validation stricte du template autorisé
            if (!isset($this->allowedTemplates[$params['template_id']])) {
                return ['success' => false, 'message' => 'Template not allowed for creation'];
            }

            // Validation de l'utilisateur
            if (empty($params['owner_id'])) {
                return ['success' => false, 'message' => 'Owner ID required'];
            }

            $this->conn->beginTransaction();

            // 1. Créer la ressource
            $query = "INSERT INTO `resource`
                      (`owner_id`, `resource_class_id`, `resource_template_id`, `is_public`, `created`, `modified`, `resource_type`)
                      VALUES (?, ?, ?, 1, NOW(), NOW(), 'Omeka\\\\Entity\\\\Item')";

            $this->conn->executeStatement($query, [
                $params['owner_id'],
                $params['class_id'] ?? null,
                $params['template_id']
            ]);

            $resourceId = $this->conn->lastInsertId();

            // Forcer la mise à jour du titre si dcterms:title est fourni
            if (!empty($params['values'])) {
                $values = is_string($params['values']) ? json_decode($params['values'], true) : $params['values'];
                foreach ($values as $value) {
                    if ($value['property_id'] == 1 && !empty($value['value'])) {
                        // Mettre à jour le titre de la ressource
                        $updateQuery = "UPDATE `resource` SET `title` = ? WHERE `id` = ?";
                        $this->conn->executeStatement($updateQuery, [$value['value'], $resourceId]);
                        break;
                    }
                }
            }

            // 2. Créer l'item
            $query = "INSERT INTO `item` (`id`) VALUES (?)";
            $this->conn->executeStatement($query, [$resourceId]);

            // 3. Insérer les valeurs avec validation
            $values = [];
            if (!empty($params['values'])) {
                // Les valeurs peuvent être une chaîne JSON ou déjà un tableau
                if (is_string($params['values'])) {
                    $values = json_decode($params['values'], true);
                    error_log('Decoded values from JSON: ' . print_r($values, true));
                } elseif (is_array($params['values'])) {
                    $values = $params['values'];
                    error_log('Values already array: ' . print_r($values, true));
                }

                if (is_array($values) && !empty($values)) {
                    error_log('Calling insertValues with resourceId: ' . $resourceId . ', values: ' . print_r($values, true));
                    $this->insertValues($resourceId, $values, $params['template_id']);
                } else {
                    error_log('No valid values to insert');
                }
            } else {
                error_log('No values provided in params');
            }

            $this->conn->commit();

            return [
                'success' => true,
                'id' => $resourceId,
                'message' => "{$this->allowedTemplates[$params['template_id']]} created successfully"
            ];
        } catch (\Exception $e) {
            $this->conn->rollBack();
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Insérer des valeurs avec validation par template
     *
     * @param int $resourceId
     * @param array $values
     * @param int $templateId
     */
    private function insertValues($resourceId, $values, $templateId)
    {
        error_log("insertValues called with resourceId: $resourceId, templateId: $templateId, values count: " . count($values));

        // Définir les propriétés autorisées par template
        $allowedPropertiesByTemplate = [

            123 => [1, 561, 562, 2095, 1794] // Edisem Commentaire: title (1), commentText (561), commentTime (562), hasActant (2095), hasRelatedResource (1794)
        ];

        $allowedProperties = $allowedPropertiesByTemplate[$templateId] ?? [];
        error_log("Allowed properties for template $templateId: " . implode(', ', $allowedProperties));

        foreach ($values as $index => $value) {
            error_log("Processing value $index: " . print_r($value, true));

            // Validation: propriété autorisée pour ce template
            if (!in_array($value['property_id'], $allowedProperties)) {
                error_log("Property {$value['property_id']} not allowed for template $templateId, skipping");
                continue; // Ignorer les propriétés non autorisées
            }

            $type = $value['type'] ?? 'literal';
            error_log("Using type: $type");

            // Validation du type
            if (!in_array($type, ['literal', 'resource', 'uri'])) {
                error_log("Invalid type: $type, skipping");
                continue;
            }

            $insertQuery = "INSERT INTO `value`
                           (`resource_id`, `property_id`, `value`, `value_resource_id`, `uri`, `type`, `is_public`)
                           VALUES (?, ?, ?, ?, ?, ?, 1)";

            error_log("Executing query: $insertQuery with params: [$resourceId, {$value['property_id']}, " . ($value['value'] ?? 'null') . ", " . ($value['value_resource_id'] ?? 'null') . ", " . ($value['uri'] ?? 'null') . ", $type]");

            try {
                $this->conn->executeStatement($insertQuery, [
                    $resourceId,
                    $value['property_id'],
                    $value['value'] ?? null,
                    $value['value_resource_id'] ?? null,
                    $value['uri'] ?? null,
                    $type
                ]);
                error_log("Successfully inserted value for property {$value['property_id']}");
            } catch (\Exception $e) {
                error_log("Error inserting value: " . $e->getMessage());
            }
        }
    }

    /**
     * Mettre à jour une ressource
     *
     * @param array $params
     * @return array
     */
    function updateResource($params)
    {
        try {
            if (empty($params['id'])) {
                return ['success' => false, 'message' => 'Resource ID required'];
            }

            // Vérifier que la ressource existe et récupérer son template
            $checkQuery = "SELECT resource_template_id, owner_id FROM `resource` WHERE id = ?";
            $resource = $this->conn->fetchAssociative($checkQuery, [$params['id']]);

            if (!$resource) {
                return ['success' => false, 'message' => 'Resource not found'];
            }

            $this->conn->beginTransaction();

            // Mettre à jour la date de modification
            $updateQuery = "UPDATE `resource` SET `modified` = NOW() WHERE id = ?";
            $this->conn->executeStatement($updateQuery, [$params['id']]);

            // Si des valeurs sont fournies, les mettre à jour
            if (!empty($params['values']) && is_array($params['values'])) {
                // Supprimer les anciennes valeurs pour les propriétés concernées
                $propertyIds = array_column($params['values'], 'property_id');
                if (!empty($propertyIds)) {
                    $deleteQuery = "DELETE FROM `value`
                                   WHERE resource_id = ?
                                   AND property_id IN (" . implode(',', array_fill(0, count($propertyIds), '?')) . ")";
                    $this->conn->executeStatement($deleteQuery, array_merge([$params['id']], $propertyIds));
                }

                // Insérer les nouvelles valeurs
                $this->insertValues($params['id'], $params['values'], $resource['resource_template_id']);
            }

            $this->conn->commit();

            return ['success' => true, 'message' => 'Resource updated successfully'];
        } catch (\Exception $e) {
            $this->conn->rollBack();
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Supprimer une ressource (soft delete en mettant is_public = 0)
     *
     * @param array $params
     * @return array
     */
    function deleteResource($params)
    {
        try {
            if (empty($params['id'])) {
                return ['success' => false, 'message' => 'Resource ID required'];
            }

            // Soft delete
            $query = "UPDATE `resource` SET `is_public` = 0, `modified` = NOW() WHERE id = ?";
            $this->conn->executeStatement($query, [$params['id']]);

            return ['success' => true, 'message' => 'Resource deleted successfully'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Upload et associer un média à une ressource
     *
     * @param array $params
     * @return array
     */

    function uploadMedia($params)
    {
        try {
            if (empty($params['item_id']) || empty($params['storage_id']) || empty($params['extension'])) {
                return ['success' => false, 'message' => 'item_id, storage_id and extension are required'];
            }

            // Créer la ressource média
            $query = "INSERT INTO `resource` (`owner_id`, `is_public`, `created`, `modified`, `resource_type`)
                      VALUES (?, 1, NOW(), NOW(), 'Omeka\\\\Entity\\\\Media')";

            $this->conn->executeStatement($query, [$params['owner_id'] ?? 1]);
            $mediaId = $this->conn->lastInsertId();

            // Insérer dans la table media
            $mediaQuery = "INSERT INTO `media`
                          (`id`, `item_id`, `ingester`, `renderer`, `storage_id`, `extension`, `media_type`, `has_original`, `has_thumbnails`, `position`)
                          VALUES (?, ?, 'upload', 'file', ?, ?, ?, 1, 1, ?)";

            $this->conn->executeStatement($mediaQuery, [
                $mediaId,
                $params['item_id'],
                $params['storage_id'],
                $params['extension'],
                $params['media_type'] ?? 'image/jpeg',
                $params['position'] ?? 1
            ]);

            // Ajouter le titre si fourni
            if (!empty($params['title'])) {
                $valueQuery = "INSERT INTO `value` (`resource_id`, `property_id`, `value`, `type`, `is_public`)
                              VALUES (?, 1, ?, 'literal', 1)";
                $this->conn->executeStatement($valueQuery, [$mediaId, $params['title']]);
            }

            return [
                'success' => true,
                'media_id' => $mediaId,
                'message' => 'Media uploaded successfully'
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }


    function getComments()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 123
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 561, 562, 2095, 1794)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();


        // Récupérer les informations pour creator
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        if (!empty($creatorIds)) {
            $creatorQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorData = $this->conn->executeQuery($creatorQuery)->fetchAllAssociative();

            foreach ($creatorData as $data) {
                $creatorMap[$data['resource_id']] = $data['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $item = [
                'id' => $resource['id'],
                'title' => '',
                'commentText' => '',
                'commentTime' => '',
                'actant' => '',
                'relatedResource' => ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $item['title'] = $value['value'];
                            break;

                        case 561:
                            $item['commentText'] = $value['value'];
                            break;
                        case 562:
                            $item['commentTime'] = $value['value'];
                            break;
                        case 2095:
                            $item['actant'] = $value['value_resource_id'];
                            break;
                        case 1794:
                            $item['relatedResource'] = $value['value_resource_id'];
                            break;
                    }
                }
            }

            $result[] = $item;
        }

        return $result;
    }


    function getElementEsthetique()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 118
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 581, 3225, 3197, 1825, 3201, 3187, 3194, 3208, 12, 16, 1457, 4, 1794, 438)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();


        // Récupérer les informations pour creator
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        if (!empty($creatorIds)) {
            $creatorQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorData = $this->conn->executeQuery($creatorQuery)->fetchAllAssociative();

            foreach ($creatorData as $data) {
                $creatorMap[$data['resource_id']] = $data['value'];
            }
        }

        // Récupérer les informations pour contributor
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 581 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $contributorMap = [];
        if (!empty($contributorIds)) {
            $contributorQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorData = $this->conn->executeQuery($contributorQuery)->fetchAllAssociative();

            foreach ($contributorData as $data) {
                $contributorMap[$data['resource_id']] = $data['value'];
            }
        }

        // Récupérer les informations pour relatedResource
        $relatedResourceIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1794 && $value['value_resource_id']) {
                $relatedResourceIds[] = $value['value_resource_id'];
            }
        }

        $relatedResourceMap = [];
        if (!empty($relatedResourceIds)) {
            $relatedResourceQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($relatedResourceIds)) . ")
                AND v.property_id = 1
            ";
            $relatedResourceData = $this->conn->executeQuery($relatedResourceQuery)->fetchAllAssociative();

            foreach ($relatedResourceData as $data) {
                $relatedResourceMap[$data['resource_id']] = $data['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $item = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => '',
                'contributor' => '',
                'eventDate' => '',
                'genre' => '',
                'duration' => '',
                'imageCharacteristic' => '',
                'colourCharacteristic' => '',
                'form' => '',
                'soundCharacteristic' => '',
                'language' => '',
                'audience' => '',
                'temporal' => '',
                'description' => '',
                'relatedResource' => '',
                'associatedMedia' => []
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $item['title'] = $value['value'];
                            break;
                        case 2:
                            $item['creator'] = $value['value_resource_id'];
                            break;
                        case 581:
                            $item['contributor'] = $value['value_resource_id'];
                            break;
                        case 3225:
                            $item['eventDate'] = $value['value'];
                            break;
                        case 3197:
                            $item['genre'] = $value['value'];
                            break;
                        case 1825:
                            $item['duration'] = $value['value'];
                            break;
                        case 3201:
                            $item['imageCharacteristic'] = $value['value'];
                            break;
                        case 3187:
                            $item['colourCharacteristic'] = $value['value'];
                            break;
                        case 3194:
                            $item['form'] = $value['value'];
                            break;
                        case 3208:
                            $item['soundCharacteristic'] = $value['value'];
                            break;
                        case 12:
                            $item['language'] = $value['value'];
                            break;
                        case 16:
                            $item['audience'] = $value['value'];
                            break;
                        case 1457:
                            $item['temporal'] = $value['value'];
                            break;
                        case 4:
                            $item['description'] = $value['value'];
                            break;
                        case 1794:
                            $item['relatedResource'] = $value['value_resource_id'];
                            break;
                        case 438:
                            if ($value['value_resource_id']) {

                                $associatedId = $value['value_resource_id'];

                                // Vérifier si l'item lié utilise le template 83 (ImageGallery)
                                $galleryTemplateSql = "
                                        SELECT resource_template_id
                                        FROM resource
                                        WHERE id = ?
                                        LIMIT 1
                                    ";
                                $templateId = $this->conn->executeQuery($galleryTemplateSql, [$associatedId])->fetchOne();

                                // Si c'est une galerie → récupérer TOUTES les images
                                if (intval($templateId) === 83) {
                                    $mediaSql = "
                                            SELECT storage_id, extension
                                            FROM media
                                            WHERE item_id = ?
                                        ";
                                    $medias = $this->conn->executeQuery($mediaSql, [$associatedId])->fetchAllAssociative();

                                    foreach ($medias as $m) {
                                        if ($m['storage_id'] && $m['extension']) {
                                            $item['associatedMedia'][] = $this->generateThumbnailUrl($m['storage_id'], $m['extension']);
                                        }
                                    }
                                    break;
                                }

                                // Sinon : image simple (comme avant)
                                if ($value['storage_id'] && $value['extension']) {
                                    $item['associatedMedia'][] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                                }
                            }
                            break;
                    }
                }
            }

            $result[] = $item;
        }

        return $result;
    }

    function getElementNarratifs()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 115
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 438, 3225, 3197, 1825, 4, 2491, 533, 1497, 36)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();


        // Récupérer les informations pour creator
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        if (!empty($creatorIds)) {
            $creatorQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorData = $this->conn->executeQuery($creatorQuery)->fetchAllAssociative();

            foreach ($creatorData as $data) {
                $creatorMap[$data['resource_id']] = $data['value'];
            }
        }

        // Récupérer les informations pour references
        $referencesIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 36 && $value['value_resource_id']) {
                $referencesIds[] = $value['value_resource_id'];
            }
        }

        $referencesMap = [];
        if (!empty($referencesIds)) {
            $referencesQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($referencesIds)) . ")
                AND v.property_id = 1
            ";
            $referencesData = $this->conn->executeQuery($referencesQuery)->fetchAllAssociative();

            foreach ($referencesData as $data) {
                $referencesMap[$data['resource_id']] = $data['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $item = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => '',
                'associatedMedia' => [],
                'eventDate' => '',
                'genre' => '',
                'duration' => '',
                'description' => '',
                'plotSummary' => '',
                'characters' => '',
                'transcript' => '',
                'references' => []
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $item['title'] = $value['value'];
                            break;
                        case 2:
                            $item['creator'] = $value['value_resource_id'];
                            break;
                        case 438:
                            if ($value['storage_id'] && $value['extension']) {
                                $item['associatedMedia'][] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                            }
                            break;
                        case 3225:
                            $item['eventDate'] = $value['value'];
                            break;
                        case 3197:
                            $item['genre'] = $value['value'];
                            break;
                        case 1825:
                            $item['duration'] = $value['value'];
                            break;
                        case 4:
                            $item['description'] = $value['value'];
                            break;
                        case 2491:
                            $item['plotSummary'] = $value['value'];
                            break;
                        case 533:
                            $item['characters'] = $value['value'];
                            break;
                        case 1497:
                            $item['transcript'] = $value['uri'];
                            break;
                        case 36:
                            if ($value['value_resource_id']) {
                                $item['references'][] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $item;
        }

        return $result;
    }

    function getStudents()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 96
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (139, 140, 1701, 724)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        $result = [];
        foreach ($resources as $resource) {
            $student = [
                'id' => $resource['id'],
                'firstname' => '',
                'lastname' => '',
                'picture' => '',
                'mail' => '',
                'picture' => '',

            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 139:
                            $student['firstname'] = $value['value'];
                            break;
                        case 140:
                            $student['lastname'] = $value['value'];
                            break;
                        case 1517:
                            $student['url'] = $value['uri'];
                            break;
                        case 724:
                            $student['mail'] = $value['value'];
                            break;
                        case 1701:
                            if ($value['storage_id'] && $value['extension']) {
                                $student['picture'] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                            }
                            break;
                    }
                }
            }

            $result[] = $student;
        }

        return $result;
    }

    function getAnnotations()
    {
        // 1) Récupération des ressources
        $resourceQuery = "
            SELECT r.id, r.created
            FROM resource r
            WHERE r.resource_template_id = 101
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (!$resources) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2) Récupération des valeurs liées aux ressources
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type
            FROM value v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1,4,199,1794,581,438,1701)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        $result = [];

        foreach ($resources as $resource) {

            $annotation = [
                'id' => $resource['id'],
                'created' => $resource['created'],
                'title' => '',
                'description' => '',
                'target' => [],
                'related' => [],
                'contributor' => '',
                'associatedMedia' => [],
            ];

            // --- MÉDIAS DIRECTS ---
            $nativeMedias = $this->conn->executeQuery("
                SELECT id, ingester, media_type, source, storage_id, extension
                FROM media
                WHERE item_id = ?
            ", [$resource['id']])->fetchAllAssociative();

            foreach ($nativeMedias as $m) {
                if ($m['ingester'] === 'youtube' && !empty($m['source'])) {
                    $annotation['associatedMedia'][] = [
                        'id' => $m['id'],
                        'type' => 'youtube',
                        'url' => $m['source'],
                        'thumbnail' => (!empty($m['storage_id']) && !empty($m['extension']))
                            ? $this->generateThumbnailUrl($m['storage_id'], $m['extension'])
                            : null
                    ];
                    continue;
                }

                if (!empty($m['storage_id']) && !empty($m['extension'])) {
                    $annotation['associatedMedia'][] = [
                        'id' => $m['id'],
                        'type' => 'file',
                        'url' => null,
                        'thumbnail' => $this->generateThumbnailUrl($m['storage_id'], $m['extension'])
                    ];
                }
            }

            // 1) Thumbnail Omeka du resource.thumbnail_id
            $thumbnail = $this->conn->executeQuery("
                SELECT storage_id, extension
                FROM media
                WHERE id = (SELECT thumbnail_id FROM resource WHERE id = ?)
            ", [$resource['id']])->fetchAssociative();

            if ($thumbnail && $thumbnail['storage_id']) {
                $annotation['associatedMedia'][] = [
                    'id' => 'thumbnail-' . $resource['id'],
                    'type' => 'thumbnail',
                    'url' => null,
                    'thumbnail' => $this->generateThumbnailUrl(
                        $thumbnail['storage_id'],
                        $thumbnail['extension']
                    )
                ];
            }

            // --- PARCOURS DES PROPRIÉTÉS ---
            foreach ($values as $value) {
                if ($value['resource_id'] != $resource['id']) continue;

                switch ($value['property_id']) {

                    case 1:
                        $annotation['title'] = $value['value'];
                        break;

                    case 4:
                        $annotation['description'] = $value['value'];
                        break;

                    case 199:
                        // TARGET - peut avoir plusieurs ressources
                        if ($value['value_resource_id']) {
                            $annotation['target'][] = [
                                'id' => $value['value_resource_id']
                            ];
                        }
                        break;

                    case 581:
                        $annotation['contributor'] = $value['value_resource_id'];
                        break;

                    case 1794:
                        // RELATED - peut être un ID de ressource ou une URI externe
                        if ($value['value_resource_id']) {
                            // ID de ressource Omeka
                            $annotation['related'][] = [
                                'id' => $value['value_resource_id']
                            ];
                        } elseif ($value['uri']) {
                            // URI externe
                            $annotation['related'][] = [
                                'uri' => $value['uri'],
                                'title' => $value['value'] ?: basename($value['uri'])
                            ];
                        }
                        break;

                    // MÉDIAS INDIRECTS
                    case 1701:
                    case 438:
                        if (!$value['value_resource_id']) break;

                        $targetId = $value['value_resource_id'];

                        $templateId = $this->conn->executeQuery("
                            SELECT resource_template_id
                            FROM resource
                            WHERE id = ?
                        ", [$targetId])->fetchOne();

                        if (intval($templateId) === 83) {

                            $galleryMedias = $this->conn->executeQuery("
                                SELECT id, ingester, media_type, source, storage_id, extension
                                FROM media
                                WHERE item_id = ?
                            ", [$targetId])->fetchAllAssociative();

                            foreach ($galleryMedias as $gm) {
                                if ($gm['ingester'] === 'youtube' && !empty($gm['source'])) {
                                    $annotation['associatedMedia'][] = [
                                        'id' => $gm['id'],
                                        'type' => 'youtube',
                                        'url' => $gm['source'],
                                        'thumbnail' => (!empty($gm['storage_id']) && !empty($gm['extension']))
                                            ? $this->generateThumbnailUrl($gm['storage_id'], $gm['extension'])
                                            : null
                                    ];
                                    continue;
                                }

                                if (!empty($gm['storage_id']) && !empty($gm['extension'])) {
                                    $annotation['associatedMedia'][] = [
                                        'id' => $gm['id'],
                                        'type' => 'file',
                                        'url' => null,
                                        'thumbnail' => $this->generateThumbnailUrl($gm['storage_id'], $gm['extension'])
                                    ];
                                }
                            }

                            break;
                        }

                        $itemMedias = $this->conn->executeQuery("
                            SELECT id, ingester, media_type, source, storage_id, extension
                            FROM media
                            WHERE item_id = ?
                        ", [$targetId])->fetchAllAssociative();

                        foreach ($itemMedias as $m) {
                            if ($m['ingester'] === 'youtube' && !empty($m['source'])) {
                                $annotation['associatedMedia'][] = [
                                    'id' => $m['id'],
                                    'type' => 'youtube',
                                    'url' => $m['source'],
                                    'thumbnail' => (!empty($m['storage_id']) && !empty($m['extension']))
                                        ? $this->generateThumbnailUrl($m['storage_id'], $m['extension'])
                                        : null
                                ];
                                continue;
                            }

                            if (!empty($m['storage_id']) && !empty($m['extension'])) {
                                $annotation['associatedMedia'][] = [
                                    'id' => $m['id'],
                                    'type' => 'file',
                                    'url' => null,
                                    'thumbnail' => $this->generateThumbnailUrl($m['storage_id'], $m['extension'])
                                ];
                            }
                        }

                        break;
                }
            }

            // -------------------------------------------------------------
            // 🟩 ENRICHISSEMENT AUTOMATIQUE DU TARGET (ID + TEMPLATE + TITLE)
            // -------------------------------------------------------------
            if (!empty($annotation['target']) && is_array($annotation['target'])) {
                foreach ($annotation['target'] as &$targetItem) {
                    if (!empty($targetItem['id'])) {
                        $targetId = $targetItem['id'];

                        $targetRow = $this->conn->executeQuery("
                            SELECT r.resource_template_id,
                                   COALESCE(v.value, r.id) AS title
                            FROM resource r
                            LEFT JOIN value v
                                ON v.resource_id = r.id AND v.property_id = 1
                            WHERE r.id = ?
                        ", [$targetId])->fetchAssociative();

                        if ($targetRow) {
                            $targetItem['template_id'] = $targetRow['resource_template_id'];
                            $targetItem['title'] = $targetRow['title'];
                        }
                    }
                }
            }

            // -------------------------------------------------------------
            // 🟩 ENRICHISSEMENT AUTOMATIQUE DU RELATED (ID + TEMPLATE + TITLE)
            // -------------------------------------------------------------
            if (!empty($annotation['related']) && is_array($annotation['related'])) {
                foreach ($annotation['related'] as &$relatedItem) {
                    if (!empty($relatedItem['id'])) {
                        $relatedId = $relatedItem['id'];

                        $relatedRow = $this->conn->executeQuery("
                            SELECT r.resource_template_id,
                                   COALESCE(v.value, r.id) AS title
                            FROM resource r
                            LEFT JOIN value v
                                ON v.resource_id = r.id AND v.property_id = 1
                            WHERE r.id = ?
                        ", [$relatedId])->fetchAssociative();

                        if ($relatedRow) {
                            $relatedItem['template_id'] = $relatedRow['resource_template_id'];
                            $relatedItem['title'] = $relatedRow['title'];
                        }
                    }
                }
            }


            // FIN
            $result[] = $annotation;
        }

        return $result;
    }

    function getRecherches()
    {
        $resourceQuery = "
            SELECT r.id, r.created
            FROM `resource` r
            WHERE r.resource_template_id = 102
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1,2,551)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        $result = [];
        foreach ($resources as $resource) {
            $recherche = [
                'id' => $resource['id'],
                'created' => $resource['created'], // Ajout de la date de création
                'title' => '',
                'creator' => '',
                'config' => '',

            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $recherche['title'] = $value['value'];
                            break;
                        case 2:
                            $recherche['creator'] = $value['value_resource_id'];
                            break;
                        case 551:
                            $recherche['config'] = $value['value'];
                            break;
                    }
                }
            }

            $result[] = $recherche;
        }

        return $result;
    }

    function getMediagraphies()
    {
        // Requête pour récupérer les ressources avec les templates 83 et 98
        $resourceQuery = "
            SELECT r.id, r.resource_class_id, r.resource_template_id
            FROM `resource` r
            WHERE r.resource_template_id IN (83, 98)
        ";
        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Requête pour récupérer les valeurs associées aux propriétés des ressources
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.uri, v.value_resource_id
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (
                1, 2, 9, 7, 66, 121, 1552, 123, 26, 33, 126, 127, 128, 129, 64, 74, 2141
            )
        ";
        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Requête pour récupérer les créateurs (propriété 2) et les directeurs (propriété 64)
        $personQuery = "
            SELECT r.id, r.title
            FROM `resource` r
            WHERE r.id IN (
                SELECT v.value_resource_id
                FROM `value` v
                WHERE v.property_id IN (2, 64)
                AND v.resource_id IN (" . implode(',', $resourceIds) . ")
            )
        ";
        $persons = $this->conn->executeQuery($personQuery)->fetchAllAssociative();

        // Requête pour récupérer les prénoms et noms des créateurs et directeurs (propriétés 139 et 140)
        $personNameQuery = "
            SELECT v.resource_id, v.value, v.property_id
            FROM `value` v
            WHERE v.property_id IN (139, 140)
            AND v.resource_id IN (
                SELECT v.value_resource_id
                FROM `value` v
                WHERE v.property_id IN (2, 64)
                AND v.resource_id IN (" . implode(',', $resourceIds) . ")
            )
        ";
        $personNameValues = $this->conn->executeQuery($personNameQuery)->fetchAllAssociative();

        // Indexer les personnes (créateurs et directeurs) par leur ID
        $personMap = [];
        foreach ($persons as $person) {
            $personMap[$person['id']] = $person['title'];
        }

        // Indexer les prénoms et noms des personnes
        $personNameMap = [];
        foreach ($personNameValues as $value) {
            $personId = $value['resource_id'];
            if (!isset($personNameMap[$personId])) {
                $personNameMap[$personId] = ['first_name' => '', 'last_name' => ''];
            }
            if ($value['property_id'] == 139) {
                $personNameMap[$personId]['first_name'] = $value['value'];
            } elseif ($value['property_id'] == 140) {
                $personNameMap[$personId]['last_name'] = $value['value'];
            }
        }

        // Requête pour récupérer les logos/thumbnails
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $logoMap = [];
        foreach ($logos as $logo) {
            $logoMap[$logo['item_id']] = $logo['logo'];
        }

        $mediagraphies = [];

        foreach ($resources as $resource) {
            $mediagraphy = [
                'id' => $resource['id'],
                'class' => $resource['resource_class_id'],
                'resource_template_id' => $resource['resource_template_id'],
                'title' => '',
                'creator' => [],
                'director' => [],
                'date' => '',
                'format' => '',
                'publisher' => '',
                'uri' => '',
                'isPartOf' => '',
                'version' => '',
                'medium' => '',
                'location' => '',
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // Title
                            $mediagraphy['title'] = $value['value'];
                            break;
                        case 2: // Creator
                        case 64: // Director
                            if (isset($personMap[$value['value_resource_id']])) {
                                $personId = $value['value_resource_id'];
                                $role = $value['property_id'] == 2 ? 'creator' : 'director';
                                if (isset($personNameMap[$personId])) {
                                    $mediagraphy[$role][] = [
                                        'first_name' => $personNameMap[$personId]['first_name'],
                                        'last_name' => $personNameMap[$personId]['last_name']
                                    ];
                                }
                            }
                            break;
                        case 7: // Date
                            $mediagraphy['date'] = $value['value'];
                            break;
                        case 66: // Publisher
                            $mediagraphy['publisher'] = $value['value'];
                            break;
                        case 121: // URI
                            $mediagraphy['uri'] = $value['uri'];
                            break;
                        case 1552: // Version
                            $mediagraphy['version'] = $value['value'];
                            break;
                        case 9: // Format
                            $mediagraphy['format'] = $value['value'];
                            break;
                        case 26: // Medium
                            $mediagraphy['medium'] = $value['value'];
                            break;
                        case 33: // Is Part Of
                            $mediagraphy['isPartOf'] = $value['value'];
                            break;
                        case 74: // Location
                            $mediagraphy['location'] = $value['value'];
                            break;
                        case 2141: // Place
                            $mediagraphy['place'] = $value['value'];
                            break;
                        case 129: // Language
                            $mediagraphy['language'] = $value['value'];
                            break;
                    }
                }
            }

            $mediagraphies[] = $mediagraphy;
        }

        return $mediagraphies;
    }

    function getKeywords()
    {
        //
        // 1) Récupérer les mots-clés (template 34)
        //
        $resourceQuery = "
            SELECT r.id, r.resource_class_id
            FROM `resource` r
            WHERE r.resource_template_id = 34
        ";
        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');


        //
        // 2) Récupérer les valeurs associées
        //
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.uri, v.value_resource_id
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (
                1, 4, 19, 1716, 1720, 1721, 1742, 1731, 1732, 1733,
                1739, 1621, 581, 555
            )
        ";
        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();


        //
        // 3) Récupérer la popularité (occurrences)
        //
        $popularityQuery = "
            SELECT
                v.value_resource_id AS keyword_id,
                COUNT(*) AS occurrences
            FROM value v
            WHERE v.value_resource_id IN (" . implode(',', $resourceIds) . ")
            GROUP BY v.value_resource_id
        ";
        $popularityData = $this->conn->executeQuery($popularityQuery)->fetchAllAssociative();

        // Indexer par keyword_id pour accès rapide
        $popularityIndex = [];
        foreach ($popularityData as $row) {
            $popularityIndex[$row['keyword_id']] = (int)$row['occurrences'];
        }


        //
        // 4) Construire la structure complète
        //
        $motCles = [];

        foreach ($resources as $resource) {

            $motCle = [
                'id' => $resource['id'],
                'class' => $resource['resource_class_id'],
                'title' => '',
                'short_resume' => '',
                'definition' => '',
                'english_terms' => [],
                'associated_term' => [],
                'orthographic_variants' => [],
                'synonyms' => [],
                'parent_concept' => [],
                'child_concept' => [],
                'related_concept' => [],
                'relative_concept' => [],
                'genre_media' => [],
                'related_subject' => [],
                'linked_subject' => [],
                'popularity' => $popularityIndex[$resource['id']] ?? 0
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {

                    $valueContent = $value['value_resource_id'] ?: $value['value'];

                    switch ($value['property_id']) {
                        case 1:
                            $motCle['title'] = $valueContent;
                            break;
                        case 4:
                            $motCle['definition'] = $valueContent;
                            break;
                        case 19:
                            $motCle['short_resume'] = $valueContent;
                            break;
                        case 1716:
                            $motCle['english_terms'][] = $valueContent;
                            break;
                        case 1720:
                            $motCle['associated_term'][] = $valueContent;
                            break;
                        case 1721:
                            $motCle['orthographic_variants'][] = $valueContent;
                            break;
                        case 1742:
                            $motCle['synonyms'][] = $valueContent;
                            break;
                        case 1731:
                            $motCle['parent_concept'][] = $valueContent;
                            break;
                        case 1732:
                            $motCle['child_concept'][] = $valueContent;
                            break;
                        case 1733:
                            $motCle['related_concept'][] = $valueContent;
                            break;
                        case 1739:
                            $motCle['relative_concept'][] = $valueContent;
                            break;
                        case 1621:
                            $motCle['genre_media'][] = $valueContent;
                            break;
                        case 581:
                            $motCle['related_subject'][] = $valueContent;
                            break;
                        case 555:
                            $motCle['linked_subject'][] = $valueContent;
                            break;
                    }
                }
            }

            $motCles[] = $motCle;
        }

        return $motCles;
    }

    function getCollections()
    {
        // ID du template de ressource spécifique (92)
        $resourceTemplateId = 92;

        // Requête pour récupérer les IDs des ressources ayant le template de ressource (id 92)
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = :resourceTemplateId
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery, ['resourceTemplateId' => $resourceTemplateId])->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Requête pour récupérer les titres des ressources (property_id = 1 pour le champ "title")
        $titleQuery = "
            SELECT v.resource_id, v.value AS title
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id = 1
        ";

        $titles = $this->conn->executeQuery($titleQuery)->fetchAllAssociative();

        // Associer les titres avec les ressources en utilisant leur `id`
        $titleMap = [];
        foreach ($titles as $title) {
            $titleMap[$title['resource_id']] = $title['title'];
        }

        // Préparer les résultats finaux
        $result = [];
        foreach ($resourceIds as $resourceId) {
            $result[] = [
                'id' => $resourceId,
                'title' => $titleMap[$resourceId] ?? null,
            ];
        }

        return $result;
    }

    function getStudyDayConfs()
    {
        // Get resource IDs with conference template (id 121)
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 121
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 138, 141, 7, 143, 386, 145, 1517, 147, 19, 544, 36,951,438,2097, 937,555,86)  -- Ajout de la propriété 544
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Prepare conferences
        $result = [];
        foreach ($resources as $resource) {
            $conference = [
                'id' => $resource['id'],
                'event' => '',
                'title' => '',
                'actant' => [],
                'date' => '',
                'season' => '',
                'edition' => '',
                'url' => '',
                'collection' => '',
                'fullUrl' => '',
                'description' => '',
                'citations' => [],
                'micro_resumes' => [],
                'bibliographies' => [],
                'mediagraphies' => [],
                'motcles' => [],
                'recommendation' => []
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 138:
                            $conference['event'] = $value['value'];
                            break;
                        case 1:
                            $conference['title'] = $value['value'];
                            break;
                        case 386:
                            $conference['actant'][] = $value['value_resource_id'];
                            break;
                        case 7:
                            $conference['date'] = $value['value'];
                            break;
                        case 143:
                            $conference['season'] = $value['value'];
                            break;
                        case 144:
                            $conference['edition'] = $value['value'];
                            break;
                        case 1517:
                            $conference['url'] = $value['uri'];
                            break;
                        case 146:
                            $conference['fullUrl'] = $value['uri'];
                            break;
                        case 19:
                            $conference['description'] = $value['value'];
                            break;
                        case 544:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['citations'][] = $value['value_resource_id'];
                            break;
                        case 86:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['micro_resumes'][] = $value['value_resource_id'];
                            break;
                        case 36:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['bibliographies'][] = $value['value_resource_id'];
                            break;
                        case 951:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;
                        case 438:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;

                        case 937:
                            $conference['recommendation'][] = $value['value_resource_id'];
                            break;
                        case 555:
                            $conference['collection'] = $value['value_resource_id'];
                        case 2097:
                            // Ajouter les IDs de motclé dans le tableau
                            $conference['motcles'][] = $value['value_resource_id'];
                            break;
                    }
                }
            }
            $result[] = $conference;
        }

        // Get resource IDs with edition template (id 77)
        $seasonQuery = "
            SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
            FROM `value` v
            JOIN `resource` r ON v.resource_id = r.id
            WHERE r.resource_template_id = 77
            AND v.property_id IN (937, 1662)  -- IDs des propriétés pertinentes pour l'édition
        ";

        $seasons = $this->conn->executeQuery($seasonQuery)->fetchAllAssociative();

        $seasonMap = [];
        foreach ($seasons as $season) {
            if ($season['property_id'] == 1662) {
                $seasonMap[$season['resource_id']] = $season['value'];
            }
        }

        // Compare conferences & editions to find right edition
        foreach ($result as &$conference) {
            foreach ($seasons as $season) {
                if ($season['property_id'] == 937 && $season['value_resource_id'] == $conference['id']) {
                    $conference['edition'] = $season['resource_id'];
                    foreach ($seasons as $seasonData) {
                        if ($seasonData['resource_id'] == $season['resource_id'] && $seasonData['property_id'] == 1662) {
                            $conference['season'] = $seasonData['value'];
                            break;
                        }
                    }
                }
            }
        }

        $editionQuery = "
        SELECT v.resource_id, v.value_resource_id
        FROM `value` v
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id = 33  -- Propriété 33 : 'Is Part Of'
        ";

        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Add right edition to conferences
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['resource_id'] == $conference['id']) {

                    $editionId = $edition['value_resource_id']; // Utiliser l'ID obtenu
                    $idQuery = "
                    SELECT v.uri
                    FROM `value` v
                    WHERE v.resource_id = :editionId
                    AND v.property_id = 1517  -- Propriété 1517
                ";

                    $uriResult = $this->conn->executeQuery($idQuery, ['editionId' => $editionId])->fetchOne();
                    if ($uriResult) {
                        $conference['fullUrl'] = $uriResult;
                    }
                    break;
                }
            }
        }


        // Appel pour récupérer les items avec resource_template_id = 95
        $editionQuery = "
        SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
        FROM `value` v
        JOIN `resource` r ON v.resource_id = r.id
        WHERE r.resource_template_id = 95
        AND v.property_id IN (937, 1)  -- On récupère aussi la property_id 1
        ";

        // Exécutez la requête et récupérez les résultats
        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Créer un tableau pour stocker les valeurs de property_id 1 associées à chaque édition
        $propertyOneMap = [];

        // Parcourir les résultats pour associer la value de property_id 1 à chaque resource_id
        foreach ($editions as $edition) {
            if ($edition['property_id'] == 1) {
                // Stocker la valeur de property_id 1 pour chaque resource_id
                $propertyOneMap[$edition['resource_id']] = $edition['value'];
            }
        }

        // Comparer les conférences avec les éditions pour déterminer la valeur de property_id 1
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['property_id'] == 937 && $edition['value_resource_id'] == $conference['edition']) {
                    // Si la value_resource_id correspond à l'édition de la conférence,
                    // on stocke la value de property_id 1
                    $conference['event'] = $propertyOneMap[$edition['resource_id']] ?? null; // Utiliser ?? pour éviter les erreurs si non trouvé
                    break; // Sortir de la boucle si on a trouvé la correspondance
                }
            }
        }



        return $result;
    }

    function getSeminarConfs()
    {
        // Récupérer les IDs des ressources ayant le template de conférence (id 71)
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 71
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs associées aux propriétés des conférences, incluant la nouvelle propriété 544
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 138, 141, 7, 143, 386, 145, 1517, 147, 19, 544, 36,951,438,2097, 937,555,86)  -- Ajout de la propriété 544
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Préparer les conférences
        $result = [];
        foreach ($resources as $resource) {
            $conference = [
                'id' => $resource['id'],
                'event' => '',
                'title' => '',
                'actant' => [],
                'date' => '',
                'season' => '',
                'edition' => '',
                'url' => '',
                'collection' => '',
                'fullUrl' => '',
                'description' => '',
                'citations' => [], // Nouveau champ citations
                'micro_resumes' => [],
                'bibliographies' => [], // Nouveau champ citations
                'mediagraphies' => [],
                'motcles' => [],
                'recommendation' => [] // Nouveau champ recommendation
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 138:
                            $conference['event'] = $value['value'];
                            break;
                        case 1:
                            $conference['title'] = $value['value'];
                            break;
                        case 386:
                            $conference['actant'][] = $value['value_resource_id'];
                            break;
                        case 7:
                            $conference['date'] = $value['value'];
                            break;
                        case 143:
                            $conference['season'] = $value['value'];
                            break;
                        case 144:
                            $conference['edition'] = $value['value'];
                            break;
                        case 1517:
                            $conference['url'] = $value['uri'];
                            break;
                        case 146:
                            $conference['fullUrl'] = $value['uri'];
                            break;
                        case 19:
                            $conference['description'] = $value['value'];
                            break;
                        case 544:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['citations'][] = $value['value_resource_id'];
                            break;
                        case 86:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['micro_resumes'][] = $value['value_resource_id'];
                            break;
                        case 36:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['bibliographies'][] = $value['value_resource_id'];
                            break;
                        case 951:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;
                        case 438:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;

                        case 937:
                            $conference['recommendation'][] = $value['value_resource_id'];
                            break;
                        case 555:
                            $conference['collection'] = $value['value_resource_id'];
                        case 2097:
                            // Ajouter les IDs de motclé dans le tableau
                            $conference['motcles'][] = $value['value_resource_id'];
                            break;
                    }
                }
            }

            // Ajouter la conférence au tableau
            $result[] = $conference;
        }

        // Appel pour récupérer les éditions (resource_template_id = 77)
        $seasonQuery = "
            SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
            FROM `value` v
            JOIN `resource` r ON v.resource_id = r.id
            WHERE r.resource_template_id = 77
            AND v.property_id IN (937, 1662)  -- IDs des propriétés pertinentes pour l'édition
        ";

        $seasons = $this->conn->executeQuery($seasonQuery)->fetchAllAssociative();

        // Créer un tableau associatif pour les saisons
        $seasonMap = [];
        foreach ($seasons as $season) {
            if ($season['property_id'] == 1662) {
                $seasonMap[$season['resource_id']] = $season['value'];
            }
        }

        // Comparer les conférences avec les éditions pour déterminer l'édition correcte
        foreach ($result as &$conference) {
            foreach ($seasons as $season) {
                if ($season['property_id'] == 937 && $season['value_resource_id'] == $conference['id']) {
                    // Si la conférence est associée à l'édition via la property_id 937
                    $conference['edition'] = $season['resource_id']; // Assurez-vous d'utiliser resource_id
                    //echo("Conference ID: {$conference['id']}, Edition ID: {$season['resource_id']}");
                    foreach ($seasons as $seasonData) {
                        if ($seasonData['resource_id'] == $season['resource_id'] && $seasonData['property_id'] == 1662) {
                            // On récupère l'ID de l'édition via la property_id 1662
                            $conference['season'] = $seasonData['value'];
                            break;
                        }
                    }
                }
            }
        }


        // Appel pour récupérer les éditions associées via la propriété 33
        $editionQuery = "
        SELECT v.resource_id, v.value_resource_id
        FROM `value` v
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id = 33  -- Propriété 33 : 'Is Part Of'
        ";

        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Parcourir les conférences et associer l'édition récupérée
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['resource_id'] == $conference['id']) {


                    // Nouvelle requête pour récupérer le @id de la propriété 1517 de la ressource d'édition
                    $editionId = $edition['value_resource_id']; // Utiliser l'ID obtenu
                    $idQuery = "
                    SELECT v.uri
                    FROM `value` v
                    WHERE v.resource_id = :editionId
                    AND v.property_id = 1517  -- Propriété 1517
                ";

                    $uriResult = $this->conn->executeQuery($idQuery, ['editionId' => $editionId])->fetchOne();
                    if ($uriResult) {
                        // Assignation du @id à l'édition de la conférence
                        $conference['fullUrl'] = $uriResult;
                    }
                    break; // Sortir de la boucle après avoir trouvé l'édition
                }
            }
        }


        // Appel pour récupérer les items avec resource_template_id = 95
        $editionQuery = "
        SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
        FROM `value` v
        JOIN `resource` r ON v.resource_id = r.id
        WHERE r.resource_template_id = 95
        AND v.property_id IN (937, 1)  -- On récupère aussi la property_id 1
        ";

        // Exécutez la requête et récupérez les résultats
        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Créer un tableau pour stocker les valeurs de property_id 1 associées à chaque édition
        $propertyOneMap = [];

        // Parcourir les résultats pour associer la value de property_id 1 à chaque resource_id
        foreach ($editions as $edition) {
            if ($edition['property_id'] == 1) {
                // Stocker la valeur de property_id 1 pour chaque resource_id
                $propertyOneMap[$edition['resource_id']] = $edition['value'];
            }
        }

        // Comparer les conférences avec les éditions pour déterminer la valeur de property_id 1
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['property_id'] == 937 && $edition['value_resource_id'] == $conference['edition']) {
                    // Si la value_resource_id correspond à l'édition de la conférence,
                    // on stocke la value de property_id 1
                    $conference['event'] = $propertyOneMap[$edition['resource_id']] ?? null; // Utiliser ?? pour éviter les erreurs si non trouvé
                    break; // Sortir de la boucle si on a trouvé la correspondance
                }
            }
        }



        return $result;
    }

    function getColloqueConfs()
    {
        // Récupérer les IDs des ressources ayant le template de conférence (id 71)
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 122
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs associées aux propriétés des conférences, incluant la nouvelle propriété 544
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 138, 141, 7, 143, 386, 145, 1517, 147, 19, 544, 36,951,438,2097, 937,555,86)  -- Ajout de la propriété 544
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Préparer les conférences
        $result = [];
        foreach ($resources as $resource) {
            $conference = [
                'id' => $resource['id'],
                'event' => '',
                'title' => '',
                'actant' => [],
                'date' => '',
                'season' => '',
                'edition' => '',
                'url' => '',
                'collection' => '',
                'fullUrl' => '',
                'description' => '',
                'citations' => [], // Nouveau champ citations
                'micro_resumes' => [],
                'bibliographies' => [], // Nouveau champ citations
                'mediagraphies' => [],
                'motcles' => [],
                'recommendation' => [] // Nouveau champ recommendation
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 138:
                            $conference['event'] = $value['value'];
                            break;
                        case 1:
                            $conference['title'] = $value['value'];
                            break;
                        case 386:
                            $conference['actant'][] = $value['value_resource_id'];
                            break;
                        case 7:
                            $conference['date'] = $value['value'];
                            break;
                        case 143:
                            $conference['season'] = $value['value'];
                            break;
                        case 144:
                            $conference['edition'] = $value['value'];
                            break;
                        case 1517:
                            $conference['url'] = $value['uri'];
                            break;
                        case 146:
                            $conference['fullUrl'] = $value['uri'];
                            break;
                        case 19:
                            $conference['description'] = $value['value'];
                            break;
                        case 544:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['citations'][] = $value['value_resource_id'];
                            break;
                        case 86:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['micro_resumes'][] = $value['value_resource_id'];
                            break;
                        case 36:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['bibliographies'][] = $value['value_resource_id'];
                            break;
                        case 951:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;
                        case 438:
                            // Ajouter les IDs de citation dans le tableau
                            $conference['mediagraphies'][] = $value['value_resource_id'];
                            break;

                        case 937:
                            $conference['recommendation'][] = $value['value_resource_id'];
                            break;
                        case 555:
                            $conference['collection'] = $value['value_resource_id'];
                        case 2097:
                            // Ajouter les IDs de motclé dans le tableau
                            $conference['motcles'][] = $value['value_resource_id'];
                            break;
                    }
                }
            }

            // Ajouter la conférence au tableau
            $result[] = $conference;
        }

        // Appel pour récupérer les éditions (resource_template_id = 77)
        $seasonQuery = "
            SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
            FROM `value` v
            JOIN `resource` r ON v.resource_id = r.id
            WHERE r.resource_template_id = 77
            AND v.property_id IN (937, 1662)  -- IDs des propriétés pertinentes pour l'édition
        ";

        $seasons = $this->conn->executeQuery($seasonQuery)->fetchAllAssociative();

        // Créer un tableau associatif pour les saisons
        $seasonMap = [];
        foreach ($seasons as $season) {
            if ($season['property_id'] == 1662) {
                $seasonMap[$season['resource_id']] = $season['value'];
            }
        }

        // Comparer les conférences avec les éditions pour déterminer l'édition correcte
        foreach ($result as &$conference) {
            foreach ($seasons as $season) {
                if ($season['property_id'] == 937 && $season['value_resource_id'] == $conference['id']) {
                    // Si la conférence est associée à l'édition via la property_id 937
                    $conference['edition'] = $season['resource_id']; // Assurez-vous d'utiliser resource_id
                    //echo("Conference ID: {$conference['id']}, Edition ID: {$season['resource_id']}");
                    foreach ($seasons as $seasonData) {
                        if ($seasonData['resource_id'] == $season['resource_id'] && $seasonData['property_id'] == 1662) {
                            // On récupère l'ID de l'édition via la property_id 1662
                            $conference['season'] = $seasonData['value'];
                            break;
                        }
                    }
                }
            }
        }


        // Appel pour récupérer les éditions associées via la propriété 33
        $editionQuery = "
        SELECT v.resource_id, v.value_resource_id
        FROM `value` v
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id = 33  -- Propriété 33 : 'Is Part Of'
        ";

        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Parcourir les conférences et associer l'édition récupérée
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['resource_id'] == $conference['id']) {


                    // Nouvelle requête pour récupérer le @id de la propriété 1517 de la ressource d'édition
                    $editionId = $edition['value_resource_id']; // Utiliser l'ID obtenu
                    $idQuery = "
                    SELECT v.uri
                    FROM `value` v
                    WHERE v.resource_id = :editionId
                    AND v.property_id = 1517  -- Propriété 1517
                ";

                    $uriResult = $this->conn->executeQuery($idQuery, ['editionId' => $editionId])->fetchOne();
                    if ($uriResult) {
                        // Assignation du @id à l'édition de la conférence
                        $conference['fullUrl'] = $uriResult;
                    }
                    break; // Sortir de la boucle après avoir trouvé l'édition
                }
            }
        }


        // Appel pour récupérer les items avec resource_template_id = 95
        $editionQuery = "
        SELECT v.resource_id, v.property_id, v.value_resource_id, v.value
        FROM `value` v
        JOIN `resource` r ON v.resource_id = r.id
        WHERE r.resource_template_id = 95
        AND v.property_id IN (937, 1)  -- On récupère aussi la property_id 1
        ";

        // Exécutez la requête et récupérez les résultats
        $editions = $this->conn->executeQuery($editionQuery)->fetchAllAssociative();

        // Créer un tableau pour stocker les valeurs de property_id 1 associées à chaque édition
        $propertyOneMap = [];

        // Parcourir les résultats pour associer la value de property_id 1 à chaque resource_id
        foreach ($editions as $edition) {
            if ($edition['property_id'] == 1) {
                // Stocker la valeur de property_id 1 pour chaque resource_id
                $propertyOneMap[$edition['resource_id']] = $edition['value'];
            }
        }

        // Comparer les conférences avec les éditions pour déterminer la valeur de property_id 1
        foreach ($result as &$conference) {
            foreach ($editions as $edition) {
                if ($edition['property_id'] == 937 && $edition['value_resource_id'] == $conference['edition']) {
                    // Si la value_resource_id correspond à l'édition de la conférence,
                    // on stocke la value de property_id 1
                    $conference['event'] = $propertyOneMap[$edition['resource_id']] ?? null; // Utiliser ?? pour éviter les erreurs si non trouvé
                    break; // Sortir de la boucle si on a trouvé la correspondance
                }
            }
        }



        return $result;
    }

    function getCitations()
    {
        // Récupérer les IDs des ressources ayant le template 80
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 80
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs associées aux propriétés des citations
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (269, 1417, 735, 315, 1718)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Préparer les objets de citation
        $result = [];
        foreach ($resources as $resource) {
            $citationObj = [
                'id' => $resource['id'],
                'actant' => '',
                'citation' => '',
                'startTime' => '',
                'endTime' => '',
                'motcles' => [] // Nouveau tableau pour mot et motclé
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 269:
                            $citationObj['citation'] = $value['value'];
                            break;
                        case 1417:
                            $citationObj['startTime'] = $value['value'];
                            break;
                        case 735:
                            $citationObj['endTime'] = $value['value'];
                            break;
                        case 315:
                            $citationObj['actant'] = $value['value_resource_id'];
                            break;
                        case 1718:
                            // Ajouter l'ID dans le tableau motcles
                            $citationObj['motcles'][] = $value['value_resource_id'];
                            break;
                    }
                }
            }

            // Ajouter l'objet de citation au tableau
            $result[] = $citationObj;
        }

        return $result;
    }

    function getMicroResumes()
    {
        // ========================================
        // PARTIE 1 : REQUÊTE PRINCIPALE
        // ========================================

        $microResumeQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 125
            ORDER BY r.created DESC
        ";

        $microResumes = $this->conn->executeQuery($microResumeQuery)->fetchAllAssociative();

        if (empty($microResumes)) {
            return [];
        }

        $microResumeIds = array_column($microResumes, 'id');

        // ========================================
        // PARTIE 2 : REQUÊTE DES VALEURS
        // ========================================

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $microResumeIds) . ")
            AND v.property_id IN (1, 4, 1417, 735, 1710, 1794)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // ========================================
        // PARTIE 3 : MAPS DES RESSOURCES LIÉES
        // ========================================

        // Récupérer les IDs des instruments (property_id 1710)
        $instrumentIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1710 && $value['value_resource_id']) {
                $instrumentIds[] = $value['value_resource_id'];
            }
        }

        // Récupérer les IDs des ressources liées (property_id 1794)
        $relatedResourceIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1794 && $value['value_resource_id']) {
                $relatedResourceIds[] = $value['value_resource_id'];
            }
        }

        // Map pour les titres des instruments (optionnel si besoin d'afficher le titre)
        $instrumentMap = [];
        if (!empty($instrumentIds)) {
            $instrumentQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($instrumentIds)) . ")
                AND v.property_id = 1
            ";
            $instrumentData = $this->conn->executeQuery($instrumentQuery)->fetchAllAssociative();

            foreach ($instrumentData as $data) {
                $instrumentMap[$data['resource_id']] = $data['value'];
            }
        }

        // Map pour les titres des ressources liées (optionnel si besoin d'afficher le titre)
        $relatedResourceMap = [];
        if (!empty($relatedResourceIds)) {
            $relatedResourceQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($relatedResourceIds)) . ")
                AND v.property_id = 1
            ";
            $relatedResourceData = $this->conn->executeQuery($relatedResourceQuery)->fetchAllAssociative();

            foreach ($relatedResourceData as $data) {
                $relatedResourceMap[$data['resource_id']] = $data['value'];
            }
        }

        // ========================================
        // PARTIE 4 : CONSTRUCTION DU RÉSULTAT
        // ========================================

        $result = [];
        foreach ($microResumes as $microResume) {
            $item = [
                'id' => $microResume['id'],
                'title' => '',
                'description' => '',
                'startTime' => '',
                'endTime' => '',
                'outil' => null,
                'relatedResource' => null,
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $microResume['id']) {
                    switch ($value['property_id']) {

                        case 1: // dcterms:title
                            $item['title'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            $item['description'] = $value['value'];
                            break;

                        case 1417: // schema:startTime
                            $item['startTime'] = $value['value'];
                            break;

                        case 735: // schema:endTime
                            $item['endTime'] = $value['value'];
                            break;

                        case 1710: // schema:instrument (resource avec ID)
                            if ($value['value_resource_id']) {

                                $item['outil'] = $value['value_resource_id'];
                            }
                            break;

                        case 1794: // ma:hasRelatedResource (resource avec ID)
                            if ($value['value_resource_id']) {
                                $item['relatedResource'] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $item;
        }

        // ========================================
        // PARTIE 5 : RETURN
        // ========================================

        return $result;
    }

    function getUniversities()
    {
        $universityQuery = "
            SELECT
                r.id AS resource_id,
                MAX(CASE WHEN v.property_id = 1 THEN v.value END) AS title,  -- dcterms:title
                MAX(CASE WHEN v.property_id = 17 THEN v.value END) AS shortName,  -- dcterms:alternative
                MAX(CASE WHEN v.property_id = 1517 THEN v.uri END) AS url,  -- schema:url
                MAX(CASE WHEN v.property_id = 377 THEN v.value_resource_id END) AS country_id,  -- pays (linked resource)
                MAX(CASE WHEN v.property_id = 1701 THEN m.storage_id END) AS logo_storage_id,
                MAX(CASE WHEN v.property_id = 1701 THEN m.extension END) AS logo_extension
            FROM resource r
            LEFT JOIN value v ON v.resource_id = r.id
            LEFT JOIN media m ON v.value_resource_id = m.id AND v.property_id = 1701
            WHERE r.resource_template_id = 73
            GROUP BY r.id
        ";

        $universityResult = $this->conn->executeQuery($universityQuery)->fetchAllAssociative();

        if (empty($universityResult)) {
            return null;
        }

        $universities = [];
        foreach ($universityResult as $university) {
            // Récupération du pays
            $countryName = '';
            if (!empty($university['country_id'])) {
                $countryQuery = "
                    SELECT value
                    FROM value
                    WHERE resource_id = :countryId
                    AND property_id = 1
                ";
                $countryName = $this->conn->executeQuery($countryQuery, ['countryId' => $university['country_id']])->fetchOne();
            }

            $logo = '';
            if (!empty($university['logo_storage_id']) && !empty($university['logo_extension'])) {
                $logo = $this->generateThumbnailUrl($university['logo_storage_id'] . '.' . $university['logo_extension']);
            }

            $universities[] = [
                'id' => $university['resource_id'],
                'name' => $university['title'],
                'shortName' => $university['shortName'] ?? null,
                'logo' => $logo,
                'url' => $university['url'] ?? '',
                'country' => $countryName ?? ''
            ];
        }

        return $universities;
    }

    function getLaboratories()
    {
        $laboratoryQuery = "
            SELECT
                r.id AS resource_id,  -- Ajouter l'ID de la ressource
                (SELECT v.value
                 FROM `value` v
                 WHERE v.resource_id = r.id
                 AND v.property_id = 1
                 LIMIT 1) AS title,  -- Titre de la ressource

                (SELECT v.uri
                 FROM `value` v
                 WHERE v.resource_id = r.id
                 AND v.property_id = 1517
                 LIMIT 1) AS url,  -- URL de la ressource

                (SELECT CONCAT(m.storage_id, '.', m.extension)
                 FROM `value` v
                 JOIN `media` m ON v.value_resource_id = m.id
                 WHERE v.resource_id = r.id
                 AND v.property_id = 1701
                 LIMIT 1) AS logo  -- Image de la ressource

            FROM `resource` r
            WHERE r.resource_template_id = 91  -- Utilisation du template 91
        ";

        // Exécution de la requête
        $laboratoryResult = $this->conn->executeQuery($laboratoryQuery)->fetchAllAssociative();

        if (empty($laboratoryResult)) {
            return null;
        }

        // Parcourir les résultats et préparer le tableau de données
        $laboratories = [];
        foreach ($laboratoryResult as $laboratory) {
            $laboratories[] = [
                'id' => $laboratory['resource_id'],  // Ajouter l'ID de la ressource
                'name' => $laboratory['title'],
                'logo' => $laboratory['logo'] ? $this->generateThumbnailUrl($laboratory['logo']) : '',
                'url' => $laboratory['url'] ?? ''
            ];
        }

        return $laboratories;
    }

    function getDoctoralSchools()
    {
        $doctoralSchoolQuery = "
            SELECT
                r.id AS resource_id,  -- Ajouter l'ID de la ressource
                (SELECT v.value
                 FROM `value` v
                 WHERE v.resource_id = r.id
                 AND v.property_id = 1
                 LIMIT 1) AS title,  -- Titre de la ressource

                (SELECT v.uri
                 FROM `value` v
                 WHERE v.resource_id = r.id
                 AND v.property_id = 1517
                 LIMIT 1) AS url  -- URL de la ressource

            FROM `resource` r
            WHERE r.resource_template_id = 74  -- Utilisation du template 74
        ";

        // Exécution de la requête
        $doctoralSchoolResult = $this->conn->executeQuery($doctoralSchoolQuery)->fetchAllAssociative();

        if (empty($doctoralSchoolResult)) {
            return null;
        }

        // Parcourir les résultats et préparer le tableau de données
        $doctoralSchools = [];
        foreach ($doctoralSchoolResult as $doctoralSchool) {
            $doctoralSchools[] = [
                'id' => $doctoralSchool['resource_id'],  // Ajouter l'ID de la ressource
                'name' => $doctoralSchool['title'],
                'url' => $doctoralSchool['url'] ?? ''  // URL de la ressource
            ];
        }

        return $doctoralSchools;
    }

    function getBibliographies()
    {
        // Requête pour récupérer les ressources avec le template 81 et 99
        $resourceQuery = "
            SELECT r.id, r.resource_class_id, r.resource_template_id
            FROM `resource` r
            WHERE r.resource_template_id IN (81, 99)
        ";
        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Requête pour récupérer les valeurs associées aux propriétés des ressources
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.uri, v.value_resource_id
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 5, 7, 8, 33, 92, 66, 94, 122, 103, 112, 121, 108)
        ";
        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Requête pour récupérer les créateurs (propriété 2 est une ressource, donc value_resource_id)
        $creatorQuery = "
            SELECT r.id, r.title
            FROM `resource` r
            WHERE r.id IN (
                SELECT v.value_resource_id
                FROM `value` v
                WHERE v.property_id = 2
                AND v.resource_id IN (" . implode(',', $resourceIds) . ")
            )
        ";
        $creators = $this->conn->executeQuery($creatorQuery)->fetchAllAssociative();

        // Requête pour récupérer les prénoms et noms des créateurs (propriétés 139 et 140)
        $creatorNameQuery = "
            SELECT v.resource_id, v.value, v.property_id
            FROM `value` v
            WHERE v.property_id IN (139, 140)
            AND v.resource_id IN (
                SELECT v.value_resource_id
                FROM `value` v
                WHERE v.property_id = 2
                AND v.resource_id IN (" . implode(',', $resourceIds) . ")
            )
        ";
        $creatorNameValues = $this->conn->executeQuery($creatorNameQuery)->fetchAllAssociative();

        // Indexer les créateurs par leur ID pour un accès facile
        $creatorMap = [];
        foreach ($creators as $creator) {
            $creatorMap[$creator['id']] = $creator['title'];
        }

        // Indexer les prénoms et noms des créateurs
        $creatorNameMap = [];
        foreach ($creatorNameValues as $value) {
            $creatorId = $value['resource_id'];
            if (!isset($creatorNameMap[$creatorId])) {
                $creatorNameMap[$creatorId] = ['first_name' => '', 'last_name' => ''];
            }
            if ($value['property_id'] == 139) {
                $creatorNameMap[$creatorId]['first_name'] = $value['value'];
            } elseif ($value['property_id'] == 140) {
                $creatorNameMap[$creatorId]['last_name'] = $value['value'];
            }
        }

        // Récupérer les logos/thumbnails
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $logoMap = [];
        foreach ($logos as $logo) {
            $logoMap[$logo['item_id']] = $logo['logo'];
        }

        $bibliographies = [];

        foreach ($resources as $resource) {
            $bibliographie = [
                'id' => $resource['id'],
                'class' => $resource['resource_class_id'],
                'resource_template_id' => $resource['resource_template_id'], // Ajout du resource_template_id
                'title' => '',
                'type' => '',
                'creator' => [],
                'date' => '',
                'publisher' => '',
                'volume' => '',
                'issue' => '',
                'pages' => '',
                'url' => '',
                'doi' => '',
                'editor' => '',
                'edition' => '',
                'ispartof' => '',
                'number' => '',
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : ''
            ];

            // Associer les valeurs récupérées à chaque ressource
            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // Title
                            $bibliographie['title'] = $value['value'];
                            break;
                        case 2: // Creator
                            if (isset($creatorMap[$value['value_resource_id']])) {
                                $creatorId = $value['value_resource_id'];
                                if (isset($creatorNameMap[$creatorId])) {
                                    // Ajout du créateur au tableau creator
                                    $bibliographie['creator'][] = [
                                        'first_name' => $creatorNameMap[$creatorId]['first_name'],
                                        'last_name' => $creatorNameMap[$creatorId]['last_name']
                                    ];
                                }
                            }
                            break;
                        case 7: // Date
                            $bibliographie['date'] = $value['value'];
                            break;
                        case 5: // Publisher
                            $bibliographie['publisher'] = $value['value']; // Ajout de chaque valeur de publisher au tableau
                            break;
                        case 92: // DOI
                            $bibliographie['doi'] = $value['value'];
                            break;
                        case 66: // Editor
                            $bibliographie['editor'] = $value['value'];
                            break;
                        case 33: // Is Part Of
                            $bibliographie['ispartof'] = $value['value'];
                            break;
                        case 94: // Edition
                            $bibliographie['edition'] = $value['value'];
                            break;
                        case 122: // Volume
                            $bibliographie['volume'] = $value['value'];
                            break;
                        case 103: // Issue
                            $bibliographie['issue'] = $value['value'];
                            break;
                        case 112: // Pages
                            $bibliographie['pages'] = $value['value'];
                            break;
                        case 8: // Type
                            $bibliographie['type'] = $value['value'];
                            break;
                        case 121: // URI
                            $bibliographie['url'] = $value['uri'];
                            break;
                        case 108: // Number
                            $bibliographie['number'] = $value['uri'];
                            break;
                    }
                }
            }

            // Ajouter la ressource traitée au tableau final des bibliographies
            $bibliographies[] = $bibliographie;
        }

        return $bibliographies;
    }

    private function generateThumbnailUrl($storageId, $extension = null)
    {
        if ($extension) {
            return "https://tests.arcanes.ca/omk/files/original/{$storageId}.{$extension}";
        } else {
            return "https://tests.arcanes.ca/omk/files/original/{$storageId}";
        }
    }


    /* https://tests.arcanes.ca/omk/files/square/37168c987fdf42c9b4bbbc8020329c3186cbc46b.jpg */
    /* https://tests.arcanes.ca/omk/files/square/37168c987fdf42c9b4bbbc8020329c3186cbc46b.jpeg */

    /**
     * mise à jour de la complexité
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function complexityInsertValue($params)
    {

        //création de l'annotation
        $query = "INSERT INTO `resource` (`owner_id`, `is_public`, `created`,`resource_type`) VALUES
        (?,1,NOW(),?)";
        $rs = $this->conn->executeStatement($query, [$params['vals']['owner'], 'Omeka\Entity\ValueAnnotation']);
        $aId = $this->conn->lastInsertId();
        $query = "INSERT INTO `value_annotation` (`id`) VALUES (" . $aId . ")";
        $rs = $this->conn->executeStatement($query);

        //mise à jour de la resource
        $query = "UPDATE `resource` SET `modified`=NOW() WHERE id =" . $params['vals']['id'];
        $rs = $this->conn->executeStatement($query);

        //création des nouvelles valeurs d'annotation
        $this->complexityInsertAnnotationValues($aId, $params['vals']);

        //création de la valeur de la ressource
        $query = "INSERT INTO `value` (`value`,`property_id`, `type`,`resource_id`,`is_public`,`value_annotation_id`)  VALUES
            (?, ?, 'literal', ?, 1, ?)";
        $rs = $this->conn->executeStatement($query, [$params['vals']['value'], $params['vals']['property_id'], $params['vals']['id'], $aId]);
        return $rs;
    }
    /**
     * ajout de la complexité
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function complexityUpdateValue($params)
    {
        //récupère les identifiants
        $query = "SELECT id, value_annotation_id FROM value v WHERE v.property_id = ? AND v.resource_id = ?";
        $rs = $this->conn->fetchAll($query, [$params['vals']['property_id'], $params['vals']['id']]);
        $aId = $rs[0]['value_annotation_id'];
        $vId = $rs[0]['id'];

        //mise à jour les resources
        $query = "UPDATE `resource` SET `modified`=NOW() WHERE id IN (" . $params['vals']['id'] . "," . $aId . ")";
        $rs = $this->conn->executeStatement($query);

        //supression des valeurs de l'annotation
        $query = "DELETE FROM `value` WHERE resource_id = " . $aId;
        $rs = $this->conn->executeStatement($query);

        //création des nouvelles valeurs
        $this->complexityInsertAnnotationValues($aId, $params['vals']);

        //mise à jour de la valeur de la ressource
        $query = "UPDATE value v SET v.value = ? WHERE v.id = ?";
        $rs = $this->conn->executeStatement($query, [$params['vals']['value'], $vId]);
        return $rs;
    }

    /**
     * ajout des annotation de la complexité
     *
     * @param array    $vals paramètre de la requête
     * @return array
     */
    function complexityInsertAnnotationValues($id, $vals)
    {

        $query = "INSERT INTO `value` (`value`, `property_id`, `type`, `resource_id`,`is_public`) VALUES (?, ?, ?, ?, 1)";
        foreach ($vals['@annotation'] as $a) {
            foreach ($a as $v) {
                $rs = $this->conn->executeStatement(
                    $query,
                    [$v['@value'], $v['property_id'], $v['type'], $id]
                );
            }
        }
    }


    /**
     * renvoie le nombre de ressource par complexité
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function complexityNbValue($params)
    {
        $query = "    SELECT
                CAST(v.value AS INTEGER) val, COUNT(*) nb
            FROM
                property p
                    INNER JOIN
                value v ON v.property_id = p.id
            WHERE
                p.local_name = 'complexity'
            GROUP BY v.value
            ORDER BY val DESC";
        $rs = $this->conn->fetchAll($query);
        return $rs;
    }


    /**
     * renvoie les propriété utilisées pour les valeurs de ressource
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function propValueResource($params)
    {
        $query = "SELECT
                v.property_id,
                COUNT(v.id),
                CONCAT(vo.prefix, ':', p.local_name) prop
            FROM
                value v
                    INNER JOIN
                property p ON p.id = v.property_id
                    INNER JOIN
                vocabulary vo ON vo.id = p.vocabulary_id
            WHERE
                v.value_resource_id IS NOT NULL
            GROUP BY v.property_id
                ";
        $rs = $this->conn->fetchAll($query);
        return $rs;
    }

    /**
     * renvoie les statistiques d'utilisation d'une ressource
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function statResUsed($params)
    {
        //if(!$this->conn->isConnected())$this->conn->connect();

        //ATTENTION: on ne prend pas en compte toutes les ressources mais uniquement certains types
        $resourceTypes = ["Annotate\Entity\Annotation", "Omeka\Entity\Item", "Omeka\Entity\Media", "Omeka\Entity\ItemSet"];
        $query = "SELECT
                r.id,
                COUNT(v.id) nbVal,
                COUNT(v.property_id) nbProp,
                COUNT(DISTINCT r.owner_id) nbOwner,
                GROUP_CONCAT(DISTINCT r.owner_id) idsOwner,
                COUNT(v.uri) nbUri,
                GROUP_CONCAT(v.uri) uris,
                COUNT(v.value_resource_id) nbRes,
                GROUP_CONCAT(v.value_resource_id) idsRes,
                GROUP_CONCAT(CONCAT(vo.prefix, ':', p.local_name)) propsRes,
                COUNT(v.value_annotation_id) nbAno,
                COUNT(DISTINCT m.id) nbMedia,
                GROUP_CONCAT(DISTINCT m.id) idsMedia,
                r.resource_type,
                rc.label 'class label',
                rc.id 'idClass'
            FROM
                value v
                    INNER JOIN
                resource r ON r.id = v.resource_id
                    LEFT JOIN
                media m ON m.item_id = r.id
                    LEFT JOIN
                resource_class rc ON rc.id = r.resource_class_id
                    LEFT JOIN
                value vl ON vl.resource_id = v.resource_id
                    AND vl.value_resource_id = v.value_resource_id
                    LEFT JOIN
                property p ON p.id = vl.property_id
                    LEFT JOIN
                vocabulary vo ON vo.id = p.vocabulary_id
                ";
        if ($params["id"]) {
            $query .= " WHERE r.id = ?";
            $rs = $this->conn->fetchAll($query, [$params["id"]]);
        } elseif ($params["ids"]) {
            $query .= " WHERE r.id IN (";
            $query .= implode(',', array_fill(0, count($params['ids']), '?'));
            $query .= ")
                GROUP BY r.id ";
            $rs = $this->conn->fetchAll($query, $params["ids"]);
        } elseif ($params['resource_types']) {
            ini_set('memory_limit', '2048M');
            $query .= " WHERE r.resource_type IN (";
            $query .= implode(',', array_fill(0, count($params['resource_types']), '?'));
            $query .= ")
                GROUP BY r.id ";
            $rs = $this->conn->fetchAll($query, $params['resource_types']);
        } elseif ($params['vrid']) {
            $query .= " WHERE v.value_resource_id = ? AND r.resource_type IN (";
            $query .= implode(',', array_fill(0, count($resourceTypes), '?'));
            $query .= ")  GROUP BY r.id";
            $rs = $this->conn->fetchAll($query, array_merge([$params["vrid"]], $resourceTypes));
        } else {
            ini_set('memory_limit', '2048M');
            $query .= " WHERE r.resource_type IN (?,?,?,?)
                GROUP BY r.id ";
            $rs = $this->conn->fetchAll($query, $resourceTypes);
        }
        //$this->conn->close();
        return $rs;
    }

    /**
     * renvoie les statistiques d'utilisation des class
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function statClassUsed($params)
    {
        $query = 'SELECT
            COUNT(v.id) nbVal,
            COUNT(DISTINCT v.resource_id) nbItem,
            COUNT(DISTINCT v.property_id) nbProp,
            COUNT(DISTINCT r.owner_id) nbOwner,
            COUNT(DISTINCT v.uri) nbUri,
            COUNT(DISTINCT v.value_resource_id) nbRes,
            COUNT(DISTINCT v.value_annotation_id) nbAno,
            r.resource_type,
            rc.label "class label",
            rc.id
        FROM
            value v
                INNER JOIN
            resource r ON r.id = v.resource_id
                LEFT JOIN
            resource_class rc ON rc.id = r.resource_class_id
        WHERE
            r.resource_type IN (?,?,?,?)
        GROUP BY r.resource_type, rc.id, rc.id
        ';
        $rs = $this->conn->fetchAll($query, ["Annotate\Entity\Annotation", "Omeka\Entity\Item", "Omeka\Entity\Media", "Omeka\Entity\ItemSet"]);
        return $rs;
    }

    function tagUses($params)
    {
        //récupère le descriptif des usages = le tag utilisé comme valueResource
        $query = "SELECT
                r.id tagId,
                r.title tagTitle,
                p.local_name relation,
                v.resource_id useId,
                rc.label useClass
            FROM
                resource r
                    INNER JOIN
                value v ON v.value_resource_id = r.id
                    INNER JOIN
                property p ON p.id = v.property_id
                    INNER JOIN
                resource rU ON rU.id = v.resource_id
                    INNER JOIN
                resource_class rc ON rc.id = rU.resource_class_id
            WHERE
                        r.title like '%" . $params['search'] . "%'
                        AND (p.local_name = 'hasConcept' OR p.local_name = 'semanticRelation')
                    ";
        //GROUP BY r.id, p.local_name ";
        $query .= " ORDER BY r.created";
        $rs = $this->conn->fetchAll($query);
        //détails les usages
        $tags = [];
        foreach ($rs as $i => $r) {
            //récupère le détail de l'usage suivant sa class
            if (!isset($tags[$r['tagId']]))
                $tags[$r['tagId']] = ['tagId' => $r['tagId'], 'tagTitle' => $r['tagTitle'], 'relations' => []];
            if (!isset($tags[$r['tagId']]['relations'][$r['useClass']]))
                $tags[$r['tagId']]['relations'][$r['useClass']] = [];
            switch ($r['useClass']) {
                case 'part of speech':
                    $tags[$r['tagId']]['relations'][$r['useClass']][] = $this->getDetailUsagePartOfSpeech($r['tagId'], $r['useId']);
                    break;
            }
        }
        return $tags;
    }

    /**
     * renvoie le detail des usages pour part of speech
     *
     * @param int    $idT identifiant du tag
     * @param int    $idR identifiant de la ressource
     * @return array
     */
    function getDetailUsagePartOfSpeech($idT, $idR)
    {
        $query = "SELECT idMin, idMax, nb, pId, pLabel, numVal
        , vStart.id, vStart.value start
        , vEnd.id, vEnd.value end
        , vConf.id, vConf.value confidence
        , vSpeak.id, vSpeak.value speaker
        FROM (
        SELECT
            count(v.value_resource_id),
            count(v.value),
            min(v.id) idMin,
            max(v.id) idMax,
            max(v.id)-min(v.id) nb,
            v.property_id pId,
            p.label pLabel,
            min(vC.id) - min(v.id) numVal
        FROM
            value v
            inner join property p on p.id = v.property_id
            left join value vC on vC.id = v.id and v.property_id = 2068 and v.value_resource_id = " . $idT . "
        WHERE
            v.resource_id = " . $idR . "
         group by v.resource_id,  v.property_id
         having nb > 1 and numVal > 0
         ) trans,
         (select id, value, property_id from value WHERE resource_id = " . $idR . " and property_id = 208) vStart,
         (select id, value, property_id from value WHERE resource_id = " . $idR . " and property_id = 189) vEnd,
         (select id, value, property_id from value WHERE resource_id = " . $idR . " and property_id = 2043) vConf,
         (select id, value, property_id from value WHERE resource_id = " . $idR . " and property_id = 2082) vSpeak
        WHERE
        vStart.id = trans.idMin+(nb+1)+numVal
        AND vEnd.id = trans.idMin+((nb+1)*2)+numVal
        AND vConf.id = trans.idMin+((nb+1)*3)+numVal
        AND vSpeak.id = trans.idMin+((nb+1)*4)+numVal";
        $rs = $this->conn->fetchAll($query);
        return $rs;
    }

    /**
     * renvoie les statistiques d'une class comme valeur de ressource
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function statValueResourceClass($params)
    {
        $oClass = $this->api->search('resource_classes', ['term' => $params['class']])->getContent()[0];
        $query = "SELECT
            r.id,
            r.title,
            COUNT(v.id) nbValue,
            GROUP_CONCAT(DISTINCT p.local_name) props
        FROM
            resource r
                INNER JOIN
            value v ON v.value_resource_id = r.id
                INNER JOIN
            property p ON p.id = v.property_id
        WHERE
            resource_class_id = ?
        GROUP BY r.id ";
        $having = "";
        if ($params['minVal'] && $params['maxVal']) $having = " HAVING nbValue BETWEEN " . $params['minVal'] . " AND " . $params['maxVal'];
        elseif ($params['maxVal']) $having = " HAVING nbValue <= " . $params['maxVal'];
        elseif ($params['minVal']) $having = " HAVING nbValue >= " . $params['minVal'];
        $query .= $having . " ORDER BY r.created";
        $rs = $this->conn->fetchAll($query, [$oClass->id()]);
        return $rs;
    }

    /**
     * renvoie les coocurrences de relation d'une ressource
     *
     * @param array    $params paramètre de la requête
     * @return array
     */
    function cooccurrenceValueResource($params)
    {
        $query = "SELECT
                rlr.title, rlr.id, COUNT(vl.id) nbValue
                ,GROUP_CONCAT(DISTINCT v.resource_id) idsR
            FROM
                resource r
                    INNER JOIN
                value v ON v.value_resource_id = r.id
                    INNER JOIN
                property p ON p.id = v.property_id
                    INNER JOIN
                resource rl ON rl.id = v.resource_id
                    INNER JOIN
                value vl ON vl.resource_id = rl.id
                    INNER JOIN
                resource rlr ON rlr.id = vl.value_resource_id
            WHERE
                r.id = ?
            GROUP BY rlr.id
            ";
        $rs = $this->conn->fetchAll($query, [$params['id']]);
        return $rs;
    }

    /**
     * renvoie les statistiques d'une resource template
     *
     * @param int     $id identifiant du resurce template
     * @return array
     */
    function statResourceTemplate($id)
    {
        $query = "SELECT
                    COUNT(DISTINCT r.id) nbRes,
                    p.local_name, p.label,
                    p.id pId,
                    COUNT(DISTINCT v.value) nbVal,
                    COUNT(DISTINCT v.value_resource_id) nbValRes
                FROM
                    resource r
                        INNER JOIN
                    value v ON v.resource_id = r.id
                        INNER JOIN
                    property p ON p.id = v.property_id
                WHERE
                    r.resource_template_id = ?
                GROUP BY v.property_id
                ORDER BY v.value
                ";
        $rs = $this->conn->fetchAll($query, [$id]);
        return $rs;
    }

    /**
     * renvoie les valeurs distincts d'uen propriété d'un resource template
     *
     * @param int     $idRT identifiant du resurce template
     * @param int     $idP identifiant de le propriété
     * @return array
     */
    function getDistinctPropertyVal($idRT, $idP)
    {
        $query = "SELECT
                p.local_name,
                p.id,
                COUNT(DISTINCT r.id) nb,
                v.value,
                v.value_resource_id,
                rt.title
            FROM
                resource r
                    INNER JOIN
                value v ON v.resource_id = r.id
                    INNER JOIN
                property p ON p.id = v.property_id
                    LEFT JOIN
                resource rt ON rt.id = v.value_resource_id
            WHERE
                r.resource_template_id = ?
                    AND p.id = ?
            GROUP BY v.value , value_resource_id
             ";
        $rs = $this->conn->fetchAll($query, [$idRT, $idP]);
        return $rs;
    }


    function getExperimentations()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 108
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 4, 7, 1418, 86, 386, 235, 2145, 438, 1606, 11, 2097, 36, 48, 1517, 937, 1701, 1263, 581)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Logos/thumbnails (de l'item lui-même)
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $logoMap = [];
        foreach ($logos as $logo) {
            $logoMap[$logo['item_id']] = $logo['logo'];
        }

        // Médias associés
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                $associatedMediaMap[$media['resource_id']] = $media['media_file'];
            }
        }

        // URIs, thumbnails, titles pour références/citations (36 / 48)
        $referencesAndCitationsIds = [];
        foreach ($values as $value) {
            if (($value['property_id'] == 36 || $value['property_id'] == 48) && $value['value_resource_id']) {
                $referencesAndCitationsIds[] = $value['value_resource_id'];
            }
        }

        $uriMap = [];
        $thumbnailMap = [];
        $titleMap = [];
        if (!empty($referencesAndCitationsIds)) {
            $uriTitleQuery = "
                SELECT v.resource_id, v.uri, v.value, v.property_id
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
                AND v.property_id IN (121, 1)
            ";
            $uriTitleData = $this->conn->executeQuery($uriTitleQuery)->fetchAllAssociative();

            foreach ($uriTitleData as $data) {
                if ($data['property_id'] == 121) {
                    $uriMap[$data['resource_id']] = $data['uri'];
                } elseif ($data['property_id'] == 1) {
                    $titleMap[$data['resource_id']] = $data['value'];
                }
            }

            $thumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
            ";
            $thumbnailData = $this->conn->executeQuery($thumbnailQuery)->fetchAllAssociative();
            foreach ($thumbnailData as $thumbnail) {
                $thumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // Cartouche complet pour credits (235)
        $creditIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 235 && $value['value_resource_id']) {
                $creditIds[] = $value['value_resource_id'];
            }
        }

        $creditMap = [];
        if (!empty($creditIds)) {
            $creditTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creditIds)) . ")
                AND v.property_id = 1
            ";
            $creditTitleData = $this->conn->executeQuery($creditTitleQuery)->fetchAllAssociative();
            foreach ($creditTitleData as $credit) {
                if (!isset($creditMap[$credit['resource_id']])) {
                    $creditMap[$credit['resource_id']] = [];
                }
                $creditMap[$credit['resource_id']]['display_title'] = $credit['value'];
            }

            $creditThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($creditIds)) . ")
            ";
            $creditThumbnailData = $this->conn->executeQuery($creditThumbnailQuery)->fetchAllAssociative();
            foreach ($creditThumbnailData as $thumbnail) {
                if (!isset($creditMap[$thumbnail['item_id']])) {
                    $creditMap[$thumbnail['item_id']] = [];
                }
                $creditMap[$thumbnail['item_id']]['thumbnail_url'] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // MÊME TRAITEMENT QUE getOeuvres: contributeurs (581) -> actants détaillés
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 581 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $contributorMap = [];
        $contributorThumbnailMap = [];
        $contributorPageMap = [];
        if (!empty($contributorIds)) {
            $contributorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorNameData = $this->conn->executeQuery($contributorNameQuery)->fetchAllAssociative();
            foreach ($contributorNameData as $contributor) {
                $contributorMap[$contributor['resource_id']] = $contributor['value'];
            }

            $contributorPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 174
            ";
            $contributorPageData = $this->conn->executeQuery($contributorPageQuery)->fetchAllAssociative();
            foreach ($contributorPageData as $contributor) {
                $contributorPageMap[$contributor['resource_id']] = $contributor['uri'];
            }

            $contributorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($contributorIds)) . ")
            ";
            $contributorThumbnailData = $this->conn->executeQuery($contributorThumbnailQuery)->fetchAllAssociative();
            foreach ($contributorThumbnailData as $thumbnail) {
                $contributorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // MÊME TRAITEMENT QUE getOeuvres: agents (386) -> acteurs détaillés
        $agentIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 386 && $value['value_resource_id']) {
                $agentIds[] = $value['value_resource_id'];
            }
        }

        $agentMap = [];
        $agentThumbnailMap = [];
        $agentPageMap = [];
        if (!empty($agentIds)) {
            $agentNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 1
            ";
            $agentNameData = $this->conn->executeQuery($agentNameQuery)->fetchAllAssociative();
            foreach ($agentNameData as $agent) {
                $agentMap[$agent['resource_id']] = $agent['value'];
            }

            $agentPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 174
            ";
            $agentPageData = $this->conn->executeQuery($agentPageQuery)->fetchAllAssociative();
            foreach ($agentPageData as $agent) {
                $agentPageMap[$agent['resource_id']] = $agent['uri'];
            }

            $agentThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($agentIds)) . ")
            ";
            $agentThumbnailData = $this->conn->executeQuery($agentThumbnailQuery)->fetchAllAssociative();
            foreach ($agentThumbnailData as $thumbnail) {
                $agentThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $experimentation = [
                'id' => $resource['id'],
                'title' => '',
                'description' => '',
                'date' => '',
                'abstract' => '',
                'actants' => [],
                'acteurs' => [],            // <-- ajouté
                'credits' => [],
                'technicalCredits' => [],
                'associatedMedia' => [],
                'feedbacks' => [],
                'source' => '',
                'keywords' => [],
                'references' => [],
                'bibliographicCitations' => [],
                'url' => '',
                'relatedItems' => [],
                'percentage' => 0,
                'status' => '',
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : '',
                'log' => ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $experimentation['title'] = $value['value'];
                            break;
                        case 4:
                            $experimentation['description'] = $value['value'];
                            break;
                        case 7:
                            $experimentation['date'] = $value['value'];
                            break;
                        case 1418:
                            $experimentation['status'] = $value['value'];
                            break;
                        case 86:
                            $experimentation['abstract'] = $value['value'];
                            break;
                        case 581: // contributors -> actants (juste les resource id)
                            if ($value['value_resource_id']) {
                                $experimentation['acteurs'][] = $value['value_resource_id'];
                            }
                            break;
                        case 386: // agents -> acteurs (juste les resource id)
                        case 235:
                            if ($value['value_resource_id']) {
                                $experimentation['actants'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2145:
                            if ($value['value_resource_id']) {
                                $experimentation['technicalCredits'][] = $value['value_resource_id'];
                            }
                            break;
                        case 438:
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $experimentation['associatedMedia'][] =
                                        $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
                                }
                            }
                            break;
                        case 1606:
                            if ($value['value_resource_id']) {
                                $experimentation['feedbacks'][] = $value['value_resource_id'];
                            }
                            break;
                        case 11:
                            $experimentation['source'] = $value['uri'];
                            break;
                        case 2097:
                            if ($value['value_resource_id']) {
                                $experimentation['keywords'][] = $value['value_resource_id'];
                            }
                            break;
                        case 36:
                            if ($value['value_resource_id']) {
                                $experimentation['references'][] = $value['value_resource_id'];
                            }
                            break;
                        case 48:
                            if ($value['value_resource_id']) {
                                $experimentation['bibliographicCitations'][] = $value['value_resource_id'];
                            }
                            break;
                        case 1517:
                            $experimentation['url'] = $value['uri'];
                            break;
                        case 937:
                            if ($value['value_resource_id']) {
                                $experimentation['relatedItems'][] = $value['value_resource_id'];
                            }
                            break;
                        case 1701:
                            if ($value['storage_id'] && $value['extension']) {
                                $experimentation['picture'] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                            }
                            break;
                        case 1263:
                            $experimentation['percentage'] = $value['value'];
                            break;
                    }
                }
            }

            if (count($experimentation['actants']) === 0) {
                $experimentation['log'] .= (strlen($experimentation['log']) ? "\n" : "")
                    . "Aucun actant détecté pour la ressource " . $resource['id'] . " (vérifier les valeurs de propriété 581).";
            }

            $result[] = $experimentation;
        }

        return $result;
    }

    function getExperimentationsStudents()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 127
            AND r.is_public = 1
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 4, 7, 1418, 86, 386, 235, 2145, 438, 1606, 11, 2097, 36, 48, 1517, 937, 1701, 1263, 581)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Logos/thumbnails (de l'item lui-même)
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $logoMap = [];
        foreach ($logos as $logo) {
            $logoMap[$logo['item_id']] = $logo['logo'];
        }

        // Médias associés
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                $associatedMediaMap[$media['resource_id']] = $media['media_file'];
            }
        }

        // URIs, thumbnails, titles pour références/citations (36 / 48)
        $referencesAndCitationsIds = [];
        foreach ($values as $value) {
            if (($value['property_id'] == 36 || $value['property_id'] == 48) && $value['value_resource_id']) {
                $referencesAndCitationsIds[] = $value['value_resource_id'];
            }
        }

        $uriMap = [];
        $thumbnailMap = [];
        $titleMap = [];
        if (!empty($referencesAndCitationsIds)) {
            $uriTitleQuery = "
                SELECT v.resource_id, v.uri, v.value, v.property_id
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
                AND v.property_id IN (121, 1)
            ";
            $uriTitleData = $this->conn->executeQuery($uriTitleQuery)->fetchAllAssociative();

            foreach ($uriTitleData as $data) {
                if ($data['property_id'] == 121) {
                    $uriMap[$data['resource_id']] = $data['uri'];
                } elseif ($data['property_id'] == 1) {
                    $titleMap[$data['resource_id']] = $data['value'];
                }
            }

            $thumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
            ";
            $thumbnailData = $this->conn->executeQuery($thumbnailQuery)->fetchAllAssociative();
            foreach ($thumbnailData as $thumbnail) {
                $thumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // Cartouche complet pour credits (235)
        $creditIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 235 && $value['value_resource_id']) {
                $creditIds[] = $value['value_resource_id'];
            }
        }

        $creditMap = [];
        if (!empty($creditIds)) {
            $creditTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creditIds)) . ")
                AND v.property_id = 1
            ";
            $creditTitleData = $this->conn->executeQuery($creditTitleQuery)->fetchAllAssociative();
            foreach ($creditTitleData as $credit) {
                if (!isset($creditMap[$credit['resource_id']])) {
                    $creditMap[$credit['resource_id']] = [];
                }
                $creditMap[$credit['resource_id']]['display_title'] = $credit['value'];
            }

            $creditThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($creditIds)) . ")
            ";
            $creditThumbnailData = $this->conn->executeQuery($creditThumbnailQuery)->fetchAllAssociative();
            foreach ($creditThumbnailData as $thumbnail) {
                if (!isset($creditMap[$thumbnail['item_id']])) {
                    $creditMap[$thumbnail['item_id']] = [];
                }
                $creditMap[$thumbnail['item_id']]['thumbnail_url'] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // MÊME TRAITEMENT QUE getOeuvres: contributeurs (581) -> actants détaillés
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 581 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $contributorMap = [];
        $contributorThumbnailMap = [];
        $contributorPageMap = [];
        if (!empty($contributorIds)) {
            $contributorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorNameData = $this->conn->executeQuery($contributorNameQuery)->fetchAllAssociative();
            foreach ($contributorNameData as $contributor) {
                $contributorMap[$contributor['resource_id']] = $contributor['value'];
            }

            $contributorPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 174
            ";
            $contributorPageData = $this->conn->executeQuery($contributorPageQuery)->fetchAllAssociative();
            foreach ($contributorPageData as $contributor) {
                $contributorPageMap[$contributor['resource_id']] = $contributor['uri'];
            }

            $contributorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($contributorIds)) . ")
            ";
            $contributorThumbnailData = $this->conn->executeQuery($contributorThumbnailQuery)->fetchAllAssociative();
            foreach ($contributorThumbnailData as $thumbnail) {
                $contributorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // MÊME TRAITEMENT QUE getOeuvres: agents (386) -> acteurs détaillés
        $agentIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 386 && $value['value_resource_id']) {
                $agentIds[] = $value['value_resource_id'];
            }
        }

        $agentMap = [];
        $agentThumbnailMap = [];
        $agentPageMap = [];
        if (!empty($agentIds)) {
            $agentNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 1
            ";
            $agentNameData = $this->conn->executeQuery($agentNameQuery)->fetchAllAssociative();
            foreach ($agentNameData as $agent) {
                $agentMap[$agent['resource_id']] = $agent['value'];
            }

            $agentPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 174
            ";
            $agentPageData = $this->conn->executeQuery($agentPageQuery)->fetchAllAssociative();
            foreach ($agentPageData as $agent) {
                $agentPageMap[$agent['resource_id']] = $agent['uri'];
            }

            $agentThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($agentIds)) . ")
            ";
            $agentThumbnailData = $this->conn->executeQuery($agentThumbnailQuery)->fetchAllAssociative();
            foreach ($agentThumbnailData as $thumbnail) {
                $agentThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $experimentation = [
                'id' => $resource['id'],
                'title' => '',
                'description' => '',
                'date' => '',
                'abstract' => '',
                'actants' => [],
                'acteurs' => [],            // <-- ajouté
                'credits' => [],
                'technicalCredits' => [],
                'associatedMedia' => [],
                'feedbacks' => [],
                'source' => '',
                'concepts' => [],
                'references' => [],
                'bibliographicCitations' => [],
                'url' => '',
                'relatedItems' => [],
                'percentage' => 0,
                'status' => '',
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : '',
                'log' => ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                            $experimentation['title'] = $value['value'];
                            break;
                        case 4:
                            $experimentation['description'] = $value['value'];
                            break;
                        case 7:
                            $experimentation['date'] = $value['value'];
                            break;
                        case 1418:
                            $experimentation['status'] = $value['value'];
                            break;
                        case 86:
                            $experimentation['abstract'] = $value['value'];
                            break;
                        case 581: // contributors -> actants (juste les resource id)
                            if ($value['value_resource_id']) {
                                $experimentation['acteurs'][] = $value['value_resource_id'];
                            }
                            break;
                        case 386:
                        case 235:
                            if ($value['value_resource_id']) {
                                $experimentation['actants'][] = $value['value_resource_id'];
                            }
                            break;
                        case 2145:
                            if ($value['value_resource_id']) {
                                $experimentation['technicalCredits'][] = $value['value_resource_id'];
                            }
                            break;
                        case 438:
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $experimentation['associatedMedia'][] =
                                        $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
                                }
                            }
                            break;
                        case 1606:
                            if ($value['value_resource_id']) {
                                $experimentation['feedbacks'][] = $value['value_resource_id'];
                            }
                            break;
                        case 11:
                            $experimentation['source'] = $value['uri'];
                            break;
                        case 2097:
                            if ($value['value_resource_id']) {
                                $experimentation['concepts'][] = $value['value_resource_id'];
                            }
                            break;
                        case 36:
                            if ($value['value_resource_id']) {
                                $experimentation['references'][] = $value['value_resource_id'];
                            }
                            break;
                        case 48:
                            if ($value['value_resource_id']) {
                                $experimentation['bibliographicCitations'][] = $value['value_resource_id'];
                            }
                            break;
                        case 1517:
                            $experimentation['url'] = $value['uri'];
                            break;
                        case 937:
                            if ($value['value_resource_id']) {
                                $experimentation['relatedItems'][] = $value['value_resource_id'];
                            }
                            break;
                        case 1701:
                            if ($value['storage_id'] && $value['extension']) {
                                $experimentation['picture'] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                            }
                            break;
                        case 1263:
                            $experimentation['percentage'] = $value['value'];
                            break;
                    }
                }
            }

            if (count($experimentation['actants']) === 0) {
                $experimentation['log'] .= (strlen($experimentation['log']) ? "\n" : "")
                    . "Aucun actant détecté pour la ressource " . $resource['id'] . " (vérifier les valeurs de propriété 581).";
            }

            $result[] = $experimentation;
        }

        return $result;
    }


    /**
     * Récupère tous les outils (eclap:Tool)
     * Template ID: 114
     *
     * @return array Liste des outils avec leurs propriétés
     */
    function getTools()
    {
        // 1. REQUÊTE PRINCIPALE : Récupération des IDs
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 114
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2. REQUÊTE DES VALEURS : Récupération des propriétés
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 4, 6, 33, 193, 1701, 3243, 3253, 3254, 3255, 3264, 3266, 3249, 3276, 3277, 438)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // 3. MAPS DES RESSOURCES LIÉES

        // 3.1 Thumbnail principal (logo)
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();

        $logoMap = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                $logoMap[$logo['item_id']] = $logo['logo'];
            }
        }

        // 3.2 Associated Media (property_id 438)
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                $associatedMediaMap[$media['resource_id']] = $media['media_file'];
            }
        }

        // 3.3 Programming Languages (property_id 3276)
        $programmingLanguageIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 3276 && $value['value_resource_id']) {
                $programmingLanguageIds[] = $value['value_resource_id'];
            }
        }

        $programmingLanguageMap = [];
        $programmingLanguageThumbnailMap = [];
        if (!empty($programmingLanguageIds)) {
            // Map des titres
            $programmingLanguageTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($programmingLanguageIds)) . ")
                AND v.property_id = 1
            ";
            $programmingLanguageTitleData = $this->conn->executeQuery($programmingLanguageTitleQuery)->fetchAllAssociative();

            foreach ($programmingLanguageTitleData as $title) {
                $programmingLanguageMap[$title['resource_id']] = $title['value'];
            }

            // Map des thumbnails
            $programmingLanguageThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($programmingLanguageIds)) . ")
            ";
            $programmingLanguageThumbnailData = $this->conn->executeQuery($programmingLanguageThumbnailQuery)->fetchAllAssociative();

            foreach ($programmingLanguageThumbnailData as $thumbnail) {
                if (!empty($thumbnail['thumbnail'])) {
                    $programmingLanguageThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 3.4 Contributors (property_id 6)
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 6 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $contributorMap = [];
        $contributorThumbnailMap = [];
        if (!empty($contributorIds)) {
            // Map des titres
            $contributorTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorTitleData = $this->conn->executeQuery($contributorTitleQuery)->fetchAllAssociative();

            foreach ($contributorTitleData as $title) {
                $contributorMap[$title['resource_id']] = $title['value'];
            }

            // Map des thumbnails
            $contributorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($contributorIds)) . ")
            ";
            $contributorThumbnailData = $this->conn->executeQuery($contributorThumbnailQuery)->fetchAllAssociative();

            foreach ($contributorThumbnailData as $thumbnail) {
                if (!empty($thumbnail['thumbnail'])) {
                    $contributorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 3.5 Is Part Of (property_id 33)
        $isPartOfIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 33 && $value['value_resource_id']) {
                $isPartOfIds[] = $value['value_resource_id'];
            }
        }

        $isPartOfMap = [];
        $isPartOfThumbnailMap = [];
        if (!empty($isPartOfIds)) {
            // Map des titres
            $isPartOfTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($isPartOfIds)) . ")
                AND v.property_id = 1
            ";
            $isPartOfTitleData = $this->conn->executeQuery($isPartOfTitleQuery)->fetchAllAssociative();

            foreach ($isPartOfTitleData as $title) {
                $isPartOfMap[$title['resource_id']] = $title['value'];
            }

            // Map des thumbnails
            $isPartOfThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($isPartOfIds)) . ")
            ";
            $isPartOfThumbnailData = $this->conn->executeQuery($isPartOfThumbnailQuery)->fetchAllAssociative();

            foreach ($isPartOfThumbnailData as $thumbnail) {
                if (!empty($thumbnail['thumbnail'])) {
                    $isPartOfThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 4. CONSTRUCTION DU RÉSULTAT
        $result = [];
        foreach ($resources as $resource) {
            $tool = [
                'id' => $resource['id'],
                'title' => '',
                'description' => '',
                'category' => '',
                'purpose' => '',
                'release' => '',
                'operatingSystem' => '',
                'fileRelease' => '',
                'license' => '',
                'repository' => '',
                'homepage' => '',
                'bugDatabase' => '',
                'programmingLanguages' => [],
                'associatedMedia' => [],
                'contributors' => [],
                'isPartOf' => null,
                'picture' => '',
                'thumbnail' => isset($logoMap[$resource['id']])
                    ? $this->generateThumbnailUrl($logoMap[$resource['id']])
                    : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $tool['title'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            $tool['description'] = $value['value'];
                            break;

                        case 6: // dcterms:contributor
                            if ($value['value_resource_id']) {
                                $contributorId = $value['value_resource_id'];
                                $tool['contributors'][] = [
                                    'id' => $contributorId,
                                    'name' => $contributorMap[$contributorId] ?? null,
                                    'thumbnail' => $contributorThumbnailMap[$contributorId] ?? null
                                ];
                            }
                            break;

                        case 33: // dcterms:isPartOf
                            if ($value['value_resource_id']) {
                                $isPartOfId = $value['value_resource_id'];
                                $tool['isPartOf'] = [
                                    'id' => $isPartOfId,
                                    'title' => $isPartOfMap[$isPartOfId] ?? null,
                                    'thumbnail' => $isPartOfThumbnailMap[$isPartOfId] ?? null
                                ];
                            }
                            break;

                        case 193: // oa:hasPurpose
                            $tool['purpose'] = $value['value'];
                            break;

                        case 3253: // DOAP:category
                            $tool['category'] = $value['value'];
                            break;

                        case 1701: // schema:image
                            if ($value['storage_id'] && $value['extension']) {
                                $tool['picture'] = $this->generateThumbnailUrl(
                                    $value['storage_id'],
                                    $value['extension']
                                );
                            }
                            break;

                        case 3243: // DOAP:homepage
                            $tool['homepage'] = $value['uri'];
                            break;

                        case 3254: // DOAP:license
                            $tool['license'] = $value['value'];
                            break;

                        case 3255: // DOAP:repository
                            $tool['repository'] = $value['uri'];
                            break;

                        case 3264: // DOAP:file-release
                            $tool['fileRelease'] = $value['value'];
                            break;

                        case 3266: // DOAP:bug-database
                            $tool['bugDatabase'] = $value['uri'];
                            break;

                        case 3249: // DOAP:release
                            $tool['release'] = $value['value'];
                            break;

                        case 3276: // DOAP:programming-language
                            if ($value['value_resource_id']) {
                                $programmingLanguageId = $value['value_resource_id'];
                                $tool['programmingLanguages'][] = [
                                    'id' => $programmingLanguageId,
                                    'name' => $programmingLanguageMap[$programmingLanguageId] ?? null,
                                    'thumbnail' => $programmingLanguageThumbnailMap[$programmingLanguageId] ?? null
                                ];
                            }
                            break;

                        case 3277: // DOAP:os
                            $tool['operatingSystem'] = $value['value'];
                            break;

                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $tool['associatedMedia'][] =
                                        $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
                                }
                            }
                            break;
                    }
                }
            }

            $result[] = $tool;
        }

        // 5. RETURN DU RÉSULTAT
        return $result;
    }


    function getFeedbacks()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 110
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 4, 438, 2355, 103, 313, 52, 581, 305, 1198, 14, 1705)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Requête pour récupérer les logos/thumbnails
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $logoMap = [];
        foreach ($logos as $logo) {
            $logoMap[$logo['item_id']] = $logo['logo'];
        }

        // Récupérer tous les IDs des médias associés pour construire une requête unique
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) { // schema:associatedMedia
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        // Requête pour récupérer les informations des médias associés (approche UNION)
        $associatedMediaMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                $associatedMediaMap[$media['resource_id']] = $media['media_file'];
            }
        }

        // Récupérer les informations des contributeurs
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 581 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $contributorMap = [];
        $contributorThumbnailMap = [];
        if (!empty($contributorIds)) {
            // Récupérer les noms des contributeurs
            $contributorQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorData = $this->conn->executeQuery($contributorQuery)->fetchAllAssociative();

            foreach ($contributorData as $contributor) {
                $contributorMap[$contributor['resource_id']] = $contributor['value'];
            }

            // Récupérer les thumbnails des contributeurs
            $contributorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($contributorIds)) . ")
            ";
            $contributorThumbnailData = $this->conn->executeQuery($contributorThumbnailQuery)->fetchAllAssociative();

            foreach ($contributorThumbnailData as $thumbnail) {
                $contributorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $feedback = [
                'id' => $resource['id'],
                'title' => '',
                'description' => '',
                'associatedMedia' => [],
                'achievements' => '',
                'issues' => '',
                'methodsUsed' => '',
                'instructionalMethod' => '',
                'contributors' => [],
                'reviews' => '',
                'potentialActions' => '',
                'coverage' => '',
                'workExamples' => '',
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : '',
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $feedback['title'] = $value['value'];
                            break;
                        case 4: // dcterms:description
                            $feedback['description'] = $value['value'];
                            break;
                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                // Utiliser le map des médias associés pour générer l'URL
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $feedback['associatedMedia'][] =
                                        $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
                                }
                            }
                            break;
                        case 2355: // drama:achieves
                            $feedback['achievements'] = $value['value'];
                            break;
                        case 103: // bibo:issue
                            $feedback['issues'] = $value['value'];
                            break;
                        case 313: // cito:usesMethodIn
                            $feedback['methodsUsed'] = $value['value'];
                            break;
                        case 52: // dcterms:instructionalMethod
                            $feedback['instructionalMethod'] = $value['value'];
                            break;
                        case 581: // schema:contributor
                            if ($value['value_resource_id']) {
                                $contributorId = $value['value_resource_id'];
                                $contributorName = isset($contributorMap[$contributorId]) ? $contributorMap[$contributorId] : null;
                                $contributorThumbnail = isset($contributorThumbnailMap[$contributorId]) ? $contributorThumbnailMap[$contributorId] : null;
                                $feedback['contributors'][] = [
                                    'id' => $contributorId,
                                    'name' => $contributorName,
                                    'thumbnail' => $contributorThumbnail
                                ];
                            }
                            break;
                        case 305: // cito:reviews
                            $feedback['reviews'] = $value['value'];
                            break;
                        case 1198: // schema:potentialAction
                            $feedback['potentialActions'] = $value['value'];
                            break;
                        case 14: // dcterms:coverage
                            $feedback['coverage'] = $value['value'];
                            break;
                        case 1705: // schema:workExample
                            $feedback['workExamples'] = $value['value'];
                            break;
                    }
                }
            }

            $result[] = $feedback;
        }

        return $result;
    }


    function getOeuvres()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 103
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');


        // MODIFICATION: Ajouter la propriété 386 (schema:agent) pour les acteurs
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 4, 7, 19, 26, 36, 48, 386,428, 438, 461, 1517, 581, 2145, 2097,2355, 3236, 3237, 3233, 3238, 3239, 2079, 3235, 3240, 2080, 1621)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // DEBUG: Vérifier les archives
        $archiveCount = 0;
        foreach ($values as $value) {
            if ($value['property_id'] == 2355) {
                $archiveCount++;
                error_log("Archive trouvée - Resource ID: " . $value['resource_id'] . ", Value: " . ($value['value'] ?? 'NULL') . ", Value Resource ID: " . ($value['value_resource_id'] ?? 'NULL'));
            }
        }
        error_log("Nombre total d'archives trouvées: " . $archiveCount);


        // Requête pour récupérer les logos/thumbnails
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";

        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();

        $logoMap = [];
        $processedItems = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                if (!in_array($logo['item_id'], $processedItems)) {
                    $logoMap[$logo['item_id']] = $logo['logo'];
                    $processedItems[] = $logo['item_id'];
                }
            }
        }

        // Récupérer tous les IDs des médias associés
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        // Requête pour récupérer les informations des médias associés
        $associatedMediaMap = [];
        $associatedMediaUriMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                // Si c'est une vidéo YouTube, utiliser la source
                if ($media['ingester'] === 'youtube' && !empty($media['source'])) {
                    $associatedMediaMap[$media['resource_id']] = $media['source'];
                }
                // Sinon, utiliser le fichier normal
                elseif (!empty($media['media_file'])) {
                    $associatedMediaMap[$media['resource_id']] = $media['media_file'];
                }
            }

            // Récupérer les URIs des médias associés (pour les vidéos YouTube)
            $associatedMediaUriQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($associatedMediaIds)) . ")
                AND v.property_id = 121
            ";
            $associatedMediaUriData = $this->conn->executeQuery($associatedMediaUriQuery)->fetchAllAssociative();

            foreach ($associatedMediaUriData as $uriData) {
                $associatedMediaUriMap[$uriData['resource_id']] = $uriData['uri'];
            }
        }

        // Récupérer les URIs, thumbnails et titles pour les références et citations bibliographiques
        $referencesAndCitationsIds = [];
        foreach ($values as $value) {
            if (($value['property_id'] == 36 || $value['property_id'] == 48) && $value['value_resource_id']) {
                $referencesAndCitationsIds[] = $value['value_resource_id'];
            }
        }


        $uriMap = [];
        $thumbnailMap = [];
        $titleMap = [];
        if (!empty($referencesAndCitationsIds)) {
            // Récupérer les URIs et titles
            $uriTitleQuery = "
                SELECT v.resource_id, v.uri, v.value, v.property_id
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
                AND v.property_id IN (121, 1)
            ";
            $uriTitleData = $this->conn->executeQuery($uriTitleQuery)->fetchAllAssociative();

            foreach ($uriTitleData as $data) {
                if ($data['property_id'] == 121) { // bibo:uri
                    $uriMap[$data['resource_id']] = $data['uri'];
                } elseif ($data['property_id'] == 1) { // dcterms:title
                    $titleMap[$data['resource_id']] = $data['value'];
                }
            }



            // Récupérer les thumbnails
            $thumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($referencesAndCitationsIds)) . ")
            ";
            $thumbnailData = $this->conn->executeQuery($thumbnailQuery)->fetchAllAssociative();

            foreach ($thumbnailData as $thumbnail) {
                $thumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // AJOUT: Récupérer les informations des contributeurs (propriété 581)
        $contributorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 581 && $value['value_resource_id']) {
                $contributorIds[] = $value['value_resource_id'];
            }
        }

        $genreIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1621 && $value['value_resource_id']) {
                $genreIds[] = $value['value_resource_id'];
            }
        }

        $genreMap = [];
        if (!empty($genreIds)) {
            $genreNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($genreIds)) . ")
                AND v.property_id = 1
            ";
            $genreNameData = $this->conn->executeQuery($genreNameQuery)->fetchAllAssociative();

            foreach ($genreNameData as $genre) {
                $genreMap[$genre['resource_id']] = $genre['value'];
            }
        }

        $contributorMap = [];
        $contributorThumbnailMap = [];
        $contributorPageMap = [];
        if (!empty($contributorIds)) {
            // Récupérer les noms des contributeurs (propriété 1)
            $contributorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 1
            ";
            $contributorNameData = $this->conn->executeQuery($contributorNameQuery)->fetchAllAssociative();

            foreach ($contributorNameData as $contributor) {
                $contributorMap[$contributor['resource_id']] = $contributor['value'];
            }

            // Récupérer les pages des contributeurs (propriété 174)
            $contributorPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($contributorIds)) . ")
                AND v.property_id = 174
            ";
            $contributorPageData = $this->conn->executeQuery($contributorPageQuery)->fetchAllAssociative();

            foreach ($contributorPageData as $contributor) {
                $contributorPageMap[$contributor['resource_id']] = $contributor['uri'];
            }

            // Récupérer les thumbnails des contributeurs
            $contributorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($contributorIds)) . ")
            ";
            $contributorThumbnailData = $this->conn->executeQuery($contributorThumbnailQuery)->fetchAllAssociative();

            foreach ($contributorThumbnailData as $thumbnail) {
                $contributorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // AJOUT: Récupérer les informations des agents/acteurs (propriété 386)
        $agentIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 386 && $value['value_resource_id']) {
                $agentIds[] = $value['value_resource_id'];
            }
        }

        $agentMap = [];
        $agentThumbnailMap = [];
        $agentPageMap = [];
        if (!empty($agentIds)) {
            // Récupérer les noms des agents (propriété 1)
            $agentNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 1
            ";
            $agentNameData = $this->conn->executeQuery($agentNameQuery)->fetchAllAssociative();

            foreach ($agentNameData as $agent) {
                $agentMap[$agent['resource_id']] = $agent['value'];
            }

            // Récupérer les pages des agents (propriété 174)
            $agentPageQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($agentIds)) . ")
                AND v.property_id = 174
            ";
            $agentPageData = $this->conn->executeQuery($agentPageQuery)->fetchAllAssociative();

            foreach ($agentPageData as $agent) {
                $agentPageMap[$agent['resource_id']] = $agent['uri'];
            }

            // Récupérer les thumbnails des agents
            $agentThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($agentIds)) . ")
            ";
            $agentThumbnailData = $this->conn->executeQuery($agentThumbnailQuery)->fetchAllAssociative();

            foreach ($agentThumbnailData as $thumbnail) {
                $agentThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // Récupérer les informations des concepts, thèmes, processus, affects, scénarios, rôles, risques, mondes
        $linkedResourceIds = [];
        $linkedProperties = [2097, 3233, 3238, 3239, 2079, 3235, 3240, 2080];

        foreach ($values as $value) {
            if (in_array($value['property_id'], $linkedProperties) && $value['value_resource_id']) {
                $linkedResourceIds[] = $value['value_resource_id'];
            }
        }

        $linkedResourceMap = [];
        if (!empty($linkedResourceIds)) {
            // Récupérer les titres des ressources liées
            $linkedResourceQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($linkedResourceIds)) . ")
                AND v.property_id = 1
            ";
            $linkedResourceData = $this->conn->executeQuery($linkedResourceQuery)->fetchAllAssociative();

            foreach ($linkedResourceData as $data) {
                $linkedResourceMap[$data['resource_id']] = $data['value'];
            }
        }

        // Récupérer spécifiquement les archives et leurs sources
        $archiveIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2355 && $value['value_resource_id']) {
                $archiveIds[] = $value['value_resource_id'];
            }
        }

        $archiveSourceMap = [];
        $archiveTitleMap = [];
        if (!empty($archiveIds)) {
            // Récupérer les sources des archives depuis la table media
            $archiveSourceQuery = "
                SELECT m.id, m.source
                FROM `media` m
                WHERE m.id IN (" . implode(',', array_unique($archiveIds)) . ")
            ";
            $archiveSourceData = $this->conn->executeQuery($archiveSourceQuery)->fetchAllAssociative();

            foreach ($archiveSourceData as $data) {
                $archiveSourceMap[$data['id']] = $data['source'];
            }

            // Récupérer les titres des archives
            $archiveTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($archiveIds)) . ")
                AND v.property_id = 1
            ";
            $archiveTitleData = $this->conn->executeQuery($archiveTitleQuery)->fetchAllAssociative();

            foreach ($archiveTitleData as $data) {
                $archiveTitleMap[$data['resource_id']] = $data['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $recit_artistique = [
                'id' => $resource['id'],
                'title' => '',
                'annotations' => [],
                'date' => '',
                'abstract' => '',
                'actants' => [],
                'personne' => [],
                'credits' => "",
                'associatedMedia' => [],
                'url' => [],
                'keywords' => [],
                'archives' => [],
                'genre' => "",
                'elementsEsthetique' => [],
                'elementsNarratifs' => [],
                'referencesScient' => [],
                'referencesCultu' => [],
                'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : '',

            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $recit_artistique['title'] = $value['value'];
                            break;
                        case 4: // dcterms:description
                            $recit_artistique['annotations'][] = $value['value_resource_id'];
                            break;
                        case 7: // dcterms:date
                            $recit_artistique['date'] = $value['value'];
                            break;
                        case 19: // dcterms:abstract
                            $recit_artistique['abstract'] = $value['value'];
                            break;
                        case 26: // dcterms:medium
                            $recit_artistique['medium'] = $value['value'];
                            break;
                        case 581: // schema:contributor
                            if ($value['value_resource_id']) {
                                $contributorId = $value['value_resource_id'];
                                $contributorName = isset($contributorMap[$contributorId]) ? $contributorMap[$contributorId] : null;
                                $contributorThumbnail = isset($contributorThumbnailMap[$contributorId]) ? $contributorThumbnailMap[$contributorId] : null;
                                $contributorPage = isset($contributorPageMap[$contributorId]) ? $contributorPageMap[$contributorId] : null;
                                $recit_artistique['actants'][] = [
                                    'id' => $contributorId,
                                    'name' => $contributorName,
                                    'thumbnail' => $contributorThumbnail,
                                    'page' => $contributorPage
                                ];
                            }
                            break;
                        case 1621:
                            if (!empty($value['value_resource_id'])) {
                                $genreId = $value['value_resource_id'];
                                $genreName = isset($genreMap[$genreId]) ? $genreMap[$genreId] : '';
                                if (!empty($genreName)) {
                                    $recit_artistique['genre'] = $genreName;
                                }
                            }
                            break;
                        case 386: // schema:agent - AJOUT DU NOUVEAU CAS
                            if ($value['value_resource_id']) {
                                $agentId = $value['value_resource_id'];

                                $recit_artistique['personne'][] = $agentId;
                            }
                            break;
                        case 461: // schema:elementsNarratifs
                            if ($value['value_resource_id']) {
                                $elementsNarratifsId = $value['value_resource_id'];
                                $recit_artistique['elementsNarratifs'][] = $elementsNarratifsId;
                            }
                            break;
                        case 428: // schema:elementsEsthetique
                            if ($value['value_resource_id']) {
                                $elementsEsthetiqueId = $value['value_resource_id'];
                                $recit_artistique['elementsEsthetique'][] = $elementsEsthetiqueId;
                            }
                            break;
                        case 2145: // theatre:credit
                            $recit_artistique['credits'] = $value['uri'];
                            break;
                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $mediaUrl = $associatedMediaMap[$mediaId];
                                    // Si c'est une URL YouTube, retourner un objet avec url
                                    if (strpos($mediaUrl, 'youtube.com') !== false || strpos($mediaUrl, 'youtu.be') !== false) {
                                        $recit_artistique['associatedMedia'][] = [
                                            'id' => $mediaId,
                                            'url' => $mediaUrl,
                                            'thumbnail' => null
                                        ];
                                    } else {
                                        // Sinon, retourner juste l'URL du thumbnail comme string
                                        $recit_artistique['associatedMedia'][] = $this->generateThumbnailUrl($mediaUrl);
                                    }
                                }
                            }
                            break;
                        case 1517: // schema:url
                            $recit_artistique['url'][] = $value['uri'];
                            break;
                        case 36:
                            if ($value['value_resource_id']) {
                                $recit_artistique['referencesScient'][] = $value['value_resource_id'];
                            }
                            break;
                        case 48:
                            if ($value['value_resource_id']) {
                                $recit_artistique['referencesCultu'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2097: // jdc:hasConcept
                            if ($value['value_resource_id']) {
                                $conceptId = $value['value_resource_id'];
                                $recit_artistique['keywords'][] = isset($linkedResourceMap[$conceptId]) ? $linkedResourceMap[$conceptId] : '';
                            }
                            break;
                        case 2355: // Archive
                            error_log("Traitement archive - Resource ID: " . $resource['id'] . ", Value: " . ($value['value'] ?? 'NULL') . ", Value Resource ID: " . ($value['value_resource_id'] ?? 'NULL'));
                            if ($value['value_resource_id']) {
                                // Archive liée à une ressource
                                $archiveId = $value['value_resource_id'];
                                $archiveTitle = isset($archiveTitleMap[$archiveId]) ? $archiveTitleMap[$archiveId] : '';
                                $archiveSource = isset($archiveSourceMap[$archiveId]) ? $archiveSourceMap[$archiveId] : '';
                                error_log("Archive liée - ID: " . $archiveId . ", Title: " . $archiveTitle . ", Source: " . $archiveSource);
                                $recit_artistique['archives'][] = [
                                    'id' => $archiveId,
                                    'title' => $archiveTitle,
                                    'source' => $archiveSource
                                ];
                            } else if (!empty($value['value'])) {
                                // Archive comme valeur textuelle simple
                                error_log("Archive simple - Value: " . $value['value']);
                                $recit_artistique['archives'][] = [
                                    'id' => null,
                                    'title' => $value['value'],
                                    'source' => null
                                ];
                            }
                            break;
                        case 3233: // storyline:hasTheme
                            if ($value['value_resource_id']) {
                                $themeId = $value['value_resource_id'];
                                $recit_artistique['themes'][] = isset($linkedResourceMap[$themeId]) ? $linkedResourceMap[$themeId] : '';
                            }
                            break;
                        case 3238: // storyline:hasProcess
                            if ($value['value_resource_id']) {
                                $processId = $value['value_resource_id'];
                                $recit_artistique['processes'][] = isset($linkedResourceMap[$processId]) ? $linkedResourceMap[$processId] : '';
                            }
                            break;
                        case 3239: // storyline:hasAffect
                            if ($value['value_resource_id']) {
                                $affectId = $value['value_resource_id'];
                                $recit_artistique['affects'][] = isset($linkedResourceMap[$affectId]) ? $linkedResourceMap[$affectId] : '';
                            }
                            break;
                        case 2079: // genstory:hasScenario
                            if ($value['value_resource_id']) {
                                $scenarioId = $value['value_resource_id'];
                                $recit_artistique['scenarios'][] = isset($linkedResourceMap[$scenarioId]) ? $linkedResourceMap[$scenarioId] : '';
                            }
                            break;
                        case 3235: // storyline:hasRole
                            if ($value['value_resource_id']) {
                                $roleId = $value['value_resource_id'];
                                $recit_artistique['roles'][] = isset($linkedResourceMap[$roleId]) ? $linkedResourceMap[$roleId] : '';
                            }
                            break;
                        case 3240: // storyline:hasRisk
                            if ($value['value_resource_id']) {
                                $riskId = $value['value_resource_id'];
                                $recit_artistique['risks'][] = isset($linkedResourceMap[$riskId]) ? $linkedResourceMap[$riskId] : '';
                            }
                            break;
                        case 2080: // genstory:hasMonde
                            if ($value['value_resource_id']) {
                                $mondeId = $value['value_resource_id'];
                                $recit_artistique['mondes'][] = isset($linkedResourceMap[$mondeId]) ? $linkedResourceMap[$mondeId] : '';
                            }
                            break;
                    }
                }
            }

            $result[] = $recit_artistique;
        }

        return $result;
    }

    function getPersonnes()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 33
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les propriétés des personnes (mise à jour des property_id)
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (138, 139, 140, 182, 961, 595, 4, 11)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Récupérer les thumbnails
        $thumbnailQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";

        $thumbnails = $this->conn->executeQuery($thumbnailQuery)->fetchAllAssociative();

        $thumbnailMap = [];
        foreach ($thumbnails as $thumbnail) {
            if (!empty($thumbnail['thumbnail']) && !empty($thumbnail['item_id'])) {
                $thumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // Récupérer les informations des relations (jobTitle et countryOfOrigin)
        $relationIds = [];
        foreach ($values as $value) {
            if (($value['property_id'] == 961 || $value['property_id'] == 595) && $value['value_resource_id']) {
                $relationIds[] = $value['value_resource_id'];
            }
        }

        $relationMap = [];
        if (!empty($relationIds)) {
            // Récupérer les titres des relations
            $relationTitleQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($relationIds)) . ")
                AND v.property_id = 1
            ";
            $relationTitleData = $this->conn->executeQuery($relationTitleQuery)->fetchAllAssociative();

            foreach ($relationTitleData as $relation) {
                $relationMap[$relation['resource_id']] = $relation['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $personne = [
                'id' => $resource['id'],
                'name' => '',
                'firstName' => '',
                'lastName' => '',
                'birthday' => '',
                'jobTitle' => [],
                'countryOfOrigin' => [],
                'description' => '',
                'source' => '',
                'picture' => isset($thumbnailMap[$resource['id']]) ? $thumbnailMap[$resource['id']] : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 138: // foaf:name
                            $personne['name'] = $value['value'];
                            break;
                        case 139: // foaf:firstName
                            $personne['firstName'] = $value['value'];
                            break;
                        case 140: // foaf:lastName
                            $personne['lastName'] = $value['value'];
                            break;
                        case 182: // foaf:birthday
                            $personne['birthday'] = $value['value'];
                            break;
                        case 961: // schema:jobTitle
                            if ($value['value_resource_id']) {
                                $jobTitleId = $value['value_resource_id'];
                                $personne['jobTitle'][] = [
                                    'id' => $jobTitleId,
                                    'title' => isset($relationMap[$jobTitleId]) ? $relationMap[$jobTitleId] : ''
                                ];
                            }
                            break;
                        case 595: // schema:countryOfOrigin
                            if ($value['value_resource_id']) {
                                $countryId = $value['value_resource_id'];
                                $personne['countryOfOrigin'][] = [
                                    'id' => $countryId,
                                    'name' => isset($relationMap[$countryId]) ? $relationMap[$countryId] : ''
                                ];
                            }
                            break;
                        case 4: // dcterms:description
                            $personne['description'] = $value['value'];
                            break;
                        case 11: // dcterms:source
                            $personne['source'] = $value['uri'];
                            break;
                    }
                }
            }

            $result[] = $personne;
        }

        return $result;
    }

    /**
     * Retourne le mapping term → id pour un template donné
     * @param array $params ['template_id' => 127]
     * @return array { "dcterms:title": 1, "fup8:percentage": 1263, ... }
     */
    function getTemplateProperties($params)
    {
        if (empty($params['template_id'])) {
            return ['error' => 'template_id required'];
        }

        $templateId = intval($params['template_id']);

        $sql = "
            SELECT p.id, CONCAT(v.prefix, ':', p.local_name) as term
            FROM resource_template_property rtp
            JOIN property p ON rtp.property_id = p.id
            JOIN vocabulary v ON p.vocabulary_id = v.id
            WHERE rtp.resource_template_id = ?
        ";

        $properties = $this->conn->executeQuery($sql, [$templateId])->fetchAllAssociative();

        $map = [];
        foreach ($properties as $prop) {
            $map[$prop['term']] = intval($prop['id']);
        }

        return $map;
    }

    function getActants()
    {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 72
            ORDER BY RAND()
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (139, 140, 1517, 1701, 3038, 3043, 3044, 724)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        $result = [];
        foreach ($resources as $resource) {
            $actant = [
                'id' => $resource['id'],
                'firstname' => '',
                'lastname' => '',
                'picture' => '',
                'mail' => '',
                'url' => '',
                'universities' => [],
                'doctoralSchools' => [],
                'laboratories' => []
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 139:
                            $actant['firstname'] = $value['value'];
                            break;
                        case 140:
                            $actant['lastname'] = $value['value'];
                            break;
                        case 1517:
                            $actant['url'] = $value['uri'];
                            break;
                        case 724:
                            $actant['mail'] = $value['value'];
                            break;
                        case 1701:
                            if ($value['storage_id'] && $value['extension']) {
                                $actant['picture'] = $this->generateThumbnailUrl($value['storage_id'], $value['extension']);
                            }
                            break;
                        case 3038:  // Universities
                            if ($value['value_resource_id']) {
                                $actant['universities'][] = $value['value_resource_id'];
                            }
                            break;
                        case 3043:  // Doctoral Schools
                            if ($value['value_resource_id']) {
                                $actant['doctoralSchools'][] = $value['value_resource_id'];
                            }
                            break;
                        case 3044:  // Laboratories
                            if ($value['value_resource_id']) {
                                $actant['laboratories'][] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $actant;
        }

        return $result;
    }


    function getNavbarEditions()
    {
        // Select editions (template 77) that have at least one conference (property 937)
        // and order by year (property 7) DESC
        // We join with value table to check for property 937 (hasConference)
        $sql = "
            SELECT DISTINCT r.id
            FROM resource r
            INNER JOIN value v_conf ON r.id = v_conf.resource_id AND v_conf.property_id = 937
            LEFT JOIN value v_year ON r.id = v_year.resource_id AND v_year.property_id = 7
            WHERE r.resource_template_id = 77
            ORDER BY v_year.value DESC
            LIMIT 300
        ";

        $resources = $this->conn->executeQuery($sql)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Fetch properties: Title (1), Year (7), Type (8), Season (1662)
        // For Type and Season, we need the display title (value of the linked resource)
        $valueQuery = "
            SELECT
                v.resource_id,
                v.value,
                v.property_id,
                v.value_resource_id,
                v_linked.value as linked_title
            FROM value v
            LEFT JOIN value v_linked ON v.value_resource_id = v_linked.resource_id AND v_linked.property_id = 1
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 7, 8, 1662)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        $result = [];
        foreach ($resources as $resource) {
            $edition = [
                'id' => $resource['id'],
                'season' => '',
                'year' => '',
                'editionType' => '',
                'editionTypeId' => 0,
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1:
                             // $edition['title'] = $value['value'];
                             break;
                        case 1662: // Season
                            $edition['season'] = $value['linked_title'] ?: '';
                            break;
                        case 7: // Year
                            $edition['year'] = $value['value'];
                            break;
                        case 8: // Type
                            $edition['editionType'] = $value['linked_title'] ?: '';
                            $edition['editionTypeId'] = $value['value_resource_id'];
                            break;
                    }
                }
            }
            $result[] = $edition;
        }

        return $result;
    }

    /**
     * Récupérer les commentaires Edisem
     *
     * @return array
     */
    function getEdisemComments()
    {
        $resourceQuery = "
            SELECT r.id, r.created, r.modified
            FROM `resource` r
            WHERE r.resource_template_id = 123
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (561, 562, 2095, 1794, 1)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // Récupérer les informations des actants liés
        $actantIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2095 && $value['value_resource_id']) {
                $actantIds[] = $value['value_resource_id'];
            }
        }

        $actantMap = [];
        if (!empty($actantIds)) {
            $actantQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($actantIds)) . ")
                AND v.property_id = 1
            ";
            $actantData = $this->conn->executeQuery($actantQuery)->fetchAllAssociative();

            foreach ($actantData as $data) {
                $actantMap[$data['resource_id']] = $data['value'];
            }
        }

        $result = [];
        foreach ($resources as $resource) {
            $comment = [
                'id' => $resource['id'],
                'created' => $resource['created'],
                'modified' => $resource['modified'],
                'contenu' => '',
                'titre' => '',
                'timestamp' => '',
                'actant' => null,
                'actantName' => '',
                'relatedResource' => null
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 561: // schema:commentText
                            $comment['contenu'] = $value['value'];
                            break;
                        case 562: // schema:commentTime
                            $comment['timestamp'] = $value['value'];
                            break;
                        case 2095: // jdc:hasActant
                            $comment['actant'] = $value['value_resource_id'];
                            $comment['actantName'] = $actantMap[$value['value_resource_id']] ?? '';
                            break;
                        case 1794: // ma:hasRelatedResource
                            $comment['relatedResource'] = $value['value_resource_id'];
                            break;
                        case 1: // dcterms:title
                            $comment['titre'] = $value['value'];
                            break;
                    }
                }
            }

            $result[] = $comment;
        }

        return $result;
    }

    /**
     * Récupérer les Objets techno-industriels
     *
     * @return array
     */
    function getRecitsTechnoIndustriels()
    {
        // 1. REQUÊTE PRINCIPALE : Récupération des IDs
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 117
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2. REQUÊTE DES VALEURS : Récupération des propriétés
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 23, 438, 1480, 408, 193, 1391, 4, 2083, 1659, 11, 1794, 2097, 33)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

        // 3. MAPS DES RESSOURCES LIÉES

        // 3.1 Thumbnail principal (logo)
        $logoQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
            FROM `media`
            WHERE item_id IN (" . implode(',', $resourceIds) . ")
        ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();

        $logoMap = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                $logoMap[$logo['item_id']] = $logo['logo'];
            }
        }

        // 3.2 Associated Media (property_id 438)
        $associatedMediaIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedMediaIds[] = $value['value_resource_id'];
            }
        }

        // Requête UNION pour récupérer les fichiers médias (images/vidéos locales)
        $associatedMediaMap = [];
        if (!empty($associatedMediaIds)) {
            $associatedMediaQuery = "
                (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
                UNION
                (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
                FROM `media`
                WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            ";
            $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

            foreach ($associatedMediaData as $media) {
                // Si c'est une vidéo YouTube, utiliser la source
                if ($media['ingester'] === 'youtube' && !empty($media['source'])) {
                    $associatedMediaMap[$media['resource_id']] = $media['source'];
                }
                // Sinon, utiliser le fichier normal
                elseif (!empty($media['media_file'])) {
                    $associatedMediaMap[$media['resource_id']] = $media['media_file'];
                }
            }
        }

        // 3.3 Tools (property_id 1480)
        $toolIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1480 && $value['value_resource_id']) {
                $toolIds[] = $value['value_resource_id'];
            }
        }

        $toolMap = [];
        $toolThumbnailMap = [];
        $toolUrlMap = [];
        if (!empty($toolIds)) {
            // Récupérer les titres des outils
            $toolNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($toolIds)) . ")
                AND v.property_id = 1
            ";
            $toolNameData = $this->conn->executeQuery($toolNameQuery)->fetchAllAssociative();

            foreach ($toolNameData as $tool) {
                $toolMap[$tool['resource_id']] = $tool['value'];
            }

            // Récupérer les URLs des outils (essayer 121, 11, puis 1517)
            $toolUrlQuery = "
                SELECT v.resource_id, v.uri, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($toolIds)) . ")
                AND v.property_id IN (121, 11, 1517)
            ";
            $toolUrlData = $this->conn->executeQuery($toolUrlQuery)->fetchAllAssociative();

            foreach ($toolUrlData as $tool) {
                // Utiliser l'URI si elle existe, sinon la valeur
                $toolUrlMap[$tool['resource_id']] = $tool['uri'] ?? $tool['value'];
            }

            // Récupérer les thumbnails des outils
            $toolThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($toolIds)) . ")
            ";
            $toolThumbnailData = $this->conn->executeQuery($toolThumbnailQuery)->fetchAllAssociative();

            foreach ($toolThumbnailData as $thumbnail) {
                $toolThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 3.4 Reviews (property_id 1659)
        $reviewIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1659 && $value['value_resource_id']) {
                $reviewIds[] = $value['value_resource_id'];
            }
        }

        $reviewMap = [];
        $reviewThumbnailMap = [];
        $reviewUrlMap = [];
        if (!empty($reviewIds)) {
            // Récupérer les titres des reviews
            $reviewNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($reviewIds)) . ")
                AND v.property_id = 1
            ";
            $reviewNameData = $this->conn->executeQuery($reviewNameQuery)->fetchAllAssociative();

            foreach ($reviewNameData as $review) {
                $reviewMap[$review['resource_id']] = $review['value'];
            }

            // Récupérer les URLs des reviews (essayer d'abord 121, puis 11, puis 1517)
            $reviewUrlQuery = "
                SELECT v.resource_id, v.uri, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($reviewIds)) . ")
                AND v.property_id IN (121, 11, 1517)
            ";
            $reviewUrlData = $this->conn->executeQuery($reviewUrlQuery)->fetchAllAssociative();

            foreach ($reviewUrlData as $review) {
                // Utiliser l'URI si elle existe, sinon la valeur
                $reviewUrlMap[$review['resource_id']] = $review['uri'] ?? $review['value'];
            }

            // Récupérer les thumbnails des reviews
            $reviewThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($reviewIds)) . ")
            ";
            $reviewThumbnailData = $this->conn->executeQuery($reviewThumbnailQuery)->fetchAllAssociative();

            foreach ($reviewThumbnailData as $thumbnail) {
                $reviewThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 3.5 Related Resources (property_id 1794)
        $relatedResourceIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 1794 && $value['value_resource_id']) {
                $relatedResourceIds[] = $value['value_resource_id'];
            }
        }

        $relatedResourceMap = [];
        $relatedResourceThumbnailMap = [];
        $relatedResourceUrlMap = [];
        if (!empty($relatedResourceIds)) {
            // Récupérer les titres des ressources liées
            $relatedResourceNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($relatedResourceIds)) . ")
                AND v.property_id = 1
            ";
            $relatedResourceNameData = $this->conn->executeQuery($relatedResourceNameQuery)->fetchAllAssociative();

            foreach ($relatedResourceNameData as $relatedResource) {
                $relatedResourceMap[$relatedResource['resource_id']] = $relatedResource['value'];
            }

            // Récupérer les URLs des ressources liées (essayer 121, 11, puis 1517)
            $relatedResourceUrlQuery = "
                SELECT v.resource_id, v.uri, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($relatedResourceIds)) . ")
                AND v.property_id IN (121, 11, 1517)
            ";
            $relatedResourceUrlData = $this->conn->executeQuery($relatedResourceUrlQuery)->fetchAllAssociative();

            foreach ($relatedResourceUrlData as $relatedResource) {
                // Utiliser l'URI si elle existe, sinon la valeur
                $relatedResourceUrlMap[$relatedResource['resource_id']] = $relatedResource['uri'] ?? $relatedResource['value'];
            }

            // Récupérer les thumbnails des ressources liées
            $relatedResourceThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($relatedResourceIds)) . ")
            ";
            $relatedResourceThumbnailData = $this->conn->executeQuery($relatedResourceThumbnailQuery)->fetchAllAssociative();

            foreach ($relatedResourceThumbnailData as $thumbnail) {
                $relatedResourceThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 4. CONSTRUCTION DU RÉSULTAT : Boucle avec switch/case
        $result = [];
        foreach ($resources as $resource) {
            $objetTechno = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => '',
                'dateIssued' => '',
                'associatedMedia' => [],
                'tools' => [],
                'application' => '',
                'purpose' => '',
                'slogan' => '',
                'descriptions' => [],
                'conditionInitiale' => '',
                'reviews' => [],
                'source' => '',
                'relatedResources' => [],
                'keywords' => [],
                'isPartOf' => '',
                'thumbnail' => isset($logoMap[$resource['id']])
                    ? $this->generateThumbnailUrl($logoMap[$resource['id']])
                    : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $objetTechno['title'] = $value['value'];
                            break;

                        case 2: // dcterms:creator
                            $objetTechno['creator'] = $value['value'];
                            break;

                        case 23: // dcterms:issued
                            $objetTechno['dateIssued'] = $value['value'];
                            break;

                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $mediaId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$mediaId])) {
                                    $mediaUrl = $associatedMediaMap[$mediaId];
                                    // Si c'est une URL YouTube, retourner un objet avec url
                                    if (strpos($mediaUrl, 'youtube.com') !== false || strpos($mediaUrl, 'youtu.be') !== false) {
                                        $objetTechno['associatedMedia'][] = [
                                            'id' => $mediaId,
                                            'url' => $mediaUrl,
                                            'thumbnail' => null
                                        ];
                                    } else {
                                        // Sinon, retourner juste l'URL du thumbnail comme string
                                        $objetTechno['associatedMedia'][] = $this->generateThumbnailUrl($mediaUrl);
                                    }
                                }
                            }
                            break;

                        case 1480: // schema:tool
                            if ($value['value_resource_id']) {
                                $toolId = $value['value_resource_id'];
                                $objetTechno['tools'][] = [
                                    'id' => $toolId,
                                    'name' => $toolMap[$toolId] ?? null,
                                    'thumbnail' => $toolThumbnailMap[$toolId] ?? null,
                                    'url' => $toolUrlMap[$toolId] ?? null
                                ];
                            }
                            break;

                        case 408: // schema:application
                            $objetTechno['application'] = $value['value'];
                            break;

                        case 193: // oa:hasPurpose
                            $objetTechno['purpose'] = $value['value'];
                            break;

                        case 1391: // schema:slogan
                            $objetTechno['slogan'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            if ($value['value_resource_id']) {
                                $objetTechno['descriptions'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2083: // genstory:hasConditionInitial
                            $objetTechno['conditionInitiale'] = $value['value'];
                            break;

                        case 1659: // schema:review
                            if ($value['value_resource_id']) {
                                $reviewId = $value['value_resource_id'];
                                $objetTechno['reviews'][] = [
                                    'id' => $reviewId,
                                    'title' => $reviewMap[$reviewId] ?? null,
                                    'thumbnail' => $reviewThumbnailMap[$reviewId] ?? null,
                                    'url' => $reviewUrlMap[$reviewId] ?? null
                                ];
                            }
                            break;

                        case 11: // dcterms:source
                            $objetTechno['source'] = $value['uri'];
                            break;

                        case 1794: // ma:hasRelatedResource
                            if ($value['value_resource_id']) {
                                $relatedResourceId = $value['value_resource_id'];
                                $objetTechno['relatedResources'][] = [
                                    'id' => $relatedResourceId,
                                    'title' => $relatedResourceMap[$relatedResourceId] ?? null,
                                    'thumbnail' => $relatedResourceThumbnailMap[$relatedResourceId] ?? null,
                                    'url' => $relatedResourceUrlMap[$relatedResourceId] ?? null
                                ];
                            }
                            break;

                        case 2097: // jdc:hasConcept
                            if ($value['value_resource_id']) {
                                $objetTechno['keywords'][] = $value['value_resource_id'];
                            }
                            break;

                        case 33: // dcterms:isPartOf
                            if ($value['value_resource_id']) {
                                $objetTechno['isPartOf'] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $objetTechno;
        }

        // 5. RETURN DU RÉSULTAT
        return $result;
    }

    /**
     * Récupérer les Documentations scientifiques
     * Template ID: 124
     *
     * @return array
     */
    function getRecitsScientifiques()
    {
        // 1. REQUÊTE PRINCIPALE : Récupération des IDs
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 124
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2. REQUÊTE DES VALEURS : Récupération des propriétés
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 23, 1517, 438, 408, 193, 4, 2083, 11, 2097, 937, 33, 1659)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($values) . ' values';

        // 3. MAPS DES RESSOURCES LIÉES

        // 3.1 Thumbnail principal (logo)
        $logoQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
                FROM `media`
                WHERE item_id IN (" . implode(',', $resourceIds) . ")
            ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($logos) . ' logos';

        $logoMap = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                $logoMap[$logo['item_id']] = $logo['logo'];
            }
        }

        // 3.2 Creator (property_id 2)
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        $creatorThumbnailMap = [];
        if (!empty($creatorIds)) {
            // Récupérer les titres des créateurs
            $creatorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorNameData = $this->conn->executeQuery($creatorNameQuery)->fetchAllAssociative();

            foreach ($creatorNameData as $creator) {
                $creatorMap[$creator['resource_id']] = $creator['value'];
            }

            // Récupérer les thumbnails des créateurs
            $creatorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($creatorIds)) . ")
            ";
            $creatorThumbnailData = $this->conn->executeQuery($creatorThumbnailQuery)->fetchAllAssociative();

            foreach ($creatorThumbnailData as $thumbnail) {
                $creatorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 3.3 Associated Media (property_id 438) - Pour les documentations scientifiques,
        // associatedMedia pointe vers des ITEMS (conférences) qui contiennent des URLs YouTube
        $associatedItemIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedItemIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedItemIds)) {
            // Récupérer les URIs (URLs YouTube) des items associés via property_id 121
            $associatedMediaUriQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                AND v.property_id = 121
            ";
            $associatedMediaUriData = $this->conn->executeQuery($associatedMediaUriQuery)->fetchAllAssociative();

            foreach ($associatedMediaUriData as $uriData) {
                $url = $uriData['uri'];
                // Vérifier si c'est une URL YouTube
                if (!empty($url) && (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false)) {
                    $associatedMediaMap[$uriData['resource_id']] = [
                        'id' => $uriData['resource_id'],
                        'url' => $url,
                        'thumbnail' => null
                    ];
                }
            }

            // Si pas d'URI YouTube trouvée, récupérer les thumbnails des items associés
            if (empty($associatedMediaMap)) {
                $associatedMediaThumbnailQuery = "
                    SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                    FROM `media`
                    WHERE item_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                ";
                $associatedMediaThumbnailData = $this->conn->executeQuery($associatedMediaThumbnailQuery)->fetchAllAssociative();

                foreach ($associatedMediaThumbnailData as $thumbnail) {
                    $associatedMediaMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 3.4 Is Related To (property_id 937)
        $isRelatedToIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 937 && $value['value_resource_id']) {
                $isRelatedToIds[] = $value['value_resource_id'];
            }
        }

        $isRelatedToMap = [];
        $isRelatedToThumbnailMap = [];
        if (!empty($isRelatedToIds)) {
            // Récupérer les titres des ressources liées
            $isRelatedToNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
                AND v.property_id = 1
            ";
            $isRelatedToNameData = $this->conn->executeQuery($isRelatedToNameQuery)->fetchAllAssociative();

            foreach ($isRelatedToNameData as $related) {
                $isRelatedToMap[$related['resource_id']] = $related['value'];
            }

            // Récupérer les thumbnails des ressources liées
            $isRelatedToThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
            ";
            $isRelatedToThumbnailData = $this->conn->executeQuery($isRelatedToThumbnailQuery)->fetchAllAssociative();

            foreach ($isRelatedToThumbnailData as $thumbnail) {
                $isRelatedToThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 4. CONSTRUCTION DU RÉSULTAT : Boucle avec switch/case
        $result = [];
        foreach ($resources as $resource) {
            $docScientifique = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => null,
                'dateIssued' => '',
                'url' => '',
                'associatedMedia' => [],
                'application' => '',
                'purpose' => '',
                'descriptions' => [],
                'conditionInitiale' => '',
                'referencesScient' => [],
                'referencesCultu' => [],
                'keywords' => [],
                'isRelatedTo' => [],
                'isPartOf' => [],
                'thumbnail' => isset($logoMap[$resource['id']])
                    ? $this->generateThumbnailUrl($logoMap[$resource['id']])
                    : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $docScientifique['title'] = $value['value'];
                            break;

                        case 2: // dcterms:creator
                            if ($value['value_resource_id']) {
                                $creatorId = $value['value_resource_id'];
                                $docScientifique['creator'] = $creatorId;
                            }
                            break;

                        case 23: // dcterms:issued
                            $docScientifique['dateIssued'] = $value['value'];
                            break;

                        case 1517: // schema:url
                            $docScientifique['url'] = $value['uri'];
                            break;

                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $itemId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$itemId])) {
                                    $mediaData = $associatedMediaMap[$itemId];
                                    // Si c'est un objet (vidéo YouTube), l'ajouter tel quel
                                    if (is_array($mediaData)) {
                                        $docScientifique['associatedMedia'][] = $mediaData;
                                    } else {
                                        // Sinon, c'est une string (URL du thumbnail)
                                        $docScientifique['associatedMedia'][] = $mediaData;
                                    }
                                }
                            }
                            break;

                        case 408: // schema:application
                            $docScientifique['application'] = $value['value'];
                            break;

                        case 193: // oa:hasPurpose
                            $docScientifique['purpose'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            if ($value['value_resource_id']) {
                                $docScientifique['descriptions'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2083: // genstory:hasConditionInitial
                            $docScientifique['conditionInitiale'] = $value['value'];
                            break;

                        case 11: // dcterms:source
                            if ($value['value_resource_id']) {
                                $docScientifique['referencesScient'][] = $value['value_resource_id'];
                            }
                            break;

                        case 1659: // schema:review
                            if ($value['value_resource_id']) {
                                $docScientifique['referencesCultu'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2097: // jdc:hasConcept
                            if ($value['value_resource_id']) {
                                $docScientifique['keywords'][] = $value['value_resource_id'];
                            }
                            break;

                        case 937: // schema:isRelatedTo
                            if ($value['value_resource_id']) {
                                $relatedId = $value['value_resource_id'];
                                $docScientifique['isRelatedTo'][] = [
                                    'id' => $relatedId,
                                    'title' => $isRelatedToMap[$relatedId] ?? null,
                                    'thumbnail' => $isRelatedToThumbnailMap[$relatedId] ?? null
                                ];
                            }
                            break;

                        case 33: // dcterms:isPartOf
                            if ($value['value_resource_id']) {
                                $docScientifique['isPartOf'][] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $docScientifique;
        }

        // 5. RETURN DU RÉSULTAT
        return $result;
    }

    function getRecitsMediatiques()
    {
        // 1. REQUÊTE PRINCIPALE : Récupération des IDs
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 120
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2. REQUÊTE DES VALEURS : Récupération des propriétés
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 23, 1517, 438, 408, 193, 4, 2083, 11, 2097, 937, 33, 1659, 3236)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($values) . ' values';

        // 3. MAPS DES RESSOURCES LIÉES

        // 3.1 Thumbnail principal (logo)
        $logoQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
                FROM `media`
                WHERE item_id IN (" . implode(',', $resourceIds) . ")
            ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($logos) . ' logos';

        $logoMap = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                $logoMap[$logo['item_id']] = $logo['logo'];
            }
        }

        // 3.2 Creator (property_id 2)
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        $creatorThumbnailMap = [];
        if (!empty($creatorIds)) {
            // Récupérer les titres des créateurs
            $creatorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorNameData = $this->conn->executeQuery($creatorNameQuery)->fetchAllAssociative();

            foreach ($creatorNameData as $creator) {
                $creatorMap[$creator['resource_id']] = $creator['value'];
            }

            // Récupérer les thumbnails des créateurs
            $creatorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($creatorIds)) . ")
            ";
            $creatorThumbnailData = $this->conn->executeQuery($creatorThumbnailQuery)->fetchAllAssociative();

            foreach ($creatorThumbnailData as $thumbnail) {
                $creatorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 3.3 Associated Media (property_id 438) - Pour les documentations scientifiques,
        // associatedMedia pointe vers des ITEMS (conférences) qui contiennent des URLs YouTube
        $associatedItemIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedItemIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedItemIds)) {
            // Récupérer les URIs (URLs YouTube) des items associés via property_id 121
            $associatedMediaUriQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                AND v.property_id = 121
            ";
            $associatedMediaUriData = $this->conn->executeQuery($associatedMediaUriQuery)->fetchAllAssociative();

            foreach ($associatedMediaUriData as $uriData) {
                $url = $uriData['uri'];
                // Vérifier si c'est une URL YouTube
                if (!empty($url) && (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false)) {
                    $associatedMediaMap[$uriData['resource_id']] = [
                        'id' => $uriData['resource_id'],
                        'url' => $url,
                        'thumbnail' => null
                    ];
                }
            }

            // Si pas d'URI YouTube trouvée, récupérer les thumbnails des items associés
            if (empty($associatedMediaMap)) {
                $associatedMediaThumbnailQuery = "
                    SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                    FROM `media`
                    WHERE item_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                ";
                $associatedMediaThumbnailData = $this->conn->executeQuery($associatedMediaThumbnailQuery)->fetchAllAssociative();

                foreach ($associatedMediaThumbnailData as $thumbnail) {
                    $associatedMediaMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 3.4 Is Related To (property_id 937)
        $isRelatedToIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 937 && $value['value_resource_id']) {
                $isRelatedToIds[] = $value['value_resource_id'];
            }
        }

        $isRelatedToMap = [];
        $isRelatedToThumbnailMap = [];
        if (!empty($isRelatedToIds)) {
            // Récupérer les titres des ressources liées
            $isRelatedToNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
                AND v.property_id = 1
            ";
            $isRelatedToNameData = $this->conn->executeQuery($isRelatedToNameQuery)->fetchAllAssociative();

            foreach ($isRelatedToNameData as $related) {
                $isRelatedToMap[$related['resource_id']] = $related['value'];
            }

            // Récupérer les thumbnails des ressources liées
            $isRelatedToThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
            ";
            $isRelatedToThumbnailData = $this->conn->executeQuery($isRelatedToThumbnailQuery)->fetchAllAssociative();

            foreach ($isRelatedToThumbnailData as $thumbnail) {
                $isRelatedToThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 4. CONSTRUCTION DU RÉSULTAT : Boucle avec switch/case
        $result = [];
        foreach ($resources as $resource) {
            $recit_mediatique = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => '',
                'dateIssued' => '',
                'url' => '',
                'associatedMedia' => [],
                'application' => '',
                'purpose' => '',
                'descriptions' => [],
                'conditionInitiale' => '',
                'referencesScient' => [],
                'referencesCultu' => [],
                'citations' => [],
                'keywords' => [],
                'isRelatedTo' => [],
                'isPartOf' => [],
                'thumbnail' => isset($logoMap[$resource['id']])
                    ? $this->generateThumbnailUrl($logoMap[$resource['id']])
                    : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $recit_mediatique['title'] = $value['value'];
                            break;

                        case 2: // dcterms:creator
                            if ($value['value_resource_id']) {
                                $creatorId = $value['value_resource_id'];
                                $recit_mediatique['creator'] = $creatorId;
                            } else {
                                $recit_mediatique['creator'] = $value['value'];
                            }
                            break;

                        case 23: // dcterms:issued
                            $recit_mediatique['dateIssued'] = $value['value'];
                            break;

                        case 1517: // schema:url
                            $recit_mediatique['url'] = $value['uri'];
                            break;

                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $itemId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$itemId])) {
                                    $mediaData = $associatedMediaMap[$itemId];
                                    // Si c'est un objet (vidéo YouTube), l'ajouter tel quel
                                    if (is_array($mediaData)) {
                                        $recit_mediatique['associatedMedia'][] = $mediaData;
                                    } else {
                                        // Sinon, c'est une string (URL du thumbnail)
                                        $recit_mediatique['associatedMedia'][] = $mediaData;
                                    }
                                }
                            }
                            break;

                        case 408: // schema:application
                            $recit_mediatique['application'] = $value['value'];
                            break;

                        case 193: // oa:hasPurpose
                            $recit_mediatique['purpose'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            if ($value['value_resource_id']) {
                                $recit_mediatique['descriptions'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2083: // genstory:hasConditionInitial
                            $recit_mediatique['conditionInitiale'] = $value['value'];
                            break;

                        case 11: // dcterms:source
                            if ($value['value_resource_id']) {
                                $recit_mediatique['referencesScient'][] = $value['value_resource_id'];
                            }
                            break;

                        case 1659: // schema:review
                            if ($value['value_resource_id']) {
                                $recit_mediatique['referencesCultu'][] = $value['value_resource_id'];
                            }
                            break;

                        case 3236: // storyline:hasQuote - Citations
                            if ($value['value']) {
                                $recit_mediatique['citations'][] = $value['value'];
                            }
                            break;

                        case 2097: // jdc:hasConcept
                            if ($value['value_resource_id']) {
                                $recit_mediatique['keywords'][] = $value['value_resource_id'];
                            }
                            break;

                        case 937: // schema:isRelatedTo
                            if ($value['value_resource_id']) {
                                $relatedId = $value['value_resource_id'];
                                $recit_mediatique['isRelatedTo'][] = [
                                    'id' => $relatedId,
                                    'title' => $isRelatedToMap[$relatedId] ?? null,
                                    'thumbnail' => $isRelatedToThumbnailMap[$relatedId] ?? null
                                ];
                            }
                            break;

                        case 33: // dcterms:isPartOf
                            if ($value['value_resource_id']) {
                                $recit_mediatique['isPartOf'][] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }

            $result[] = $recit_mediatique;
        }

        // 5. RETURN DU RÉSULTAT
        return $result;
    }

    function getRecitsCitoyens()
    {
        // 1. REQUÊTE PRINCIPALE : Récupération des IDs
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 119
            ORDER BY r.created DESC
        ";

        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // 2. REQUÊTE DES VALEURS : Récupération des propriétés
        $valueQuery = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
                   m.id as media_id, m.storage_id, m.extension
            FROM `value` v
            LEFT JOIN `media` m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (1, 2, 23, 1517, 438, 408, 193, 4, 2083, 11, 2097, 937, 33, 1659)
        ";

        $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($values) . ' values';

        // 3. MAPS DES RESSOURCES LIÉES

        // 3.1 Thumbnail principal (logo)
        $logoQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
                FROM `media`
                WHERE item_id IN (" . implode(',', $resourceIds) . ")
            ";
        $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
        $debug[] = 'Found ' . count($logos) . ' logos';

        $logoMap = [];
        foreach ($logos as $logo) {
            if (!empty($logo['logo']) && !empty($logo['item_id'])) {
                $logoMap[$logo['item_id']] = $logo['logo'];
            }
        }

        // 3.2 Creator (property_id 2)
        $creatorIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 2 && $value['value_resource_id']) {
                $creatorIds[] = $value['value_resource_id'];
            }
        }

        $creatorMap = [];
        $creatorThumbnailMap = [];
        if (!empty($creatorIds)) {
            // Récupérer les titres des créateurs
            $creatorNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($creatorIds)) . ")
                AND v.property_id = 1
            ";
            $creatorNameData = $this->conn->executeQuery($creatorNameQuery)->fetchAllAssociative();

            foreach ($creatorNameData as $creator) {
                $creatorMap[$creator['resource_id']] = $creator['value'];
            }

            // Récupérer les thumbnails des créateurs
            $creatorThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($creatorIds)) . ")
            ";
            $creatorThumbnailData = $this->conn->executeQuery($creatorThumbnailQuery)->fetchAllAssociative();

            foreach ($creatorThumbnailData as $thumbnail) {
                $creatorThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 3.3 Associated Media (property_id 438) - Pour les documentations scientifiques,
        // associatedMedia pointe vers des ITEMS (conférences) qui contiennent des URLs YouTube
        $associatedItemIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 438 && $value['value_resource_id']) {
                $associatedItemIds[] = $value['value_resource_id'];
            }
        }

        $associatedMediaMap = [];
        if (!empty($associatedItemIds)) {
            // Récupérer les URIs (URLs YouTube) des items associés via property_id 121
            $associatedMediaUriQuery = "
                SELECT v.resource_id, v.uri
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                AND v.property_id = 121
            ";
            $associatedMediaUriData = $this->conn->executeQuery($associatedMediaUriQuery)->fetchAllAssociative();

            foreach ($associatedMediaUriData as $uriData) {
                $url = $uriData['uri'];
                // Vérifier si c'est une URL YouTube
                if (!empty($url) && (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false)) {
                    $associatedMediaMap[$uriData['resource_id']] = [
                        'id' => $uriData['resource_id'],
                        'url' => $url,
                        'thumbnail' => null
                    ];
                }
            }

            // Si pas d'URI YouTube trouvée, récupérer les thumbnails des items associés
            if (empty($associatedMediaMap)) {
                $associatedMediaThumbnailQuery = "
                    SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                    FROM `media`
                    WHERE item_id IN (" . implode(',', array_unique($associatedItemIds)) . ")
                ";
                $associatedMediaThumbnailData = $this->conn->executeQuery($associatedMediaThumbnailQuery)->fetchAllAssociative();

                foreach ($associatedMediaThumbnailData as $thumbnail) {
                    $associatedMediaMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
                }
            }
        }

        // 3.4 Is Related To (property_id 937)
        $isRelatedToIds = [];
        foreach ($values as $value) {
            if ($value['property_id'] == 937 && $value['value_resource_id']) {
                $isRelatedToIds[] = $value['value_resource_id'];
            }
        }

        $isRelatedToMap = [];
        $isRelatedToThumbnailMap = [];
        if (!empty($isRelatedToIds)) {
            // Récupérer les titres des ressources liées
            $isRelatedToNameQuery = "
                SELECT v.resource_id, v.value
                FROM `value` v
                WHERE v.resource_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
                AND v.property_id = 1
            ";
            $isRelatedToNameData = $this->conn->executeQuery($isRelatedToNameQuery)->fetchAllAssociative();

            foreach ($isRelatedToNameData as $related) {
                $isRelatedToMap[$related['resource_id']] = $related['value'];
            }

            // Récupérer les thumbnails des ressources liées
            $isRelatedToThumbnailQuery = "
                SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
                FROM `media`
                WHERE item_id IN (" . implode(',', array_unique($isRelatedToIds)) . ")
            ";
            $isRelatedToThumbnailData = $this->conn->executeQuery($isRelatedToThumbnailQuery)->fetchAllAssociative();

            foreach ($isRelatedToThumbnailData as $thumbnail) {
                $isRelatedToThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
            }
        }

        // 4. CONSTRUCTION DU RÉSULTAT : Boucle avec switch/case
        $result = [];
        foreach ($resources as $resource) {
            $recit_citoyen = [
                'id' => $resource['id'],
                'title' => '',
                'creator' => [],
                'dateIssued' => '',
                'url' => '',
                'associatedMedia' => [],
                'application' => '',
                'purpose' => '',
                'descriptions' => [],
                'conditionInitiale' => '',
                'referencesScient' => [],
                'referencesCultu' => [],
                'keywords' => [],
                'isRelatedTo' => [],
                'isPartOf' => [],
                'thumbnail' => isset($logoMap[$resource['id']])
                    ? $this->generateThumbnailUrl($logoMap[$resource['id']])
                    : ''
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 1: // dcterms:title
                            $recit_citoyen['title'] = $value['value'];
                            break;

                        case 2: // dcterms:creator
                            if ($value['value_resource_id']) {
                                $creatorId = $value['value_resource_id'];
                                $recit_citoyen['creator'][] = [
                                    'id' => $creatorId,
                                    'title' => $creatorMap[$creatorId] ?? null,
                                    'thumbnail' => $creatorThumbnailMap[$creatorId] ?? null
                                ];
                            }
                            break;

                        case 23: // dcterms:issued
                            $recit_citoyen['dateIssued'] = $value['value'];
                            break;

                        case 1517: // schema:url
                            $recit_citoyen['url'] = $value['uri'];
                            break;

                        case 438: // schema:associatedMedia
                            if ($value['value_resource_id']) {
                                $itemId = $value['value_resource_id'];
                                if (isset($associatedMediaMap[$itemId])) {
                                    $mediaData = $associatedMediaMap[$itemId];
                                    // Si c'est un objet (vidéo YouTube), l'ajouter tel quel
                                    if (is_array($mediaData)) {
                                        $recit_citoyen['associatedMedia'][] = $mediaData;
                                    } else {
                                        // Sinon, c'est une string (URL du thumbnail)
                                        $recit_citoyen['associatedMedia'][] = $mediaData;
                                    }
                                }
                            }
                            break;

                        case 408: // schema:application
                            $recit_citoyen['application'] = $value['value'];
                            break;

                        case 193: // oa:hasPurpose
                            $recit_citoyen['purpose'] = $value['value'];
                            break;

                        case 4: // dcterms:description
                            if ($value['value_resource_id']) {
                                $recit_citoyen['descriptions'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2083: // genstory:hasConditionInitial
                            $recit_citoyen['conditionInitiale'] = $value['value'];
                            break;

                        case 11: // dcterms:source
                            if ($value['value_resource_id']) {
                                $recit_citoyen['referencesScient'][] = $value['value_resource_id'];
                            }
                            break;

                        case 1659: // schema:review
                            if ($value['value_resource_id']) {
                                $recit_citoyen['referencesCultu'][] = $value['value_resource_id'];
                            }
                            break;

                        case 2097: // jdc:hasConcept
                            if ($value['value_resource_id']) {
                                $recit_citoyen['keywords'][] = $value['value_resource_id'];
                            }
                            break;

                        case 937: // schema:isRelatedTo
                            if ($value['value_resource_id']) {
                                $relatedId = $value['value_resource_id'];
                                $recit_citoyen['isRelatedTo'][] = [
                                    'id' => $relatedId,
                                    'title' => $isRelatedToMap[$relatedId] ?? null,
                                    'thumbnail' => $isRelatedToThumbnailMap[$relatedId] ?? null
                                ];
                            }
                            break;

                        case 33: // dcterms:isPartOf
                            if ($value['value_resource_id']) {
                                $recit_citoyen['isPartOf'][] = $value['value_resource_id'];
                            }
                            break;
                    }
                }
            }



            $result[] = $recit_citoyen;
        }

        // 5. RETURN DU RÉSULTAT
        return $result;
    }

    /**
     * Optimized version for Cards only (Home, Lists, etc.)
     */
    function getRecitsCitoyensCards() {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 119
            ORDER BY r.created DESC
        ";
        $resources = $this->conn->fetchAllAssociative($resourceQuery);
        
        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        
        return $this->cardHelper->fetchCards($resourceIds);
    }

    function getRecitsMediatiquesCards() {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 120
            ORDER BY r.created DESC
        ";
        $resources = $this->conn->fetchAllAssociative($resourceQuery);
        
        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        
        return $this->cardHelper->fetchCards($resourceIds);
    }

    function getRecitsScientifiquesCards() {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 124
            ORDER BY r.created DESC
        ";
        $resources = $this->conn->fetchAllAssociative($resourceQuery);
        
        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        
        return $this->cardHelper->fetchCards($resourceIds);
    }

    function getRecitsTechnoCards() {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 117
            ORDER BY r.created DESC
        ";
        $resources = $this->conn->fetchAllAssociative($resourceQuery);
        
        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        
        return $this->cardHelper->fetchCards($resourceIds);
    }

    function getRecitsArtistiquesCards() {
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id IN (131, 103)
            ORDER BY r.created DESC
        ";
        $resources = $this->conn->fetchAllAssociative($resourceQuery);
        
        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');
        
        return $this->cardHelper->fetchCards($resourceIds);
    }


    /**
     * Recherche sémantique dans les embeddings - comparaison avec une requête textuelle
     * Support GET et POST
     *
     * @param array $params Paramètres (query obligatoire, limit optionnel)
     * @return array Résultats de la recherche sémantique
     */
    function searchEmbeddings($params = [])
    {
        // Support GET et POST - priorité aux params, sinon GET
        $query = trim($params['query'] ?? $_GET['query'] ?? '');
        $limit = intval($params['limit'] ?? $_GET['limit'] ?? 20);

        error_log('searchEmbeddings function called with query: ' . $query . ', limit: ' . $limit);

        try {
            // Vérifier que la requête est fournie
            if (empty($query)) {
                return [
                    'success' => false,
                    'message' => 'Une requête de recherche est requise'
                ];
            }

            // Debug: Log des paramètres reçus
            error_log('searchEmbeddings called with query: ' . $query);

            // 1. Vérifier la clé API Jina
            if (!$this->jinaApiKey || $this->jinaApiKey === 'VOTRE_CLE_JINA_ICI') {
                return [
                    'success' => false,
                    'message' => 'Jina API key not configured. Get one free at https://jina.ai',
                    'debug' => 'API key not set'
                ];
            }

            // 2. Générer l'embedding pour la requête
            $queryEmbedding = $this->callJinaEmbeddingAPI($this->jinaApiKey, $query);

            if (!$queryEmbedding || isset($queryEmbedding['error'])) {
                $errorDetail = isset($queryEmbedding['error']) ? $queryEmbedding['error'] : 'Unknown error';
                $httpCode = isset($queryEmbedding['http_code']) ? $queryEmbedding['http_code'] : 'N/A';
                return [
                    'success' => false,
                    'message' => 'Erreur lors de la génération de l\'embedding pour la requête: ' . $errorDetail,
                    'debug' => [
                        'error_detail' => $errorDetail,
                        'http_code' => $httpCode,
                        'query' => $query,
                        'api_key_configured' => !empty($this->jinaApiKey)
                    ]
                ];
            }

            // 3. Récupérer tous les embeddings de la base de données
            $embeddings = $this->conn->fetchAllAssociative(
                "SELECT resource_id, embedding FROM semantic_embeddings WHERE embedding IS NOT NULL AND LENGTH(TRIM(embedding)) > 2 ORDER BY updated_at DESC"
            );

            error_log('Found ' . count($embeddings) . ' embeddings in database');
            error_log('First embedding sample: ' . substr($embeddings[0]['embedding'] ?? 'none', 0, 100));

            if (empty($embeddings)) {
                return [
                    'success' => false,
                    'message' => 'Aucun embedding trouvé dans la base de données',
                    'debug' => [
                        'embeddings_count' => 0,
                        'query' => $query
                    ]
                ];
            }

            // 4. Calculer les similarités avec la requête
            $results = [];
            $parsedCount = 0;
            foreach ($embeddings as $row) {
                // Essayer d'abord de parser comme JSON
                $embedding = json_decode($row['embedding'], true);

                // Si ça ne marche pas, essayer de parser comme texte avec crochets
                if (!is_array($embedding) || count($embedding) === 0) {
                    $embeddingText = trim($row['embedding'], '[]');
                    if (!empty($embeddingText)) {
                        $values = explode(',', $embeddingText);
                        $embedding = array_map('floatval', array_map('trim', $values));
                    }
                }

                if (is_array($embedding) && count($embedding) > 0) {
                    $parsedCount++;
                    $similarity = $this->cosineSimilarity($queryEmbedding, $embedding);

                    $results[] = [
                        'resource_id' => $row['resource_id'],
                        'similarity' => round($similarity, 4),
                        'embedding_preview' => array_slice($embedding, 0, 5), // Premiers 5 éléments
                        'query_embedding_preview' => array_slice($queryEmbedding, 0, 5)
                    ];
                } else {
                    error_log('Failed to parse embedding for resource_id ' . $row['resource_id'] . ': ' . substr($row['embedding'], 0, 100));
                }
            }

            error_log('Successfully parsed ' . $parsedCount . ' out of ' . count($embeddings) . ' embeddings');

            // 5. Trier par similarité décroissante
            usort($results, function ($a, $b) {
                return $b['similarity'] <=> $a['similarity'];
            });

            // 6. Limiter les résultats
            $results = array_slice($results, 0, $limit);

            // 7. Statistiques
            $stats = [
                'total_embeddings_searched' => count($embeddings),
                'results_returned' => count($results),
                'query_length' => strlen($query),
                'avg_similarity' => count($results) > 0 ? round(array_sum(array_column($results, 'similarity')) / count($results), 4) : 0,
                'max_similarity' => count($results) > 0 ? max(array_column($results, 'similarity')) : 0,
                'min_similarity' => count($results) > 0 ? min(array_column($results, 'similarity')) : 0
            ];

            $response = [
                'success' => true,
                'message' => 'Recherche sémantique terminée',
                'query' => $query,
                'data' => [
                    'results' => $results,
                    'stats' => $stats
                ]
            ];

            error_log('searchEmbeddings completed successfully, returning ' . count($results) . ' results');
            return $response;
        } catch (\Exception $e) {
            error_log('Erreur dans searchEmbeddings: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());

            $errorResponse = [
                'success' => false,
                'message' => 'Erreur lors de la recherche sémantique: ' . $e->getMessage(),
                'debug' => [
                    'exception_message' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                    'query' => $query ?? 'not set'
                ]
            ];

            return $errorResponse;
        }
    }

    /**
     * Calculer la similarité cosinus entre deux vecteurs
     *
     * @param array $vec1 Premier vecteur
     * @param array $vec2 Deuxième vecteur
     * @return float Similarité cosinus (-1 à 1)
     */
    private function cosineSimilarity($vec1, $vec2)
    {
        if (count($vec1) !== count($vec2)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $norm1 = 0.0;
        $norm2 = 0.0;

        foreach ($vec1 as $i => $val1) {
            $val2 = $vec2[$i];
            $dotProduct += $val1 * $val2;
            $norm1 += $val1 * $val1;
            $norm2 += $val2 * $val2;
        }

        $norm1 = sqrt($norm1);
        $norm2 = sqrt($norm2);

        if ($norm1 == 0.0 || $norm2 == 0.0) {
            return 0.0;
        }

        return $dotProduct / ($norm1 * $norm2);
    }
    public function getExperimentationCards()
    {
        // Get IDs of all experimentations (Template 108)
        $resourceQuery = "
            SELECT r.id
            FROM `resource` r
            WHERE r.resource_template_id = 108
            ORDER BY r.created DESC
        ";
        
        $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();
        
        if (empty($resources)) {
            return [];
        }
        
        $ids = array_column($resources, 'id');
        
        // Delegate to QueryCardHelper
        return $this->cardHelper->fetchCards($ids);
    }

    /**
     * Get cards filtered by Edition ID
     * Fetches all conferences (seminaires, colloques, journées d'études) linked to a specific edition
     * 
     * @param int $editionId Edition resource ID
     * @return array Standardized card data
     */
    public function getCardsByEdition($editionId) {
        if (!$editionId) {
            return [];
        }
        
        $editionId = (int)$editionId;
        
        // Get all conferences linked to this edition (Property 937)
        $sql = "
            SELECT v.value_resource_id as id
            FROM value v
            WHERE v.resource_id = :editionId
            AND v.property_id = 937
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, ['editionId' => $editionId]);
        
        if (empty($rows)) {
            return [];
        }
        
        $confIds = array_column($rows, 'id');
        
        // Delegate to QueryCardHelper for standardized card data
        return $this->cardHelper->fetchCards($confIds);
    }
    
    /**
     * Get cards filtered by Actant (Intervenant) ID
     * Fetches all resources where this actant appears as schema:agent
     * 
     * @param int $actantId Actant resource ID
     * @param array $types Optional filter by resource types (e.g., ['seminaire', 'experimentation'])
     * @return array Standardized card data
     */
    public function getCardsByActant($actantId, $types = []) {
        if (!$actantId) {
            return [];
        }
        
        $actantId = (int)$actantId;
        
        // Template IDs for actant-based resources
        $typeTemplateMap = [
            'seminaire' => 71,
            'colloque' => 122,
            'journee_etudes' => 121,
            'experimentation' => 108
        ];
        
        // Determine which template IDs to include
        if (!empty($types)) {
            $templateIds = [];
            foreach ($types as $type) {
                if (isset($typeTemplateMap[$type])) {
                    $templateIds[] = $typeTemplateMap[$type];
                }
            }
            // If no valid types provided, return empty
            if (empty($templateIds)) {
                return [];
            }
        } else {
            // Default: all actant-based types
            $templateIds = array_values($typeTemplateMap);
        }
        
        $templateIdsStr = implode(',', $templateIds);
        
        // Get all resources where this actant appears (Property 386 - schema:agent)
        $sql = "
            SELECT DISTINCT v.resource_id as id
            FROM value v
            INNER JOIN resource r ON r.id = v.resource_id
            WHERE v.property_id = 386
            AND v.value_resource_id = :actantId
            AND r.resource_template_id IN ($templateIdsStr)
            ORDER BY r.created DESC
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, ['actantId' => $actantId]);
        
        if (empty($rows)) {
            return [];
        }
        
        $resourceIds = array_column($rows, 'id');
        
        // Delegate to QueryCardHelper for standardized card data
        return $this->cardHelper->fetchCards($resourceIds);
    }
    
    /**
     * Get cards filtered by Keyword (Concept) ID
     * Fetches conferences (seminaires, colloques, journées d'études) linked to a specific keyword
     * 
     * @param int $keywordId Keyword resource ID
     * @param int $limit Maximum number of cards to return
     * @return array Standardized card data
     */
    public function getCardsByKeyword($keywordId, $limit = 8) {
        if (!$keywordId) {
            return [];
        }
        
        $keywordId = (int)$keywordId;
        $limit = (int)$limit;
        
        // Template IDs for conferences (seminaire, colloque, journée d'études)
        $templateIds = [71, 122, 121];
        $templateIdsStr = implode(',', $templateIds);
        
        // Get all conferences linked to this keyword (Property 2097 - jdc:hasConcept)
        $sql = "
            SELECT DISTINCT v.resource_id as id
            FROM value v
            INNER JOIN resource r ON r.id = v.resource_id
            WHERE v.property_id = 2097
            AND v.value_resource_id = :keywordId
            AND r.resource_template_id IN ($templateIdsStr)
            ORDER BY r.created DESC
            LIMIT :limit
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [
            'keywordId' => $keywordId,
            'limit' => $limit
        ]);
        
        if (empty($rows)) {
            return [];
        }
        
        $confIds = array_column($rows, 'id');
        
        // Delegate to QueryCardHelper for standardized card data
        return $this->cardHelper->fetchCards($confIds);
    }
}
