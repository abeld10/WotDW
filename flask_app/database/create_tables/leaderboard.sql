CREATE TABLE IF NOT EXISTS `leaderboard` (
`leaderboard_id`  int(11)  	   NOT NULL auto_increment	  COMMENT 'the id of the leaderboard',
`username`        varchar(100) NOT NULL            		  COMMENT 'username of the user',
`time`            int(11) NOT NULL                   COMMENT 'the time taken',
PRIMARY KEY (`leaderboard_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains site user information";