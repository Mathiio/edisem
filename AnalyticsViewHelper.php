<?php

namespace CartoAffect\View\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * API dediee aux analytics et statistiques
 * Endpoints optimises pour les visualisations analytiques (heatmaps, trends, coverage)
 */
class AnalyticsViewHelper extends AbstractHelper
{
    protected $api;
    protected $conn;

    // Templates des ressources principales (IDs from Omeka resource_template)
    private $templates = [
        'actant' => 105,
        'annotation' => 101,
        'annexe' => 82,
        'bibliographieComplementaire' => 99,
        'bibliography' => 81,
        'carnetRecherche' => 39,
        'citation' => 80,
        'collection' => 92,
        'colloque' => 122,
        'commentaire' => 123,
        'compagnie' => 104,
        'keyword' => 34,
        'seminar' => 71,
        'conferencier' => 72,
        'coursStudent' => 130,
        'departement' => 75,
        'ecoleDoctorale' => 74,
        'edition' => 77,
        'elementEsthetique' => 118,
        'elementNarratif' => 115,
        'conferenceReliee' => 89,
        'etudiant' => 96,
        'evenementArcanes' => 95,
        'experimentation' => 108,
        'experimentationStudent' => 127,
        'studyday' => 121,
        'feedback' => 110,
        'feedbackStudent' => 128,
        'laboratoire' => 91,
        'mediaMiara' => 100,
        'mediagraphieComplementaire' => 98,
        'mediagraphie' => 83,
        'microResumeIA' => 125,
        'misesEnRecitIA' => 111,
        'numeroSeance' => 88,
        'oeuvre' => 103,
        'tool' => 114,
        'toolStudent' => 129,
        'pays' => 94,
        'personneExterne' => 33,
        'recherche' => 102,
        'recitArtistique' => 126,
        'recitCitoyen' => 119,
        'recitMediatique' => 120,
        'recitScientifique' => 124,
        'recitTechnoIndustriel' => 117,
        'saison' => 78,
        'seance' => 76,
        'thematiquesAnalyses' => 106,
        'themeConference' => 87,
        'travauxEtudiants' => 97,
        'universite' => 73,
        'workflow' => 116,
    ];

    // Mapping type -> label francais
    private $typeLabels = [
        'actant' => 'Actants',
        'annotation' => 'Annotations',
        'annexe' => 'Annexes',
        'bibliographieComplementaire' => 'Bibliographies complementaires',
        'bibliography' => 'Bibliographies',
        'carnetRecherche' => 'Carnets de recherche',
        'citation' => 'Citations',
        'collection' => 'Collections',
        'colloque' => 'Colloques',
        'commentaire' => 'Commentaires',
        'compagnie' => 'Compagnies',
        'keyword' => 'Mots-cles',
        'seminar' => 'Seminaires',
        'conferencier' => 'Conferenciers',
        'coursStudent' => 'Cours (Etudiant)',
        'departement' => 'Departements',
        'ecoleDoctorale' => 'Ecoles doctorales',
        'edition' => 'Editions',
        'elementEsthetique' => 'Elements esthetiques',
        'elementNarratif' => 'Elements narratifs',
        'conferenceReliee' => 'Conferences reliees',
        'etudiant' => 'Etudiants',
        'evenementArcanes' => 'Evenements Arcanes',
        'experimentation' => 'Experimentations',
        'experimentationStudent' => 'Experimentations (Etudiant)',
        'studyday' => 'Journees d\'etude',
        'feedback' => 'Retours d\'experience',
        'feedbackStudent' => 'Retours d\'experience (Etudiant)',
        'laboratoire' => 'Laboratoires',
        'mediaMiara' => 'Medias MIARA',
        'mediagraphieComplementaire' => 'Mediagraphies complementaires',
        'mediagraphie' => 'Mediagraphies',
        'microResumeIA' => 'Micro resumes IA',
        'misesEnRecitIA' => 'Mises en recit de l\'IA',
        'numeroSeance' => 'Numeros de seance',
        'oeuvre' => 'Oeuvres',
        'tool' => 'Outils',
        'toolStudent' => 'Outils (Etudiant)',
        'pays' => 'Pays',
        'personneExterne' => 'Personnes externes',
        'recherche' => 'Recherches',
        'recitArtistique' => 'Recits artistiques',
        'recitCitoyen' => 'Recits Citoyens',
        'recitMediatique' => 'Recits Mediatiques',
        'recitScientifique' => 'Recits Scientifiques',
        'recitTechnoIndustriel' => 'Recits Techno-Industriels',
        'saison' => 'Saisons',
        'seance' => 'Seances',
        'thematiquesAnalyses' => 'Thematiques des analyses',
        'themeConference' => 'Themes de conference',
        'travauxEtudiants' => 'Travaux etudiants',
        'universite' => 'Universites',
        'workflow' => 'Workflows',
    ];

