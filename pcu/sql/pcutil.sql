-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 24, 2021 at 02:17 PM
-- Server version: 10.6.4-MariaDB
-- PHP Version: 8.0.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pcutil`
--

-- --------------------------------------------------------

--
-- Table structure for table `domains`
--

CREATE TABLE `domains` (
  `id` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `ownerId` int(11) NOT NULL,
  `fullName` tinytext NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(11) NOT NULL COMMENT 'Module ID',
  `name` tinytext NOT NULL COMMENT 'Module name.',
  `commandURL` varchar(2048) NOT NULL DEFAULT 'http://pumpkincell.net/api/module/invalid.php' COMMENT 'URL with command API.',
  `maintainerUserId` int(11) NOT NULL DEFAULT 0 COMMENT 'The user which is responsible for the module and has admin access to it.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `commandURL`, `maintainerUserId`) VALUES
(1, 'pcu-login', 'http://localhost/api/login-module.php', 1),
(2, 'pcu-hw-planner', 'http://localhost/u/hwplanner/api-module.php', 1),
(3, 'pcu-cloud', 'http://localhost/api/module/cloud.php', 1),
(4, 'pcu-support', 'http://pumpkincell.net/u/support/api.php', 1);

-- --------------------------------------------------------

--
-- Table structure for table `userAttributes`
--

CREATE TABLE `userAttributes` (
  `userId` int(11) NOT NULL,
  `def` int(11) NOT NULL,
  `value` varchar(1024) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `userAttributesDefs`
--

CREATE TABLE `userAttributesDefs` (
  `id` int(11) NOT NULL,
  `name` varchar(16) NOT NULL,
  `public` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userName` tinytext NOT NULL,
  `email` text DEFAULT NULL COMMENT 'The e-mail address (optional)',
  `role` enum('member','owner','admin','default','trusted','moderator') NOT NULL DEFAULT 'default',
  `password` tinytext DEFAULT NULL,
  `passwordExpired` tinyint(1) NOT NULL DEFAULT 0,
  `createTime` datetime NOT NULL DEFAULT current_timestamp(),
  `public` tinyint(1) NOT NULL DEFAULT 0,
  `emailVerificationToken` varchar(256) DEFAULT NULL,
  `domain` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `domains`
--
ALTER TABLE `domains`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ownerId` (`ownerId`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintainerUserId` (`maintainerUserId`);

--
-- Indexes for table `userAttributes`
--
ALTER TABLE `userAttributes`
  ADD UNIQUE KEY `uniq` (`userId`,`def`),
  ADD KEY `userId_2` (`userId`),
  ADD KEY `def` (`def`);

--
-- Indexes for table `userAttributesDefs`
--
ALTER TABLE `userAttributesDefs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `domain` (`domain`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `domains`
--
ALTER TABLE `domains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Module ID', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `userAttributesDefs`
--
ALTER TABLE `userAttributesDefs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `domains`
--
ALTER TABLE `domains`
  ADD CONSTRAINT `domains_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`);

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`maintainerUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userAttributes`
--
ALTER TABLE `userAttributes`
  ADD CONSTRAINT `userAttributes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userAttributes_ibfk_2` FOREIGN KEY (`def`) REFERENCES `userAttributesDefs` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`domain`) REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
