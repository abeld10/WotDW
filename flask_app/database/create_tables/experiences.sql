CREATE TABLE IF NOT EXISTS `experiences` (
`experience_id`  int(11)       NOT NULL AUTO_INCREMENT 	COMMENT 'The experience id',
`position_id`    int(11)       NOT NULL                	COMMENT 'FK: positions_id in table positions', 
`name`           varchar(1000) NOT NULL                	COMMENT 'The name of the experience',
`description`    varchar(10000) DEFAULT NULL            	COMMENT 'The description of the experience',
`hyperlink`      varchar(1000) DEFAULT NULL            	COMMENT 'A hyperlink for the experience',
`start_date`     date          NOT NULL                 COMMENT 'My start date for this experience',
`end_date`       date          DEFAULT NULL             COMMENT 'The end date for this experience',
PRIMARY KEY  (`experience_id`),
FOREIGN KEY (position_id) REFERENCES positions(position_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='My experiences';