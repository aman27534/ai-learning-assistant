-- Initialize databases for AI Learning Assistant services

-- Create databases for each service
CREATE DATABASE learning_db;
CREATE DATABASE productivity_db;
CREATE DATABASE content_db;
CREATE DATABASE analytics_db;

-- Create test databases
CREATE DATABASE learning_db_test;
CREATE DATABASE productivity_db_test;
CREATE DATABASE content_db_test;
CREATE DATABASE analytics_db_test;

-- Create users for each service (optional, for better security)
CREATE USER learning_user WITH ENCRYPTED PASSWORD 'learning_password';
CREATE USER productivity_user WITH ENCRYPTED PASSWORD 'productivity_password';
CREATE USER content_user WITH ENCRYPTED PASSWORD 'content_password';
CREATE USER analytics_user WITH ENCRYPTED PASSWORD 'analytics_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE learning_db TO learning_user;
GRANT ALL PRIVILEGES ON DATABASE productivity_db TO productivity_user;
GRANT ALL PRIVILEGES ON DATABASE content_db TO content_user;
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;

-- Grant test database privileges
GRANT ALL PRIVILEGES ON DATABASE learning_db_test TO learning_user;
GRANT ALL PRIVILEGES ON DATABASE productivity_db_test TO productivity_user;
GRANT ALL PRIVILEGES ON DATABASE content_db_test TO content_user;
GRANT ALL PRIVILEGES ON DATABASE analytics_db_test TO analytics_user;

-- Enable required extensions
\c learning_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c productivity_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c content_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c analytics_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";