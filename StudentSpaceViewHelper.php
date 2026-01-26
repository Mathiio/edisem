<?php

namespace CartoAffect\View\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * API dédiée à l'espace étudiant
 * Endpoints simplifiés pour les ressources étudiantes (expérimentations, outils, feedbacks)
 */
class StudentSpaceViewHelper extends AbstractHelper
{
    protected $api;
    protected $conn;

    // Templates pour les ressources étudiantes
    private $templates = [
        'experimentation' => 127,  // Expérimentation étudiante
        'feedback' => 128,         // Retour d'expérience
        'tool' => 129,             // Outil
        'student' => 96,           // Étudiant
        'actant' => 72,            // Actant (enseignant/chercheur)
        'course' => 130,           // Cours
        'bibliography' => 81,      // Bibliographie
    ];

    // IDs des propriétés pour les cours
    private $courseProperties = [
        'title' => 1,              // dcterms:title
        'description' => 4,        // dcterms:description
        'identifier' => 10,        // dcterms:subject (code du cours)
        'educationalLevel' => 713, // schema:educationalLevel
        'session' => 1343,         // schema:scheduledTime
        'year' => 1676,            // dcterms:temporal (année)
    ];

    // IDs des propriétés pour les étudiants
    private $studentProperties = [
        'title' => 1,              // dcterms:title
        'firstname' => 139,        // foaf:givenName
        'lastname' => 140,         // foaf:familyName
        'email' => 724,            // schema:email
        'studentNumber' => 202,    // dcterms:identifier
        'picture' => 1701,         // foaf:depiction
        'classNumber' => 597,      // schema:courseCode
    ];

    public function __construct($api, $conn)
    {
        $this->api = $api;
        $this->conn = $conn;
    }

    /**
     * Normalise l'extension d'image (jpeg -> jpg)
     * Omeka S stocke 'jpeg' dans la DB mais les fichiers utilisent 'jpg'
     */
    private function normalizeExtension($extension)
    {
        if (strtolower($extension) === 'jpeg') {
            return 'jpg';
        }
        return $extension;
    }

    public function __invoke($params = [])
    {
        // Log pour debug
        error_log('[StudentSpace] Params received: ' . json_encode($params));
        error_log('[StudentSpace] $_POST: ' . json_encode($_POST));
        error_log('[StudentSpace] $_GET: ' . json_encode($_GET));

        // Essayer de lire le body JSON de différentes façons
        $rawBody = file_get_contents('php://input');
        error_log('[StudentSpace] Raw body: ' . $rawBody);

        if ($rawBody) {
            $jsonData = json_decode($rawBody, true);
            if ($jsonData && is_array($jsonData)) {
                $params = array_merge($params, $jsonData);
                error_log('[StudentSpace] Merged with JSON body: ' . json_encode($params));
            }
        }

        // Fusionner aussi avec $_POST au cas où
        if (!empty($_POST)) {
            $params = array_merge($params, $_POST);
            error_log('[StudentSpace] Merged with $_POST: ' . json_encode($params));
        }

        // Fusionner avec $_GET pour les paramètres passés dans l'URL
        if (!empty($_GET)) {
            $params = array_merge($params, $_GET);
            error_log('[StudentSpace] Merged with $_GET: ' . json_encode($params));
        }

        if ($params == []) {
            error_log('[StudentSpace] Empty params, returning []');
            return [];
        }

        $action = isset($params['action']) ? $params['action'] : '';
        error_log('[StudentSpace] Action: ' . $action);

        switch ($action) {
            // Liste de toutes les ressources pour les cards (données simplifiées)
            case 'getAllResources':
                $result = $this->getAllResources();
                break;

            // Liste des expérimentations pour les cards
            case 'getExperimentations':
                $result = $this->getExperimentations();
                break;

            // Liste des outils pour les cards
            case 'getTools':
                $result = $this->getTools();
                break;

            // Liste des feedbacks pour les cards
            case 'getFeedbacks':
                $result = $this->getFeedbacks();
                break;

            // Détails d'une ressource spécifique
            case 'getResourceDetails':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->getResourceDetails($id);
                break;

            // Propriétés d'un template (pour création/édition)
            case 'getTemplateProperties':
                $templateId = isset($params['templateId']) ? (int)$params['templateId'] : 0;
                $result = $this->getTemplateProperties($templateId);
                break;

            // Liste des étudiants avec leur ID utilisateur Omeka S
            case 'getStudents':
                $result = $this->getStudents();
                break;

            // ========== ADMIN ACTIONS ==========

            // Liste des étudiants pour l'admin (avec plus d'infos)
            case 'getStudentsAdmin':
                $result = $this->getStudentsAdmin();
                break;

            // Liste des utilisateurs Omeka S
            case 'getOmekaUsers':
                $result = $this->getOmekaUsers();
                break;

            // Créer un étudiant
            case 'createStudent':
                $result = $this->createStudent($params);
                break;

            // Mettre à jour un étudiant
            case 'updateStudent':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->updateStudent($id, $params);
                break;

            // Lier un étudiant à un utilisateur Omeka S
            case 'linkStudentToUser':
                $studentId = isset($params['studentId']) ? (int)$params['studentId'] : 0;
                $userId = isset($params['userId']) ? (int)$params['userId'] : 0;
                $result = $this->linkStudentToUser($studentId, $userId);
                break;

            // Supprimer un étudiant
            case 'deleteStudent':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->deleteStudent($id);
                break;

            // ========== COURSE ACTIONS ==========

            // Liste des cours
            case 'getCourses':
                $result = $this->getCourses();
                break;

            // Créer un cours
            case 'createCourse':
                $result = $this->createCourse($params);
                break;

            // Mettre à jour un cours
            case 'updateCourse':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->updateCourse($id, $params);
                break;

            // Supprimer un cours
            case 'deleteCourse':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->deleteCourse($id);
                break;

            // Affecter un étudiant à un cours
            case 'enrollStudent':
                $studentId = isset($params['studentId']) ? (int)$params['studentId'] : 0;
                $courseId = isset($params['courseId']) ? (int)$params['courseId'] : 0;
                $result = $this->enrollStudent($studentId, $courseId);
                break;

            // Retirer un étudiant d'un cours
            case 'unenrollStudent':
                $studentId = isset($params['studentId']) ? (int)$params['studentId'] : 0;
                $courseId = isset($params['courseId']) ? (int)$params['courseId'] : 0;
                $result = $this->unenrollStudent($studentId, $courseId);
                break;

            // Récupérer les cours d'un étudiant
            case 'getStudentCourses':
                $studentId = isset($params['studentId']) ? (int)$params['studentId'] : 0;
                $result = $this->getStudentCourses($studentId);
                break;

            // Récupérer les étudiants d'un cours
            case 'getCourseStudents':
                $courseId = isset($params['courseId']) ? (int)$params['courseId'] : 0;
                $result = $this->getCourseStudents($courseId);
                break;

            // Récupérer les ressources filtrées par cours
            case 'getResourcesByCourse':
                $courseId = isset($params['courseId']) ? (int)$params['courseId'] : 0;
                $result = $this->getResourcesByCourse($courseId);
                break;

            // ========== ACTANT ACTIONS ==========

            // Liste des actants avec leur ID utilisateur Omeka S
            case 'getActants':
                $result = $this->getActantsWithOmekaId();
                break;

            // Lier un actant à un utilisateur Omeka S
            case 'linkActantToUser':
                $actantId = isset($params['actantId']) ? (int)$params['actantId'] : 0;
                $userId = isset($params['userId']) ? (int)$params['userId'] : 0;
                $result = $this->linkActantToUser($actantId, $userId);
                break;

            // Récupérer les ressources enseignantes (créées par les actants)
            case 'getTeacherResources':
                $result = $this->getTeacherResources();
                break;

            // Créer un utilisateur Omeka S pour un actant
            case 'createOmekaUserForActant':
                $actantId = isset($params['actantId']) ? (int)$params['actantId'] : 0;
                $email = isset($params['email']) ? $params['email'] : '';
                $name = isset($params['name']) ? $params['name'] : '';
                $role = isset($params['role']) ? $params['role'] : 'author';
                $result = $this->createOmekaUserForActant($actantId, $email, $name, $role);
                break;

            // Créer un actant avec son utilisateur Omeka S (pour import batch)
            case 'createActantWithUser':
                $email = isset($params['email']) ? trim($params['email']) : '';
                $name = isset($params['name']) ? trim($params['name']) : '';
                $role = isset($params['role']) ? $params['role'] : 'author';
                $result = $this->createActantWithUser($email, $name, $role);
                break;

            // Supprimer un actant (et optionnellement son utilisateur Omeka S)
            case 'deleteActant':
                $actantId = isset($params['actantId']) ? (int)$params['actantId'] : 0;
                $deleteUser = isset($params['deleteUser']) && $params['deleteUser'] === 'true';
                $result = $this->deleteActant($actantId, $deleteUser);
                break;

            // Modifier un actant (email, nom, prénom, nom de famille)
            case 'updateActant':
                $actantId = isset($params['actantId']) ? (int)$params['actantId'] : 0;
                $email = isset($params['email']) ? trim($params['email']) : '';
                $name = isset($params['name']) ? trim($params['name']) : '';
                $firstname = isset($params['firstname']) ? trim($params['firstname']) : '';
                $lastname = isset($params['lastname']) ? trim($params['lastname']) : '';
                $result = $this->updateActant($actantId, $email, $name, $firstname, $lastname);
                break;

            // ========== RESOURCE MANAGEMENT ACTIONS ==========

            // Récupérer toutes les ressources avec leur cours associé (pour admin)
            case 'getAllResourcesAdmin':
                $result = $this->getAllResourcesAdmin();
                break;

            // Mettre à jour le cours d'une ressource
            case 'updateResourceCourse':
                $resourceId = isset($params['resourceId']) ? (int)$params['resourceId'] : 0;
                $courseId = isset($params['courseId']) && $params['courseId'] !== '' ? (int)$params['courseId'] : null;
                $result = $this->updateResourceCourse($resourceId, $courseId);
                break;

            // Supprimer une ressource (soft delete - met is_public à 0)
            case 'deleteResource':
                $id = isset($params['id']) ? (int)$params['id'] : 0;
                $result = $this->deleteResource($id);
                break;

            // Récupérer les expérimentations du même cours (pour recommandations)
            case 'getSameCourseExperimentations':
                $experimentationId = isset($params['experimentationId']) ? (int)$params['experimentationId'] : 0;
                $limit = isset($params['limit']) ? (int)$params['limit'] : 4;
                $result = $this->getSameCourseExperimentations($experimentationId, $limit);
                break;

            default:
                $result = ['error' => 'Action inconnue: ' . $action];
        }

        return $result;
    }

