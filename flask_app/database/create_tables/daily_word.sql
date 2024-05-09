CREATE TABLE IF NOT EXISTS `daily_word` (
`word_id`         int(11)  	   NOT NULL auto_increment	  COMMENT 'the id of the word',
`word`            varchar(255) NOT NULL            		  COMMENT 'the word',
PRIMARY KEY (`word_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains site user information";