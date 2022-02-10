-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 10, 2022 at 12:04 PM
-- Server version: 10.6.5-MariaDB
-- PHP Version: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
  `tid` int(11) NOT NULL COMMENT 'Unique ID.',
  `userId` int(11) DEFAULT NULL COMMENT 'Idenftifies user who can see the HW.',
  `shareToDomain` tinyint(1) NOT NULL COMMENT 'Whether HW should be displayed for all users in a domain. Other users won''t be able to edit it.',
  `sub` varchar(3) NOT NULL COMMENT '3-letter Subject Identifier',
  `type` varchar(1) NOT NULL COMMENT '[DEPRECATED] Type: small/big task/test',
  `addTime` datetime DEFAULT NULL COMMENT 'Creation time',
  `untilTime` date NOT NULL COMMENT 'Turn-in date',
  `untilTimeT` time NOT NULL COMMENT 'Turn-in time. TODO: merge untilTime and untilTimeT',
  `topicFormat` varchar(1) NOT NULL COMMENT 'R-raw, N-new exercise list',
  `topic` text NOT NULL COMMENT 'Topic text.',
  `topicLabel` text DEFAULT NULL COMMENT 'Comma-separated label list',
  `status` varchar(6) NOT NULL DEFAULT 'N' COMMENT 'Status. One of ?,N,ipXX%[,P][,E],D',
  `description` text NOT NULL COMMENT 'Long description of task. TODO: Support adding binary files and more',
  `optional` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Is the HW optional, add additional label for it.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `labels`
--

CREATE TABLE `labels` (
  `id` int(11) NOT NULL COMMENT 'The unique label ID.',
  `userId` int(11) DEFAULT NULL COMMENT 'Identifies user, who added the label, or NULL if public (default) label.',
  `imp` enum('none','small','medium','big','verybig') NOT NULL DEFAULT 'none' COMMENT 'Defines the color of label.',
  `fullFlow` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Enables the ?-N-ip-P[-E]-D flow instead of default ?-N-ip[-E]-D',
  `name` tinytext NOT NULL DEFAULT '' COMMENT 'Label displayed name.',
  `preparationTime` int(11) NOT NULL DEFAULT 14 COMMENT 'The time (in days) that the HW can be in "E" state',
  `evaluationTime` int(11) NOT NULL DEFAULT 7 COMMENT 'The time (in days) that the HW must be added before untilTime.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `links`
--

CREATE TABLE `links` (
  `linkId` int(11) NOT NULL,
  `tid` int(11) NOT NULL,
  `link` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `requestLog`
--

CREATE TABLE `requestLog` (
  `id` int(11) NOT NULL COMMENT 'ID',
  `userId` int(11) NOT NULL COMMENT 'The User ID who did the request',
  `command` enum('add-hw','remove-hw','modify-hw','add-label','remove-label','modify-label','pcu-register','clear-log','remove-log','modify-status','modify-turn-in-time','modify-details') NOT NULL COMMENT 'API command',
  `args` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Arguments to command' CHECK (json_valid(`args`)),
  `time` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Request time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` varchar(3) NOT NULL,
  `user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `hws`
--
ALTER TABLE `hws`
  ADD PRIMARY KEY (`tid`) USING BTREE,
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `links`
--
ALTER TABLE `links`
  ADD PRIMARY KEY (`linkId`);

--
-- Indexes for table `requestLog`
--
ALTER TABLE `requestLog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hws`
--
ALTER TABLE `hws`
  MODIFY `tid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique ID.';

--
-- AUTO_INCREMENT for table `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The unique label ID.';

--
-- AUTO_INCREMENT for table `links`
--
ALTER TABLE `links`
  MODIFY `linkId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requestLog`
--
ALTER TABLE `requestLog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID';

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `labels`
--
ALTER TABLE `labels`
  ADD CONSTRAINT `labels_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `pcutil`.`users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