    /**
     * Récupère toutes les ressources étudiantes (expérimentations, outils, feedbacks)
     * Format simplifié pour les cards
     */
    private function getAllResources()
    {
        $experimentations = $this->getExperimentations();
        $tools = $this->getTools();
        $feedbacks = $this->getFeedbacks();

        return [
            'experimentations' => $experimentations,
            'tools' => $tools,
            'feedbacks' => $feedbacks,
            'total' => count($experimentations) + count($tools) + count($feedbacks)
        ];
    }

    /**
     * Récupère les expérimentations étudiantes (format card)
     * Propriétés: id, title, thumbnail, actants (premier uniquement avec title et picture), type
     */
    private function getExperimentations()
    {
        $templateId = $this->templates['experimentation'];

        $sql = "
            SELECT DISTINCT
                r.id,
                r.title,
                r.created
            FROM resource r
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Enrichir avec les actants et thumbnail
        foreach ($items as &$item) {
            $item['type'] = 'experimentation';
            $item['actants'] = $this->getFirstActant($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupère les outils (format card)
     */
    private function getTools()
    {
        $templateId = $this->templates['tool'];

        $sql = "
            SELECT DISTINCT
                r.id,
                r.title,
                r.created
            FROM resource r
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['type'] = 'tool';
            $item['actants'] = $this->getFirstContributor($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupère les feedbacks (format card)
     */
    private function getFeedbacks()
    {
        $templateId = $this->templates['feedback'];

        $sql = "
            SELECT DISTINCT
                r.id,
                r.title,
                r.created
            FROM resource r
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['type'] = 'feedback';
            $item['actants'] = $this->getFirstContributor($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupère le premier actant d'une ressource (schema:agent ou cito:credits)
     */
    private function getFirstActant($resourceId)
    {
        // Propriétés pour les actants: schema:agent (ID à déterminer) ou cito:credits
        $sql = "
            SELECT
                vr.id,
                vr.title,
                m.storage_id as picture,
                m.extension as picture_ext
            FROM value v
            JOIN resource vr ON v.value_resource_id = vr.id
            LEFT JOIN (
                SELECT item_id, storage_id, extension FROM media WHERE id IN (
                    SELECT MIN(id) FROM media GROUP BY item_id
                )
            ) m ON m.item_id = vr.id
            WHERE v.resource_id = :resourceId
            AND v.property_id IN (
                SELECT id FROM property WHERE local_name IN ('agent', 'credits', 'contributor')
            )
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $actant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($actant) {
            // Construire l'URL complète de l'image si disponible
            if ($actant['picture']) {
                $baseUrl = 'https://tests.arcanes.ca/omk/files/';
                $ext = $actant['picture_ext'] ? '.' . $this->normalizeExtension($actant['picture_ext']) : '';
                $actant['picture'] = $baseUrl . 'original/' . $actant['picture'] . $ext;
            }
            unset($actant['picture_ext']);
            return [$actant];
        }

        return [];
    }

    /**
     * Récupère le premier contributeur (dcterms:contributor ou schema:contributor)
     */
    private function getFirstContributor($resourceId)
    {
        $sql = "
            SELECT
                vr.id,
                vr.title,
                m.storage_id as picture,
                m.extension as picture_ext
            FROM value v
            JOIN resource vr ON v.value_resource_id = vr.id
            LEFT JOIN (
                SELECT item_id, storage_id, extension FROM media WHERE id IN (
                    SELECT MIN(id) FROM media GROUP BY item_id
                )
            ) m ON m.item_id = vr.id
            WHERE v.resource_id = :resourceId
            AND v.property_id IN (
                SELECT id FROM property WHERE local_name = 'contributor'
            )
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $contributor = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($contributor) {
            // Construire l'URL complète de l'image si disponible
            if ($contributor['picture']) {
                $baseUrl = 'https://tests.arcanes.ca/omk/files/';
                $ext = $contributor['picture_ext'] ? '.' . $this->normalizeExtension($contributor['picture_ext']) : '';
                $contributor['picture'] = $baseUrl . 'original/' . $contributor['picture'] . $ext;
            }
            unset($contributor['picture_ext']);
            return [$contributor];
        }

        return [];
    }

    /**
     * Récupère la thumbnail d'une ressource
     * Utilise le dossier 'square' car Omeka S génère les thumbnails en .jpg
     * même si l'original est en .jpeg, et le serveur bloque les .jpeg cross-origin
     */
    private function getThumbnail($resourceId)
    {
        $sql = "
            SELECT storage_id, extension
            FROM media
            WHERE item_id = :resourceId
            ORDER BY position ASC
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $media = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($media && $media['storage_id']) {
            $baseUrl = 'https://tests.arcanes.ca/omk/files/';
            // Utiliser 'square' avec extension .jpg car Omeka S génère les thumbnails en jpg
            return $baseUrl . 'square/' . $media['storage_id'] . '.jpg';
        }

        return null;
    }

    /**
     * Récupère les détails complets d'une ressource
     */
    private function getResourceDetails($id)
    {
        if (!$id) {
            return ['error' => 'ID requis'];
        }

        // Récupérer les infos de base
        $sql = "
            SELECT
                r.id,
                r.title,
                r.resource_template_id,
                r.created,
                r.modified,
                r.owner_id
            FROM resource r
            WHERE r.id = :id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        $resource = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$resource) {
            return ['error' => 'Ressource introuvable'];
        }

        // Déterminer le type
        $resource['type'] = $this->getResourceType($resource['resource_template_id']);

        // Récupérer toutes les valeurs
        $resource['values'] = $this->getResourceValues($id);

        // Récupérer les médias
        $resource['media'] = $this->getResourceMedia($id);

        // Récupérer les actants/contributeurs
        $resource['actants'] = $this->getAllActants($id);

        return $resource;
    }

    /**
     * Détermine le type de ressource basé sur le template
     */
    private function getResourceType($templateId)
    {
        foreach ($this->templates as $type => $id) {
            if ($id == $templateId) {
                return $type;
            }
        }
        return 'unknown';
    }

    /**
     * Récupère toutes les valeurs d'une ressource
     */
    private function getResourceValues($resourceId)
    {
        $sql = "
            SELECT
                p.local_name as property,
                v.value,
                v.uri,
                v.value_resource_id,
                vr.title as linked_resource_title
            FROM value v
            JOIN property p ON v.property_id = p.id
            LEFT JOIN resource vr ON v.value_resource_id = vr.id
            WHERE v.resource_id = :resourceId
            ORDER BY p.local_name, v.id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Grouper par propriété
        $grouped = [];
        foreach ($values as $value) {
            $prop = $value['property'];
            if (!isset($grouped[$prop])) {
                $grouped[$prop] = [];
            }
            $grouped[$prop][] = $value;
        }

        return $grouped;
    }

    /**
     * Récupère les médias d'une ressource
     */
    private function getResourceMedia($resourceId)
    {
        $sql = "
            SELECT
                id,
                storage_id,
                extension,
                media_type,
                source
            FROM media
            WHERE item_id = :resourceId
            ORDER BY position
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $medias = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $baseUrl = 'https://tests.arcanes.ca/omk/files/';
        foreach ($medias as &$media) {
            if ($media['storage_id']) {
                $ext = $media['extension'] ? '.' . $this->normalizeExtension($media['extension']) : '';
                $media['url'] = $baseUrl . 'original/' . $media['storage_id'] . $ext;
                $media['thumbnail'] = $baseUrl . 'square/' . $media['storage_id'] . $ext;
            }
        }

        return $medias;
    }

    /**
     * Récupère tous les actants/contributeurs d'une ressource
     */
    private function getAllActants($resourceId)
    {
        $sql = "
            SELECT DISTINCT
                vr.id,
                vr.title,
                m.storage_id as picture,
                m.extension as picture_ext,
                p.local_name as role
            FROM value v
            JOIN property p ON v.property_id = p.id
            JOIN resource vr ON v.value_resource_id = vr.id
            LEFT JOIN (
                SELECT item_id, storage_id, extension FROM media WHERE id IN (
                    SELECT MIN(id) FROM media GROUP BY item_id
                )
            ) m ON m.item_id = vr.id
            WHERE v.resource_id = :resourceId
            AND p.local_name IN ('agent', 'credits', 'contributor', 'creator')
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['resourceId' => $resourceId]);
        $actants = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $baseUrl = 'https://tests.arcanes.ca/omk/files/';
        foreach ($actants as &$actant) {
            if ($actant['picture']) {
                $ext = $actant['picture_ext'] ? '.' . $this->normalizeExtension($actant['picture_ext']) : '';
                $actant['picture'] = $baseUrl . 'original/' . $actant['picture'] . $ext;
            }
            unset($actant['picture_ext']);
        }

        return $actants;
    }

    /**
     * Récupère les propriétés d'un template (pour les formulaires)
     */
    private function getTemplateProperties($templateId)
    {
        if (!$templateId) {
            return ['error' => 'templateId requis'];
        }

        $sql = "
            SELECT
                p.id as property_id,
                CONCAT(v.prefix, ':', p.local_name) as term,
                p.local_name,
                rtp.is_required,
                rtp.alternate_label,
                rtp.alternate_comment
            FROM resource_template_property rtp
            JOIN property p ON rtp.property_id = p.id
            JOIN vocabulary v ON p.vocabulary_id = v.id
            WHERE rtp.resource_template_id = :templateId
            ORDER BY rtp.position
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $properties = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return [
            'templateId' => $templateId,
            'properties' => $properties
        ];
    }

    /**
     * Récupère les étudiants avec leur ID utilisateur Omeka S
     * L'ID utilisateur est obtenu en matchant l'email avec la table user
     */
    private function getStudents()
    {
        $templateId = $this->templates['student'];

        // Récupérer les étudiants (items avec template 96)
        $sql = "
            SELECT r.id
            FROM resource r
            WHERE r.resource_template_id = :templateId
            ORDER BY r.id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $resources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs des propriétés
        // 139 = foaf:givenName (firstname)
        // 140 = foaf:familyName (lastname)
        // 724 = schema:email (mail)
        // 1701 = foaf:depiction (picture - media)
        // 202 = dcterms:identifier (studentNumber)
        // schema:courseCode = classNumber (ID dynamique)
        $propertyIds = [139, 140, 724, 1701, 202];
        if ($this->studentProperties['classNumber']) {
            $propertyIds[] = $this->studentProperties['classNumber'];
        }
        $valueSql = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id,
                   m.id as media_id, m.storage_id, m.extension
            FROM value v
            LEFT JOIN media m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (" . implode(',', $propertyIds) . ")
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Récupérer tous les utilisateurs Omeka S pour le mapping par email
        $userSql = "SELECT id, email FROM user";
        $stmt = $this->conn->prepare($userSql);
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Créer un mapping email (lowercase) -> user_id
        $usersByEmail = [];
        foreach ($users as $user) {
            $usersByEmail[strtolower($user['email'])] = $user['id'];
        }

        // Construire le résultat
        $result = [];
        $classNumberPropertyId = $this->studentProperties['classNumber'];

        foreach ($resources as $resource) {
            $student = [
                'id' => $resource['id'],
                'firstname' => '',
                'lastname' => '',
                'mail' => '',
                'studentNumber' => '',
                'classNumber' => '',
                'picture' => '',
                'omekaUserId' => null,  // ID utilisateur Omeka S (table user)
                'type' => 'student'
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 139: // foaf:givenName
                            $student['firstname'] = $value['value'];
                            break;
                        case 140: // foaf:familyName
                            $student['lastname'] = $value['value'];
                            break;
                        case 724: // schema:email
                            $student['mail'] = $value['value'];
                            // Chercher l'utilisateur Omeka S correspondant par email
                            if ($value['value']) {
                                $emailLower = strtolower($value['value']);
                                if (isset($usersByEmail[$emailLower])) {
                                    $student['omekaUserId'] = (int)$usersByEmail[$emailLower];
                                }
                            }
                            break;
                        case 202: // dcterms:identifier (studentNumber)
                            $student['studentNumber'] = $value['value'];
                            break;
                        case 1701: // foaf:depiction (picture)
                            if ($value['storage_id'] && $value['extension']) {
                                $student['picture'] = 'https://tests.arcanes.ca/omk/files/original/' . $value['storage_id'] . '.' . $this->normalizeExtension($value['extension']);
                            }
                            break;
                        default:
                            // schema:courseCode (classNumber) - ID dynamique
                            if ($classNumberPropertyId && $value['property_id'] == $classNumberPropertyId) {
                                $student['classNumber'] = $value['value'];
                            }
                            break;
                    }
                }
            }

            // Ajouter le nom complet
            $student['title'] = trim($student['firstname'] . ' ' . $student['lastname']);

            // Si pas d'image via property 1701, essayer de récupérer le média attaché à l'item
            if (empty($student['picture'])) {
                $student['picture'] = $this->getItemThumbnail($resource['id']);
            }

            $result[] = $student;
        }

        return $result;
    }

    /**
     * Récupère la thumbnail d'un item (média directement attaché)
     */
    private function getItemThumbnail($itemId)
    {
        $sql = "
            SELECT storage_id, extension
            FROM media
            WHERE item_id = :itemId
            ORDER BY position ASC
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['itemId' => $itemId]);
        $media = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($media && $media['storage_id']) {
            $baseUrl = 'https://tests.arcanes.ca/omk/files/';
            // Utiliser 'square' avec extension .jpg car Omeka S génère les thumbnails en jpg
            return $baseUrl . 'square/' . $media['storage_id'] . '.jpg';
        }

        return null;
    }

    // ========== ADMIN METHODS ==========

    /**
     * Liste des étudiants pour l'admin avec numéro étudiant
     */
    private function getStudentsAdmin()
    {
        error_log('[StudentSpace] getStudentsAdmin called');
        $templateId = $this->templates['student'];
        error_log('[StudentSpace] Template ID: ' . $templateId);

        $sql = "
            SELECT r.id, r.created, r.modified
            FROM resource r
            WHERE r.resource_template_id = :templateId
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $resources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Propriétés: 139=firstname, 140=lastname, 724=email, 1701=picture,
        // 202=identifier (numéro étudiant), schema:courseCode=classNumber
        $propertyIds = [139, 140, 724, 1701, 202];
        if ($this->studentProperties['classNumber']) {
            $propertyIds[] = $this->studentProperties['classNumber'];
        }
        $valueSql = "
            SELECT v.resource_id, v.value, v.property_id, v.value_resource_id,
                   m.storage_id, m.extension
            FROM value v
            LEFT JOIN media m ON v.value_resource_id = m.id
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (" . implode(',', $propertyIds) . ")
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Récupérer les liaisons omekaUserId depuis la table user via email
        $userSql = "SELECT id, email FROM user";
        $stmt = $this->conn->prepare($userSql);
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $usersByEmail = [];
        foreach ($users as $user) {
            $usersByEmail[strtolower($user['email'])] = $user['id'];
        }

        $result = [];
        $classNumberPropertyId = $this->studentProperties['classNumber'];

        foreach ($resources as $resource) {
            $student = [
                'id' => $resource['id'],
                'firstname' => '',
                'lastname' => '',
                'mail' => '',
                'studentNumber' => '',
                'classNumber' => '',
                'picture' => null,
                'omekaUserId' => null,
                'created' => $resource['created'],
                'modified' => $resource['modified'],
                'type' => 'student'
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
                        case 724:
                            $student['mail'] = $value['value'];
                            if ($value['value']) {
                                $emailLower = strtolower($value['value']);
                                if (isset($usersByEmail[$emailLower])) {
                                    $student['omekaUserId'] = (int)$usersByEmail[$emailLower];
                                }
                            }
                            break;
                        case 202: // dcterms:identifier - numéro étudiant
                            $student['studentNumber'] = $value['value'];
                            break;
                        case 1701:
                            if ($value['storage_id'] && $value['extension']) {
                                $student['picture'] = 'https://tests.arcanes.ca/omk/files/original/' . $value['storage_id'] . '.' . $this->normalizeExtension($value['extension']);
                            }
                            break;
                        default:
                            // schema:courseCode (classNumber) - ID dynamique
                            if ($classNumberPropertyId && $value['property_id'] == $classNumberPropertyId) {
                                $student['classNumber'] = $value['value'];
                            }
                            break;
                    }
                }
            }

            $student['title'] = trim($student['firstname'] . ' ' . $student['lastname']);

            if (empty($student['picture'])) {
                $student['picture'] = $this->getItemThumbnail($resource['id']);
            }

            $result[] = $student;
        }

        return $result;
    }

