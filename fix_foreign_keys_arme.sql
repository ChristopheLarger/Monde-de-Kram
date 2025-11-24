-- ============================================
-- Script pour créer les clés étrangères Arme
-- ============================================
-- Ce script résout l'erreur 1452 en :
-- 1. Vérifiant/créant un index UNIQUE sur Arme.Nom
-- 2. Nettoyant les données orphelines
-- 3. Créant les clés étrangères

USE Kram;

-- ============================================
-- VÉRIFICATION PRÉALABLE : Vérifier que les tables existent
-- ============================================
-- Exécutez d'abord cette requête pour vérifier que les tables existent :
SHOW TABLES LIKE 'perso';
SHOW TABLES LIKE 'arme';

-- Si les tables n'apparaissent pas, l'erreur 1109 se produira
-- Vérifiez le nom exact des tables avec :
-- SHOW TABLES;

-- ============================================
-- ÉTAPE 1 : Vérifier si Arme.Nom est unique
-- ============================================
-- Si Arme.Nom n'est pas une clé primaire ou unique, on doit créer un index UNIQUE

-- Vérifier si un index UNIQUE existe déjà sur Arme.Nom
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM 
    information_schema.STATISTICS
WHERE 
    TABLE_SCHEMA = 'Kram'
    AND TABLE_NAME = 'arme'
    AND COLUMN_NAME = 'Nom'
    AND NON_UNIQUE = 0;

-- IMPORTANT : Assurez-vous que la base de données Kram est sélectionnée
-- Si l'erreur 1109 persiste, vérifiez que la table existe avec :
-- SHOW TABLES LIKE 'perso';

-- Si aucun index UNIQUE n'existe, créer un index UNIQUE sur Arme.Nom
-- (Décommentez la ligne suivante si nécessaire)
-- ALTER TABLE `arme` ADD UNIQUE INDEX idx_nom_unique (Nom);

-- ============================================
-- ÉTAPE 2 : Vérifier les données orphelines
-- ============================================
-- Trouver les valeurs dans Perso.Arme_1, Arme_2, Arme_3 qui n'existent pas dans Arme.Nom

-- Vérifier Arme_1
SELECT DISTINCT p.Arme_1 as 'Valeur orpheline'
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_1 = a.Nom
WHERE p.Arme_1 IS NOT NULL 
  AND p.Arme_1 != ''
  AND a.Nom IS NULL;

-- Vérifier Arme_2
SELECT DISTINCT p.Arme_2 as 'Valeur orpheline'
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_2 = a.Nom
WHERE p.Arme_2 IS NOT NULL 
  AND p.Arme_2 != ''
  AND a.Nom IS NULL;

-- Vérifier Arme_3
SELECT DISTINCT p.Arme_3 as 'Valeur orpheline'
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_3 = a.Nom
WHERE p.Arme_3 IS NOT NULL 
  AND p.Arme_3 != ''
  AND a.Nom IS NULL;

-- ============================================
-- ÉTAPE 3 : Nettoyer les données orphelines
-- ============================================
-- Mettre à NULL les valeurs qui n'existent pas dans Arme.Nom
-- (Décommentez les lignes suivantes pour nettoyer)

-- UPDATE `perso` p
-- LEFT JOIN `arme` a ON p.Arme_1 = a.Nom
-- SET p.Arme_1 = NULL
-- WHERE p.Arme_1 IS NOT NULL 
--   AND p.Arme_1 != ''
--   AND a.Nom IS NULL;

-- UPDATE `perso` p
-- LEFT JOIN `arme` a ON p.Arme_2 = a.Nom
-- SET p.Arme_2 = NULL
-- WHERE p.Arme_2 IS NOT NULL 
--   AND p.Arme_2 != ''
--   AND a.Nom IS NULL;

-- UPDATE `perso` p
-- LEFT JOIN `arme` a ON p.Arme_3 = a.Nom
-- SET p.Arme_3 = NULL
-- WHERE p.Arme_3 IS NOT NULL 
--   AND p.Arme_3 != ''
--   AND a.Nom IS NULL;

-- ============================================
-- ÉTAPE 4 : Créer les clés étrangères
-- ============================================
-- Une fois que Arme.Nom est unique et les données sont nettoyées,
-- vous pouvez créer les clés étrangères

-- Supprimer les clés étrangères existantes si elles existent (pour éviter les erreurs)
-- Note: MySQL ne supporte pas IF EXISTS pour DROP FOREIGN KEY
-- Vérifiez d'abord si elles existent avec :
-- SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'Kram' AND TABLE_NAME = 'perso' 
-- AND CONSTRAINT_NAME IN ('fk_perso_arme1', 'fk_perso_arme2', 'fk_perso_arme3');

-- Puis supprimez-les manuellement si nécessaire :
-- ALTER TABLE `perso` DROP FOREIGN KEY fk_perso_arme1;
-- ALTER TABLE `perso` DROP FOREIGN KEY fk_perso_arme2;
-- ALTER TABLE `perso` DROP FOREIGN KEY fk_perso_arme3;

-- Créer la clé étrangère pour Arme_1
-- ALTER TABLE `perso`
-- ADD CONSTRAINT fk_perso_arme1
-- FOREIGN KEY (Arme_1) REFERENCES `arme`(Nom)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;

-- Créer la clé étrangère pour Arme_2
-- ALTER TABLE `perso`
-- ADD CONSTRAINT fk_perso_arme2
-- FOREIGN KEY (Arme_2) REFERENCES `arme`(Nom)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;

-- Créer la clé étrangère pour Arme_3
-- ALTER TABLE `perso`
-- ADD CONSTRAINT fk_perso_arme3
-- FOREIGN KEY (Arme_3) REFERENCES `arme`(Nom)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;

