-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 18, 2025 at 12:05 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u798820094_ms_shop_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_section` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `parent_section`) VALUES
(1, 'أحمر شفاه', 'ruby-beauty'),
(2, 'ظلال عيون', 'juicy-beauty'),
(3, 'فساتين', 'ruby-beauty'),
(4, 'حقائب', 'ruby-beauty'),
(5, 'كريم أساس', 'juicy-beauty'),
(6, 'مسكارا', 'juicy-beauty'),
(7, 'مناكير Pink', 'juicy-beauty'),
(8, 'مناكير Princess', 'juicy-beauty'),
(11, 'مسكارا شيجلام', 'sheglam');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `expiry_date` date NOT NULL,
  `usage_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `name`, `code`, `discount_type`, `discount_value`, `expiry_date`, `usage_count`, `created_at`) VALUES
(3, 'كوبون عيد الاأضحى', 'ADH2027', 'percentage', 10.00, '2025-11-22', 13, '2025-11-10 15:47:36'),
(4, 'عيد رأس السنة', 'NEW2027', 'percentage', 15.00, '2025-11-22', 5, '2025-11-10 20:45:49'),
(5, 'الصيف', 'SUM2027', 'percentage', 5.00, '2025-11-22', 3, '2025-11-12 11:23:54');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `location` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_order_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `name`, `phone`, `location`, `created_at`, `last_order_date`) VALUES
(1, 'Yazan Dyab', '0991343489', 'https://www.google.com/maps?q=32.707633,36.560925250000004', '2025-11-12 09:13:11', '2025-11-16 16:55:17'),
(2, 'زون', '0524104519', 'https://www.google.com/maps?q=32.707633,36.560925250000004', '2025-11-12 09:19:50', '2025-11-15 21:31:24'),
(3, 'Yazan', '099134348988', 'https://www.google.com/maps?q=32.707633,36.560925', '2025-11-12 11:10:17', '2025-11-14 10:08:54'),
(4, 'RAMI AL ASHKAR', '36435322223434', 'https://www.google.com/maps?q=32.707633,36.560925250000004', '2025-11-16 10:47:28', '2025-11-16 10:47:28'),
(5, 'يزون', '099316464933', 'https://www.google.com/maps?q=32.7078687,36.561007', '2025-11-16 11:16:14', '2025-11-16 11:16:14');

-- --------------------------------------------------------

--
-- Table structure for table `lucky_product`
--

CREATE TABLE `lucky_product` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `selection_method` enum('manual','auto') NOT NULL DEFAULT 'manual',
  `active_from` datetime NOT NULL,
  `active_to` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT 'admin',
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lucky_product`
--

INSERT INTO `lucky_product` (`id`, `product_id`, `discount_percent`, `selection_method`, `active_from`, `active_to`, `created_at`, `created_by`, `note`) VALUES
(16, 32, 5.00, '', '2025-11-16 00:00:00', '2025-12-16 00:00:00', '2025-11-16 10:54:30', 'admin', '');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_location` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Completed') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_new` tinyint(1) NOT NULL DEFAULT 1,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `contains_lucky_product` tinyint(1) NOT NULL DEFAULT 0,
  `lucky_product_id` int(11) DEFAULT NULL,
  `lucky_discount_percent` decimal(5,2) DEFAULT 0.00,
  `lucky_discount_amount` decimal(10,2) DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reward_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reward_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_gift` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parent_sections`
--