    /**
     * Liste des utilisateurs Omeka S
     */
    private function getOmekaUsers()
    {
        $sql = "
            SELECT id, email, name, role, created
            FROM user
            WHERE is_active = 1
            ORDER BY name ASC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Créer un nouvel étudiant
     */
    private function createStudent($params)
    {
        $debug = [];
        $debug[] = 'Params: ' . json_encode($params);

        $firstname = $params['firstname'] ?? '';
        $lastname = $params['lastname'] ?? '';
        $email = $params['email'] ?? '';
        $studentNumber = $params['studentNumber'] ?? '';
        $classNumber = $params['classNumber'] ?? '';
        // Gérer createUser comme string '1' ou boolean true
        $createUser = isset($params['createUser']) && ($params['createUser'] === true || $params['createUser'] === '1' || $params['createUser'] === 1);

        $debug[] = "createUser raw value: " . var_export($params['createUser'] ?? 'not set', true);
        $debug[] = "createUser parsed: " . ($createUser ? 'true' : 'false');

        if (empty($firstname) || empty($lastname) || empty($email)) {
            return ['error' => 'Prénom, nom et email sont requis', 'debug' => $debug];
        }

        try {
            // Vérifier si l'email existe déjà
            $checkSql = "
                SELECT r.id FROM resource r
                JOIN `value` v ON v.resource_id = r.id
                WHERE r.resource_template_id = :templateId
                AND v.property_id = 724
                AND v.value = :email
            ";
            $stmt = $this->conn->prepare($checkSql);
            $stmt->execute(['templateId' => $this->templates['student'], 'email' => $email]);
            if ($stmt->fetch()) {
                return ['error' => 'Un étudiant avec cet email existe déjà', 'debug' => $debug];
            }

            $omekaUserId = null;
            $userError = null;

            // Créer l'utilisateur Omeka S si demandé
            if ($createUser) {
                $debug[] = 'Creating Omeka user...';
                try {
                    // Vérifier si l'utilisateur existe déjà
                    $checkUserSql = "SELECT id FROM `user` WHERE `email` = :email";
                    $stmt = $this->conn->prepare($checkUserSql);
                    $stmt->execute(['email' => $email]);
                    $existingUser = $stmt->fetch(\PDO::FETCH_ASSOC);

                    if ($existingUser) {
                        $omekaUserId = $existingUser['id'];
                        $debug[] = 'User already exists with ID: ' . $omekaUserId;
                    } else {
                        // Créer l'utilisateur avec un mot de passe temporaire hashé
                        $tempPassword = password_hash('temp_' . time(), PASSWORD_DEFAULT);
                        $insertUserSql = "
                            INSERT INTO `user` (`email`, `name`, `role`, `is_active`, `created`, `modified`, `password_hash`)
                            VALUES (:email, :name, 'author', 1, NOW(), NOW(), :password)
                        ";
                        $stmt = $this->conn->prepare($insertUserSql);
                        $stmt->execute([
                            'email' => $email,
                            'name' => $firstname . ' ' . $lastname,
                            'password' => $tempPassword
                        ]);
                        $omekaUserId = $this->conn->lastInsertId();
                        $debug[] = 'Created user with ID: ' . $omekaUserId;
                    }
                } catch (\Exception $e) {
                    $userError = $e->getMessage();
                    $debug[] = 'ERROR creating user: ' . $userError;
                }
            } else {
                $debug[] = 'Skipping user creation (createUser is false)';
            }

            // Créer la ressource item
            $debug[] = 'Creating resource item...';
            $insertResourceSql = "
                INSERT INTO resource (owner_id, resource_class_id, resource_template_id, is_public, created, modified, resource_type)
                VALUES (:ownerId, NULL, :templateId, 1, NOW(), NOW(), 'Omeka\\\\Entity\\\\Item')
            ";
            $stmt = $this->conn->prepare($insertResourceSql);
            $stmt->execute([
                'ownerId' => $omekaUserId ?? 1,
                'templateId' => $this->templates['student']
            ]);
            $resourceId = $this->conn->lastInsertId();
            $debug[] = 'Created resource with ID: ' . $resourceId;

            // Insérer dans la table item
            $insertItemSql = "INSERT INTO item (id) VALUES (:id)";
            $stmt = $this->conn->prepare($insertItemSql);
            $stmt->execute(['id' => $resourceId]);
            $debug[] = 'Inserted into item table';

            // Ajouter les propriétés
            $title = trim($firstname . ' ' . $lastname);
            $this->addPropertyValue($resourceId, 1, $title);       // dcterms:title
            $this->addPropertyValue($resourceId, 139, $firstname); // foaf:givenName
            $this->addPropertyValue($resourceId, 140, $lastname);  // foaf:familyName
            $this->addPropertyValue($resourceId, 724, $email);     // schema:email

            // Mettre à jour le champ title dans la table resource (cache Omeka S)
            $updateTitleSql = "UPDATE resource SET title = :title WHERE id = :id";
            $stmt = $this->conn->prepare($updateTitleSql);
            $stmt->execute(['title' => $title, 'id' => $resourceId]);

            $debug[] = 'Added properties (title: ' . $title . ')';

            if (!empty($studentNumber)) {
                $this->addPropertyValue($resourceId, 202, $studentNumber); // dcterms:identifier
                $debug[] = 'Added student number';
            }

            if (!empty($classNumber) && $this->studentProperties['classNumber']) {
                $this->addPropertyValue($resourceId, $this->studentProperties['classNumber'], $classNumber);
                $debug[] = 'Added class number';
            }

            $debug[] = 'Student created successfully!';
            return [
                'success' => true,
                'id' => $resourceId,
                'studentId' => $resourceId, // Alias pour le frontend
                'omekaUserId' => $omekaUserId,
                'userError' => $userError,
                'debug' => $debug
            ];
        } catch (\Exception $e) {
            $debug[] = 'ERROR: ' . $e->getMessage();
            return ['error' => 'Erreur: ' . $e->getMessage(), 'debug' => $debug];
        }
    }

    /**
     * Mettre à jour un étudiant
     */
    private function updateStudent($id, $params)
    {
        if (!$id) {
            return ['error' => 'ID requis'];
        }

        // Vérifier que l'étudiant existe
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $id, 'templateId' => $this->templates['student']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Étudiant non trouvé'];
        }

        // Mettre à jour les propriétés
        if (isset($params['firstname'])) {
            $this->updatePropertyValue($id, 139, $params['firstname']);
        }
        if (isset($params['lastname'])) {
            $this->updatePropertyValue($id, 140, $params['lastname']);
        }
        if (isset($params['email'])) {
            $this->updatePropertyValue($id, 724, $params['email']);
        }
        if (isset($params['studentNumber'])) {
            $this->updatePropertyValue($id, 202, $params['studentNumber']);
        }
        if (isset($params['classNumber']) && $this->studentProperties['classNumber']) {
            $this->updatePropertyValue($id, $this->studentProperties['classNumber'], $params['classNumber']);
        }

        // Mettre à jour modified
        $updateSql = "UPDATE resource SET modified = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($updateSql);
        $stmt->execute(['id' => $id]);

        return ['success' => true, 'id' => $id];
    }