    // IDs des proprietes importantes
    private $properties = [
        'title' => 1,           // dcterms:title
        'date' => 7,            // dcterms:date
        'created' => 15,        // dcterms:created
        'keyword' => 2097,      // jdc:hasConcept (motcles/keywords)
        'subject' => 3,         // dcterms:subject
    ];

    public function __construct($api, $conn)
    {
        $this->api = $api;
        $this->conn = $conn;
    }

    public function __invoke($params = [])
    {
        // Fusion des parametres de differentes sources
        $rawBody = file_get_contents('php://input');
        if ($rawBody) {
            $jsonData = json_decode($rawBody, true);
            if ($jsonData && is_array($jsonData)) {
                $params = array_merge($params, $jsonData);
            }
        }
        if (!empty($_POST)) {
            $params = array_merge($params, $_POST);
        }
        if (!empty($_GET)) {
            $params = array_merge($params, $_GET);
        }

        if ($params == []) {
            return ['error' => 'No params provided'];
        }

        $action = isset($params['action']) ? $params['action'] : '';

        switch ($action) {
            // ========== DONNEES GLOBALES ==========

            // Vue d'ensemble: comptages par type
            case 'getOverview':
                $result = $this->getOverview();
                break;

            // ========== ANALYSE TEMPORELLE ==========

            // Activite par jour (pour heatmap calendrier)
            case 'getActivityByDay':
                $year = isset($params['year']) ? (int)$params['year'] : date('Y');
                $result = $this->getActivityByDay($year);
                break;

            // Tendances des keywords dans le temps
            case 'getKeywordTrends':
                $limit = isset($params['limit']) ? (int)$params['limit'] : 10;
                $result = $this->getKeywordTrends($limit);
                break;

            // Timeline des ressources
            case 'getTimeline':
                $types = isset($params['types']) ? explode(',', $params['types']) : null;
                $result = $this->getTimeline($types);
                break;

            // ========== ANALYSE DES LACUNES ==========

            // Matrice de couverture Type x Keyword
            case 'getCoverageMatrix':
                $topKeywords = isset($params['topKeywords']) ? (int)$params['topKeywords'] : 20;
                $result = $this->getCoverageMatrix($topKeywords);
                break;

            // Ressources orphelines (peu connectees)
            case 'getOrphanResources':
                $threshold = isset($params['threshold']) ? (int)$params['threshold'] : 2;
                $result = $this->getOrphanResources($threshold);
                break;

            // Completude des metadonnees par type
            case 'getCompletenessStats':
                $result = $this->getCompletenessStats();
                break;

            // ========== ANALYSE RESEAU ==========

            // Relations entre types (pour chord diagram)
            case 'getTypeRelations':
                $result = $this->getTypeRelations();
                break;

            // Co-occurrence des keywords
            case 'getKeywordCooccurrence':
                $limit = isset($params['limit']) ? (int)$params['limit'] : 30;
                $minOccurrence = isset($params['minOccurrence']) ? (int)$params['minOccurrence'] : 2;
                $result = $this->getKeywordCooccurrence($limit, $minOccurrence);
                break;

            // ========== ANALYSE ACTANTS ==========

            // Metriques des actants
            case 'getActantMetrics':
                $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
                $result = $this->getActantMetrics($limit);
                break;

            // Reseau de collaboration
            case 'getCollaborationNetwork':
                $minCollabs = isset($params['minCollabs']) ? (int)$params['minCollabs'] : 1;
                $result = $this->getCollaborationNetwork($minCollabs);
                break;

            // ========== ANALYSE PAR TYPE ==========

            // Keywords specifiques a un type de ressource
            case 'getKeywordsByType':
                $type = isset($params['type']) ? $params['type'] : null;
                $result = $this->getKeywordsByType($type);
                break;

            // Statistiques de couverture par type
            case 'getCoverageStats':
                $topKeywords = isset($params['topKeywords']) ? (int)$params['topKeywords'] : 15;
                $result = $this->getCoverageStats($topKeywords);
                break;

            default:
                $result = ['error' => 'Action inconnue: ' . $action];
        }

        return $result;
    }

    // ========== DONNEES GLOBALES ==========

    /**
     * Vue d'ensemble: comptage par type de ressource
     */
    private function getOverview()
    {
        $counts = [];

        foreach ($this->templates as $type => $templateId) {
            $sql = "SELECT COUNT(*) as count FROM resource WHERE resource_template_id = :templateId AND is_public = 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['templateId' => $templateId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            $counts[] = [
                'type' => $type,
                'label' => $this->typeLabels[$type] ?? $type,
                'count' => (int)$row['count'],
                'templateId' => $templateId
            ];
        }

