CREATE TABLE IF NOT EXISTS users(
 id SERIAL PRIMARY KEY,
 full_name VARCHAR(150) NOT NULL,
 email VARCHAR(180) UNIQUE NOT NULL,
 phone VARCHAR(15) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 business_name VARCHAR(180),
 business_type VARCHAR(80),
 role VARCHAR(20) DEFAULT 'customer' CHECK(role IN ('customer','admin')),
 is_active BOOLEAN DEFAULT true,
 is_verified BOOLEAN DEFAULT false,
 subscription_plan_id INTEGER,
 subscription_expires_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 code VARCHAR(6) NOT NULL,
 purpose VARCHAR(30) DEFAULT 'login',
 used BOOLEAN DEFAULT false,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans(
 id SERIAL PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 price NUMERIC(10,2) NOT NULL,
 duration_days INTEGER NOT NULL,
 tender_limit INTEGER,
 features JSONB DEFAULT '[]',
 is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS tenders(
 id SERIAL PRIMARY KEY,
 tender_number VARCHAR(100) UNIQUE NOT NULL,
 title TEXT NOT NULL,
 organisation TEXT,
 state VARCHAR(100),
 category VARCHAR(120),
 tender_value VARCHAR(100),
 emd VARCHAR(100),
 closing_date DATE NOT NULL,
 status VARCHAR(20) DEFAULT 'Live' CHECK(status IN ('Live','Closed','Cancelled')),
 description TEXT,
 documents TEXT,
 official_link TEXT,
 created_by INTEGER REFERENCES users(id),
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_tenders(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 UNIQUE(user_id,tender_id)
);

CREATE TABLE IF NOT EXISTS alert_keywords(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 keyword VARCHAR(120) NOT NULL,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 title VARCHAR(180),
 message TEXT,
 type VARCHAR(50),
 is_read BOOLEAN DEFAULT false,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 plan_id INTEGER REFERENCES subscription_plans(id),
 amount NUMERIC(10,2),
 provider VARCHAR(50),
 provider_order_id VARCHAR(120),
 provider_payment_id VARCHAR(120),
 status VARCHAR(30) DEFAULT 'pending',
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries(
 id SERIAL PRIMARY KEY,
 name VARCHAR(150),
 phone VARCHAR(15),
 email VARCHAR(180),
 service VARCHAR(150),
 message TEXT,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs(
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id),
 action VARCHAR(180),
 entity VARCHAR(80),
 entity_id INTEGER,
 ip_address VARCHAR(60),
 created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenders_search ON tenders USING gin(to_tsvector('english',coalesce(title,'')||' '||coalesce(organisation,'')||' '||coalesce(category,'')));
CREATE INDEX IF NOT EXISTS idx_tenders_closing ON tenders(closing_date);
