CREATE USER mlflow_user WITH PASSWORD 'SuperSecurePwdHere' CREATEDB;
CREATE DATABASE mlflow_pg_db
    WITH 
    OWNER = mlflow_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE USER prefect_user WITH PASSWORD 'SuperSecurePwdHere' CREATEDB;
CREATE DATABASE prefect_pg_db
    WITH 
    OWNER = prefect_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE USER dlservice_user WITH PASSWORD 'SuperSecurePwdHere' CREATEDB;
CREATE DATABASE dlservice_pg_db
    WITH 
    OWNER = dlservice_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;





-- Tạo user PostgreSQL mới
CREATE USER mlopspipeline_user WITH PASSWORD 'SuperSecurePwdHere' CREATEDB;

-- Tạo database riêng cho Workflows
CREATE DATABASE mlops_workflow_db
    WITH 
    OWNER = mlopspipeline_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Chuyển sang database mới
\c mlops_workflow_db;

-- Xóa dữ liệu cũ trước khi chèn mới
DROP TABLE IF EXISTS workflow_edges CASCADE;
DROP TABLE IF EXISTS workflow_nodes CASCADE;
DROP SEQUENCE IF EXISTS workflow_node_id_seq;
DROP SEQUENCE IF EXISTS workflow_edge_id_seq;

-- Tạo sequence để tự động tăng ID
CREATE SEQUENCE workflow_node_id_seq START 1;
CREATE SEQUENCE workflow_edge_id_seq START 1;

-- Tạo bảng workflow_nodes
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id INT DEFAULT nextval('workflow_node_id_seq') PRIMARY KEY, 
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    position JSONB NOT NULL,
    status TEXT DEFAULT 'idle',
    progress INT DEFAULT 0,
    parameters JSONB,
    metrics JSONB
);

-- Tạo bảng workflow_edges
CREATE TABLE IF NOT EXISTS workflow_edges (
    id INT DEFAULT nextval('workflow_edge_id_seq') PRIMARY KEY, 
    edge_id TEXT UNIQUE NOT NULL,  -- Định danh duy nhất theo format "e1-2"
    source INT NOT NULL REFERENCES workflow_nodes(id),
    target INT NOT NULL REFERENCES workflow_nodes(id),
    edge_type TEXT DEFAULT 'bezier',
    animated BOOLEAN DEFAULT TRUE,
    style JSONB NOT NULL
);


-- Insert workflow nodes (Full Data)
INSERT INTO workflow_nodes (label, type, status, progress, position, parameters, metrics) VALUES
('데이터 수집', 'data_collection', 'idle', 0, '{"x": 100, "y": 100}', '{"source": "Local", "format": "Csv", "version": "latest"}', '{"데이터 크기": "2.3GB", "레코드 수": "1.2M"}'),
('데이터 검증', 'data_validation', 'idle', 0, '{"x": 300, "y": 100}', '{"checks": ["missing_values", "duplicates", "data_type"], "threshold": 0.8}', '{"유효성": "98.5%", "누락률": "0.2%"}'),
('특성 엔지니어링', 'feature_engineering', 'idle', 0, '{"x": 500, "y": 100}', '{"methods": ["scaling", "encoding", "selection"], "feature_selection": "correlation"}', '{"선택된 특성": "42개", "처리 시간": "45s"}'),
('데이터 분할', 'data_split', 'idle', 0, '{"x": 1300, "y": 100}', '{"train": 0.7, "validation": 0.15, "test": 0.15, "random_state": 42}', '{}'),
('모델 학습', 'model_training', 'idle', 0, '{"x": 1500, "y": 100}', '{"model": "xgboost", "epochs": 100, "batch_size": 32, "learning_rate": 0.001}', '{"Train Loss": "0.234", "Val Loss": "0.245", "Train Acc": "0.892", "Val Acc": "0.885"}'),
('모델 평가', 'model_evaluation', 'idle', 0, '{"x": 1700, "y": 100}', '{"metrics": ["accuracy", "precision", "recall", "f1"], "cross_validation": 5}', '{"Test Acc": "0.883", "F1 Score": "0.875", "AUC": "0.912"}'),
('모델 분석', 'model_analysis', 'idle', 0, '{"x": 1900, "y": 100}', '{"analysis_type": ["feature_importance", "shap_values"], "visualization": true}', '{"Top Feature": "age", "Impact Score": "0.324"}'),
('모델 버전 관리', 'model_versioning', 'idle', 0, '{"x": 2100, "y": 100}', '{"storage": "mlflow", "tags": ["production", "latest"]}', '{}'),
('모델 배포', 'model_deployment', 'idle', 0, '{"x": 2300, "y": 100}', '{"target": "production", "version": "1.0", "platform": "kubernetes"}', '{"응답 시간": "120ms", "TPS": "1000"}'),
('모니터링', 'monitoring', 'idle', 0, '{"x": 2500, "y": 100}', '{"metrics": ["performance", "drift"], "interval": "1h"}', '{"정확도 드리프트": "0.015", "평균 지연 시간": "85ms"}');

-- Insert workflow edges (Connections between nodes) (Fixed JSON)
INSERT INTO workflow_edges (edge_id, source, target, edge_type, animated, style) VALUES
('e1-2', 1, 2, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e2-3', 2, 3, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e3-4', 3, 4, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e4-5', 4, 5, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e5-6', 5, 6, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e6-7', 6, 7, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e7-8', 7, 8, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e8-9', 8, 9, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}'),
('e9-10', 9, 10, 'bezier', TRUE, '{"stroke": "#ED8936", "strokeWidth": 2, "opacity": 0.8}');

-- Grant full privileges to mlopspipeline_user on the new database
GRANT ALL PRIVILEGES ON DATABASE mlops_workflow_db TO mlopspipeline_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mlopspipeline_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mlopspipeline_user;



