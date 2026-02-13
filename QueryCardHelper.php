<?php
namespace CartoAffect\View\Helper;

use Doctrine\DBAL\Connection;

/**
 * Dedicated helper for fetching standardized Resource Card data
 * Separates concerns from QuerySqlViewHelper.php
 */
class QueryCardHelper
{
    private $conn;
    
    /**
     * Configuration mapping: Template ID => Card Requirements
     */
    private $cardConfig = [
        // Experimentations
        108 => [
            'type' => 'experimentation',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'item',
            'agent_prop' => 386,
            'agent_type' => 'actant'
        ],
        // Experimentations Etudiant
        127 => [
            'type' => 'experimentation_etudiant',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'item',
            'agent_prop' => 386,
            'agent_type' => 'actant'
        ],
        // Seminars
        71 => [
            'type' => 'seminaire',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'youtube',
            'agent_prop' => 386,
            'agent_type' => 'actant'
        ],
        // Study Days
        121 => [
            'type' => 'journee_etudes',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'youtube',
            'agent_prop' => 386,
            'agent_type' => 'actant'
        ],
        // Colloques
        122 => [
            'type' => 'colloque',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'youtube',
            'agent_prop' => 386,
            'agent_type' => 'actant'
        ],
        // Recits Citoyens
        119 => [
            'type' => 'recit_citoyen',
            'title_prop' => 1,
            'date_prop' => 23,
            'thumbnail_source' => 'item',
            'agent_prop' => 2,
            'agent_type' => 'creator',
            'genre_prop' => 1621
        ],
        // Recits Mediatiques
        120 => [
            'type' => 'recit_mediatique',
            'title_prop' => 1,
            'date_prop' => 23,
            'thumbnail_source' => 'item',
            'agent_prop' => 2,
            'agent_type' => 'creator',
            'genre_prop' => 1621
        ],
        // Recits Scientifiques
        124 => [
            'type' => 'recit_scientifique',
            'title_prop' => 1,
            'date_prop' => 23,
            'thumbnail_source' => 'item',
            'agent_prop' => 2,
            'agent_type' => 'creator',
            'genre_prop' => 1621
        ],
        // Recits Techno-Industriels
        117 => [
            'type' => 'recit_techno_industriel',
            'title_prop' => 1,
            'date_prop' => 23,
            'thumbnail_source' => 'item',
            'agent_prop' => 2,
            'agent_type' => 'creator',
            'genre_prop' => 1621
        ],
        // Recits Artistiques
        103 => [
            'type' => 'recit_artistique',
            'title_prop' => 1,
            'date_prop' => 7,
            'thumbnail_source' => 'item',
            'agent_prop' => 386,
            'agent_type' => 'creator',
            'genre_prop' => 1621
        ]
    ];

    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
    }

    /**
     * Fetch standardized card data for given resource IDs
     * Returns: [ {id, title, date, thumbnail, type, actants: [...]} ]
     */
    public function fetchCards(array $resourceIds)
    {
        if (empty($resourceIds)) return [];
        
        $idsStr = implode(',', array_map('intval', $resourceIds));
        
        // 1. Fetch base resource data (ID, Template, Title from resource table)
        $baseSql = "
            SELECT r.id, r.title, r.resource_template_id
            FROM resource r
            WHERE r.id IN ($idsStr)
        ";
        $resources = $this->conn->fetchAllAssociative($baseSql);
        
        if (empty($resources)) return [];
        
        // 2. Group by template to batch queries
        $byTemplate = [];
        foreach ($resources as $res) {
            $tmplId = $res['resource_template_id'];
            $byTemplate[$tmplId][] = $res['id'];
        }
        
        // 3. Process each template type
        $results = [];
        foreach ($byTemplate as $tmplId => $ids) {
            if (!isset($this->cardConfig[$tmplId])) {
                // Unknown template, skip
                continue;
            }
            
            $config = $this->cardConfig[$tmplId];
            $cardsForTemplate = $this->processTemplate($ids, $config);
            $results = array_merge($results, $cardsForTemplate);
        }
        
        return $results;
    }

    /**
     * Process a specific template type
     */
    private function processTemplate(array $ids, array $config)
    {
        $idsStr = implode(',', $ids);
        
        // Fetch dates
        $dates = $this->fetchDates($idsStr, $config['date_prop']);
        
        // Fetch thumbnails
        $thumbnails = $this->fetchThumbnails($idsStr, $config['thumbnail_source']);
        
        // Fetch agents/creators
        $agents = $this->fetchAgents($idsStr, $config['agent_prop'], $config['agent_type']);
        
        // Fetch genres if configured
        $genres = isset($config['genre_prop']) ? $this->fetchGenres($idsStr, $config['genre_prop']) : [];

        
        // Assemble results
        $results = [];
        foreach ($ids as $id) {
            $results[] = [
                'id' => (string)$id,
                'title' => '', // Will be enriched from resource table
                'date' => $dates[$id] ?? null,
                'thumbnail' => $thumbnails[$id] ?? null,
                'type' => $config['type'],
                'actants' => $agents[$id] ?? [],
                'genres' => $genres[$id] ?? [],
                'url' => null // TODO: Add URL fetching if needed
            ];
        }
        
        // Enrich with titles from resource table
        $titleSql = "SELECT id, title FROM resource WHERE id IN ($idsStr)";
        $titleRows = $this->conn->fetchAllAssociative($titleSql);
        $titleMap = [];
        foreach ($titleRows as $row) {
            $titleMap[$row['id']] = $row['title'];
        }
        
        foreach ($results as &$result) {
            $result['title'] = $titleMap[$result['id']] ?? '';
        }
        
        return $results;
    }

    /**
     * Fetch dates for resources
     */
    private function fetchDates($idsStr, $dateProp)
    {
        $sql = "
            SELECT resource_id, value
            FROM value
            WHERE resource_id IN ($idsStr)
            AND property_id = $dateProp
        ";
        $rows = $this->conn->fetchAllAssociative($sql);
        
        $map = [];
        foreach ($rows as $row) {
            $map[$row['resource_id']] = $row['value'];
        }
        return $map;
    }

    /**
     * Fetch thumbnails based on source type
     */
    private function fetchThumbnails($idsStr, $source)
    {
        if ($source === 'item') {
            // Fetch item's own thumbnail (using original folder for better quality)
            $sql = "
                SELECT item_id, storage_id, extension
                FROM media
                WHERE item_id IN ($idsStr)
            ";
            $rows = $this->conn->fetchAllAssociative($sql);
            
            $map = [];
            foreach ($rows as $row) {
                $ext = $row['extension'];
                // Skip media items without a valid extension
                if (!empty($ext)) {
                    $map[$row['item_id']] = "https://tests.arcanes.ca/omk/files/original/{$row['storage_id']}.{$ext}";
                }
            }
            return $map;
        } elseif ($source === 'youtube') {
            // Extract YouTube thumbnail from URL (Property 1517)
            $sql = "
                SELECT resource_id, uri
                FROM value
                WHERE resource_id IN ($idsStr)
                AND property_id = 1517
            ";
            $rows = $this->conn->fetchAllAssociative($sql);
            
            $map = [];
            foreach ($rows as $row) {
                $url = $row['uri'];
                // Extract video ID and build thumbnail URL
                if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $url, $matches)) {
                    $videoId = $matches[1];
                    $map[$row['resource_id']] = "https://img.youtube.com/vi/$videoId/0.jpg";
                }
            }
            return $map;
        }
        
        return [];
    }

    /**
     * Fetch agents/creators based on type
     */
    private function fetchAgents($idsStr, $agentProp, $agentType)
    {
        if ($agentType === 'actant') {
            return $this->fetchActants($idsStr, $agentProp);
        } elseif ($agentType === 'creator') {
            return $this->fetchCreators($idsStr, $agentProp);
        }
        return [];
    }

    /**
     * Fetch Actants (Property 386) - Full person details with firstname/lastname/university
     */
    private function fetchActants($idsStr, $agentProp)
    {
        // Step 1: Get agent links (exclude tools - template 114)
        $linkSql = "
            SELECT v.resource_id, v.value_resource_id as agent_id
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id IN ($idsStr)
            AND v.property_id = $agentProp
            AND v.value_resource_id IS NOT NULL
            AND r.resource_template_id IN (72, 96)
        ";
        $links = $this->conn->fetchAllAssociative($linkSql);
        
        if (empty($links)) return [];
        
        $agentIds = array_unique(array_column($links, 'agent_id'));
        $agentIdsStr = implode(',', $agentIds);
        
        // Step 2: Fetch agent details (firstname, lastname, picture)
        $agentSql = "
            SELECT 
                v.resource_id,
                MAX(CASE WHEN v.property_id = 139 THEN v.value END) as firstname,
                MAX(CASE WHEN v.property_id = 140 THEN v.value END) as lastname
            FROM value v
            WHERE v.resource_id IN ($agentIdsStr)
            AND v.property_id IN (139, 140)
            GROUP BY v.resource_id
        ";
        $agentRows = $this->conn->fetchAllAssociative($agentSql);
        
        // Step 3: Fetch agent thumbnails (using original folder)
        $thumbSql = "
            SELECT item_id, storage_id, extension
            FROM media
            WHERE item_id IN ($agentIdsStr)
        ";
        $thumbRows = $this->conn->fetchAllAssociative($thumbSql);
        $thumbMap = [];
        foreach ($thumbRows as $row) {
            $ext = $row['extension'];
            $thumbMap[$row['item_id']] = "https://tests.arcanes.ca/omk/files/original/{$row['storage_id']}.{$ext}";
        }
        
        // Step 4: Fetch universities (Property 3038 - jdc:hasUniversity)
        $uniSql = "
            SELECT v.resource_id as agent_id, v.value_resource_id as uni_id
            FROM value v
            WHERE v.resource_id IN ($agentIdsStr)
            AND v.property_id = 3038
            AND v.value_resource_id IS NOT NULL
        ";
        $uniLinks = $this->conn->fetchAllAssociative($uniSql);
        
        $uniMap = [];
        if (!empty($uniLinks)) {
            $uniIds = array_unique(array_column($uniLinks, 'uni_id'));
            $uniIdsStr = implode(',', $uniIds);
            
            // Fetch university shortName (Property 17 - dcterms:alternative)
            $uniNameSql = "
                SELECT resource_id, value as shortName
                FROM value
                WHERE resource_id IN ($uniIdsStr)
                AND property_id = 17
            ";
            $uniNames = $this->conn->fetchAllAssociative($uniNameSql);
            $uniNameMap = [];
            foreach ($uniNames as $row) {
                $uniNameMap[$row['resource_id']] = $row['shortName'];
            }
            
            foreach ($uniLinks as $link) {
                if (!isset($uniMap[$link['agent_id']])) {
                    $uniMap[$link['agent_id']] = [];
                }
                if (isset($uniNameMap[$link['uni_id']])) {
                    $uniMap[$link['agent_id']][] = $uniNameMap[$link['uni_id']];
                }
            }
        }
        
        // Step 5: Build agent map
        $agentMap = [];
        foreach ($agentRows as $row) {
            $agentMap[$row['resource_id']] = [
                'id' => (string)$row['resource_id'],
                'firstname' => $row['firstname'] ?? '',
                'lastname' => $row['lastname'] ?? '',
                'name' => trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? '')),
                'picture' => $thumbMap[$row['resource_id']] ?? null,
                'universities' => $uniMap[$row['resource_id']] ?? []
            ];
        }
        
        // Step 6: Group by resource (with deduplication)
        $results = [];
        foreach ($links as $link) {
            $resId = $link['resource_id'];
            $agentId = $link['agent_id'];
            
            if (isset($agentMap[$agentId])) {
                if (!isset($results[$resId])) {
                    $results[$resId] = [];
                }
                
                // Check if this actant is already added to this resource
                $alreadyAdded = false;
                foreach ($results[$resId] as $existing) {
                    if ($existing['id'] === (string)$agentId) {
                        $alreadyAdded = true;
                        break;
                    }
                }
                
                if (!$alreadyAdded) {
                    $results[$resId][] = $agentMap[$agentId];
                }
            }
        }
        
        return $results;
    }

    /**
     * Fetch Creators (Property 2) - Just display_title and thumbnail_url
     */
    private function fetchCreators($idsStr, $creatorProp)
    {
        // Step 1: Get creator links
        $linkSql = "
            SELECT 
                v.resource_id, 
                v.value_resource_id as creator_id,
                v.value as literal_value
            FROM value v
            WHERE v.resource_id IN ($idsStr)
            AND v.property_id = $creatorProp
        ";
        $links = $this->conn->fetchAllAssociative($linkSql);
        
        if (empty($links)) return [];
        
        // Step 2: Process links
        $results = [];
        $creatorIds = [];
        
        foreach ($links as $link) {
            $resId = $link['resource_id'];
            
            // Handle literal values (e.g., "Radio-Canada")
            if ($link['literal_value'] && !$link['creator_id']) {
                if (!isset($results[$resId])) {
                    $results[$resId] = [];
                }
                $results[$resId][] = [
                    'name' => $link['literal_value'],
                    'picture' => null
                ];
            } elseif ($link['creator_id']) {
                $creatorIds[$link['creator_id']] = $resId;
            }
        }
        
        // Step 3: Fetch creator details for resource-linked creators
        if (!empty($creatorIds)) {
            $creatorIdsStr = implode(',', array_keys($creatorIds));
            
            // Fetch titles
            $titleSql = "
                SELECT id, title
                FROM resource
                WHERE id IN ($creatorIdsStr)
            ";
            $titleRows = $this->conn->fetchAllAssociative($titleSql);
            $titleMap = [];
            foreach ($titleRows as $row) {
                $titleMap[$row['id']] = $row['title'];
            }
            
            // Fetch thumbnails (using original folder)
            $thumbSql = "
                SELECT item_id, storage_id, extension
                FROM media
                WHERE item_id IN ($creatorIdsStr)
            ";
            $thumbRows = $this->conn->fetchAllAssociative($thumbSql);
            $thumbMap = [];
            foreach ($thumbRows as $row) {
                $ext = $row['extension'];
                $thumbMap[$row['item_id']] = "https://tests.arcanes.ca/omk/files/original/{$row['storage_id']}.{$ext}";
            }
            
            // Build results
            foreach ($creatorIds as $creatorId => $resId) {
                if (!isset($results[$resId])) {
                    $results[$resId] = [];
                }
                $results[$resId][] = [
                    'id' => (string)$creatorId,
                    'name' => $titleMap[$creatorId] ?? 'Contributor',
                    'picture' => $thumbMap[$creatorId] ?? null
                ];
            }
        }
        
        return $results;
    }
    /**
     * Fetch Genres (Property 1621 - schema:genre)
     * Returns: [ {id, label, value_resource_id} ]
     */
    private function fetchGenres($idsStr, $genreProp)
    {
        $sql = "
            SELECT 
                v.resource_id,
                v.value_resource_id as genre_id,
                r.title as genre_label
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id IN ($idsStr)
            AND v.property_id = $genreProp
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql);
        
        $results = [];
        foreach ($rows as $row) {
            $resId = $row['resource_id'];
            if (!isset($results[$resId])) {
                $results[$resId] = [];
            }
            $results[$resId][] = [
                'id' => $row['genre_id'],
                'label' => $row['genre_label']
            ];
        }
        
        return $results;
    }
}
