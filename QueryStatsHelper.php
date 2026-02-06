<?php
namespace CartoAffect\View\Helper;

use Doctrine\DBAL\Connection;

/**
 * Helper for general corpus statistics and counting operations
 * Provides reusable counting functions for various resource types
 */
class QueryStatsHelper
{
    private $conn;
    
    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
    }
    
    /**
     * Get count of resources by a single template ID
     * 
     * @param int $templateId Resource template ID
     * @return int Count of resources
     */
    public function getResourceCount($templateId)
    {
        $sql = "
            SELECT COUNT(*) as count
            FROM resource
            WHERE resource_template_id = :templateId
        ";
        
        $result = $this->conn->fetchAssociative($sql, ['templateId' => (int)$templateId]);
        return (int)($result['count'] ?? 0);
    }
    
    /**
     * Get counts for multiple template IDs in one query
     * 
     * @param array $templateIds Array of template IDs
     * @return array Map of [templateId => count]
     */
    public function getResourceCounts(array $templateIds)
    {
        if (empty($templateIds)) {
            return [];
        }
        
        $ids = implode(',', array_map('intval', $templateIds));
        
        $sql = "
            SELECT resource_template_id, COUNT(*) as count
            FROM resource
            WHERE resource_template_id IN ($ids)
            GROUP BY resource_template_id
        ";
        
        $rows = $this->conn->fetchAllAssociative($sql);
        
        $result = [];
        foreach ($rows as $row) {
            $result[(int)$row['resource_template_id']] = (int)$row['count'];
        }
        
        // Fill in zeros for template IDs with no resources
        foreach ($templateIds as $tmplId) {
            if (!isset($result[$tmplId])) {
                $result[$tmplId] = 0;
            }
        }
        
        return $result;
    }
    
    /**
     * Get count of resources matching a WHERE condition
     * 
     * @param string $whereClause SQL WHERE clause (without WHERE keyword)
     * @param array $params Query parameters
     * @return int Count
     */
    public function getCountWhere($whereClause, array $params = [])
    {
        $sql = "
            SELECT COUNT(*) as count
            FROM resource r
            WHERE $whereClause
        ";
        
        $result = $this->conn->fetchAssociative($sql, $params);
        return (int)($result['count'] ?? 0);
    }
}
