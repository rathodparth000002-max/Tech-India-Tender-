INSERT INTO subscription_plans(name,price,duration_days,tender_limit,features) VALUES
('Free',0,365,10,'["Limited tender search","Basic tender details","Enquiry support"]'),
('Basic',999,30,100,'["Advanced tender search","Full tender details","Email alerts","Tender tracking"]'),
('Premium',2499,30,NULL,'["Unlimited search","Full tender details","Email, SMS and WhatsApp alerts","Document vault","Priority support"]')
ON CONFLICT DO NOTHING;

INSERT INTO users(full_name,email,phone,password_hash,role,is_verified)
VALUES('Tech India Tender Admin','admin@techindiatender.com','9999999999','$2a$12$C6UzMDM.H6dfI/f/IKcEe.O7OY7ZQ8mJ0uJ0Z0Z0Z0Z0Z0Z0Z0Z0Z','admin',true)
ON CONFLICT DO NOTHING;

INSERT INTO tenders(tender_number,title,organisation,state,category,tender_value,emd,closing_date,status,official_link) VALUES
('TIT/2026/GJ/1042','Supply and Installation of Office Furniture','Gujarat Urban Development Company Ltd.','Gujarat','Furniture','₹18,50,000','₹18,500','2026-11-18','Live','https://bidplus.gem.gov.in'),
('TIT/2026/GJ/1058','AMC for Computers and Printers','District Panchayat Office, Ahmedabad','Gujarat','IT Hardware','₹6,20,000','₹6,200','2026-11-12','Live','https://bidplus.gem.gov.in'),
('TIT/2026/MH/1071','Procurement of Industrial Safety Equipment','Municipal Corporation','Maharashtra','Safety Equipment','₹32,00,000','₹32,000','2026-11-25','Live','https://bidplus.gem.gov.in')
ON CONFLICT DO NOTHING;
