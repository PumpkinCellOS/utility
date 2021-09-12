-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 23, 2021 at 11:17 AM
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
-- Database: `pcutil`
--

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL COMMENT 'Module ID',
  `name` tinytext NOT NULL COMMENT 'Module name.',
  `commandURL` varchar(2048) CHARACTER SET utf8mb4  NOT NULL DEFAULT 'http://pumpkincell.net/api/module/invalid.php' COMMENT 'URL with command API.',
  `maintainerUserId` int NOT NULL DEFAULT '0' COMMENT 'The user which is responsible for the module and has admin access to it.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `commandURL`, `maintainerUserId`) VALUES
(1, 'pcu-login', 'http://localhost/api/login-module.php', 1),
(2, 'pcu-hw-planner', 'http://localhost/u/hwplanner/api-module.php', 1),
(3, 'pcu-cloud', 'http://localhost/api/module/cloud.php', 1),
(4, 'pcu-support', 'http://localhost/u/support/api.php', 1);

-- --------------------------------------------------------

-- Domains
CREATE TABLE `domains` (
  `id` int NOT NULL,
  `name` tinytext NOT NULL,
  `ownerId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `domains`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `domains` CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT;

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `userName` tinytext NOT NULL,
  `email` TEXT NOT NULL DEFAULT 'not-given' COMMENT 'The e-mail address (optional)',
  `role` enum('member','owner','admin','default','trusted','moderator') CHARACTER SET utf8mb4  NOT NULL DEFAULT 'default',
  `password` tinytext NOT NULL,
  `passwordExpired` tinyint(1) NOT NULL DEFAULT '0',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `properties` JSON NOT NULL COMMENT 'User properties',
  `public` tinyint(1) NOT NULL DEFAULT '1',
  `domain` int NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'Module ID', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
