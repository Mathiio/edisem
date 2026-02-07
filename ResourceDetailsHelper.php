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
    
    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
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
        
        // 3. Build result structure
        $result = [
            'id' => $basic['id'],
            'title' => $basic['title'],
            'type' => $this->getResourceType($templateId),
            'template_id' => $templateId,
        ];
        
        // 4. Fetch common components
        $result['actants'] = $this->fetchActants($resourceId);
        $result['associatedMedia'] = $this->fetchAssociatedMedia($resourceId);
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
            $result['description'] = $this->fetchDescription($resourceId);
            $result['date'] = $this->fetchDate($resourceId);
            $result['keywords'] = $this->fetchSubjects($resourceId); // dcterms:subject (4)
        }
        
        return $result;
    }
    
    /**
     * Get resource type label from template ID
     */
    private function getResourceType($templateId)
    {
        $types = [
            71 => 'seminaire',
            121 => 'journee_etudes',
            122 => 'colloque',
            108 => 'experimentation',
        ];
        
        return $types[$templateId] ?? 'unknown';
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
            return 'https://tests.arcanes.ca/omk/files/square/' . $mediaFile;
        }
        
        // Otherwise, try to extract YouTube thumbnail
        if ($videoUrl && preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/', $videoUrl, $matches)) {
            $videoId = $matches[1];
            return "https://img.youtube.com/vi/$videoId/0.jpg";
        }
        
        return null;
    }
    
    /**
     * Fetch date (prop 7)
     */
    private function fetchDate($resourceId)
    {
        $sql = "
            SELECT value
            FROM value
            WHERE resource_id = ? AND property_id = 7
            LIMIT 1
        ";
        
        return $this->conn->fetchOne($sql, [$resourceId]) ?: null;
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
                'actants' => $actants
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
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/square/' . $row['thumbnail'] : null
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
                'thumbnail' => $row['thumbnail'] ? 'https://tests.arcanes.ca/omk/files/square/' . $row['thumbnail'] : null
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
}
