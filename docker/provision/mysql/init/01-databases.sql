CREATE DATABASE IF NOT EXISTS `cotulity_dev`;
CREATE DATABASE IF NOT EXISTS `cotulity_test`;
CREATE DATABASE IF NOT EXISTS `cotulity`;

-- CREATE USER 'root'@'localhost' IDENTIFIED BY 'local';
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';

CREATE USER 'cot_admin'@'localhost' IDENTIFIED BY 'admin_pwd';
GRANT ALL PRIVILEGES ON cotulity_dev.* TO cot_admin@'%' IDENTIFIED BY 'admin_pwd';
GRANT ALL PRIVILEGES ON cotulity_test.* TO cot_admin@'%' IDENTIFIED BY 'admin_pwd';
GRANT ALL PRIVILEGES ON cotulity.* TO cot_admin@'%' IDENTIFIED BY 'admin_pwd';

CREATE USER 'cot_dev'@'localhost' IDENTIFIED BY 'dev_pwd';
GRANT ALL PRIVILEGES ON cotulity_dev.* TO cot_dev@'%' IDENTIFIED BY 'dev_pwd';

CREATE USER 'cot_test'@'localhost' IDENTIFIED BY 'test_pwd';
GRANT ALL PRIVILEGES ON cotulity_test.* TO cot_test@'%' IDENTIFIED BY 'test_pwd';

CREATE USER 'cot_prod'@'localhost' IDENTIFIED BY 'prod_pwd';
GRANT ALL PRIVILEGES ON cotulity.* TO cot_prod@'%' IDENTIFIED BY 'prod_pwd';

FLUSH PRIVILEGES;