-- Table `pion` — correspondance intégrale et exclusive avec le constructeur Pion (js/pion.js)

CREATE TABLE IF NOT EXISTS `pion` (
  `Type` varchar(16) NOT NULL,
  `Model` varchar(256) NOT NULL,
  `Position` varchar(32) NOT NULL DEFAULT '0,0',
  `Selected` tinyint(1) NOT NULL DEFAULT 0,
  `Indice` int(11) NOT NULL DEFAULT 0,

  `Attaquant` tinyint(1) NOT NULL DEFAULT 0,
  `Defenseur` tinyint(1) NOT NULL DEFAULT 0,
  `Nb_action` int(11) NOT NULL DEFAULT 0,
  `Arme1_engagee` tinyint(1) NOT NULL DEFAULT 0,
  `Arme2_engagee` tinyint(1) NOT NULL DEFAULT 0,
  `Esquive` tinyint(1) NOT NULL DEFAULT 0,
  `Est_blesse` tinyint(1) NOT NULL DEFAULT 0,
  `Vue` int(11) NOT NULL DEFAULT 12,

  `Titre` varchar(256) NOT NULL DEFAULT '',
  `Arme1` varchar(128) NOT NULL DEFAULT '',
  `Arme2` varchar(128) NOT NULL DEFAULT '',
  `Note` text DEFAULT NULL,

  `Nom_liste` varchar(128) NOT NULL DEFAULT '',
  `Nom_sort` varchar(128) NOT NULL DEFAULT '',
  `Incantation` int(11) NOT NULL DEFAULT 0,
  `Fatigue_sort` int(11) NOT NULL DEFAULT 0,
  `Concentration_sort` int(11) NOT NULL DEFAULT 0,
  `Cible_sort` tinyint(1) NOT NULL DEFAULT 0,

  `Auto` tinyint(1) NOT NULL DEFAULT 0,
  `Is_flying` tinyint(1) NOT NULL DEFAULT 0,

  `Fatigue` int(11) NOT NULL DEFAULT 0,
  `Fatigue_down` int(11) NOT NULL DEFAULT 0,
  `Fatigue_eco` tinyint(1) NOT NULL DEFAULT 0,
  `Concentration` int(11) NOT NULL DEFAULT 0,
  `General` int(11) NOT NULL DEFAULT 0,
  `Tete` int(11) NOT NULL DEFAULT 0,
  `Poitrine` int(11) NOT NULL DEFAULT 0,
  `Abdomen` int(11) NOT NULL DEFAULT 0,
  `Brasg` int(11) NOT NULL DEFAULT 0,
  `Brasd` int(11) NOT NULL DEFAULT 0,
  `Jambeg` int(11) NOT NULL DEFAULT 0,
  `Jambed` int(11) NOT NULL DEFAULT 0,

  `Jet_att` int(11) NOT NULL DEFAULT 0,
  `Loc_att` varchar(64) NOT NULL DEFAULT '',
  `At1_att` tinyint(1) NOT NULL DEFAULT 1,
  `At2_att` tinyint(1) NOT NULL DEFAULT 1,

  `Jet_def` int(11) NOT NULL DEFAULT 0,
  `Pr1_def` tinyint(1) NOT NULL DEFAULT 0,
  `Pr2_def` tinyint(1) NOT NULL DEFAULT 0,
  `Esq_def` tinyint(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (`Type`, `Model`, `Indice`),
  KEY `FK_Pion_Model` (`Model`),
  CONSTRAINT `FK_Pion_Model` FOREIGN KEY (`Model`) REFERENCES `model` (`Nom_model`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
