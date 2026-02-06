<?php
namespace CartoAffect\View\Helper;

use Doctrine\DBAL\Connection;

/**
 * Helper for narrative practices statistics
 * Handles metrics for pratiquesNarratives page and related analytics
 */
class NarrativeStatsHelper
{
    private $conn;
    private $statsHelper;
    
    /**
     * Template ID mapping for narrative resource types
     */
    private $recitTemplates = [
        119 => 'citoyens',           // Recits Citoyens
        120 => 'mediatiques',         // Recits Mediatiques
        124 => 'scientifiques',       // Recits Scientifiques
        117 => 'techno',              // Recits Techno-Industriels
        131 => 'artistiques',         // Recits Artistiques (primary)
        103 => 'artistiques'          // Recits Artistiques (secondary)
    ];
    
    private $experimentationTemplate = 108;
    
    public function __construct(Connection $conn, QueryStatsHelper $statsHelper)
    {
        $this->conn = $conn;
        $this->statsHelper = $statsHelper;
    }
    
    /**
     * Get comprehensive stats for pratiquesNarratives page
     * Returns total counts and breakdown by recit type
     * 
     * @return array {
     *   recits: int,
     *   experimentations: int,
     *   recitsByType: {
     *     citoyens: int,
     *     mediatiques: int,
     *     scientifiques: int,
     *     techno: int,
     *     artistiques: int
     *   }
     * }
     */
    public function getNarrativePracticesStats()
    {
        $allTemplates = array_merge(
            array_keys($this->recitTemplates), 
            [$this->experimentationTemplate]
        );
        
        $counts = $this->statsHelper->getResourceCounts($allTemplates);
        
        $totalRecits = 0;
        $recitsByType = [
            'citoyens' => 0,
            'mediatiques' => 0,
            'scientifiques' => 0,
            'techno' => 0,
            'artistiques' => 0
        ];
        
        // Aggregate counts by type
        foreach ($this->recitTemplates as $tmplId => $type) {
            $count = $counts[$tmplId] ?? 0;
            $totalRecits += $count;
            $recitsByType[$type] += $count;
        }
        
        return [
            'recits' => $totalRecits,
            'experimentations' => $counts[$this->experimentationTemplate] ?? 0,
            'recitsByType' => $recitsByType
        ];
    }
    
    /**
     * Get top keywords across all narrative practices
     * Aggregates keywords from recits and experimentations
     * 
     * @param int $limit Number of keywords to return (default: 8)
     * @return array [{label: string, value: int}, ...]
     */
    public function getTopKeywords($limit = 8)
    {
        $limit = (int)$limit;
        $allTemplates = array_merge(
            array_keys($this->recitTemplates),
            [$this->experimentationTemplate]
        );
        $templateStr = implode(',', $allTemplates);
        
        // Note: LIMIT doesn't support named parameters in MariaDB/MySQL
        // Must use the value directly after casting to int
        $sql = "
            SELECT 
                r_keyword.title as label,
                COUNT(*) as value
            FROM value v
            INNER JOIN resource r ON r.id = v.resource_id
            INNER JOIN resource r_keyword ON v.value_resource_id = r_keyword.id
            WHERE v.property_id = 2097
            AND r.resource_template_id IN ($templateStr)
            GROUP BY r_keyword.id, r_keyword.title
            ORDER BY value DESC
            LIMIT $limit
        ";
        
        return $this->conn->fetchAllAssociative($sql);
    }
    
    /**
     * Get detailed breakdown of recits by type with counts
     * Useful for navigation cards
     * 
     * @return array [{type: string, count: int}, ...]
     */
    public function getRecitTypeBreakdown()
    {
        $counts = $this->statsHelper->getResourceCounts(
            array_keys($this->recitTemplates)
        );
        
        $breakdown = [
            'citoyens' => 0,
            'mediatiques' => 0,
            'scientifiques' => 0,
            'techno' => 0,
            'artistiques' => 0
        ];
        
        foreach ($this->recitTemplates as $tmplId => $type) {
            $breakdown[$type] += $counts[$tmplId] ?? 0;
        }
        
        $result = [];
        foreach ($breakdown as $type => $count) {
            $result[] = [
                'type' => $type,
                'count' => $count
            ];
        }
        
        return $result;
    }
}
