-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 23, 2021 at 11:16 AM
-- Server version: 8.0.23-0ubuntu0.20.04.1
-- PHP Version: 7.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hwplanner`
--

-- --------------------------------------------------------

--
-- Table structure for table `hws`
--

CREATE TABLE `hws` (
  `tid` int NOT NULL COMMENT 'Unique ID.',
  `userId` int DEFAULT NULL COMMENT 'Idenftifies user who can see the HW.',
  `sub` varchar(3) CHARACTER SET utf8mb4 NOT NULL COMMENT '3-letter Subject Identifier',
  `type` varchar(1) CHARACTER SET utf8mb4 NOT NULL COMMENT '[DEPRECATED] Type: small/big task/test',
  `addTime` datetime DEFAULT NULL COMMENT 'Creation time',
  `untilTime` date NOT NULL COMMENT 'Turn-in date',
  `untilTimeT` time NOT NULL COMMENT 'Turn-in time. TODO: merge untilTime and untilTimeT',
  `topicFormat` varchar(1) CHARACTER SET utf8mb4 NOT NULL COMMENT 'R-raw, N-new exercise list',
  `topic` text CHARACTER SET utf8mb4 NOT NULL COMMENT 'Topic text.',
  `topicLabel` text CHARACTER SET utf8mb4 COMMENT 'Comma-separated label list',
  `status` varchar(6) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'N' COMMENT 'Status. One of ?,N,ipXX%[,P][,E],D',
  `description` text CHARACTER SET utf8mb4 NOT NULL COMMENT 'Long description of task. TODO: Support adding binary files and more',
  `optional` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Is the HW optional, add additional label for it.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `labels`
--

CREATE TABLE `labels` (
  `id` int NOT NULL COMMENT 'The unique label ID.',
  `userId` int DEFAULT NULL COMMENT 'Identifies user, who added the label, or NULL if public (default) label.',
  `imp` enum('none','small','medium','big','verybig') CHARACTER SET utf8mb4 NOT NULL DEFAULT 'none' COMMENT 'Defines the color of label.',
  `fullFlow` tinyint(1) NOT NULL COMMENT 'Enables the ?-N-ip-P[-E]-D flow instead of default ?-N-ip[-E]-D',
  `name` tinytext CHARACTER SET utf8mb4 NOT NULL COMMENT 'Label displayed name.',
  `preparationTime` int NOT NULL DEFAULT '14' COMMENT 'The time (in days) that the HW can be in "E" state',
  `evaluationTime` int NOT NULL DEFAULT '7' COMMENT 'The time (in days) that the HW must be added before untilTime.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `labels`
--

-- TODO: Do not hardcode this??
INSERT INTO `labels` (`id`, `userId`, `imp`, `fullFlow`, `name`, `preparationTime`, `evaluationTime`) VALUES
(2, NULL, 'small', 1, 'Odpowiedź ustna', 0, 7),
(3, NULL, 'small', 0, 'Opracowanie', 3, 14),
(4, NULL, 'small', 0, 'Opracowanie grupowe', 7, 7),
(5, NULL, 'small', 0, 'Praca domowa', 0, 7),
(6, NULL, 'small', 0, 'Ćwiczenie', 0, 7),
(7, NULL, 'medium', 1, 'Kartkówka', 3, 7),
(8, NULL, 'medium', 0, 'Lektura', 3, 7),
(9, NULL, 'medium', 1, 'Wypowiedź', 3, 0),
(10, NULL, 'medium', 0, 'Wypracowanie', 3, 7),
(11, NULL, 'big', 1, 'Konkurs', 7, 14),
(12, NULL, 'none', 0, 'Dni wolne', 14, 7),
(13, NULL, 'big', 0, 'Praca pisemna', 7, 14),
(14, NULL, 'big', 0, 'Projekt', 7, 14),
(15, NULL, 'big', 1, 'Sprawdzian', 7, 14),
(16, NULL, 'big', 0, 'Projekt', 7, 14),
(17, NULL, 'verybig', 1, 'Egzamin', 14, 31),
(18, NULL, 'verybig', 0, 'Duży projekt', 14, 31),
(19, NULL, 'small', 0, 'Karta pracy', 0, 7);

-- --------------------------------------------------------

--
-- Table structure for table `requestLog`
--

CREATE TABLE `requestLog` (
  `id` int NOT NULL COMMENT 'ID',
  `userId` int NOT NULL COMMENT 'The User ID who did the request',
  `command` enum('add-hw','remove-hw','modify-hw','add-label','remove-label','modify-label','pcu-register','clear-log','remove-log','modify-status','modify-turn-in-time','modify-details') CHARACTER SET utf8mb4 NOT NULL COMMENT 'API command',
  `args` json NOT NULL COMMENT 'Arguments to command',
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Request time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `hws`
--
ALTER TABLE `hws`
  ADD UNIQUE KEY `tid` (`tid`) USING BTREE;

--
-- Indexes for table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requestLog`
--
ALTER TABLE `requestLog`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hws`
--
ALTER TABLE `hws`
  MODIFY `tid` int NOT NULL AUTO_INCREMENT COMMENT 'Unique ID.', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'The unique label ID.', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `requestLog`
--
ALTER TABLE `requestLog`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID', AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