CREATE TABLE `parent_sections` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT 'fa-box',
  `icon_file` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parent_sections`
--

INSERT INTO `parent_sections` (`id`, `name`, `slug`, `icon`, `icon_file`, `description`, `display_order`, `is_active`, `created_at`) VALUES
(1, 'Juicy Beauty', 'juicy-beauty', 'fa-spa', 'uploads/icon_68fa0062e2e20_Juicy beauty logo.png', 'منتجات Juicy Beauty الأصلية', 1, 1, '2025-10-21 18:43:28'),
(2, 'Ruby Beauty', 'ruby-beauty', 'fa-r', 'uploads/icon_68fa01148a642_20084525101690992263 copy.png', 'منتجات Ruby Beauty الأصلية', 2, 1, '2025-10-21 18:43:28'),
(3, 'SHEGLAM', 'sheglam', 'fa-s', 'uploads/icon_68fa00aa2713f_Sheglam.png', 'منتجات Sheglam  الأصلية', 3, 1, '2025-10-21 20:25:47');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `reserved_stock` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT 'uploads/placeholder.jpg',
  `category_id` int(11) NOT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `last_cost_price` decimal(10,2) DEFAULT NULL,
  `is_new` tinyint(1) NOT NULL DEFAULT 0,
  `new_until` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `reserved_stock`, `image`, `category_id`, `barcode`, `last_cost_price`, `is_new`, `new_until`) VALUES
(1, 'أحمر شفاه قرمزي', 'لون غني يدوم طويلاً.', 30.00, 53, 0, 'uploads/1762954581_31812225_TopfaceInstyleMatteLipstick-012-680x680-1.png.webp', 1, '1001', 30.00, 1, '2025-11-29'),
(2, 'باليت ظلال عيون', 'مجموعة ألوان ترابية.', 45.00, 24, 0, 'uploads/1762954456_c3m5z0BiH71dUC1eUEEAf4hAdq9lKWEcQnJ5Tdmi.webp', 2, '1002', NULL, 0, '2025-11-29'),
(3, 'فستان سهرة أسود', 'فستان أنيق ومناسب للحفلات.', 11.00, 104, 0, 'uploads/1762954285_6dd8d587-a442-45f2-95a6-84f8a5d6ab18-1000x1000-VBuVWrx6a5p2xrrg6LF19SzysQv7ttXv6pGX9FMQ.webp', 3, '2001', 10.00, 0, '2025-11-29'),
(4, 'حقيبة يد جلدية', 'حقيبة عصرية وعملية.', 82.50, 5, 0, 'uploads/1762954375_2KJAX4iRd46Rnrw8rEpaDiFYuLcgnlgejTqLsHEX.webp', 4, '2002', 82.50, 0, '2025-11-29'),
(16, 'فرشاة للتجربة', '', 22.00, 0, 0, 'uploads/68f65eb03e0611K7A7958_4-768x768.webp', 5, NULL, NULL, 0, '2025-11-29'),
(17, 'منتج له درجات', '', 20.00, 0, 0, 'uploads/placeholder.jpg', 2, NULL, NULL, 0, NULL),
(18, 'مناكير رقم 9', '', 5.00, 11, 0, 'uploads/1761215264_9-500x500.webp', 7, '3085407652097', 15.00, 0, NULL),
(19, 'مناكير رقم 142', '', 5.00, 44, 0, 'uploads/68fa1f2b7710f142-500x500.webp', 7, '3236633231420', 15.00, 0, NULL),
(20, 'مناكير برينس 1050', '', 10.00, 27, 0, 'uploads/68fa1f84014631050-500x500.webp', 8, '3247133200120', 10.00, 0, NULL),
(21, 'مناكير لون 79', '', 5.00, 49, 0, 'uploads/68fa61707cbb079-768x768.webp', 7, '3085407652790', 15.00, 0, NULL),
(22, 'مناكير لون 169', '', 5.00, 18, 0, 'uploads/68fa61e7a6efe169-768x768.webp', 7, '3236633231697', NULL, 0, NULL),
(26, 'مناكير لون 168', '', 5.00, -2, 0, 'uploads/68fa632312991WhatsApp-Image-2021-11-16-at-10.11.09-AM-500x500.webp', 7, '3236633231680', NULL, 0, NULL),
(32, 'مناكير لون 10', '', 5.00, 15, 0, 'uploads/68fbe4248d8da1K7A0418_1007-500x500.webp', 7, '556778900', 0.00, 0, NULL),
(35, 'مناكير لون 37', '', 5.00, 20, 0, 'uploads/placeholder.jpg', 7, '3453456777', NULL, 0, NULL),
(36, 'مناكير لون 100', '', 5.00, 18, 0, 'uploads/placeholder.jpg', 7, '56548788890', NULL, 0, NULL),
(37, 'أحمر شفاه أحمر', 'لون غني يدوم طويلاً', 30.00, 19, 0, 'uploads/csv/csv_6901f36733c74_1761735527.jpg', 1, '1.23457E+11', 15.00, 0, NULL),
(38, 'كريم أساس سائل', 'تغطية كاملة ولمسة نهائية طبيعية', 50.00, 8, 0, 'uploads/csv/csv_6901f36753030_1761735527.jpg', 1, '994456779', 25.00, 0, NULL),
(39, 'منتج جديد', '', 15.00, 50, 0, 'uploads/690359477a6744EACEDF74BC740D2AC00345D6B41F0C2768x767.jpeg', 2, '77890123', NULL, 0, NULL),
(42, 'منتج جديد للتجربة', '', 15.00, 50, 0, 'uploads/1761838163_1K7A04071004768x767.jpg', 2, '3465346567789', NULL, 1, '2025-11-29'),
(43, 'تجربة منتج جديد', '', 15.00, 19, 0, 'uploads/69085d988fbb55A696DB3B38D4F5FA57D28D7B13CAA75500x500.jpeg', 4, '99008877', 50.00, 1, '2025-12-03'),
(45, 'تجربة اضافة', '', 16.50, 0, 0, 'uploads/690c5c1cd520cAB9D13E2F1434C38AB1137E8B4A9459D500x500.jpeg', 6, NULL, NULL, 1, '2025-12-06'),
(46, 'منتج ايصا', '', 15.00, 27, 0, 'uploads/690c5dc9b3b7a002D7B332CCA4F699A89266F9EEE0110500x500.jpeg', 2, '15534456', NULL, 1, '2025-11-19'),
(47, 'مسكارا شيغ', '', 15.00, 45, 0, 'uploads/690dc790ad1e63-6.webp', 11, '654565443', NULL, 1, '2025-12-07'),
(55, 'مسكارا شيغلام', '', 15.00, 47, 0, 'uploads/690df8dd7d2743-6.webp', 11, '87666875658565', NULL, 1, '2025-12-07'),
(57, 'مناكير درجات', 'مناكير درجات', 5.00, 0, 0, 'uploads/6910f8e1ef1801K7A04061020768x767.jpg', 7, NULL, NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `reserved_stock` int(11) NOT NULL DEFAULT 0,
  `price_override` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT 'uploads/placeholder.jpg',
  `last_cost_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `name`, `barcode`, `stock`, `reserved_stock`, `price_override`, `image`, `last_cost_price`) VALUES
