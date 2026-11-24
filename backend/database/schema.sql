CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_address VARCHAR(45) PRIMARY KEY,
  failed_attempts INT DEFAULT 0,
  first_attempt_at BIGINT NOT NULL,
  blocked_until BIGINT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS login_attempt_reservations (
  reservation_id CHAR(36) PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX (ip_address)
);