        // Trier par count decroissant
        usort($counts, function($a, $b) {
            return $b['count'] - $a['count'];
        });

        // Total global
        $totalSql = "SELECT COUNT(*) as total FROM resource WHERE is_public = 1";
        $stmt = $this->conn->prepare($totalSql);
        $stmt->execute();
        $total = $stmt->fetch(\PDO::FETCH_ASSOC)['total'];

        return [
            'types' => $counts,
            'total' => (int)$total,
            'generatedAt' => date('Y-m-d H:i:s')
        ];
    }

    // ========== ANALYSE TEMPORELLE ==========

    /**
     * Activite par jour pour une annee (heatmap calendrier style GitHub)
     */
    private function getActivityByDay($year)
    {
        $sql = "
            SELECT
                DATE(created) as date,
                COUNT(*) as count
            FROM resource
            WHERE YEAR(created) = :year
            AND is_public = 1
            GROUP BY DATE(created)
            ORDER BY date
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['year' => $year]);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Construire un tableau avec toutes les dates de l'annee
        $startDate = new \DateTime("$year-01-01");
        $endDate = new \DateTime("$year-12-31");
        $interval = new \DateInterval('P1D');
        $period = new \DatePeriod($startDate, $interval, $endDate->modify('+1 day'));

        $activityMap = [];
        foreach ($rows as $row) {
            $activityMap[$row['date']] = (int)$row['count'];
        }

        $result = [];
        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $result[] = [
                'date' => $dateStr,
                'count' => $activityMap[$dateStr] ?? 0,
                'weekday' => (int)$date->format('w'), // 0=dimanche
                'week' => (int)$date->format('W')
            ];
        }

        // Statistiques
        $totalActivity = array_sum(array_column($result, 'count'));
        $activeDays = count(array_filter($result, fn($d) => $d['count'] > 0));
        $maxActivity = max(array_column($result, 'count'));

        return [
            'year' => $year,
            'days' => $result,
            'stats' => [
                'totalActivity' => $totalActivity,
                'activeDays' => $activeDays,
                'maxDailyActivity' => $maxActivity,
                'avgDailyActivity' => $activeDays > 0 ? round($totalActivity / $activeDays, 2) : 0
            ]
        ];
    }

    /**
     * Evolution des keywords dans le temps (pour streamgraph/area chart)
     */
    private function getKeywordTrends($limit = 10)
    {
        $limit = (int)$limit;

        // D'abord, trouver les keywords les plus utilises
        // property_id 2097 = jdc:hasConcept (motcles/keywords)
        $topKeywordsSql = "
            SELECT
                v.value_resource_id as keyword_id,
                kr.title as keyword_title,
                COUNT(*) as total_usage
            FROM value v
            JOIN resource kr ON v.value_resource_id = kr.id
            WHERE v.property_id = 2097
            AND kr.resource_template_id = :keywordTemplate
            GROUP BY v.value_resource_id, kr.title
            ORDER BY total_usage DESC
            LIMIT $limit
        ";

        $stmt = $this->conn->prepare($topKeywordsSql);
        $stmt->execute([
            'keywordTemplate' => $this->templates['keyword']
        ]);
        $topKeywords = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($topKeywords)) {
            return ['keywords' => [], 'timeline' => []];
        }

        $keywordIds = array_column($topKeywords, 'keyword_id');
        $keywordMap = [];
        foreach ($topKeywords as $kw) {
            $keywordMap[$kw['keyword_id']] = $kw['keyword_title'];
        }

        // Recuperer l'evolution par annee
        $trendSql = "
            SELECT
                YEAR(r.created) as year,
                v.value_resource_id as keyword_id,
                COUNT(*) as count
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE v.value_resource_id IN (" . implode(',', $keywordIds) . ")
            AND v.property_id = 2097
            AND r.is_public = 1
            GROUP BY YEAR(r.created), v.value_resource_id
            ORDER BY year
        ";

        $stmt = $this->conn->prepare($trendSql);
        $stmt->execute();
        $trends = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Restructurer les donnees
        $timeline = [];
        foreach ($trends as $row) {
            $year = $row['year'];
            if (!isset($timeline[$year])) {
                $timeline[$year] = ['year' => (int)$year];
                foreach ($keywordMap as $id => $title) {
                    $timeline[$year]['kw_' . $id] = 0;
                }
            }
            $timeline[$year]['kw_' . $row['keyword_id']] = (int)$row['count'];
        }

        return [
            'keywords' => array_map(function($id, $title) {
                return ['id' => (int)$id, 'title' => $title, 'key' => 'kw_' . $id];
            }, array_keys($keywordMap), array_values($keywordMap)),
            'timeline' => array_values($timeline)
        ];
    }

    /**
     * Timeline des ressources par type
     */
    private function getTimeline($types = null)
    {
        $templateFilter = '';
        $params = [];

        if ($types) {
            $templateIds = [];
            foreach ($types as $type) {
                if (isset($this->templates[$type])) {
                    $templateIds[] = $this->templates[$type];
                }
            }
            if (!empty($templateIds)) {
                $templateFilter = 'AND r.resource_template_id IN (' . implode(',', $templateIds) . ')';
            }
        }

        $sql = "
            SELECT
                r.id,
                r.title,
                r.created,
                r.resource_template_id as template_id
            FROM resource r
            WHERE r.is_public = 1
            AND r.created IS NOT NULL
            $templateFilter
            ORDER BY r.created DESC
            LIMIT 500
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Ajouter le type a chaque ressource
        $templateToType = array_flip($this->templates);
        foreach ($rows as &$row) {
            $row['type'] = $templateToType[$row['template_id']] ?? 'unknown';
            $row['label'] = $this->typeLabels[$row['type']] ?? $row['type'];
        }

        return [
            'items' => $rows,
            'count' => count($rows)
        ];
    }

    // ========== ANALYSE DES LACUNES ==========

    /**
     * Matrice de couverture: Types x Keywords
     * Montre quels types de ressources sont associes a quels keywords
     */
    private function getCoverageMatrix($topKeywords = 20)
    {
        $topKeywords = (int)$topKeywords;

        // Recuperer les top keywords
        // property_id 2097 = jdc:hasConcept (motcles/keywords)
        $topKwSql = "
            SELECT
                kr.id as keyword_id,
                kr.title as keyword_title,
                COUNT(*) as usage_count
            FROM value v
            JOIN resource kr ON v.value_resource_id = kr.id
            WHERE v.property_id = 2097
            AND kr.resource_template_id = :keywordTemplate
            GROUP BY kr.id, kr.title
            ORDER BY usage_count DESC
            LIMIT $topKeywords
        ";

        $stmt = $this->conn->prepare($topKwSql);
        $stmt->execute([
            'keywordTemplate' => $this->templates['keyword']
        ]);
        $keywords = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($keywords)) {
            return ['matrix' => [], 'keywords' => [], 'types' => []];
        }

        $keywordIds = array_column($keywords, 'keyword_id');

        // Construire la matrice
        $matrixSql = "
            SELECT
                r.resource_template_id as template_id,
                v.value_resource_id as keyword_id,
                COUNT(*) as count
            FROM value v
            JOIN resource r ON v.resource_id = r.id
            WHERE v.value_resource_id IN (" . implode(',', $keywordIds) . ")
            AND r.is_public = 1
            GROUP BY r.resource_template_id, v.value_resource_id
        ";

        $stmt = $this->conn->prepare($matrixSql);
        $stmt->execute();
        $matrixData = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Construire la structure de sortie
        $templateToType = array_flip($this->templates);
        $matrix = [];

        foreach ($matrixData as $row) {
            $type = $templateToType[$row['template_id']] ?? null;
            if (!$type) continue;

            if (!isset($matrix[$type])) {
                $matrix[$type] = [
                    'type' => $type,
                    'label' => $this->typeLabels[$type] ?? $type,
                    'keywords' => []
                ];
            }

            $matrix[$type]['keywords'][$row['keyword_id']] = (int)$row['count'];
        }

        // Identifier les lacunes (type-keyword avec count = 0)
        $gaps = [];
        foreach ($this->templates as $type => $templateId) {
            if (!isset($matrix[$type])) {
                $matrix[$type] = [
                    'type' => $type,
                    'label' => $this->typeLabels[$type] ?? $type,
                    'keywords' => []
                ];
            }

            foreach ($keywords as $kw) {
                $kwId = $kw['keyword_id'];
                if (!isset($matrix[$type]['keywords'][$kwId]) || $matrix[$type]['keywords'][$kwId] == 0) {
                    $gaps[] = [
                        'type' => $type,
                        'typeLabel' => $this->typeLabels[$type] ?? $type,
                        'keywordId' => $kwId,
                        'keywordTitle' => $kw['keyword_title']
                    ];
                    $matrix[$type]['keywords'][$kwId] = 0;
                }
            }
        }

        return [
            'matrix' => array_values($matrix),
            'keywords' => $keywords,
            'types' => array_keys($this->templates),
            'gaps' => $gaps,
            'gapCount' => count($gaps)
        ];
    }

    /**
     * Ressources orphelines (peu de connexions)
     */
    private function getOrphanResources($threshold = 2)
    {
        // Compter les relations sortantes pour chaque ressource
        $sql = "
            SELECT
                r.id,
                r.title,
                r.resource_template_id as template_id,
                r.created,
                COUNT(DISTINCT v.value_resource_id) as link_count
            FROM resource r
            LEFT JOIN value v ON r.id = v.resource_id AND v.value_resource_id IS NOT NULL
            WHERE r.is_public = 1
            GROUP BY r.id, r.title, r.resource_template_id, r.created
            HAVING link_count <= :threshold
            ORDER BY link_count ASC, r.created DESC
            LIMIT 100
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['threshold' => $threshold]);
        $orphans = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $templateToType = array_flip($this->templates);
        foreach ($orphans as &$orphan) {
            $orphan['type'] = $templateToType[$orphan['template_id']] ?? 'unknown';
            $orphan['label'] = $this->typeLabels[$orphan['type']] ?? $orphan['type'];
            $orphan['link_count'] = (int)$orphan['link_count'];
        }

        // Grouper par type
        $byType = [];
        foreach ($orphans as $orphan) {
            $type = $orphan['type'];
            if (!isset($byType[$type])) {
                $byType[$type] = [
                    'type' => $type,
                    'label' => $orphan['label'],
                    'count' => 0,
                    'items' => []
                ];
            }
            $byType[$type]['count']++;
            $byType[$type]['items'][] = $orphan;
        }

        return [
            'threshold' => $threshold,
            'totalOrphans' => count($orphans),
            'byType' => array_values($byType),
            'items' => $orphans
        ];
    }

    /**
     * Statistiques de completude des metadonnees
     * Basee sur les proprietes definies dans le Resource Template de chaque type
     */
    private function getCompletenessStats()
    {
        $stats = [];

        foreach ($this->templates as $type => $templateId) {
            // Compter le total de ressources
            $totalSql = "SELECT COUNT(*) as total FROM resource WHERE resource_template_id = :templateId AND is_public = 1";
            $stmt = $this->conn->prepare($totalSql);
            $stmt->execute(['templateId' => $templateId]);
            $total = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['total'];

            if ($total == 0) continue;

            // Recuperer les proprietes du Resource Template
            $templatePropsSql = "
                SELECT
                    rtp.property_id,
                    p.local_name,
                    p.label,
                    v.label as vocab_prefix,
                    rtp.is_required
                FROM resource_template_property rtp
                JOIN property p ON rtp.property_id = p.id
                JOIN vocabulary v ON p.vocabulary_id = v.id
                WHERE rtp.resource_template_id = :templateId
                ORDER BY rtp.position
            ";
            $stmt = $this->conn->prepare($templatePropsSql);
            $stmt->execute(['templateId' => $templateId]);
            $templateProperties = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            if (empty($templateProperties)) continue;

            $typeStats = [
                'type' => $type,
                'label' => $this->typeLabels[$type] ?? $type,
                'total' => $total,
                'templatePropertyCount' => count($templateProperties),
                'properties' => []
            ];

            // Pour chaque propriete du template, compter combien de ressources l'ont remplie
            foreach ($templateProperties as $prop) {
                $propId = $prop['property_id'];
                $propName = $prop['local_name'];
                $propLabel = $prop['label'];
                $isRequired = (bool)$prop['is_required'];

                $filledSql = "
                    SELECT COUNT(DISTINCT r.id) as filled
                    FROM resource r
                    JOIN value v ON r.id = v.resource_id
                    WHERE r.resource_template_id = :templateId
                    AND r.is_public = 1
                    AND v.property_id = :propId
                    AND (v.value IS NOT NULL AND v.value != '' OR v.value_resource_id IS NOT NULL OR v.uri IS NOT NULL)
                ";
                $stmt = $this->conn->prepare($filledSql);
                $stmt->execute(['templateId' => $templateId, 'propId' => $propId]);
                $filled = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['filled'];

                $typeStats['properties'][$propName] = [
                    'id' => (int)$propId,
                    'label' => $propLabel,
                    'required' => $isRequired,
                    'filled' => $filled,
                    'missing' => $total - $filled,
                    'percentage' => round(($filled / $total) * 100, 1)
                ];
            }

            // Score global de completude (moyenne de toutes les proprietes)
            $percentages = array_column($typeStats['properties'], 'percentage');
            $typeStats['overallCompleteness'] = count($percentages) > 0
                ? round(array_sum($percentages) / count($percentages), 1)
                : 0;

            // Score pour les proprietes requises uniquement
            $requiredProps = array_filter($typeStats['properties'], fn($p) => $p['required']);
            $requiredPercentages = array_column($requiredProps, 'percentage');
            $typeStats['requiredCompleteness'] = count($requiredPercentages) > 0
                ? round(array_sum($requiredPercentages) / count($requiredPercentages), 1)
                : 100;

            $stats[] = $typeStats;
        }

        // Trier par completude
        usort($stats, function($a, $b) {
            return $b['overallCompleteness'] - $a['overallCompleteness'];
        });

        return [
            'stats' => $stats
        ];
    }

    // ========== ANALYSE RESEAU ==========

    /**
     * Relations entre types de ressources (pour chord diagram)
     */
    private function getTypeRelations()
    {
        $sql = "
            SELECT
                r1.resource_template_id as source_template,
                r2.resource_template_id as target_template,
                COUNT(*) as link_count
            FROM value v
            JOIN resource r1 ON v.resource_id = r1.id
            JOIN resource r2 ON v.value_resource_id = r2.id
            WHERE r1.is_public = 1
            AND r2.is_public = 1
            AND v.value_resource_id IS NOT NULL
            GROUP BY r1.resource_template_id, r2.resource_template_id
            HAVING link_count > 0
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $relations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $templateToType = array_flip($this->templates);
        $links = [];
        $types = [];

        foreach ($relations as $rel) {
            $sourceType = $templateToType[$rel['source_template']] ?? null;
            $targetType = $templateToType[$rel['target_template']] ?? null;

            if ($sourceType && $targetType) {
                $links[] = [
                    'source' => $sourceType,
                    'target' => $targetType,
                    'value' => (int)$rel['link_count']
                ];
                $types[$sourceType] = true;
                $types[$targetType] = true;
            }
        }

        return [
            'nodes' => array_map(function($type) {
                return [
                    'id' => $type,
                    'label' => $this->typeLabels[$type] ?? $type
                ];
            }, array_keys($types)),
            'links' => $links
        ];
    }

    /**
     * Co-occurrence des keywords
     */
    private function getKeywordCooccurrence($limit = 30, $minOccurrence = 2)
    {
        $limit = (int)$limit;

        // Recuperer les keywords les plus frequents
        // property_id 2097 = jdc:hasConcept (motcles/keywords)
        $topKwSql = "
            SELECT
                kr.id as keyword_id,
                kr.title as keyword_title,
                COUNT(*) as usage_count
            FROM value v
            JOIN resource kr ON v.value_resource_id = kr.id
            WHERE v.property_id = 2097
            AND kr.resource_template_id = :keywordTemplate
            GROUP BY kr.id, kr.title
            ORDER BY usage_count DESC
            LIMIT $limit
        ";

        $stmt = $this->conn->prepare($topKwSql);
        $stmt->execute([
            'keywordTemplate' => $this->templates['keyword']
        ]);
        $keywords = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (count($keywords) < 2) {
            return ['nodes' => [], 'links' => []];
        }

        $keywordIds = array_column($keywords, 'keyword_id');

        // Trouver les co-occurrences (2 keywords sur la meme ressource)
        $cooccurrenceSql = "
            SELECT
                v1.value_resource_id as kw1,
                v2.value_resource_id as kw2,
                COUNT(DISTINCT v1.resource_id) as cooccurrence_count
            FROM value v1
            JOIN value v2 ON v1.resource_id = v2.resource_id
                AND v1.value_resource_id < v2.value_resource_id
            WHERE v1.value_resource_id IN (" . implode(',', $keywordIds) . ")
            AND v2.value_resource_id IN (" . implode(',', $keywordIds) . ")
            GROUP BY v1.value_resource_id, v2.value_resource_id
            HAVING cooccurrence_count >= :minOccurrence
        ";

        $stmt = $this->conn->prepare($cooccurrenceSql);
        $stmt->execute(['minOccurrence' => $minOccurrence]);
        $cooccurrences = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Construire les liens
        $links = [];
        $usedKeywords = [];

        foreach ($cooccurrences as $co) {
            $links[] = [
                'source' => (int)$co['kw1'],
                'target' => (int)$co['kw2'],
                'value' => (int)$co['cooccurrence_count']
            ];
            $usedKeywords[$co['kw1']] = true;
            $usedKeywords[$co['kw2']] = true;
        }

        // Filtrer les nodes pour ne garder que ceux avec des liens
        $nodes = array_filter($keywords, function($kw) use ($usedKeywords) {
            return isset($usedKeywords[$kw['keyword_id']]);
        });

        return [
            'nodes' => array_map(function($kw) {
                return [
                    'id' => (int)$kw['keyword_id'],
                    'label' => $kw['keyword_title'],
                    'value' => (int)$kw['usage_count']
                ];
            }, array_values($nodes)),
            'links' => $links
        ];
    }

    // ========== ANALYSE ACTANTS ==========

    /**
     * Metriques des actants (interventions, diversite thematique, etc.)
     */
    private function getActantMetrics($limit = 50)
    {
        $limit = (int)$limit;

        // Compter les interventions par actant
        $sql = "
            SELECT
                a.id,
                a.title as name,
                COUNT(DISTINCT v.resource_id) as intervention_count,
                COUNT(DISTINCT kv.value_resource_id) as keyword_diversity
            FROM resource a
            LEFT JOIN value v ON v.value_resource_id = a.id
            LEFT JOIN value kv ON kv.resource_id = v.resource_id
                AND kv.value_resource_id IS NOT NULL
                AND kv.value_resource_id != a.id
            WHERE a.resource_template_id = :actantTemplate
            AND a.is_public = 1
            GROUP BY a.id, a.title
            ORDER BY intervention_count DESC
            LIMIT $limit
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'actantTemplate' => $this->templates['actant']
        ]);
        $actants = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Recuperer les photos
        foreach ($actants as &$actant) {
            $actant['intervention_count'] = (int)$actant['intervention_count'];
            $actant['keyword_diversity'] = (int)$actant['keyword_diversity'];
            $actant['picture'] = $this->getActantPicture($actant['id']);
        }

        return [
            'actants' => $actants,
            'count' => count($actants)
        ];
    }

    /**
     * Reseau de collaboration entre actants
     */
    private function getCollaborationNetwork($minCollabs = 1)
    {
        // Trouver les actants qui interviennent sur les memes ressources
        $sql = "
            SELECT
                v1.value_resource_id as actant1,
                v2.value_resource_id as actant2,
                COUNT(DISTINCT v1.resource_id) as collab_count
            FROM value v1
            JOIN value v2 ON v1.resource_id = v2.resource_id
                AND v1.value_resource_id < v2.value_resource_id
            JOIN resource a1 ON v1.value_resource_id = a1.id AND a1.resource_template_id = :actantTemplate
            JOIN resource a2 ON v2.value_resource_id = a2.id AND a2.resource_template_id = :actantTemplate
            WHERE v1.property_id IN (
                SELECT id FROM property WHERE local_name IN ('agent', 'creator', 'contributor', 'credits')
            )
            AND v2.property_id IN (
                SELECT id FROM property WHERE local_name IN ('agent', 'creator', 'contributor', 'credits')
            )
            GROUP BY v1.value_resource_id, v2.value_resource_id
            HAVING collab_count >= :minCollabs
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'actantTemplate' => $this->templates['actant'],
            'minCollabs' => $minCollabs
        ]);
        $collaborations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Collecter les IDs d'actants impliques
        $actantIds = [];
        $links = [];

        foreach ($collaborations as $collab) {
            $actantIds[$collab['actant1']] = true;
            $actantIds[$collab['actant2']] = true;
            $links[] = [
                'source' => (int)$collab['actant1'],
                'target' => (int)$collab['actant2'],
                'value' => (int)$collab['collab_count']
            ];
        }

        if (empty($actantIds)) {
            return ['nodes' => [], 'links' => []];
        }

        // Recuperer les infos des actants
        $actantInfoSql = "
            SELECT id, title as name
            FROM resource
            WHERE id IN (" . implode(',', array_keys($actantIds)) . ")
        ";
        $stmt = $this->conn->prepare($actantInfoSql);
        $stmt->execute();
        $actants = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $nodes = [];
        foreach ($actants as $actant) {
            $nodes[] = [
                'id' => (int)$actant['id'],
                'name' => $actant['name'],
                'picture' => $this->getActantPicture($actant['id'])
            ];
        }

        return [
            'nodes' => $nodes,
            'links' => $links
        ];
    }

    /**
     * Recuperer la photo d'un actant
     */
    private function getActantPicture($actantId)
    {
        $sql = "
            SELECT storage_id, extension
            FROM media
            WHERE item_id = :id
            ORDER BY position ASC
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $actantId]);
        $media = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($media && $media['storage_id']) {
            $ext = $media['extension'] ? '.' . $media['extension'] : '';
            return '/files/square/' . $media['storage_id'] . $ext;
        }

        return null;
    }

    // ========== ANALYSE PAR TYPE ==========

    /**
     * Keywords specifiques a un type de ressource
     * Retourne TOUS les keywords utilises par ce type (pas seulement le top global)
     */
    private function getKeywordsByType($type)
    {
        if (!$type || !isset($this->templates[$type])) {
            return ['error' => 'Type invalide: ' . $type];
        }

        $templateId = $this->templates[$type];

        // Compter le total de ressources de ce type
        $totalSql = "
            SELECT COUNT(*) as total
            FROM resource
            WHERE resource_template_id = :templateId
            AND is_public = 1
        ";
        $stmt = $this->conn->prepare($totalSql);
        $stmt->execute(['templateId' => $templateId]);
        $totalResources = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['total'];

        // Compter les ressources avec au moins un keyword
        $withKeywordsSql = "
            SELECT COUNT(DISTINCT r.id) as count
            FROM resource r
            JOIN value v ON r.id = v.resource_id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND v.property_id = 2097
            AND v.value_resource_id IS NOT NULL
        ";
        $stmt = $this->conn->prepare($withKeywordsSql);
        $stmt->execute(['templateId' => $templateId]);
        $resourcesWithKeywords = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['count'];

        // Recuperer tous les keywords utilises par ce type avec leur frequence
        $keywordsSql = "
            SELECT
                kr.id,
                kr.title,
                COUNT(*) as count
            FROM resource r
            JOIN value v ON r.id = v.resource_id
            JOIN resource kr ON v.value_resource_id = kr.id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND v.property_id = 2097
            AND kr.resource_template_id = :keywordTemplate
            GROUP BY kr.id, kr.title
            ORDER BY count DESC
        ";

        $stmt = $this->conn->prepare($keywordsSql);
        $stmt->execute([
            'templateId' => $templateId,
            'keywordTemplate' => $this->templates['keyword']
        ]);
        $keywords = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Formater les resultats
        $formattedKeywords = array_map(function($kw) {
            return [
                'id' => (int)$kw['id'],
                'title' => $kw['title'],
                'count' => (int)$kw['count']
            ];
        }, $keywords);

        $coveragePercentage = $totalResources > 0
            ? round(($resourcesWithKeywords / $totalResources) * 100, 1)
            : 0;

        return [
            'type' => $type,
            'label' => $this->typeLabels[$type] ?? $type,
            'totalResources' => $totalResources,
            'resourcesWithKeywords' => $resourcesWithKeywords,
            'coveragePercentage' => $coveragePercentage,
            'keywords' => $formattedKeywords
        ];
    }

    /**
     * Statistiques de couverture par type
     * Pour chaque type, calcule le % de ressources qui ont au moins un keyword du top N global
     */
    private function getCoverageStats($topKeywords = 15)
    {
        $topKeywords = (int)$topKeywords;

        // D'abord, recuperer les IDs des top N keywords globaux
        $topKwSql = "
            SELECT kr.id
            FROM value v
            JOIN resource kr ON v.value_resource_id = kr.id
            WHERE v.property_id = 2097
            AND kr.resource_template_id = :keywordTemplate
            GROUP BY kr.id
            ORDER BY COUNT(*) DESC
            LIMIT $topKeywords
        ";

        $stmt = $this->conn->prepare($topKwSql);
        $stmt->execute(['keywordTemplate' => $this->templates['keyword']]);
        $topKeywordIds = array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'id');

        if (empty($topKeywordIds)) {
            return ['stats' => [], 'topKeywordsCount' => $topKeywords];
        }

        $topKeywordIdsList = implode(',', $topKeywordIds);
        $stats = [];

        foreach ($this->templates as $type => $templateId) {
            // Ignorer certains types
            if (in_array($type, ['actant', 'keyword'])) continue;

            // Total de ressources de ce type
            $totalSql = "
                SELECT COUNT(*) as total
                FROM resource
                WHERE resource_template_id = :templateId
                AND is_public = 1
            ";
            $stmt = $this->conn->prepare($totalSql);
            $stmt->execute(['templateId' => $templateId]);
            $total = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['total'];

            if ($total == 0) continue;

            // Ressources avec au moins un keyword du top N
            $withTopKwSql = "
                SELECT COUNT(DISTINCT r.id) as count
                FROM resource r
                JOIN value v ON r.id = v.resource_id
                WHERE r.resource_template_id = :templateId
                AND r.is_public = 1
                AND v.property_id = 2097
                AND v.value_resource_id IN ($topKeywordIdsList)
            ";
            $stmt = $this->conn->prepare($withTopKwSql);
            $stmt->execute(['templateId' => $templateId]);
            $withTopKeywords = (int)$stmt->fetch(\PDO::FETCH_ASSOC)['count'];

            $stats[] = [
                'type' => $type,
                'label' => $this->typeLabels[$type] ?? $type,
                'totalResources' => $total,
                'resourcesWithTopKeywords' => $withTopKeywords,
                'coveragePercentage' => round(($withTopKeywords / $total) * 100, 1)
            ];
        }

        // Trier par pourcentage de couverture
        usort($stats, function($a, $b) {
            return $b['coveragePercentage'] - $a['coveragePercentage'];
        });

        return [
            'stats' => $stats,
            'topKeywordsCount' => $topKeywords
        ];
    }
}