(18, 16, '1', '112233', 47, 0, NULL, 'uploads/68f79dce4b9de_106-500x500.jpg', 30.00),
(19, 16, '2', '332211', 0, 0, NULL, 'uploads/68f65eb1eda275-4-768x768.jpg', NULL),
(20, 16, 'الدرجة 3', '998800', 0, 0, NULL, 'uploads/68f79bf815b44_1K7A7958_4-768x768.webp', NULL),
(25, 17, 'درجة 1', '115599', 20, 0, NULL, 'uploads/68f7b47d2e5e31K7A0553-768x768.webp', 15.00),
(26, 17, 'درجة 2', '225599', 42, 0, NULL, 'uploads/68f7b47d2e806106-500x500.jpg', 20.00),
(27, 16, 'الدرجة 4', '115500', 0, 0, NULL, 'uploads/68f80943d921e_5-4-768x768.jpg', NULL),
(28, 45, 'درجة 1', '11225567', 13, 0, NULL, 'uploads/690c5c20632f01K7A0439768x768.jpg', NULL),
(29, 45, 'درجة 2', '11225568', 15, 0, NULL, 'uploads/690c5c206369b1K7A04401768x768.jpg', NULL),
(32, 16, 'الدرجة 5 خمسة', '234213546', 25, 0, NULL, 'uploads/6910d18d1c115_7FC56041BF5645088D496B6AED2ECE5B500x500.jpeg', NULL),
(40, 17, 'درجة 3', '665435343', 23, 0, NULL, 'uploads/6910c675a7ce6_3-6.webp', NULL),
(47, 16, 'الدرجة 6', '645452223', 8, 0, NULL, 'uploads/6910f5a31883d_123768x769.jpg', NULL),
(49, 57, 'درجة فاتحة', '99866453', 5, 0, NULL, 'uploads/6910f8e4302811K7A04141021768x768.jpg', NULL),
(50, 57, 'درجة غامقة', '99866454', 15, 0, NULL, 'uploads/6910f8e43052d1K7A04131032768x768.jpg', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_invoices`
--

CREATE TABLE `purchase_invoices` (
  `id` int(11) NOT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'USD',
  `exchange_rate` decimal(15,6) DEFAULT 1.000000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_invoices`
--

INSERT INTO `purchase_invoices` (`id`, `supplier_name`, `invoice_date`, `notes`, `total_cost`, `created_at`) VALUES
(50, NULL, '2025-11-02', NULL, 50.00, '2025-11-02 17:33:20'),
(51, NULL, '2025-11-02', NULL, 40.00, '2025-11-02 17:34:17'),
(52, NULL, '2025-11-02', NULL, 40.00, '2025-11-03 07:26:06'),
(53, NULL, '2025-11-03', NULL, 10.00, '2025-11-03 07:39:44'),
(54, NULL, '2025-11-03', NULL, 30.00, '2025-11-03 07:40:30'),
(55, 'يزن', '2025-11-03', NULL, 215.00, '2025-11-03 07:42:08'),
(56, NULL, '2025-11-03', NULL, 0.00, '2025-11-03 07:45:47'),
(57, NULL, '2025-11-03', NULL, 10.00, '2025-11-03 13:36:24'),
(58, NULL, '2025-11-03', NULL, 1000.00, '2025-11-03 16:33:13'),
(59, NULL, '2025-11-05', NULL, 30.00, '2025-11-05 14:08:15');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_invoice_items`
--

CREATE TABLE `purchase_invoice_items` (
  `id` int(11) NOT NULL,
  `purchase_invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `gifts` int(11) NOT NULL DEFAULT 0,
  `cost_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_invoice_items`
--

INSERT INTO `purchase_invoice_items` (`id`, `purchase_invoice_id`, `product_id`, `variant_id`, `quantity`, `gifts`, `cost_price`) VALUES
(67, 50, 17, 25, 1, 0, 50.00),
(68, 51, 16, 18, 1, 0, 30.00),
(69, 51, 20, NULL, 1, 0, 10.00),
(70, 52, 16, 18, 1, 0, 30.00),
(71, 52, 3, NULL, 1, 0, 10.00),
(72, 53, 3, NULL, 1, 0, 10.00),
(73, 54, 16, 18, 1, 5, 30.00),
(74, 55, 21, NULL, 1, 10, 15.00),
(75, 55, 20, NULL, 2, 9, 10.00),
(76, 55, 19, NULL, 3, 8, 15.00),
(77, 55, 18, NULL, 4, 7, 15.00),
(78, 55, 17, 25, 5, 6, 15.00),
(79, 56, 43, NULL, 5, 0, 0.00),
(80, 57, 3, NULL, 1, 0, 10.00),
(81, 58, 43, NULL, 20, 0, 50.00),
(82, 59, 16, 18, 1, 0, 30.00);

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `id` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `return_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`id`, `reason`, `return_date`) VALUES
(1, '', '2025-10-20 15:04:44'),
(2, '', '2025-10-21 15:27:04'),
(406, '', '2025-11-06 06:18:33'),
(407, '', '2025-11-06 06:18:34'),
(408, '', '2025-11-06 06:18:35'),
(409, '', '2025-11-06 06:18:36'),
(410, '', '2025-11-06 06:18:38'),
(411, '', '2025-11-06 06:23:51'),
(412, '', '2025-11-06 07:54:33'),
(413, '', '2025-11-06 07:55:16');

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_return` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_items`
--

INSERT INTO `return_items` (`id`, `return_id`, `product_id`, `variant_id`, `quantity`, `price_at_return`) VALUES
(2, 2, 16, 18, 4, 22.00),
(3, 406, 18, NULL, 2, 0.00),
(4, 407, 17, 25, 1, 0.00),
(5, 408, 1, NULL, 2, 0.00),
(6, 409, 3, NULL, 1, 0.00),
(7, 410, 3, NULL, 1, 0.00),
(8, 411, 18, NULL, 1, 5.00),
(9, 412, 18, NULL, 1, 5.00),
(10, 413, 18, NULL, 11, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `reward_gift_pool`
--

CREATE TABLE `reward_gift_pool` (
  `gift_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reward_gift_pool`
--

INSERT INTO `reward_gift_pool` (`gift_id`, `product_id`, `variant_id`, `is_active`) VALUES
(1, 3, NULL, 1),
(2, 18, NULL, 1),
(3, 20, NULL, 1),
(4, 19, NULL, 1),
(5, 26, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reward_log`
--

CREATE TABLE `reward_log` (
  `log_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `reward_type` enum('product','coupon') NOT NULL,
  `reward_description` varchar(255) DEFAULT NULL,
  `reward_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reward_rules`
--

CREATE TABLE `reward_rules` (
  `rule_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'مثل: مكافأة العميل الفضي',
  `priority` int(11) NOT NULL DEFAULT 10 COMMENT 'الأولوية (رقم أعلى = أولوية أعلى)',
  `period_days` int(11) NOT NULL COMMENT 'الفترة بالأيام (مثال: 7 أو 30)',
  `spend_threshold` decimal(10,2) NOT NULL COMMENT 'المبلغ المطلوب إنفاقه',
  `reward_type` enum('product','coupon') NOT NULL,
  `reward_value` decimal(10,2) NOT NULL COMMENT 'قيمة الخصم (إذا كان كوبون)',
  `reward_note` varchar(255) NOT NULL COMMENT 'رسالة التهنئة للعميل',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reward_rules`
--

INSERT INTO `reward_rules` (`rule_id`, `name`, `priority`, `period_days`, `spend_threshold`, `reward_type`, `reward_value`, `reward_note`, `is_active`) VALUES
(1, 'مكافأة الشهر', 10, 7, 90.00, 'product', 0.00, 'لقد ربحت هدية الإنفاق', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `seller_name` varchar(255) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `discount_type` enum('fixed','percentage') DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `total_amount`, `sale_date`, `seller_name`, `delivery_fee`, `discount_type`, `discount_value`) VALUES
(1, 35.00, '2025-10-17 12:38:10', '', 0.00, 'fixed', 0.00),
(2, 35.00, '2025-10-17 12:51:45', '', 0.00, 'fixed', 0.00),
(15, 160.00, '2025-10-17 17:50:17', '', 0.00, 'fixed', 0.00),
(16, 60.00, '2025-10-20 15:05:30', '', 0.00, 'fixed', 0.00),
(17, 40.00, '2025-10-20 16:29:15', '', 0.00, 'fixed', 0.00),
(18, 54.00, '2025-10-20 18:10:15', '', 0.00, 'percentage', 10.00),
(19, 60.00, '2025-10-23 12:33:08', '', 0.00, 'fixed', 0.00),
(20, 165.00, '2025-10-26 08:59:23', '', 0.00, 'fixed', 0.00),
(21, 11.00, '2025-10-26 08:59:27', '', 0.00, 'fixed', 0.00),
(22, 64.00, '2025-10-26 16:01:33', '', 0.00, 'fixed', 0.00),
(23, 11.00, '2025-10-26 22:05:42', '', 0.00, 'fixed', 0.00),
(24, 80.00, '2025-10-29 07:50:26', '', 0.00, 'fixed', 0.00),
(25, 80.00, '2025-10-29 07:50:32', '', 0.00, 'fixed', 0.00),
(26, 80.00, '2025-10-29 07:51:00', '', 0.00, 'fixed', 0.00),
(27, 240.00, '2025-10-29 07:54:18', '', 0.00, 'fixed', 0.00),
(28, 240.00, '2025-10-29 07:54:24', '', 0.00, 'fixed', 0.00),
(29, 15.00, '2025-10-29 09:03:11', '', 0.00, 'fixed', 0.00),
(30, 38.00, '2025-10-31 07:11:52', '', 0.00, 'fixed', 0.00),
(31, 16.00, '2025-10-31 07:13:58', '', 0.00, 'fixed', 0.00),
(32, 10.00, '2025-10-31 07:35:57', '', 0.00, 'fixed', 0.00),
(33, 5.00, '2025-10-31 07:49:08', '', 0.00, 'fixed', 0.00),
(34, 5.00, '2025-10-31 07:49:45', '', 0.00, 'fixed', 0.00),
(35, 21.00, '2025-10-31 09:00:40', '', 0.00, 'fixed', 0.00),
(36, 21.00, '2025-10-31 09:00:40', '', 0.00, 'fixed', 0.00),
(37, 21.00, '2025-10-31 09:00:44', '', 0.00, 'fixed', 0.00),
(38, 21.00, '2025-10-31 09:00:44', '', 0.00, 'fixed', 0.00),
(39, 82.50, '2025-10-31 09:04:05', '', 0.00, 'fixed', 0.00),
(40, 10.00, '2025-10-31 09:05:08', '', 0.00, 'fixed', 0.00),
(41, 93.50, '2025-10-31 09:28:40', '', 0.00, 'fixed', 0.00),
(42, 82.50, '2025-10-31 09:29:34', '', 0.00, 'fixed', 0.00),
(43, 5.00, '2025-10-31 09:39:11', '', 0.00, 'fixed', 0.00),
(44, 5.00, '2025-10-31 09:39:11', '', 0.00, 'fixed', 0.00),
(45, 792.00, '2025-11-02 14:37:08', '', 0.00, 'percentage', 12.00),
(46, 90.00, '2025-11-03 15:28:39', '', 0.00, 'fixed', 0.00),
(47, 300.00, '2025-11-03 16:36:14', '', 0.00, 'fixed', 0.00),
(48, 22.00, '2025-11-05 08:47:03', '', 0.00, 'fixed', 0.00),
(49, 35.00, '2025-11-05 16:38:38', '', 0.00, 'fixed', 0.00),
(50, 11.00, '2025-11-05 17:31:13', '', 0.00, 'fixed', 0.00),
(51, 11.00, '2025-11-05 19:12:22', '', 0.00, 'fixed', 0.00),
(52, 210.00, '2025-11-06 06:27:09', '', 0.00, 'fixed', 0.00),
(53, 15.00, '2025-11-06 07:53:57', '', 0.00, 'fixed', 0.00),
(54, 45.00, '2025-11-11 08:11:47', '', 0.00, 'percentage', 10.00),
(55, 45.00, '2025-11-15 19:37:51', '', 0.00, 'fixed', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `variant_id`, `quantity`, `price`) VALUES
(25, 15, 2, NULL, 2, 45.00),
(28, 17, 16, 18, 1, 20.00),
(29, 17, 16, 19, 1, 20.00),
(30, 18, 16, 19, 2, 20.00),
(31, 18, 16, 18, 1, 20.00),
(32, 19, 19, NULL, 3, 5.00),
(33, 19, 20, NULL, 3, 10.00),
(34, 19, 18, NULL, 3, 5.00),
(35, 20, 4, NULL, 2, 82.50),
(36, 21, 3, NULL, 1, 11.00),
(37, 22, 21, NULL, 1, 5.00),
(38, 22, 20, NULL, 1, 10.00),
(39, 22, 18, NULL, 1, 5.00),
(40, 22, 3, NULL, 4, 11.00),
(41, 23, 3, NULL, 1, 11.00),
(42, 24, 20, NULL, 8, 10.00),
(43, 25, 20, NULL, 8, 10.00),
(44, 26, 20, NULL, 8, 10.00),
(45, 27, 17, 25, 12, 20.00),
(46, 28, 17, 25, 12, 20.00),
(47, 29, 20, NULL, 1, 10.00),
(48, 29, 18, NULL, 1, 5.00),
(49, 30, 3, NULL, 1, 11.00),
(50, 30, 18, NULL, 1, 5.00),
(51, 30, 16, 18, 1, 22.00),
(52, 31, 32, NULL, 1, 5.00),
(53, 31, 3, NULL, 1, 11.00),
(54, 32, 20, NULL, 1, 10.00),
(55, 33, 36, NULL, 1, 5.00),
(56, 34, 19, NULL, 1, 5.00),
(57, 35, 20, NULL, 1, 10.00),
(58, 35, 3, NULL, 1, 11.00),
(59, 36, 20, NULL, 1, 10.00),
(60, 36, 3, NULL, 1, 11.00),
(61, 37, 20, NULL, 1, 10.00),
(62, 37, 3, NULL, 1, 11.00),
(63, 38, 20, NULL, 1, 10.00),
(64, 38, 3, NULL, 1, 11.00),
(65, 39, 4, NULL, 1, 82.50),
(66, 40, 20, NULL, 1, 10.00),
(67, 41, 3, NULL, 1, 11.00),
(68, 41, 4, NULL, 1, 82.50),
(69, 42, 4, NULL, 1, 82.50),
(70, 43, 18, NULL, 1, 5.00),
(71, 44, 18, NULL, 1, 5.00),
(72, 45, 38, NULL, 20, 45.00),
(73, 46, 43, NULL, 6, 15.00),
(74, 47, 43, NULL, 20, 15.00),
(75, 48, 16, 18, 1, 22.00),
(76, 49, 20, NULL, 2, 10.00),
(77, 49, 18, NULL, 3, 5.00),
(78, 50, 3, NULL, 1, 11.00),
(79, 51, 3, NULL, 1, 11.00),
(80, 52, 18, NULL, 42, 5.00),
(81, 53, 19, NULL, 3, 5.00),
(82, 54, 20, NULL, 5, 10.00),
(83, 55, 57, 49, 9, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('delivery_fee_type', 'fixed'),
('delivery_fee_value', '5'),
('discount_type', 'global'),
('discount_value', '10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `lucky_product`
--
ALTER TABLE `lucky_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Indexes for table `parent_sections`
--
ALTER TABLE `parent_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_is_new` (`is_new`,`new_until`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `purchase_invoices`
--
ALTER TABLE `purchase_invoices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_invoice_id` (`purchase_invoice_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_id` (`return_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `return_items_ibfk_3` (`variant_id`);

--
-- Indexes for table `reward_gift_pool`
--
ALTER TABLE `reward_gift_pool`
  ADD PRIMARY KEY (`gift_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Indexes for table `reward_log`
--
ALTER TABLE `reward_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `rule_id` (`rule_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `reward_rules`
--
ALTER TABLE `reward_rules`
  ADD PRIMARY KEY (`rule_id`),
  ADD KEY `idx_priority` (`priority` DESC);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lucky_product`
--
ALTER TABLE `lucky_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT for table `parent_sections`
--
ALTER TABLE `parent_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `purchase_invoices`
--
ALTER TABLE `purchase_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=414;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reward_gift_pool`
--
ALTER TABLE `reward_gift_pool`
  MODIFY `gift_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reward_log`
--
ALTER TABLE `reward_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reward_rules`
--
ALTER TABLE `reward_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lucky_product`
--
ALTER TABLE `lucky_product`
  ADD CONSTRAINT `lucky_product_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  ADD CONSTRAINT `purchase_invoice_items_ibfk_1` FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoice_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reward_gift_pool`
--
ALTER TABLE `reward_gift_pool`
  ADD CONSTRAINT `fk_gift_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_gift_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reward_log`
--
ALTER TABLE `reward_log`
  ADD CONSTRAINT `fk_log_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_log_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_log_rule` FOREIGN KEY (`rule_id`) REFERENCES `reward_rules` (`rule_id`) ON DELETE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
