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