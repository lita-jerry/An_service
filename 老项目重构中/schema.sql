DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_bind;
DROP TABLE IF EXISTS user_online_state;
DROP TABLE IF EXISTS mobile_sms_log;
DROP TABLE IF EXISTS trip;
DROP TABLE IF EXISTS trip_logs;
DROP TABLE IF EXISTS trip_polyline;
DROP TABLE IF EXISTS user_follow_relation;
DROP TABLE IF EXISTS follow_state;


CREATE TABLE `user` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `nick_name` CHAR(64),
  `avatar_url`  CHAR(255),
  `state` INTEGER NOT NULL,
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
DROP TRIGGER IF EXISTS `update_user_trigger`;
DELIMITER //
CREATE TRIGGER `update_user_trigger` BEFORE UPDATE ON `user`
 FOR EACH ROW SET NEW.`last_updated_time` = NOW()
//
DELIMITER ;


CREATE TABLE `user_bind` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `platform` INTEGER NOT NULL,
  `open_id` CHAR(32) NOT NULL,
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
DROP TRIGGER IF EXISTS `update_user_bind_trigger`;
DELIMITER //
CREATE TRIGGER `update_user_bind_trigger` BEFORE UPDATE ON `user_bind`
 FOR EACH ROW SET NEW.`last_updated_time` = NOW()
//
DELIMITER ;


CREATE TABLE `user_online_state` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER UNIQUE NOT NULL,
  `platform` INTEGER NOT NULL,
  `state` INTEGER NOT NULL,
  `client_token` CHAR(32) UNIQUE NOT NULL,
  `session_key` CHAR(64),
  `device_id` CHAR(128),
  `device_token` CHAR(128),
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
DROP TRIGGER IF EXISTS `update_user_online_state_trigger`;
DELIMITER //
CREATE TRIGGER `update_user_online_state_trigger` BEFORE UPDATE ON `user_online_state`
 FOR EACH ROW SET NEW.`last_updated_time` = NOW()
//
DELIMITER ;


CREATE TABLE `mobile_sms_log` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER,
  `type` INTEGER NOT NULL,
  `message` CHAR(255) NOT NULL,
  `code` CHAR(8),
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `trip` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number`  CHAR(32) UNIQUE NOT NULL,
  `user_id` INTEGER NOT NULL,
  `state` INTEGER NOT NULL,
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
DROP TRIGGER IF EXISTS `update_trip_trigger`;
DELIMITER //
CREATE TRIGGER `update_trip_trigger` BEFORE UPDATE ON `trip`
 FOR EACH ROW SET NEW.`last_updated_time` = NOW()
//
DELIMITER ;


CREATE TABLE `trip_logs` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number`  CHAR(32) NOT NULL,
  `event_type` INTEGER NOT NULL,
  `operation`  CHAR(255) NOT NULL,
  `remark`  CHAR(255),
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `trip_polyline` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number`  CHAR(32) NOT NULL,
  `longitude`  CHAR(255) NOT NULL,
  `latitude`  CHAR(255) NOT NULL,
  `remark`  CHAR(255),
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `user_follow_relation` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `follower_id` INTEGER NOT NULL,
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `follow_state` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `from_user_id` INTEGER NOT NULL,
  `to_user_id` INTEGER NOT NULL,
  `both_status` BOOLEAN NOT NULL,
  `created_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
