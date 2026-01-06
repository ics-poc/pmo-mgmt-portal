CREATE SCHEMA pmo;

CREATE TABLE pmo.br_data (
    auto_req_id                 VARCHAR(100) PRIMARY KEY,
    current_req_status          VARCHAR(100),
    grade                       VARCHAR(100),
    designation                 TEXT,
    recruiter                   TEXT,
    department_type             VARCHAR(100),
    bu                          VARCHAR(100),
    client_interview            TEXT,
    mandatory_skills            TEXT,
    entity                      VARCHAR(100),
    client_name                 TEXT,
    billing_type                VARCHAR(100),
    project                     TEXT,
    requester_id                VARCHAR(100),
    tag_manager                 TEXT,
    rm_name                     TEXT,
    job_description             TEXT,
    joining_location            VARCHAR(150),
    backfill_for_employee_name  VARCHAR(150),
    date_approved               TEXT,
    no_of_positions             INT,
    positions_remaining         INT,
    sourcing_type               VARCHAR(100),
    requirement_type            VARCHAR(100),
    st_bill_rate                NUMERIC(10,2),
    created_by                  VARCHAR(100),
    created_date                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by                 VARCHAR(100),
    modified_date               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pmo.employees (
    emp_no                             VARCHAR(30) PRIMARY KEY,
    emp_name                           VARCHAR(255),
    grade                              VARCHAR(50),
    cumulative_rating                  VARCHAR(50),
    appraisal_rating                   VARCHAR(50),
    previous_rm_name                   VARCHAR(255),
    br                                 VARCHAR(50),
    designation                        VARCHAR(200),
    official_mail_id                   VARCHAR(255) UNIQUE,
    phone_number                       VARCHAR(30),
    business_unit                      VARCHAR(200),
    previous_client                    VARCHAR(200),
    top_3_skills                       TEXT,
    rating_out_of_10_for_top_3_skills  TEXT,
    skills_category                    TEXT,
    skills_bucket                       TEXT,
    detailed_skills                    TEXT,
    infinite_doj                       DATE,
    received_date                      DATE,
    lwd                                TEXT,
    status                             VARCHAR(100),
    remarks                            TEXT,
    deployed_exit_month                VARCHAR(50),
    deployed_exit_date1                TEXT,
    deployed_client                    VARCHAR(255),
    reason_for_movement_to_corp_pool   TEXT,
    current_location                   VARCHAR(200),
    preferred_location                 VARCHAR(200),
    office_location                    VARCHAR(200),
    created_by                         VARCHAR(100),
    created_date                       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by                        VARCHAR(100),
    modified_date                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pmo.br_employee_match (
    auto_req_id VARCHAR(50) REFERENCES pmo.br_data(auto_req_id) ON DELETE CASCADE,
    emp_no VARCHAR(50) REFERENCES pmo.employees(emp_no) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    match_percent FLOAT,
    PRIMARY KEY (auto_req_id, emp_no, skill_name)
);

CREATE TABLE pmo.br_skill_map (
    auto_req_id VARCHAR(50) REFERENCES pmo.br_data(auto_req_id) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    preferred_flag CHAR(1),
    PRIMARY KEY (auto_req_id, skill_name)
);

CREATE TABLE pmo.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    password VARCHAR(255) NOT NULL, 
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE pmo.temp_login_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(200) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	redirect_path VARCHAR(500)
);

CREATE TABLE pmo.candidate_profile_document (
    candidate_profile_document_id SERIAL PRIMARY KEY,
    emp_no VARCHAR(30) REFERENCES pmo.employees(emp_no) ON DELETE CASCADE,
    file_name VARCHAR(255),
    upload_location VARCHAR(512),
    uploaded_by VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pmo.header_field_mapping (
    id                  BIGSERIAL PRIMARY KEY,
    entity_name          VARCHAR(50) NOT NULL,
    header_name          VARCHAR(200) NOT NULL,
    entity_field_name    VARCHAR(100) NOT NULL,
    active               BOOLEAN DEFAULT TRUE
);