    /**
     * Lier un étudiant à un utilisateur Omeka S
     */
    private function linkStudentToUser($studentId, $userId)
    {
        if (!$studentId || !$userId) {
            return ['error' => 'studentId et userId requis'];
        }

        // Vérifier que l'étudiant existe
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $studentId, 'templateId' => $this->templates['student']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Étudiant non trouvé'];
        }

        // Vérifier que l'utilisateur existe
        $checkUserSql = "SELECT id, email FROM user WHERE id = :id";
        $stmt = $this->conn->prepare($checkUserSql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        // Mettre à jour l'email de l'étudiant pour correspondre à l'utilisateur
        $this->updatePropertyValue($studentId, 724, $user['email']);

        // Mettre à jour le owner_id de la ressource
        $updateSql = "UPDATE resource SET owner_id = :userId, modified = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($updateSql);
        $stmt->execute(['userId' => $userId, 'id' => $studentId]);

        return ['success' => true, 'studentId' => $studentId, 'userId' => $userId];
    }

    /**
     * Supprimer un étudiant
     */
    private function deleteStudent($id)
    {
        if (!$id) {
            return ['error' => 'ID requis'];
        }

        // Vérifier que l'étudiant existe et récupérer son email
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $id, 'templateId' => $this->templates['student']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Étudiant non trouvé'];
        }

        // Récupérer l'email de l'étudiant pour trouver l'utilisateur Omeka S
        $emailSql = "SELECT value FROM `value` WHERE resource_id = :id AND property_id = 724 LIMIT 1";
        $stmt = $this->conn->prepare($emailSql);
        $stmt->execute(['id' => $id]);
        $emailResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $studentEmail = $emailResult ? $emailResult['value'] : null;

        // Supprimer les valeurs
        $deleteValuesSql = "DELETE FROM `value` WHERE `resource_id` = :id";
        $stmt = $this->conn->prepare($deleteValuesSql);
        $stmt->execute(['id' => $id]);

        // Supprimer les médias
        $deleteMediaSql = "DELETE FROM media WHERE item_id = :id";
        $stmt = $this->conn->prepare($deleteMediaSql);
        $stmt->execute(['id' => $id]);

        // Supprimer de la table item
        $deleteItemSql = "DELETE FROM item WHERE id = :id";
        $stmt = $this->conn->prepare($deleteItemSql);
        $stmt->execute(['id' => $id]);

        // Supprimer la ressource
        $deleteResourceSql = "DELETE FROM resource WHERE id = :id";
        $stmt = $this->conn->prepare($deleteResourceSql);
        $stmt->execute(['id' => $id]);

        // Supprimer l'utilisateur Omeka S associé (si existe)
        $userDeleted = false;
        if ($studentEmail) {
            $deleteUserSql = "DELETE FROM `user` WHERE email = :email";
            $stmt = $this->conn->prepare($deleteUserSql);
            $stmt->execute(['email' => $studentEmail]);
            $userDeleted = $stmt->rowCount() > 0;
        }

