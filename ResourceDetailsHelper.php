<?php
namespace CartoAffect\View\Helper;

use Doctrine\DBAL\Connection;

/**
 * Helper for fetching detailed resource information
 * Unified approach for conferences, experimentations, and recits
 */
class ResourceDetailsHelper
{
    private $conn;
    private $cardHelper;
    
    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
        $this->cardHelper = new QueryCardHelper($conn);
    }
    
    /**
     * Main entry point - get all details for a resource
     * Automatically detects resource type and returns appropriate data
     * 
     * @param int $resourceId
     * @return array|null Resource details or null if not found
     */
    public function getResourceDetails($resourceId)
    {
        // 1. Fetch basic resource info and template
        $basicSql = "
            SELECT r.id, r.title, r.resource_template_id
            FROM resource r
            WHERE r.id = ?
        ";
        $basic = $this->conn->fetchAssociative($basicSql, [$resourceId]);
        
        if (!$basic) {
            return null;
        }
        
        $templateId = $basic['resource_template_id'];
        
        // 2. Determine resource type and fetch appropriate data
        $isConference = in_array($templateId, [71, 121, 122]); // Sém, JE, Coll
        $isExperimentation = $templateId == 108;
        // Include all narrative types (Artistique, Citoyen, Mediatique, Scientifique, Techno)
        $isRecit = in_array($templateId, [103, 131, 119, 120, 124, 117]);
        
        // 3. Build result structure
        $result = [
            'id' => $basic['id'],
            'title' => $basic['title'],
            'resource_template_id' => $templateId,
            'type' => $this->getResourceType($templateId)
        ];
        
        // 4. Fetch common components
        $result['actants'] = $this->fetchActants($resourceId);
        
        // Use fetchRecitMedia for Recits, generic fetchAssociatedMedia for others
        if ($isRecit) {
            $result['associatedMedia'] = $this->fetchRecitMedia($resourceId);
        } else {
            $result['associatedMedia'] = $this->fetchAssociatedMedia($resourceId);
        }
        $result['videoUrl'] = $this->fetchVideoUrl($resourceId);
        
        // 5. Fetch type-specific components
        if ($isConference) {
            $result['abstract'] = $this->fetchAbstract($resourceId);
            $result['date'] = $this->fetchDate($resourceId);
            $result['keywords'] = $this->fetchKeywords($resourceId); // jdc:hasConcept (2097)
            $result['relatedConferences'] = $this->fetchRelatedConferences($resourceId);
            $result['citations'] = $this->fetchCitationsWithDetails($resourceId);
            $result['references'] = $this->fetchReferences($resourceId);
            $result['microResumes'] = $this->fetchMicroResumes($resourceId);
        } elseif ($isExperimentation) {
            // Description from property 4 (dcterms:description)
            $result['description'] = $this->fetchProperty($resourceId, 4);
            $result['abstract'] = $this->fetchProperty($resourceId, 86); // Hypothesis/Abstract (prop 86 - dcterms:abstract)
            $result['date'] = $this->fetchDate($resourceId);
            $result['status'] = $this->fetchStatus($resourceId); // Statut (prop 1418)
            $result['percentage'] = $this->fetchPercentage($resourceId); // Pourcentage d'avancement (prop 1263)
            $result['keywords'] = $this->fetchKeywords($resourceId); // jdc:hasConcept (2097) - même que conférences
            $result['tools'] = $this->fetchTools($resourceId); // Outils techniques (prop 2145)
            $result['feedbacks'] = $this->fetchFeedbacks($resourceId); // Retours d'expérience (prop 1606)
            $result['citations'] = $this->fetchCitationsWithDetails($resourceId); // Citations bibliographiques (prop 48)
            $result['references'] = $this->fetchReferences($resourceId); // Références (prop 36)
        } elseif ($isRecit) {
            $result['date'] = $this->fetchDate($resourceId); // dcterms:date (prop 7)
            $result['description'] = $this->fetchAbstract($resourceId); // dcterms:abstract (prop 19)
            $result['actants'] = $this->fetchRecitActants($resourceId); // schema:contributor (prop 581)
            $result['personne'] = $this->fetchRecitAgents($resourceId); // schema:agent (prop 386)
            $result['url'] = $this->fetchVideoUrl($resourceId); // schema:url (prop 1517) - video
            
            // New sections
            $result['referencesScient'] = $this->fetchLinkedResources($resourceId, 36); // referencesScient (prop 36)
            $result['referencesCultu'] = $this->fetchLinkedResources($resourceId, 48); // referencesCultu (prop 48)
            $result['elementsNarratifs'] = $this->fetchLinkedResources($resourceId, 461); // elementsNarratifs (prop 461)
            $result['elementsEsthetique'] = $this->fetchLinkedResources($resourceId, 428); // elementsEsthetique (prop 428)
            $result['annotations'] = $this->fetchLinkedResources($resourceId, 4); // annotations/analyses critiques (prop 4 linked)
            $result['relatedRecits'] = $this->fetchRelatedRecits($resourceId); // Récits liés (prop 1811 - ma:isRelatedTo)
            $result['keywords'] = $this->fetchKeywords($resourceId); // jdc:hasConcept (prop 2097)

            $result['tools'] = $this->fetchTools($resourceId); // if applicable
        }

        // Special handling for Recit Scientifique (124), Recit Mediatique (120), Recit Citoyen (119) and Recit Techno-Industriel (117)
        if (in_array($templateId, [124, 120, 119, 117])) {
            $result['date'] = $this->fetchDate($resourceId, 23); // dcterms:issued (prop 23)
            $result['purpose'] = $this->fetchProperty($resourceId, 193); // oa:hasPurpose
            $result['application'] = $this->fetchProperty($resourceId, 408); // schema:application
            $result['conditionInitiale'] = $this->fetchProperty($resourceId, 2083); // genstory:hasConditionInitial
            
            // Override/Specific fetches
            $result['actants'] = $this->fetchCreator($resourceId); // dcterms:creator (prop 2)
            $result['descriptions'] = $this->fetchLinkedResources($resourceId, 4); // dcterms:description (prop 4)
            
            if (in_array($templateId, [124, 119, 117])) {
                $result['referencesScient'] = $this->fetchLinkedResources($resourceId, 11); // dcterms:source (prop 11)
                $result['referencesCultu'] = $this->fetchLinkedResources($resourceId, 1659); // schema:review (prop 1659)
            }

            if (in_array($templateId, [120, 119])) {
                $result['citations'] = array_merge(
                    $this->fetchCitationsWithDetails($resourceId) ?? [], 
                    $this->fetchQuotes($resourceId) ?? []
                );
            }
            $result['keywords'] = $this->fetchKeywords($resourceId); // jdc:hasConcept (prop 2097)
            $result['isRelatedTo'] = $this->fetchLinkedResources($resourceId, 937); // schema:isRelatedTo (prop 937)
            $result['isPartOf'] = $this->fetchLinkedResources($resourceId, 33); // dcterms:isPartOf (prop 33)
            $result['descriptionLiteral'] = $this->fetchProperty($resourceId, 4); // dcterms:description (prop 4) - Literal
            
            if ($templateId == 117) {
                $result['slogan'] = $this->fetchProperty($resourceId, 1810); // ma:slogan (prop 1810) if exists
            }
        }
        
        return $result;
    }

    private function getResourceType($templateId) {
        switch ($templateId) {
            case 108: return 'experimentation';
            case 71: return 'seminaire';
            case 121: return 'journee_etudes';
            case 122: return 'colloque';
            case 119: return 'recit_citoyen';
            case 120: return 'recit_mediatique';
            case 124: return 'recit_scientifique';
            case 117: return 'recit_techno_industriel';
            case 103: return 'recit_artistique';
            default: return 'unknown';
        }
    }


    /**
     * Fetch related recits (prop 1811 - ma:isRelatedTo)
     * Uses QueryCardHelper to standardize output
     */
    private function fetchRelatedRecits($resourceId)
    {
        // 1. Get IDs of related resources
        $sql = "
            SELECT DISTINCT v.value_resource_id
            FROM value v
            WHERE v.resource_id = ?
            AND v.property_id = 1811
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        if (empty($rows)) {
            return [];
        }
        
        $relatedIds = array_column($rows, 'value_resource_id');
        
        // 2. Use CardHelper to fetch standardized data
        return $this->cardHelper->fetchCards($relatedIds);
    }
        

    


    /**
     * Generic fetch for linked resources (Prop -> Resource)
     * Used for: referencesScient, referencesCultu, elementsNarratifs, elementsEsthetique, annotations
     */
    private function fetchLinkedResources($resourceId, $propertyId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as thumbnail,
                 (SELECT r.resource_template_id FROM resource r WHERE r.id = v.value_resource_id) as template_id,
                 (SELECT v2.value FROM value v2 WHERE v2.resource_id = r.id AND v2.property_id = 4 LIMIT 1) as description
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = ?
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId, $propertyId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['thumbnail'] : null,
                'type' => $this->getResourceType($row['template_id']),
                'resource_template_id' => $row['template_id'], // Needed for frontend filters
                'description' => $row['description']
            ];
        }, $rows);
    }
    
    /**
     * Generic fetch for a single property value
     */
    private function fetchProperty($resourceId, $propertyId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = ?
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId, $propertyId]) ?: null;
    }
    
    /**
     * Fetch abstract (prop 19) for conferences
     */
    private function fetchAbstract($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 19
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId]) ?: null;
    }
    
    /**
     * Fetch description (prop 561) for experimentations
     */
    private function fetchDescription($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 561
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId]) ?: null;
    }
    
    /**
     * Get thumbnail for a conference - uses media if available, otherwise extracts from YouTube URL
     */
    private function getConferenceThumbnail($mediaFile, $videoUrl)
    {
        // If there's a media file, use it
        if ($mediaFile) {
            return 'https://tests.arcanes.ca/omk/files/original/' . $mediaFile;
        }
        
        // Otherwise, try to extract YouTube thumbnail
        if ($videoUrl && preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/', $videoUrl, $matches)) {
            $videoId = $matches[1];
            return "https://img.youtube.com/vi/$videoId/0.jpg";
        }
        
        return null;
    }
    
    /**
     * Fetch date (default prop 7, but can be overridden)
     */
    private function fetchDate($resourceId, $propertyId = 7)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = ?
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId, $propertyId]) ?: null;
    }
    
    /**
     * Fetch actants (prop 386) - speakers/participants
     * Excludes tools (template 114)
     * Includes universities information (property 3038)
     */
    private function fetchActants($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                MAX(CASE WHEN v.property_id = 139 THEN v.value END) as firstname,
                MAX(CASE WHEN v.property_id = 140 THEN v.value END) as lastname,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as picture
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (139, 140)
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 386
            AND r.resource_template_id = 72
            GROUP BY r.id
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        if (empty($rows)) return [];
        
        $actantIds = array_column($rows, 'id');
        $actantIdsStr = implode(',', $actantIds);
        
        // Fetch universities (Property 3038 - jdc:hasUniversity)
        $uniSql = "
            SELECT v.resource_id as actant_id, v.value_resource_id as uni_id
            FROM value v
            WHERE v.resource_id IN ($actantIdsStr)
            AND v.property_id = 3038
            AND v.value_resource_id IS NOT NULL
        ";
        $uniLinks = $this->conn->fetchAllAssociative($uniSql);
        
        $uniMap = [];
        if (!empty($uniLinks)) {
            $uniIds = array_unique(array_column($uniLinks, 'uni_id'));
            $uniIdsStr = implode(',', $uniIds);
            
            // Fetch university title (property 1 - dcterms:title)
            $uniNameSql = "
                SELECT resource_id, value as name
                FROM value
                WHERE resource_id IN ($uniIdsStr)
                AND property_id = 1
            ";
            $uniNames = $this->conn->fetchAllAssociative($uniNameSql);
            $uniNameMap = [];
            foreach ($uniNames as $uniRow) {
                $uniNameMap[$uniRow['resource_id']] = $uniRow['name'];
            }
            
            foreach ($uniLinks as $link) {
                if (!isset($uniMap[$link['actant_id']])) {
                    $uniMap[$link['actant_id']] = [];
                }
                if (isset($uniNameMap[$link['uni_id']])) {
                    $uniMap[$link['actant_id']][] = $uniNameMap[$link['uni_id']];
                }
            }
        }
        
        return array_map(function($row) use ($uniMap) {
            return [
                'id' => $row['id'],
                'firstname' => $row['firstname'] ?? '',
                'lastname' => $row['lastname'] ?? '',
                'name' => trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? '')),
                'picture' => $row['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['picture'] : null,
                'universities' => $uniMap[$row['id']] ?? []
            ];
        }, $rows);
    }
    
    /**
     * Fetch keywords (prop 2097 - jdc:hasConcept) for conferences
     */
    private function fetchKeywords($resourceId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as name
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 2097
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'name' => $row['name']
            ];
        }, $rows);
    }
    
    /**
     * Fetch subjects (prop 4 - dcterms:subject) for experimentations
     */
    private function fetchSubjects($resourceId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as name
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 4
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'name' => $row['name']
            ];
        }, $rows);
    }
    
    /**
     * Fetch related conferences (prop 937 - schema:isRelatedTo)
     * Returns complete card data including actants with universities
     */
    private function fetchRelatedConferences($resourceId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as title,
                r.resource_template_id,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as thumbnail,
                (SELECT v2.value 
                 FROM value v2 
                 WHERE v2.resource_id = r.id AND v2.property_id = 7 
                 LIMIT 1) as date,
                (SELECT v3.uri
                 FROM value v3
                 WHERE v3.resource_id = r.id AND v3.property_id = 1517
                 LIMIT 1) as video_url
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 937
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            // Fetch actants for this related conference
            $actantsSql = "
                SELECT 
                    r.id,
                    MAX(CASE WHEN v.property_id = 139 THEN v.value END) as firstname,
                    MAX(CASE WHEN v.property_id = 140 THEN v.value END) as lastname,
                    (SELECT CONCAT(m.storage_id, '.', m.extension) 
                     FROM media m 
                     WHERE m.item_id = r.id 
                     LIMIT 1) as picture
                FROM value v_link
                INNER JOIN resource r ON v_link.value_resource_id = r.id
                LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (139, 140)
                WHERE v_link.resource_id = ?
                AND v_link.property_id = 386
                AND r.resource_template_id = 72
                GROUP BY r.id
            ";
            
            $actantsData = $this->conn->fetchAllAssociative($actantsSql, [$row['id']]);
            
            if (empty($actantsData)) {
                $actants = [];
            } else {
                $actantIds = array_column($actantsData, 'id');
                $actantIdsStr = implode(',', $actantIds);
                
                // Fetch universities for all actants (property 3038)
                $uniSql = "
                    SELECT v.resource_id as actant_id, v.value_resource_id as uni_id
                    FROM value v
                    WHERE v.resource_id IN ($actantIdsStr)
                    AND v.property_id = 3038
                    AND v.value_resource_id IS NOT NULL
                ";
                $uniLinks = $this->conn->fetchAllAssociative($uniSql);
                
                $uniMap = [];
                if (!empty($uniLinks)) {
                    $uniIds = array_unique(array_column($uniLinks, 'uni_id'));
                    $uniIdsStr = implode(',', $uniIds);
                    
                    $uniNameSql = "
                        SELECT resource_id, value as shortName
                        FROM value
                        WHERE resource_id IN ($uniIdsStr)
                        AND property_id = 17
                    ";
                    $uniNames = $this->conn->fetchAllAssociative($uniNameSql);
                    $uniNameMap = [];
                    foreach ($uniNames as $uniRow) {
                        $uniNameMap[$uniRow['resource_id']] = $uniRow['shortName'];
                    }
                    
                    foreach ($uniLinks as $link) {
                        if (!isset($uniMap[$link['actant_id']])) {
                            $uniMap[$link['actant_id']] = [];
                        }
                        if (isset($uniNameMap[$link['uni_id']])) {
                            $uniMap[$link['actant_id']][] = $uniNameMap[$link['uni_id']];
                        }
                    }
                }
                
                $actants = array_map(function($actantRow) use ($uniMap) {
                    return [
                        'id' => $actantRow['id'],
                        'firstname' => $actantRow['firstname'] ?? '',
                        'lastname' => $actantRow['lastname'] ?? '',
                        'name' => trim(($actantRow['firstname'] ?? '') . ' ' . ($actantRow['lastname'] ?? '')),
                        'picture' => $actantRow['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $actantRow['picture'] : null,
                        'universities' => $uniMap[$actantRow['id']] ?? []
                    ];
                }, $actantsData);
            }
            
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'thumbnail' => $this->getConferenceThumbnail($row['thumbnail'], $row['video_url']),
                'date' => $row['date'],
                'actants' => $actants,
                'type' => $this->getResourceType($row['resource_template_id']),
                'resource_template_id' => $row['resource_template_id']
            ];
        }, $rows);
    }
    
    /**
     * Fetch citations with full details including actant, times, and citation text
     * Properties: 
     *  - 544: Citation link (schema:citation)
     *  - 269: Citation text (cito:hasCitedEntity)
     *  - 1417: Start time (schema:startTime)
     *  - 735: End time (schema:endTime)
     *  - 315: Actant (cito:isCitedBy)
     */
    private function fetchCitationsWithDetails($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                MAX(CASE WHEN v.property_id = 269 THEN v.value END) as citation_text,
                MAX(CASE WHEN v.property_id = 1417 THEN v.value END) as start_time,
                MAX(CASE WHEN v.property_id = 735 THEN v.value END) as end_time,
                MAX(CASE WHEN v.property_id = 315 THEN v.value_resource_id END) as actant_id
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            LEFT JOIN value v ON r.id = v.resource_id
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 544
            GROUP BY r.id
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            // Always provide an actant object (never null)
            $actant = [
                'id' => '',
                'firstname' => '',
                'lastname' => '',
                'name' => 'Inconnu',
                'picture' => null
            ];
            
            // Fetch actant details if available and override defaults
            if ($row['actant_id']) {
                $actantSql = "
                    SELECT 
                        r.id,
                        MAX(CASE WHEN v.property_id = 139 THEN v.value END) as firstname,
                        MAX(CASE WHEN v.property_id = 140 THEN v.value END) as lastname,
                        (SELECT CONCAT(m.storage_id, '.', m.extension) 
                         FROM media m 
                         WHERE m.item_id = r.id 
                         LIMIT 1) as picture
                    FROM resource r
                    LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (139, 140)
                    WHERE r.id = ?
                    GROUP BY r.id
                ";
                $actantData = $this->conn->fetchAssociative($actantSql, [$row['actant_id']]);
                if ($actantData) {
                    // Fetch universities (property 3038)
                    $uniSql = "
                        SELECT v.value_resource_id as uni_id
                        FROM value v
                        WHERE v.resource_id = ?
                        AND v.property_id = 3038
                        AND v.value_resource_id IS NOT NULL
                    ";
                    $uniLinks = $this->conn->fetchAllAssociative($uniSql, [$row['actant_id']]);
                    
                    $universities = [];
                    if (!empty($uniLinks)) {
                        $uniIds = array_column($uniLinks, 'uni_id');
                        $uniIdsStr = implode(',', $uniIds);
                        
                        $uniNameSql = "
                            SELECT resource_id, value as name
                            FROM value
                            WHERE resource_id IN ($uniIdsStr)
                            AND property_id = 1
                        ";
                        $uniNames = $this->conn->fetchAllAssociative($uniNameSql);
                        $universities = array_column($uniNames, 'name');
                    }
                    
                    $actant = [
                        'id' => $actantData['id'],
                        'firstname' => $actantData['firstname'] ?? '',
                        'lastname' => $actantData['lastname'] ?? '',
                        'name' => trim(($actantData['firstname'] ?? '') . ' ' . ($actantData['lastname'] ?? '')),
                        'picture' => $actantData['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $actantData['picture'] : null,
                        'universities' => $universities
                    ];
                }
            }
            
            return [
                'id' => $row['id'],
                'citation' => $row['citation_text'] ?? '',
                'actant' => $actant, // Always an object, never null
                'startTime' => (int)($row['start_time'] ?? 0),
                'endTime' => (int)($row['end_time'] ?? 0),
            ];
        }, $rows);
    }
    
    /**
     * Convert YouTube URL to embed format
     */
    private function convertToYouTubeEmbed($url)
    {
        if (empty($url)) {
            return null;
        }
        
        // Already an embed URL
        if (strpos($url, 'youtube.com/embed/') !== false) {
            return $url;
        }
        
        // Convert youtube.com/watch?v=VIDEO_ID to youtube.com/embed/VIDEO_ID
        if (preg_match('/youtube\.com\/watch\?v=([^&]+)/', $url, $matches)) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }
        
        // Convert youtu.be/VIDEO_ID to youtube.com/embed/VIDEO_ID
        if (preg_match('/youtu\.be\/([^?]+)/', $url, $matches)) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }
        
        return $url;
    }
    
    /**
     * Fetch video URL (schema:url property 1517) and convert to YouTube embed format
     */
    private function fetchVideoUrl($resourceId)
    {
        $sql = "
            SELECT uri
            FROM value
            WHERE resource_id = ? AND property_id = 1517
            LIMIT 1
        ";
        
        $url = $this->conn->fetchOne($sql, [$resourceId]) ?: null;
        return $this->convertToYouTubeEmbed($url);
    }
    
    /**
     * Fetch references/bibliography (prop 36 - dcterms:references)
     */
    private function fetchReferences($resourceId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as thumbnail
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 36
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['thumbnail'] : null
            ];
        }, $rows);
    }
    
    /**
     * Fetch associated media (prop 438 - schema:associatedMedia)
     */
    private function fetchAssociatedMedia($resourceId)
    {
        $sql = "
            SELECT 
                v.value_resource_id as id,
                r.title as title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as thumbnail
            FROM value v
            INNER JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 438
            AND v.value_resource_id IS NOT NULL
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['thumbnail'] : null
            ];
        }, $rows);
    }
    
    /**
     * Fetch micro-résumés (template 125 linked via prop 1794)
     */
    private function fetchMicroResumes($resourceId)
    {
        // Find micro-résumés that reference this conference
        $sql = "
            SELECT r.id, r.title
            FROM resource r
            INNER JOIN value v ON r.id = v.resource_id
            WHERE v.property_id = 1794
            AND v.value_resource_id = ?
            AND r.resource_template_id = 125
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title']
            ];
        }, $rows);
    }
    
    /**
     * Fetch status (prop 1418) for experimentations
     */
    private function fetchStatus($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 1418
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId]) ?: null;
    }
    
    /**
     * Fetch percentage (prop 1263) for experimentations
     */
    private function fetchPercentage($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 1263
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId]) ?: null;
    }
    
    /**
     * Fetch tools (prop 2145) - technical credits/tools used
     * Returns detailed tool information
     */
    private function fetchTools($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 1 LIMIT 1) as title,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 4 LIMIT 1) as description,
                (SELECT CONCAT(m.storage_id, '.', m.extension) FROM media m WHERE m.item_id = r.id LIMIT 1) as thumbnail
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 2145
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['thumbnail'] : null
            ];
        }, $rows);
    }
    
    /**
     * Fetch feedbacks (prop 1606) - retours d'expérience
     * Returns detailed feedback information with contributors
     */
    private function fetchFeedbacks($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 1 LIMIT 1) as title,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 4 LIMIT 1) as description,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 7 LIMIT 1) as date,
                (SELECT CONCAT(m.storage_id, '.', m.extension) FROM media m WHERE m.item_id = r.id LIMIT 1) as thumbnail
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 1606
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        if (empty($rows)) return [];
        
        // Fetch contributors for each feedback
        $feedbackIds = array_column($rows, 'id');
        $feedbackIdsStr = implode(',', $feedbackIds);
        
        $contributorsSql = "
            SELECT 
                v_link.resource_id as feedback_id,
                r.id as contributor_id,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 139 LIMIT 1) as firstname,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 140 LIMIT 1) as lastname,
                (SELECT CONCAT(m.storage_id, '.', m.extension) FROM media m WHERE m.item_id = r.id LIMIT 1) as picture
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            WHERE v_link.resource_id IN ($feedbackIdsStr)
            AND v_link.property_id = 581
            AND r.resource_template_id = 72
        ";
        
        $contributors = $this->conn->fetchAllAssociative($contributorsSql);
        
        // Group contributors by feedback
        $contributorsByFeedback = [];
        foreach ($contributors as $contributor) {
            $feedbackId = $contributor['feedback_id'];
            if (!isset($contributorsByFeedback[$feedbackId])) {
                $contributorsByFeedback[$feedbackId] = [];
            }
            
            $contributorsByFeedback[$feedbackId][] = [
                'id' => $contributor['contributor_id'],
                'firstname' => $contributor['firstname'],
                'lastname' => $contributor['lastname'],
                'display_title' => trim($contributor['firstname'] . ' ' . $contributor['lastname']),
                'thumbnail_url' => $contributor['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $contributor['picture'] : null
            ];
        }
        
        return array_map(function($row) use ($contributorsByFeedback) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'date' => $row['date'],
                'contributors' => $contributorsByFeedback[$row['id']] ?? []
            ];
        }, $rows);
    }
    

    /**
     * Fetch creator (prop 2 - dcterms:creator)
     * Handles both literal values and resource links
     */
    private function fetchCreator($resourceId)
    {
        $sql = "
            SELECT 
                v.value,
                v.value_resource_id as id,
                r.title as resource_title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as picture
            FROM value v
            LEFT JOIN resource r ON v.value_resource_id = r.id
            WHERE v.resource_id = ?
            AND v.property_id = 2
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        if (empty($rows)) return [];
        
        return array_map(function($row) {
            // Priority: Resource Title > Literal Value
            $name = $row['resource_title'] ?: $row['value'];
            
            return [
                'id' => $row['id'],
                'name' => $name,
                'picture' => $row['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['picture'] : null
            ];
        }, $rows);
    }

    /**
     * Fetch actants for Recit Artistique (Prop 581 - schema:contributor)
     */
    private function fetchRecitActants($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                MAX(CASE WHEN v.property_id = 139 THEN v.value END) as firstname,
                MAX(CASE WHEN v.property_id = 140 THEN v.value END) as lastname,
                (SELECT r2.title FROM value v JOIN resource r2 ON v.value_resource_id = r2.id WHERE v.resource_id = r.id AND v.property_id = 961 LIMIT 1) as job_title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as picture
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            LEFT JOIN value v ON r.id = v.resource_id AND v.property_id IN (139, 140)
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 581
            GROUP BY r.id
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            $name = trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? ''));
            
            return [
                'id' => $row['id'],
                'name' => $name,
                'picture' => $row['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['picture'] : null,
                'firstname' => $row['firstname'] ?? '',
                'lastname' => $row['lastname'] ?? '',
                'role' => $row['job_title'] ?? null,
                'universities' => []
            ];
        }, $rows);
    }

    /**
     * Fetch agents for Recit Artistique (Prop 386 - schema:agent)
     * Generic fetch without template restriction
     */
    private function fetchRecitAgents($resourceId)
    {
        $sql = "
            SELECT 
                r.id,
                r.title as name,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 139 LIMIT 1) as firstname,
                (SELECT v.value FROM value v WHERE v.resource_id = r.id AND v.property_id = 140 LIMIT 1) as lastname,
                (SELECT r2.title FROM value v JOIN resource r2 ON v.value_resource_id = r2.id WHERE v.resource_id = r.id AND v.property_id = 961 LIMIT 1) as job_title,
                (SELECT CONCAT(m.storage_id, '.', m.extension) 
                 FROM media m 
                 WHERE m.item_id = r.id 
                 LIMIT 1) as picture
            FROM value v_link
            INNER JOIN resource r ON v_link.value_resource_id = r.id
            WHERE v_link.resource_id = ?
            AND v_link.property_id = 386
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            $name = $row['name'];
            if ($row['firstname'] || $row['lastname']) {
                $name = trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? ''));
            }
            
            return [
                'id' => $row['id'],
                'name' => $name,
                'picture' => $row['picture'] ? 'https://tests.arcanes.ca/omk/files/original/' . $row['picture'] : null,
                'firstname' => $row['firstname'] ?? '',
                'lastname' => $row['lastname'] ?? '',
                'role' => $row['job_title'] ?? null,
                'universities' => []
            ];
        }, $rows);
    }

    /**
     * Fetch media for Recit Artistique (Prop 438 - schema:associatedMedia)
     * Aligne sur le comportement de getOeuvres() avec support des thumbnails
     */
    private function fetchRecitMedia($resourceId)
    {
        // 1. Récupérer les IDs des médias associés (propriété 438)
        $idsSql = "
            SELECT v.value_resource_id
            FROM value v
            WHERE v.resource_id = ?
            AND v.property_id = 438
            AND v.value_resource_id IS NOT NULL
        ";
        $ids = $this->conn->fetchAllAssociative($idsSql, [$resourceId]);
        $associatedMediaIds = array_column($ids, 'value_resource_id');
        
        if (empty($associatedMediaIds)) {
            return [];
        }
        
        $idsStr = implode(',', array_unique($associatedMediaIds));
        
        // 2. Récupérer les informations des médias (UNION pour item_id ET id comme dans getOeuvres)
        $mediaSql = "
            (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
            FROM `media`
            WHERE item_id IN ($idsStr))
            UNION
            (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file, source, ingester
            FROM `media`
            WHERE id IN ($idsStr))
        ";
        $mediaRows = $this->conn->executeQuery($mediaSql)->fetchAllAssociative();
        
        // 3. Construire la map des médias
        $associatedMediaMap = [];
        foreach ($mediaRows as $media) {
            // Si c'est une vidéo YouTube, utiliser la source
            if ($media['ingester'] === 'youtube' && !empty($media['source'])) {
                $associatedMediaMap[$media['resource_id']] = $media['source'];
            }
            // Sinon, utiliser le fichier normal
            elseif (!empty($media['media_file'])) {
                $associatedMediaMap[$media['resource_id']] = $media['media_file'];
            }
        }
        
        // 4. Récupérer les URIs des médias associés (pour les vidéos YouTube - propriété 121)
        $uriSql = "
            SELECT v.resource_id, v.uri
            FROM `value` v
            WHERE v.resource_id IN ($idsStr)
            AND v.property_id = 121
        ";
        $uriRows = $this->conn->executeQuery($uriSql)->fetchAllAssociative();
        $associatedMediaUriMap = [];
        foreach ($uriRows as $uriData) {
            $associatedMediaUriMap[$uriData['resource_id']] = $uriData['uri'];
        }
        
        // 5. Récupérer les thumbnails
        // On utilise files/original pour garantir que le fichier existe et correspond à l'extension en BDD
        $thumbnailSql = "
            SELECT item_id, storage_id, extension
            FROM `media`
            WHERE item_id IN ($idsStr)
        ";
        $thumbnailRows = $this->conn->executeQuery($thumbnailSql)->fetchAllAssociative();
        $thumbnailMap = [];
        foreach ($thumbnailRows as $media) {
            if (!empty($media['storage_id'])) {
                $filename = $media['storage_id'];
                if (!empty($media['extension'])) {
                    $filename .= '.' . $media['extension'];
                }
                $thumbnailMap[$media['item_id']] = 'https://tests.arcanes.ca/omk/files/original/' . $filename;
            }
        }
        
        // 6. Récupérer les titres des ressources
        $titleSql = "
            SELECT v.resource_id, v.value
            FROM `value` v
            WHERE v.resource_id IN ($idsStr)
            AND v.property_id = 1
        ";
        $titleRows = $this->conn->executeQuery($titleSql)->fetchAllAssociative();
        $titleMap = [];
        foreach ($titleRows as $titleRow) {
            $titleMap[$titleRow['resource_id']] = $titleRow['value'];
        }
        
        // 7. Construire le résultat final
        $results = [];
        foreach ($associatedMediaIds as $mediaId) {
            $title = $titleMap[$mediaId] ?? 'Média';
            $thumbnail = $thumbnailMap[$mediaId] ?? null;
            
            // Vérifier si c'est une vidéo YouTube (depuis URI ou source)
            $isYouTube = false;
            $videoUrl = null;
            
            if (isset($associatedMediaUriMap[$mediaId])) {
                $uri = $associatedMediaUriMap[$mediaId];
                if (strpos($uri, 'youtube.com') !== false || strpos($uri, 'youtu.be') !== false) {
                    $isYouTube = true;
                    $videoUrl = $this->convertToYouTubeEmbed($uri);
                }
            } elseif (isset($associatedMediaMap[$mediaId])) {
                $mediaUrl = $associatedMediaMap[$mediaId];
                if (strpos($mediaUrl, 'youtube.com') !== false || strpos($mediaUrl, 'youtu.be') !== false) {
                    $isYouTube = true;
                    $videoUrl = $this->convertToYouTubeEmbed($mediaUrl);
                }
            }
            
            // Construire l'objet selon le type (comme dans getOeuvres)
            if ($isYouTube) {
                // Si pas de thumbnail, essayer de générer depuis l'URL YouTube
                if (!$thumbnail && $videoUrl) {
                    // Extraire l'ID YouTube de l'URL embed
                    if (preg_match('/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/', $videoUrl, $matches)) {
                        $youtubeId = $matches[1];
                        $thumbnail = "https://img.youtube.com/vi/$youtubeId/0.jpg";
                    }
                }
                
                $results[] = [
                    'id' => $mediaId,
                    'title' => $title,
                    'url' => $videoUrl,
                    'thumbnail' => $thumbnail,
                    'type' => 'video'
                ];
            } else {
                // Pour les images, retourner juste l'URL du thumbnail comme string (comportement getOeuvres)
                if ($thumbnail) {
                    $results[] = $thumbnail;
                } elseif (isset($associatedMediaMap[$mediaId])) {
                    // Fallback sur l'URL originale si pas de thumbnail square
                    $results[] = 'https://tests.arcanes.ca/omk/files/original/' . $associatedMediaMap[$mediaId];
                }
            }
        }
        
        return $results;
    }

    /**
     * Fetch quotes (prop 3236 - storyline:hasQuote)
     * Returns as array of strings
     */
    private function fetchQuotes($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 3236
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql, [$resourceId]);
        
        return array_map(function($row) {
            return $row['value'];
        }, $rows);
    }
}