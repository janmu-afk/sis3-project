-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 09, 2025 at 12:51 PM
-- Server version: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- PHP Version: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `SISIII2025_89231245`
--

-- --------------------------------------------------------

--
-- Table structure for table `Dejavnost`
--

CREATE TABLE `Dejavnost` (
  `sifra_de` int(11) NOT NULL,
  `naziv_de` varchar(200) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Izvajalec`
--

CREATE TABLE `Izvajalec` (
  `sifra_iz` int(11) NOT NULL,
  `naziv_iz` varchar(200) NOT NULL,
  `enota` varchar(200) NOT NULL,
  `ulica` varchar(200) NOT NULL,
  `kraj` varchar(200) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Pripomba`
--

CREATE TABLE `Pripomba` (
  `id_pripombe` int(11) NOT NULL,
  `tekst` varchar(1024) NOT NULL,
  `sifra_zd` int(11) NOT NULL,
  `enaslov` varchar(200) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Uporabnik`
--

CREATE TABLE `Uporabnik` (
  `enaslov` varchar(200) NOT NULL,
  `username` varchar(100) NOT NULL,
  `geslo` varchar(200) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Zaposlitev_zdravnika`
--

CREATE TABLE `Zaposlitev_zdravnika` (
  `id_zapos` int(11) NOT NULL,
  `sifra_zd` int(11) NOT NULL,
  `datum` date NOT NULL,
  `obseg` float NOT NULL,
  `kolicnik` float NOT NULL,
  `sprejem` tinyint(1) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Zaznamek`
--

CREATE TABLE `Zaznamek` (
  `enaslov` varchar(200) NOT NULL,
  `sifra_zd` int(11) NOT NULL
);

-- --------------------------------------------------------

--
-- Table structure for table `Zdravnik`
--

CREATE TABLE `Zdravnik` (
  `sifra_zd` int(11) NOT NULL,
  `ime` varchar(200) NOT NULL,
  `sifra_de` int(11) NOT NULL,
  `sifra_iz` int(11) NOT NULL
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Dejavnost`
--
ALTER TABLE `Dejavnost`
  ADD PRIMARY KEY (`sifra_de`);

--
-- Indexes for table `Izvajalec`
--
ALTER TABLE `Izvajalec`
  ADD PRIMARY KEY (`sifra_iz`);

--
-- Indexes for table `Pripomba`
--
ALTER TABLE `Pripomba`
  ADD KEY `fk_pripomba_sifra_zd` (`sifra_zd`),
  ADD KEY `fk_enaslov` (`enaslov`);

--
-- Indexes for table `Uporabnik`
--
ALTER TABLE `Uporabnik`
  ADD PRIMARY KEY (`enaslov`);

--
-- Indexes for table `Zaposlitev_zdravnika`
--
ALTER TABLE `Zaposlitev_zdravnika`
  ADD PRIMARY KEY (`id_zapos`),
  ADD KEY `sifra_zd` (`sifra_zd`);

--
-- Indexes for table `Zaznamek`
--
ALTER TABLE `Zaznamek`
  ADD PRIMARY KEY (`enaslov`,`sifra_zd`),
  ADD KEY `sifra_zd` (`sifra_zd`);

--
-- Indexes for table `Zdravnik`
--
ALTER TABLE `Zdravnik`
  ADD PRIMARY KEY (`sifra_zd`),
  ADD KEY `sifra_de` (`sifra_de`),
  ADD KEY `sifra_iz` (`sifra_iz`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Dejavnost`
--
ALTER TABLE `Dejavnost`
  MODIFY `sifra_de` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Izvajalec`
--
ALTER TABLE `Izvajalec`
  MODIFY `sifra_iz` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Zaposlitev_zdravnika`
--
ALTER TABLE `Zaposlitev_zdravnika`
  MODIFY `id_zapos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Zdravnik`
--
ALTER TABLE `Zdravnik`
  MODIFY `sifra_zd` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Pripomba`
--
ALTER TABLE `Pripomba`
  ADD CONSTRAINT `fk_enaslov` FOREIGN KEY (`enaslov`) REFERENCES `Uporabnik` (`enaslov`),
  ADD CONSTRAINT `fk_pripomba_sifra_zd` FOREIGN KEY (`sifra_zd`) REFERENCES `Zdravnik` (`sifra_zd`);

--
-- Constraints for table `Zaposlitev_zdravnika`
--
ALTER TABLE `Zaposlitev_zdravnika`
  ADD CONSTRAINT `fk_sifra_zd` FOREIGN KEY (`sifra_zd`) REFERENCES `Zdravnik` (`sifra_zd`);

--
-- Constraints for table `Zaznamek`
--
ALTER TABLE `Zaznamek`
  ADD CONSTRAINT `Zaznamek_ibfk_1` FOREIGN KEY (`enaslov`) REFERENCES `Uporabnik` (`enaslov`),
  ADD CONSTRAINT `Zaznamek_ibfk_2` FOREIGN KEY (`sifra_zd`) REFERENCES `Zdravnik` (`sifra_zd`);

--
-- Constraints for table `Zdravnik`
--
ALTER TABLE `Zdravnik`
  ADD CONSTRAINT `fk_sifra_de` FOREIGN KEY (`sifra_de`) REFERENCES `Dejavnost` (`sifra_de`),
  ADD CONSTRAINT `fk_sifra_iz` FOREIGN KEY (`sifra_iz`) REFERENCES `Izvajalec` (`sifra_iz`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