        return ['success' => true, 'userDeleted' => $userDeleted];
    }

    /**
     * Ajouter une valeur de propriété
     */
    private function addPropertyValue($resourceId, $propertyId, $value)
    {
        $sql = "
            INSERT INTO `value` (`resource_id`, `property_id`, `value`, `type`, `is_public`)
            VALUES (:resourceId, :propertyId, :value, 'literal', 1)
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'resourceId' => $resourceId,
            'propertyId' => $propertyId,
            'value' => $value
        ]);
    }

    /**
     * Mettre à jour une valeur de propriété (ou créer si n'existe pas)
     */
    private function updatePropertyValue($resourceId, $propertyId, $value)
    {
        // Vérifier si la valeur existe
        $checkSql = "SELECT id FROM `value` WHERE `resource_id` = :resourceId AND `property_id` = :propertyId LIMIT 1";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['resourceId' => $resourceId, 'propertyId' => $propertyId]);
        $existing = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($existing) {
            $updateSql = "UPDATE `value` SET `value` = :value WHERE `id` = :id";
            $stmt = $this->conn->prepare($updateSql);
            $stmt->execute(['value' => $value, 'id' => $existing['id']]);
        } else {
            $this->addPropertyValue($resourceId, $propertyId, $value);
        }
    }

    // ========== COURSE METHODS ==========

    /**
     * Liste des cours
     */
    private function getCourses()
    {
        $templateId = $this->templates['course'];

        $sql = "
            SELECT r.id, r.created, r.modified
            FROM resource r
            WHERE r.resource_template_id = :templateId
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $resources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs des propriétés
        $propertyIds = array_values($this->courseProperties);
        $valueSql = "
            SELECT v.resource_id, v.value, v.property_id
            FROM value v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (" . implode(',', $propertyIds) . ")
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Compter les étudiants par cours
        $studentCountSql = "
            SELECT v.value_resource_id as course_id, COUNT(*) as student_count
            FROM value v
            WHERE v.property_id = :propertyId
            AND v.value_resource_id IN (" . implode(',', $resourceIds) . ")
            GROUP BY v.value_resource_id
        ";
        $stmt = $this->conn->prepare($studentCountSql);
        // On utilise une propriété pour lier étudiant -> cours (on va créer cette relation)
        // Pour l'instant, on cherche les relations inverses
        $stmt->execute(['propertyId' => $this->studentProperties['classNumber']]);
        $studentCounts = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $countByCourse = [];
        foreach ($studentCounts as $sc) {
            $countByCourse[$sc['course_id']] = (int)$sc['student_count'];
        }

        $result = [];
        foreach ($resources as $resource) {
            $course = [
                'id' => $resource['id'],
                'title' => '',
                'description' => '',
                'code' => '',
                'level' => '',
                'session' => '',
                'year' => '',
                'studentCount' => $countByCourse[$resource['id']] ?? 0,
                'created' => $resource['created'],
                'modified' => $resource['modified'],
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case $this->courseProperties['title']:
                            $course['title'] = $value['value'];
                            break;
                        case $this->courseProperties['description']:
                            $course['description'] = $value['value'];
                            break;
                        case $this->courseProperties['identifier']:
                            $course['code'] = $value['value'];
                            break;
                        case $this->courseProperties['educationalLevel']:
                            $course['level'] = $value['value'];
                            break;
                        case $this->courseProperties['session']:
                            $course['session'] = $value['value'];
                            break;
                        case $this->courseProperties['year']:
                            $course['year'] = $value['value'];
                            break;
                    }
                }
            }

            $result[] = $course;
        }

        return $result;
    }

    /**
     * Créer un cours
     */
    private function createCourse($params)
    {
        $title = $params['title'] ?? '';
        $description = $params['description'] ?? '';
        $code = $params['code'] ?? '';
        $level = $params['level'] ?? '';
        $session = $params['session'] ?? '';
        $year = $params['year'] ?? '';

        if (empty($title)) {
            return ['error' => 'Le titre du cours est requis'];
        }

        try {
            // Créer la ressource item
            $insertResourceSql = "
                INSERT INTO resource (owner_id, resource_class_id, resource_template_id, is_public, created, modified, resource_type)
                VALUES (1, NULL, :templateId, 1, NOW(), NOW(), 'Omeka\\\\Entity\\\\Item')
            ";
            $stmt = $this->conn->prepare($insertResourceSql);
            $stmt->execute(['templateId' => $this->templates['course']]);
            $resourceId = $this->conn->lastInsertId();

            // Insérer dans la table item
            $insertItemSql = "INSERT INTO item (id) VALUES (:id)";
            $stmt = $this->conn->prepare($insertItemSql);
            $stmt->execute(['id' => $resourceId]);

            // Ajouter les propriétés
            $this->addPropertyValue($resourceId, $this->courseProperties['title'], $title);

            // Mettre à jour le champ title dans la table resource (cache Omeka S)
            $updateTitleSql = "UPDATE resource SET title = :title WHERE id = :id";
            $stmt = $this->conn->prepare($updateTitleSql);
            $stmt->execute(['title' => $title, 'id' => $resourceId]);

            if (!empty($description)) {
                $this->addPropertyValue($resourceId, $this->courseProperties['description'], $description);
            }
            if (!empty($code)) {
                $this->addPropertyValue($resourceId, $this->courseProperties['identifier'], $code);
            }
            if (!empty($level)) {
                $this->addPropertyValue($resourceId, $this->courseProperties['educationalLevel'], $level);
            }
            if (!empty($session)) {
                $this->addPropertyValue($resourceId, $this->courseProperties['session'], $session);
            }
            if (!empty($year)) {
                $this->addPropertyValue($resourceId, $this->courseProperties['year'], $year);
            }

            return [
                'success' => true,
                'id' => $resourceId
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur: ' . $e->getMessage()];
        }
    }

    /**
     * Mettre à jour un cours
     */
    private function updateCourse($id, $params)
    {
        if (!$id) {
            return ['error' => 'ID requis'];
        }

        // Vérifier que le cours existe
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $id, 'templateId' => $this->templates['course']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Cours non trouvé'];
        }

        // Mettre à jour les propriétés
        if (isset($params['title'])) {
            $this->updatePropertyValue($id, $this->courseProperties['title'], $params['title']);
        }
        if (isset($params['description'])) {
            $this->updatePropertyValue($id, $this->courseProperties['description'], $params['description']);
        }
        if (isset($params['code'])) {
            $this->updatePropertyValue($id, $this->courseProperties['identifier'], $params['code']);
        }
        if (isset($params['level'])) {
            $this->updatePropertyValue($id, $this->courseProperties['educationalLevel'], $params['level']);
        }
        if (isset($params['session'])) {
            $this->updatePropertyValue($id, $this->courseProperties['session'], $params['session']);
        }
        if (isset($params['year'])) {
            $this->updatePropertyValue($id, $this->courseProperties['year'], $params['year']);
        }

        // Mettre à jour modified
        $updateSql = "UPDATE resource SET modified = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($updateSql);
        $stmt->execute(['id' => $id]);

        return ['success' => true, 'id' => $id];
    }

    /**
     * Supprimer un cours
     */
    private function deleteCourse($id)
    {
        if (!$id) {
            return ['error' => 'ID requis'];
        }

        // Vérifier que le cours existe
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $id, 'templateId' => $this->templates['course']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Cours non trouvé'];
        }

        // Supprimer les liens étudiants -> cours
        $deleteLinksSql = "DELETE FROM `value` WHERE `value_resource_id` = :id AND `property_id` = :propertyId";
        $stmt = $this->conn->prepare($deleteLinksSql);
        $stmt->execute(['id' => $id, 'propertyId' => $this->studentProperties['classNumber']]);

        // Supprimer les valeurs du cours
        $deleteValuesSql = "DELETE FROM `value` WHERE `resource_id` = :id";
        $stmt = $this->conn->prepare($deleteValuesSql);
        $stmt->execute(['id' => $id]);

        // Supprimer de la table item
        $deleteItemSql = "DELETE FROM item WHERE id = :id";
        $stmt = $this->conn->prepare($deleteItemSql);
        $stmt->execute(['id' => $id]);

        // Supprimer la ressource
        $deleteResourceSql = "DELETE FROM resource WHERE id = :id";
        $stmt = $this->conn->prepare($deleteResourceSql);
        $stmt->execute(['id' => $id]);

        return ['success' => true];
    }

    /**
     * Inscrire un étudiant à un cours
     */
    private function enrollStudent($studentId, $courseId)
    {
        if (!$studentId || !$courseId) {
            return ['error' => 'studentId et courseId requis'];
        }

        // Vérifier que l'étudiant existe
        $checkStudentSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkStudentSql);
        $stmt->execute(['id' => $studentId, 'templateId' => $this->templates['student']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Étudiant non trouvé'];
        }

        // Vérifier que le cours existe
        $checkCourseSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkCourseSql);
        $stmt->execute(['id' => $courseId, 'templateId' => $this->templates['course']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Cours non trouvé'];
        }

        // Vérifier si l'étudiant n'est pas déjà inscrit
        $checkEnrollSql = "
            SELECT id FROM `value`
            WHERE `resource_id` = :studentId
            AND `property_id` = :propertyId
            AND `value_resource_id` = :courseId
        ";
        $stmt = $this->conn->prepare($checkEnrollSql);
        $stmt->execute([
            'studentId' => $studentId,
            'propertyId' => $this->studentProperties['classNumber'],
            'courseId' => $courseId
        ]);
        if ($stmt->fetch()) {
            return ['error' => 'Étudiant déjà inscrit à ce cours'];
        }

        // Créer le lien étudiant -> cours (resource link)
        $insertSql = "
            INSERT INTO `value` (`resource_id`, `property_id`, `value_resource_id`, `type`, `is_public`)
            VALUES (:studentId, :propertyId, :courseId, 'resource', 1)
        ";
        $stmt = $this->conn->prepare($insertSql);
        $stmt->execute([
            'studentId' => $studentId,
            'propertyId' => $this->studentProperties['classNumber'],
            'courseId' => $courseId
        ]);

        return ['success' => true, 'studentId' => $studentId, 'courseId' => $courseId];
    }

    /**
     * Désinscrire un étudiant d'un cours
     */
    private function unenrollStudent($studentId, $courseId)
    {
        if (!$studentId || !$courseId) {
            return ['error' => 'studentId et courseId requis'];
        }

        $deleteSql = "
            DELETE FROM `value`
            WHERE `resource_id` = :studentId
            AND `property_id` = :propertyId
            AND `value_resource_id` = :courseId
        ";
        $stmt = $this->conn->prepare($deleteSql);
        $stmt->execute([
            'studentId' => $studentId,
            'propertyId' => $this->studentProperties['classNumber'],
            'courseId' => $courseId
        ]);

        return ['success' => true];
    }

    /**
     * Récupérer les cours d'un étudiant
     */
    private function getStudentCourses($studentId)
    {
        if (!$studentId) {
            return ['error' => 'studentId requis'];
        }

        // Récupérer les IDs des cours liés à l'étudiant
        $sql = "
            SELECT v.value_resource_id as course_id
            FROM value v
            WHERE v.resource_id = :studentId
            AND v.property_id = :propertyId
            AND v.value_resource_id IS NOT NULL
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'studentId' => $studentId,
            'propertyId' => $this->studentProperties['classNumber']
        ]);
        $courseLinks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($courseLinks)) {
            return [];
        }

        $courseIds = array_column($courseLinks, 'course_id');

        // Récupérer les détails des cours
        $propertyIds = array_values($this->courseProperties);
        $valueSql = "
            SELECT r.id, v.value, v.property_id
            FROM resource r
            LEFT JOIN value v ON v.resource_id = r.id AND v.property_id IN (" . implode(',', $propertyIds) . ")
            WHERE r.id IN (" . implode(',', $courseIds) . ")
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $courses = [];
        foreach ($courseIds as $courseId) {
            $course = [
                'id' => $courseId,
                'title' => '',
                'code' => '',
                'level' => '',
                'session' => '',
                'year' => '',
            ];

            foreach ($values as $value) {
                if ($value['id'] == $courseId && $value['property_id']) {
                    switch ($value['property_id']) {
                        case $this->courseProperties['title']:
                            $course['title'] = $value['value'];
                            break;
                        case $this->courseProperties['identifier']:
                            $course['code'] = $value['value'];
                            break;
                        case $this->courseProperties['educationalLevel']:
                            $course['level'] = $value['value'];
                            break;
                        case $this->courseProperties['session']:
                            $course['session'] = $value['value'];
                            break;
                        case $this->courseProperties['year']:
                            $course['year'] = $value['value'];
                            break;
                    }
                }
            }

            $courses[] = $course;
        }

        return $courses;
    }

    /**
     * Récupérer les étudiants d'un cours
     */
    private function getCourseStudents($courseId)
    {
        if (!$courseId) {
            return ['error' => 'courseId requis'];
        }

        // Récupérer les IDs des étudiants inscrits au cours
        $sql = "
            SELECT v.resource_id as student_id
            FROM value v
            JOIN resource r ON r.id = v.resource_id
            WHERE v.value_resource_id = :courseId
            AND v.property_id = :propertyId
            AND r.resource_template_id = :templateId
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'courseId' => $courseId,
            'propertyId' => $this->studentProperties['classNumber'],
            'templateId' => $this->templates['student']
        ]);
        $studentLinks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($studentLinks)) {
            return [];
        }

        $studentIds = array_column($studentLinks, 'student_id');

        // Récupérer les détails des étudiants
        $valueSql = "
            SELECT v.resource_id, v.value, v.property_id
            FROM value v
            WHERE v.resource_id IN (" . implode(',', $studentIds) . ")
            AND v.property_id IN (139, 140, 724, 202)
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $students = [];
        foreach ($studentIds as $studentId) {
            $student = [
                'id' => $studentId,
                'firstname' => '',
                'lastname' => '',
                'title' => '',
                'mail' => '',
                'studentNumber' => '',
            ];

            foreach ($values as $value) {
                if ($value['resource_id'] == $studentId) {
                    switch ($value['property_id']) {
                        case 139:
                            $student['firstname'] = $value['value'];
                            break;
                        case 140:
                            $student['lastname'] = $value['value'];
                            break;
                        case 724:
                            $student['mail'] = $value['value'];
                            break;
                        case 202:
                            $student['studentNumber'] = $value['value'];
                            break;
                    }
                }
            }

            $student['title'] = trim($student['firstname'] . ' ' . $student['lastname']);
            $student['picture'] = $this->getItemThumbnail($studentId);
            $students[] = $student;
        }

        return $students;
    }

    /**
     * Récupérer les ressources (expérimentations, outils, feedbacks) liées à un cours
     * Utilise dcterms:isPartOf (property_id: 33) pour lier les ressources aux cours
     */
    private function getResourcesByCourse($courseId)
    {
        if (!$courseId) {
            return ['error' => 'courseId requis'];
        }

        // Récupérer les ressources liées au cours via dcterms:isPartOf (property_id = 33)
        $experimentations = $this->getResourcesByCourseAndType($courseId, 'experimentation');
        $tools = $this->getResourcesByCourseAndType($courseId, 'tool');
        $feedbacks = $this->getResourcesByCourseAndType($courseId, 'feedback');

        return [
            'experimentations' => $experimentations,
            'tools' => $tools,
            'feedbacks' => $feedbacks,
            'total' => count($experimentations) + count($tools) + count($feedbacks)
        ];
    }

    /**
     * Récupérer les ressources d'un type liées à un cours via dcterms:isPartOf
     */
    private function getResourcesByCourseAndType($courseId, $type)
    {
        $templateId = $this->templates[$type];

        // Filtrer par dcterms:isPartOf (property_id = 33)
        $sql = "
            SELECT DISTINCT r.id, r.title, r.created
            FROM resource r
            JOIN value v ON v.resource_id = r.id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND v.property_id = 33
            AND v.value_resource_id = :courseId
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId, 'courseId' => $courseId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['type'] = $type;
            $item['actants'] = $type === 'experimentation'
                ? $this->getFirstActant($item['id'])
                : $this->getFirstContributor($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupérer les expérimentations du même cours qu'une expérimentation donnée
     * Pour les recommandations "Expérimentations similaires"
     */
    private function getSameCourseExperimentations($experimentationId, $limit = 4)
    {
        if (!$experimentationId) {
            return [];
        }

        // 1. Trouver le cours auquel appartient cette expérimentation via dcterms:isPartOf (property_id = 33)
        $courseQuery = "
            SELECT v.value_resource_id as course_id
            FROM value v
            WHERE v.resource_id = :experimentationId
            AND v.property_id = 33
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($courseQuery);
        $stmt->execute(['experimentationId' => $experimentationId]);
        $courseResult = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$courseResult || !$courseResult['course_id']) {
            // Pas de cours associé, retourner une liste vide
            return [];
        }

        $courseId = $courseResult['course_id'];

        // 2. Récupérer les autres expérimentations du même cours (exclure l'expérimentation courante)
        $sql = "
            SELECT DISTINCT r.id, r.title, r.created
            FROM resource r
            JOIN value v ON v.resource_id = r.id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND v.property_id = 33
            AND v.value_resource_id = :courseId
            AND r.id != :experimentationId
            ORDER BY r.created DESC
            LIMIT :limit
        ";

        $templateId = $this->templates['experimentation']; // 127

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':templateId', $templateId, \PDO::PARAM_INT);
        $stmt->bindValue(':courseId', $courseId, \PDO::PARAM_INT);
        $stmt->bindValue(':experimentationId', $experimentationId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // 3. Enrichir les données avec actants et thumbnail
        foreach ($items as &$item) {
            $item['type'] = 'experimentation';
            $item['actants'] = $this->getFirstActant($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupérer les ressources d'un type créées par une liste d'étudiants (LEGACY - pour rétrocompatibilité)
     */
    private function getResourcesByStudents($studentIds, $type)
    {
        if (empty($studentIds)) {
            return [];
        }

        $templateId = $this->templates[$type];

        // Chercher les ressources où les étudiants sont contributeurs ou créateurs
        $sql = "
            SELECT DISTINCT r.id, r.title, r.created
            FROM resource r
            LEFT JOIN value v ON v.resource_id = r.id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND (
                r.owner_id IN (
                    SELECT owner_id FROM resource WHERE id IN (" . implode(',', $studentIds) . ")
                )
                OR v.value_resource_id IN (" . implode(',', $studentIds) . ")
            )
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['type'] = $type;
            $item['actants'] = $type === 'experimentation'
                ? $this->getFirstActant($item['id'])
                : $this->getFirstContributor($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    // ========== ACTANT METHODS ==========

    /**
     * Récupère tous les actants (items template 72) avec leur liaison utilisateur Omeka S
     */
    private function getActantsWithOmekaId()
    {
        $templateId = $this->templates['actant']; // Template 72

        // Récupérer tous les items actants (template 72)
        $sql = "
            SELECT r.id, r.title, r.owner_id, r.created
            FROM resource r
            WHERE r.resource_template_id = :templateId
            ORDER BY r.title ASC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId]);
        $resources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les valeurs des propriétés pour tous les actants
        // 139 = foaf:givenName (firstname)
        // 140 = foaf:familyName (lastname)
        // 724 = schema:email (mail)
        $valueSql = "
            SELECT v.resource_id, v.value, v.property_id
            FROM value v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id IN (139, 140, 724)
        ";

        $stmt = $this->conn->prepare($valueSql);
        $stmt->execute();
        $values = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Récupérer tous les utilisateurs Omeka S pour le mapping
        $userSql = "SELECT id, email, name, role FROM user WHERE is_active = 1";
        $stmt = $this->conn->prepare($userSql);
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Créer des mappings pour recherche rapide
        $usersByEmail = [];
        $usersById = [];
        foreach ($users as $user) {
            $usersByEmail[strtolower($user['email'])] = $user;
            $usersById[$user['id']] = $user;
        }

        // Construire le résultat
        $result = [];
        foreach ($resources as $resource) {
            $actant = [
                'id' => $resource['id'],
                'firstname' => '',
                'lastname' => '',
                'mail' => '',
                'title' => $resource['title'] ?: '',
                'picture' => null,
                'omekaUserId' => null,
                'omekaUserName' => null,
                'omekaUserRole' => null,
                'created' => $resource['created'],
                'type' => 'actant'
            ];

            // Extraire les propriétés
            foreach ($values as $value) {
                if ($value['resource_id'] == $resource['id']) {
                    switch ($value['property_id']) {
                        case 139: // foaf:givenName
                            $actant['firstname'] = $value['value'];
                            break;
                        case 140: // foaf:familyName
                            $actant['lastname'] = $value['value'];
                            break;
                        case 724: // schema:email
                            $actant['mail'] = $value['value'];
                            break;
                    }
                }
            }

            // Construire le titre si vide
            if (empty($actant['title']) && ($actant['firstname'] || $actant['lastname'])) {
                $actant['title'] = trim($actant['firstname'] . ' ' . $actant['lastname']);
            }

            // Chercher l'utilisateur Omeka S lié par email
            if ($actant['mail']) {
                $emailLower = strtolower($actant['mail']);
                if (isset($usersByEmail[$emailLower])) {
                    $linkedUser = $usersByEmail[$emailLower];
                    $actant['omekaUserId'] = (int)$linkedUser['id'];
                    $actant['omekaUserName'] = $linkedUser['name'];
                    $actant['omekaUserRole'] = $linkedUser['role'];
                }
            }

            // Fallback: vérifier via owner_id
            if (!$actant['omekaUserId'] && $resource['owner_id'] && isset($usersById[$resource['owner_id']])) {
                $linkedUser = $usersById[$resource['owner_id']];
                $actant['omekaUserId'] = (int)$linkedUser['id'];
                $actant['omekaUserName'] = $linkedUser['name'];
                $actant['omekaUserRole'] = $linkedUser['role'];
            }

            // Récupérer la photo
            $actant['picture'] = $this->getItemThumbnail($resource['id']);

            $result[] = $actant;
        }

        return $result;
    }

    /**
     * Lier un actant (item) à un utilisateur Omeka S
     */
    private function linkActantToUser($actantId, $userId)
    {
        if (!$actantId || !$userId) {
            return ['error' => 'actantId et userId requis'];
        }

        // Vérifier que l'actant (item template 72) existe
        $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $actantId, 'templateId' => $this->templates['actant']]);
        if (!$stmt->fetch()) {
            return ['error' => 'Actant non trouvé'];
        }

        // Vérifier que l'utilisateur existe
        $checkUserSql = "SELECT id, email FROM user WHERE id = :id";
        $stmt = $this->conn->prepare($checkUserSql);
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$user) {
            return ['error' => 'Utilisateur non trouvé'];
        }

        // Mettre à jour l'email de l'actant pour correspondre à l'utilisateur
        $this->updatePropertyValue($actantId, 724, $user['email']);

        // Mettre à jour le owner_id de la ressource
        $updateSql = "UPDATE resource SET owner_id = :userId, modified = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($updateSql);
        $stmt->execute(['userId' => $userId, 'id' => $actantId]);

        return ['success' => true, 'actantId' => $actantId, 'userId' => $userId];
    }

    /**
     * Créer un utilisateur Omeka S pour un actant et le lier automatiquement
     */
    private function createOmekaUserForActant($actantId, $email, $name, $role = 'author')
    {
        if (!$actantId) {
            return ['error' => 'actantId requis'];
        }
        if (empty($email)) {
            return ['error' => 'Email requis'];
        }
        if (empty($name)) {
            return ['error' => 'Nom requis'];
        }

        // Vérifier que l'actant existe
        $checkSql = "SELECT id, title FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $actantId, 'templateId' => $this->templates['actant']]);
        $actant = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$actant) {
            return ['error' => 'Actant non trouvé'];
        }

        // Vérifier si un utilisateur avec cet email existe déjà
        $checkUserSql = "SELECT id FROM user WHERE email = :email";
        $stmt = $this->conn->prepare($checkUserSql);
        $stmt->execute(['email' => $email]);
        $existingUser = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($existingUser) {
            return ['error' => 'Un utilisateur avec cet email existe déjà'];
        }

        try {
            // Créer l'utilisateur Omeka S
            $tempPassword = password_hash('temp_' . time() . '_' . $actantId, PASSWORD_DEFAULT);
            $insertUserSql = "
                INSERT INTO user (email, name, role, is_active, created, modified, password_hash)
                VALUES (:email, :name, :role, 1, NOW(), NOW(), :password)
            ";
            $stmt = $this->conn->prepare($insertUserSql);
            $stmt->execute([
                'email' => $email,
                'name' => $name,
                'role' => $role,
                'password' => $tempPassword
            ]);
            $newUserId = $this->conn->lastInsertId();

            // Mettre à jour l'email de l'actant pour correspondre
            $this->updatePropertyValue($actantId, 724, $email);

            // Mettre à jour le owner_id de l'actant
            $updateSql = "UPDATE resource SET owner_id = :userId, modified = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($updateSql);
            $stmt->execute(['userId' => $newUserId, 'id' => $actantId]);

            return [
                'success' => true,
                'userId' => (int)$newUserId,
                'actantId' => $actantId,
                'email' => $email,
                'name' => $name,
                'role' => $role
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la création: ' . $e->getMessage()];
        }
    }

    /**
     * Créer un actant (item template 72) avec son utilisateur Omeka S
     * Pour l'import batch d'actants
     */
    private function createActantWithUser($email, $name, $role = 'author')
    {
        if (empty($email)) {
            return ['error' => 'Email requis'];
        }
        if (empty($name)) {
            return ['error' => 'Nom requis'];
        }

        // Vérifier si un utilisateur avec cet email existe déjà
        $checkUserSql = "SELECT id, name FROM user WHERE email = :email";
        $stmt = $this->conn->prepare($checkUserSql);
        $stmt->execute(['email' => $email]);
        $existingUser = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Vérifier si un actant avec cet email existe déjà
        $checkActantSql = "
            SELECT r.id, r.title
            FROM resource r
            JOIN `value` v ON v.resource_id = r.id AND v.property_id = 724
            WHERE r.resource_template_id = :templateId
            AND v.`value` = :email
        ";
        $stmt = $this->conn->prepare($checkActantSql);
        $stmt->execute(['templateId' => $this->templates['actant'], 'email' => $email]);
        $existingActant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($existingActant) {
            return ['error' => 'Un actant avec cet email existe déjà: ' . $existingActant['title']];
        }

        try {
            $newUserId = null;

            // Si l'utilisateur existe, vérifier s'il a un actant lié
            if ($existingUser) {
                $newUserId = $existingUser['id'];

                // Vérifier si cet utilisateur a déjà un actant (resource avec owner_id = user.id et template actant)
                $checkUserActantSql = "
                    SELECT id, title FROM resource
                    WHERE owner_id = :userId
                    AND resource_template_id = :templateId
                ";
                $stmt = $this->conn->prepare($checkUserActantSql);
                $stmt->execute(['userId' => $newUserId, 'templateId' => $this->templates['actant']]);
                $userActant = $stmt->fetch(\PDO::FETCH_ASSOC);

                if ($userActant) {
                    return ['error' => 'Cet utilisateur a déjà un actant: ' . $userActant['title']];
                }
                // L'utilisateur existe mais n'a pas d'actant, on va en créer un
            } else {
                // Créer l'utilisateur Omeka S
                $tempPassword = password_hash('temp_' . time() . '_' . rand(1000, 9999), PASSWORD_DEFAULT);
                $insertUserSql = "
                    INSERT INTO user (email, name, role, is_active, created, modified, password_hash)
                    VALUES (:email, :name, :role, 1, NOW(), NOW(), :password)
                ";
                $stmt = $this->conn->prepare($insertUserSql);
                $stmt->execute([
                    'email' => $email,
                    'name' => $name,
                    'role' => $role,
                    'password' => $tempPassword
                ]);
                $newUserId = $this->conn->lastInsertId();
            }

            // 2. Créer l'item actant (resource template 72)
            // Parser le nom pour extraire prénom et nom de famille
            $nameParts = explode(' ', $name, 2);
            $firstname = $nameParts[0];
            $lastname = isset($nameParts[1]) ? $nameParts[1] : '';

            $insertResourceSql = "
                INSERT INTO resource (owner_id, resource_class_id, resource_template_id, is_public, created, modified, title)
                VALUES (:ownerId, NULL, :templateId, 1, NOW(), NOW(), :title)
            ";
            $stmt = $this->conn->prepare($insertResourceSql);
            $stmt->execute([
                'ownerId' => $newUserId,
                'templateId' => $this->templates['actant'],
                'title' => $name
            ]);
            $newActantId = $this->conn->lastInsertId();

            // Créer l'entrée dans item
            $insertItemSql = "INSERT INTO item (id) VALUES (:id)";
            $stmt = $this->conn->prepare($insertItemSql);
            $stmt->execute(['id' => $newActantId]);

            // 3. Ajouter les propriétés de l'actant
            // dcterms:title (property 1)
            $this->insertPropertyValue($newActantId, 1, $name);
            // foaf:givenName (property 139)
            if ($firstname) {
                $this->insertPropertyValue($newActantId, 139, $firstname);
            }
            // foaf:familyName (property 140)
            if ($lastname) {
                $this->insertPropertyValue($newActantId, 140, $lastname);
            }
            // schema:email (property 724)
            $this->insertPropertyValue($newActantId, 724, $email);

            return [
                'success' => true,
                'userId' => (int)$newUserId,
                'actantId' => (int)$newActantId,
                'email' => $email,
                'name' => $name,
                'role' => $role
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la création: ' . $e->getMessage()];
        }
    }

    /**
     * Mettre à jour les informations d'un actant
     */
    private function updateActant($actantId, $email, $name, $firstname, $lastname)
    {
        if (!$actantId) {
            return ['error' => 'actantId requis'];
        }

        // Vérifier que l'actant existe
        $checkSql = "SELECT id, title, owner_id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $actantId, 'templateId' => $this->templates['actant']]);
        $actant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$actant) {
            return ['error' => 'Actant non trouvé'];
        }

        try {
            // Mettre à jour le titre de la resource
            if (!empty($name)) {
                $updateTitleSql = "UPDATE resource SET title = :title, modified = NOW() WHERE id = :id";
                $stmt = $this->conn->prepare($updateTitleSql);
                $stmt->execute(['title' => $name, 'id' => $actantId]);

                // Mettre à jour dcterms:title (property 1)
                $this->updatePropertyValue($actantId, 1, $name);
            }

            // Mettre à jour foaf:givenName (property 139)
            if ($firstname !== '') {
                $this->updatePropertyValue($actantId, 139, $firstname);
            }

            // Mettre à jour foaf:familyName (property 140)
            if ($lastname !== '') {
                $this->updatePropertyValue($actantId, 140, $lastname);
            }

            // Mettre à jour schema:email (property 724)
            if ($email !== '') {
                $this->updatePropertyValue($actantId, 724, $email);
            }

            return [
                'success' => true,
                'actantId' => $actantId,
                'name' => $name,
                'email' => $email,
                'firstname' => $firstname,
                'lastname' => $lastname
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()];
        }
    }

    /**
     * Supprimer un actant et optionnellement son utilisateur Omeka S
     */
    private function deleteActant($actantId, $deleteUser = false)
    {
        if (!$actantId) {
            return ['error' => 'actantId requis'];
        }

        // Vérifier que l'actant existe
        $checkSql = "SELECT id, title, owner_id FROM resource WHERE id = :id AND resource_template_id = :templateId";
        $stmt = $this->conn->prepare($checkSql);
        $stmt->execute(['id' => $actantId, 'templateId' => $this->templates['actant']]);
        $actant = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$actant) {
            return ['error' => 'Actant non trouvé'];
        }

        $ownerId = $actant['owner_id'];

        try {
            // Supprimer les valeurs de propriétés
            $deleteValuesSql = "DELETE FROM `value` WHERE resource_id = :id";
            $stmt = $this->conn->prepare($deleteValuesSql);
            $stmt->execute(['id' => $actantId]);

            // Supprimer l'entrée dans item
            $deleteItemSql = "DELETE FROM item WHERE id = :id";
            $stmt = $this->conn->prepare($deleteItemSql);
            $stmt->execute(['id' => $actantId]);

            // Supprimer la ressource
            $deleteResourceSql = "DELETE FROM resource WHERE id = :id";
            $stmt = $this->conn->prepare($deleteResourceSql);
            $stmt->execute(['id' => $actantId]);

            $userDeleted = false;

            // Supprimer l'utilisateur si demandé et s'il existe
            if ($deleteUser && $ownerId) {
                // Vérifier que l'utilisateur n'a pas d'autres ressources
                $checkResourcesSql = "SELECT COUNT(*) as count FROM resource WHERE owner_id = :userId";
                $stmt = $this->conn->prepare($checkResourcesSql);
                $stmt->execute(['userId' => $ownerId]);
                $resourceCount = $stmt->fetch(\PDO::FETCH_ASSOC)['count'];

                if ($resourceCount == 0) {
                    $deleteUserSql = "DELETE FROM user WHERE id = :id";
                    $stmt = $this->conn->prepare($deleteUserSql);
                    $stmt->execute(['id' => $ownerId]);
                    $userDeleted = true;
                }
            }

            return [
                'success' => true,
                'actantId' => $actantId,
                'actantTitle' => $actant['title'],
                'userDeleted' => $userDeleted
            ];
        } catch (\Exception $e) {
            return ['error' => 'Erreur lors de la suppression: ' . $e->getMessage()];
        }
    }

    /**
     * Insère une valeur de propriété pour une ressource
     */
    private function insertPropertyValue($resourceId, $propertyId, $val)
    {
        $sql = "
            INSERT INTO `value` (resource_id, property_id, type, `value`, is_public)
            VALUES (:resourceId, :propertyId, 'literal', :val, 1)
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'resourceId' => $resourceId,
            'propertyId' => $propertyId,
            'val' => $val
        ]);
    }

    /**
     * Récupérer les ressources enseignantes (créées par les actants, visibles par tous)
     * Ces ressources n'ont pas de cours spécifique (pas de dcterms:isPartOf)
     */
    private function getTeacherResources()
    {
        // Récupérer les ressources créées par des utilisateurs avec rôle admin/author
        $experimentations = $this->getTeacherResourcesByType('experimentation');
        $tools = $this->getTeacherResourcesByType('tool');
        $feedbacks = $this->getTeacherResourcesByType('feedback');

        return [
            'experimentations' => $experimentations,
            'tools' => $tools,
            'feedbacks' => $feedbacks,
            'total' => count($experimentations) + count($tools) + count($feedbacks)
        ];
    }

    /**
     * Récupérer les ressources enseignantes d'un type
     * Ces ressources sont créées par des actants et n'ont PAS de cours associé (pas de dcterms:isPartOf vers un cours)
     */
    private function getTeacherResourcesByType($type)
    {
        $templateId = $this->templates[$type];
        $courseTemplateId = $this->templates['course'];

        // Ressources créées par des admins/auteurs (rôle actant) SANS cours associé
        $sql = "
            SELECT DISTINCT r.id, r.title, r.created
            FROM resource r
            JOIN user u ON r.owner_id = u.id
            WHERE r.resource_template_id = :templateId
            AND r.is_public = 1
            AND u.role IN ('admin', 'global_admin', 'author', 'editor')
            AND NOT EXISTS (
                SELECT 1 FROM value v
                JOIN resource course ON v.value_resource_id = course.id
                WHERE v.resource_id = r.id
                AND v.property_id = 33
                AND course.resource_template_id = :courseTemplateId
            )
            ORDER BY r.created DESC
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['templateId' => $templateId, 'courseTemplateId' => $courseTemplateId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['type'] = $type;
            $item['actants'] = $type === 'experimentation'
                ? $this->getFirstActant($item['id'])
                : $this->getFirstContributor($item['id']);
            $item['thumbnail'] = $this->getThumbnail($item['id']);
        }

        return $items;
    }

    /**
     * Récupérer toutes les ressources étudiantes avec leur cours associé (pour l'administration)
     */
    private function getAllResourcesAdmin()
    {
        $templateIds = [
            $this->templates['experimentation'],
            $this->templates['feedback'],
            $this->templates['tool']
        ];

        // Récupérer toutes les ressources des templates concernés (exclure les supprimées)
        $sql = "
            SELECT r.id, r.title, r.created, r.resource_template_id
            FROM resource r
            WHERE r.resource_template_id IN (" . implode(',', $templateIds) . ")
            AND r.is_public = 1
            ORDER BY r.created DESC
        ";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $resources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($resources)) {
            return [];
        }

        $resourceIds = array_column($resources, 'id');

        // Récupérer les liens vers les cours (dcterms:isPartOf = property_id 33)
        $courseLinks = [];
        $courseLinkSql = "
            SELECT v.resource_id, v.value_resource_id as course_id
            FROM value v
            WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
            AND v.property_id = 33
            AND v.value_resource_id IS NOT NULL
        ";
        $stmt = $this->conn->prepare($courseLinkSql);
        $stmt->execute();
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $link) {
            $courseLinks[$link['resource_id']] = $link['course_id'];
        }

        // Récupérer les titres des cours
        $courseIds = array_unique(array_values($courseLinks));
        $courseTitles = [];
        if (!empty($courseIds)) {
            $courseTitleSql = "
                SELECT r.id, r.title
                FROM resource r
                WHERE r.id IN (" . implode(',', $courseIds) . ")
            ";
            $stmt = $this->conn->prepare($courseTitleSql);
            $stmt->execute();
            foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $course) {
                $courseTitles[$course['id']] = $course['title'];
            }
        }

        // Construire le résultat
        $result = [];
        foreach ($resources as $resource) {
            $resourceId = $resource['id'];
            $courseId = isset($courseLinks[$resourceId]) ? $courseLinks[$resourceId] : null;

            // Déterminer le type
            $type = 'experimentation';
            if ($resource['resource_template_id'] == $this->templates['feedback']) {
                $type = 'feedback';
            } elseif ($resource['resource_template_id'] == $this->templates['tool']) {
                $type = 'tool';
            }

            $result[] = [
                'id' => $resourceId,
                'title' => $resource['title'],
                'type' => $type,
                'created' => $resource['created'],
                'courseId' => $courseId,
                'courseTitle' => $courseId ? (isset($courseTitles[$courseId]) ? $courseTitles[$courseId] : null) : null,
                'thumbnail' => $this->getThumbnail($resourceId),
                'actants' => $type === 'experimentation'
                    ? $this->getFirstActant($resourceId)
                    : $this->getFirstContributor($resourceId),
            ];
        }

        return $result;
    }

    /**
     * Mettre à jour le cours associé à une ressource
     * Utilise dcterms:isPartOf (property_id: 33)
     */
    private function updateResourceCourse($resourceId, $courseId)
    {
        if (!$resourceId) {
            return ['error' => 'resourceId requis'];
        }

        $propertyId = 33; // dcterms:isPartOf

        try {
            // Supprimer l'ancien lien de cours s'il existe
            $deleteSql = "
                DELETE FROM `value`
                WHERE `resource_id` = :resourceId
                AND `property_id` = :propertyId
            ";
            $stmt = $this->conn->prepare($deleteSql);
            $stmt->execute([
                'resourceId' => $resourceId,
                'propertyId' => $propertyId
            ]);

            // Si un nouveau cours est spécifié, créer le lien
            if ($courseId !== null) {
                // Vérifier que le cours existe
                $checkSql = "SELECT id FROM resource WHERE id = :id AND resource_template_id = :templateId";
                $stmt = $this->conn->prepare($checkSql);
                $stmt->execute(['id' => $courseId, 'templateId' => $this->templates['course']]);
                if (!$stmt->fetch()) {
                    return ['error' => 'Cours non trouvé'];
                }

                // Créer le nouveau lien
                $insertSql = "
                    INSERT INTO `value` (`resource_id`, `property_id`, `value_resource_id`, `type`, `is_public`)
                    VALUES (:resourceId, :propertyId, :courseId, 'resource', 1)
                ";
                $stmt = $this->conn->prepare($insertSql);
                $stmt->execute([
                    'resourceId' => $resourceId,
                    'propertyId' => $propertyId,
                    'courseId' => $courseId
                ]);
            }

            return ['success' => true, 'resourceId' => $resourceId, 'courseId' => $courseId];
        } catch (\Exception $e) {
            return ['error' => 'Erreur SQL: ' . $e->getMessage()];
        }
    }

    /**
     * Supprimer une ressource (soft delete - met is_public à 0)
     *
     * @param int $id ID de la ressource
     * @return array
     */
    function deleteResource($id)
    {
        if (!$id) {
            return ['error' => 'ID de ressource requis'];
        }

        try {
            // Soft delete : mettre is_public à 0
            $updateSql = "UPDATE resource SET is_public = 0, modified = NOW() WHERE id = :id";
            $stmt = $this->conn->prepare($updateSql);
            $stmt->execute(['id' => $id]);

            return ['success' => true, 'message' => 'Ressource supprimée avec succès'];
        } catch (\Exception $e) {
            return ['error' => 'Erreur SQL: ' . $e->getMessage()];
        }
    }
}
