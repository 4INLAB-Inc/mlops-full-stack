from fastapi import APIRouter, HTTPException, BackgroundTasks, Form, HTTPException
from pydantic import BaseModel
import asyncpg, asyncio
from typing import List, Dict, Optional
import os, json, time
from typing import Dict, Any
from fastapi.encoders import jsonable_encoder

from api.workflow_run import run_selected_flow
from api.workflow_run import check_if_flow_running

# Global variable for connection pool
CONNECTION_POOL = None

# ✅ Set the database URL
PIPELINE_DB_URL = os.getenv("PIPELINE_DB_URL", "postgresql://mlopspipeline_user:SuperSecurePwdHere@postgres:${POSTGRES_PORT}/mlops_workflow_db")

async def get_db_connection():
    """Establish an asynchronous connection to the PostgreSQL database with connection pooling."""
    global CONNECTION_POOL
    if CONNECTION_POOL is None:
        try:
            # Create the pool only once when it's first needed
            CONNECTION_POOL = await asyncpg.create_pool(
                dsn=PIPELINE_DB_URL,
                min_size=1,  # Minimum number of connections
                max_size=10,  # Maximum number of connections (tạm thời giảm giới hạn để thử nghiệm)
                max_queries=50000,  # Max number of queries before the connection is reset
                max_inactive_connection_lifetime=60,  # Max time a connection can stay open if inactive
                timeout=30  # Connection timeout (seconds)
            )
            print("Connection pool created successfully.")
        except Exception as e:
            print(f"Error creating connection pool: {e}")
            raise

    # Try to acquire a connection from the pool with retry logic
    retries = 5  # Tăng số lần thử lại
    while retries > 0:
        try:
            return await CONNECTION_POOL.acquire()
        except asyncpg.exceptions.TooManyConnectionsError:
            retries -= 1
            print(f"Too many connections. Retrying... ({3 - retries} attempts left)")
            await asyncio.sleep(3)  # Tăng thời gian chờ để giảm tải
        except Exception as e:
            print(f"Failed to acquire connection: {e}")
            raise

    raise Exception("Unable to acquire database connection after several retries.")

# ✅ Release connection back to the pool after use
async def release_db_connection(conn):
    """Release database connection back to the pool."""
    try:
        await CONNECTION_POOL.release(conn)
    except Exception as e:
        print(f"Error releasing connection: {e}")
        
        
# ✅ Pydantic Models for Request Validation
class WorkflowNodeData(BaseModel):
    label: str
    type: str
    status: Optional[str] = "idle"
    progress: Optional[int] = 0
    parameters: Optional[Dict[str, Any]] = {}
    metrics: Optional[Dict[str, Any]] = {}
    
    
class WorkflowNode(BaseModel):
    type: str
    position: Dict[str, int]
    data: WorkflowNodeData
    
    class Config:
        schema_extra = {
            "example": {
                "type": "monitoring",
                "position": {"x": 2500, "y": 100 },
                "data": {
                    "label": "모니터링",
                    "type": "monitoring",
                    "status": "idle",
                    "progress": 0,
                    "parameters": {
                        "metrics": ["performance", "drift"],
                        "interval": "1h"
                    },
                    "metrics": {
                        "정확도 드리프트": "0.015",
                        "평균 지연 시간": "85ms"
                    }
                }          
            }
        }
    


class WorkflowEdge(BaseModel):
    source: int
    target: int
    edge_type: str = "bezier"
    animated: bool = True
    style: Dict
    # Cung cấp ví dụ cho style, bao gồm stroke, strokeWidth, opacity
    class Config:
        schema_extra = {
            "example": {
                "source": 1,
                "target": 4,
                "edge_type": "bezier",
                "animated": True,
                "style": {
                    "stroke": "#000000",  # Ví dụ mã màu hex
                    "strokeWidth": 2,
                    "opacity": 0.8
                }
            }
        }

# ✅ 1. Get all workflow nodes
async def get_workflows():
    """Retrieve all workflow nodes from the database asynchronously."""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("SELECT id, label, type, position, status, progress, parameters, metrics FROM workflow_nodes")

        nodes = []
        for row in rows:
            try:
                parameters_data = json.loads(row["parameters"]) if row["parameters"] else {}
                metrics_data = json.loads(row["metrics"]) if row["metrics"] else {}
                position_data = json.loads(row["position"]) if row["position"] else {}
            except json.JSONDecodeError:
                parameters_data, metrics_data = {}, {}

            nodes.append({
                "id": str(row["id"]),
                "type": "workflowNode",
                "position": position_data,
                "data": {
                    "label": row["label"],
                    "type": row["type"],
                    "status": row["status"],
                    "progress": row["progress"],
                    "parameters": parameters_data,
                    "metrics": metrics_data
                }
            })
        # Đóng kết nối
        await conn.close()
        return nodes
    finally:
        await release_db_connection(conn)

# ✅ 2. Get all workflow edges
async def get_connections():
    """Retrieve all edges (connections) between workflow nodes asynchronously."""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("SELECT edge_id, source, target, edge_type, animated, style FROM workflow_edges")

        edges = []
        for row in rows:
            try:
                style_data = json.loads(row["style"]) if row["style"] else {}
            except json.JSONDecodeError:
                style_data = {}

            edges.append({
                "id": str(row["edge_id"]),
                "source": str(row["source"]),
                "target": str(row["target"]),
                "type": row["edge_type"],
                "animated": row["animated"],
                "style": style_data
            })
        # Đóng kết nối
        await conn.close()
        return edges
    finally:
        await release_db_connection(conn)

# ✅ 3. Add a new workflow node
async def add_workflow_node(node: WorkflowNode):
    """Add a new workflow node asynchronously after formatting data correctly."""
    
    # Kết nối với DB
    conn = await get_db_connection()
    try:
        # Trích xuất dữ liệu từ `node.data`
        formatted_node = {
            "label": node.data.label,
            "type": node.data.type,
            "position": json.dumps(node.position),
            "status": node.data.status,
            "progress": node.data.progress,
            "parameters": json.dumps(node.data.parameters),  # Convert dict to JSON string
            "metrics": json.dumps(node.data.metrics)  # Convert dict to JSON string
        }
        
        await conn.execute("""
            SELECT setval('workflow_node_id_seq', COALESCE((SELECT MAX(id) FROM workflow_nodes), 0) + 1, false)
        """)

        # Thực hiện chèn vào DB
        row = await conn.fetchrow(
            """
            INSERT INTO workflow_nodes (label, type, position, status, progress, parameters, metrics)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            """,
            formatted_node["label"],
            formatted_node["type"],
            formatted_node["position"],
            formatted_node["status"],
            formatted_node["progress"],
            formatted_node["parameters"],
            formatted_node["metrics"]
        )

        # Đóng kết nối
        await conn.close()

        return {"message": "Node added", "id": row["id"]}
    finally:
        await release_db_connection(conn)

# ✅ 4. Add a new workflow edge
async def add_workflow_edge(edge: WorkflowEdge):
    
    # Hàm để tạo edge_id từ source và target
    def generate_edge_id(source: int, target: int) -> str:
        return f"e{source}-{target}"
    
    """Add a new workflow edge asynchronously."""
    conn = await get_db_connection()
    try:
        edge_id = generate_edge_id(edge.source, edge.target)

        # Sử dụng jsonable_encoder để mã hóa style trước khi lưu vào DB
        encoded_style = json.dumps(edge.style)
        
        # Cập nhật sequence để ID tiếp tục từ giá trị lớn nhất hiện có
        await conn.execute("""
            SELECT setval('workflow_edge_id_seq', COALESCE((SELECT MAX(id) FROM workflow_edges), 0) + 1, false)
        """)
        
        # Thực hiện chèn vào DB
        row = await conn.fetchrow(
            """
            INSERT INTO workflow_edges (edge_id, source, target, edge_type, animated, style)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            """,
            edge_id, edge.source, edge.target, edge.edge_type, edge.animated, encoded_style
        )
        await conn.close()
        return {"message": "Edge added", "id": row["id"]}
    finally:
        await release_db_connection(conn)


# ✅ 5. Update workflow node status, progress, parameters & metrics
async def update_workflow_node(node_id: int, status: str, progress: int, parameters: Optional[Dict[str, Any]] = None, metrics: Optional[Dict[str, Any]] = None):
    """Update the status, progress, parameters, and metrics of a workflow node asynchronously."""
    conn = await get_db_connection()
    
    try:
        # Prepare the query with optional fields
        query = """
            UPDATE workflow_nodes 
            SET status = $1, progress = $2, 
                parameters = $3, metrics = $4 
            WHERE id = $5
        """
        
        # Execute the query, passing in the new status, progress, parameters, and metrics
        await conn.execute(
            query, 
            status, 
            progress, 
            json.dumps(parameters) if parameters else None,  # Serialize the parameters to JSON
            json.dumps(metrics) if metrics else None,  # Serialize the metrics to JSON
            node_id
        )
        
        # Đóng kết nối
        await conn.close()
        
        return {"message": "Node updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating node: {str(e)}")
    
    finally:
        await release_db_connection(conn)

        
        
# ✅ 6. Delete a workflow node (and its associated edges)
async def delete_workflow_node():
    """Delete a workflow node (and its associated edges) asynchronously."""
    conn = await get_db_connection()
    try:
        # First, delete all the edges
        await conn.execute("DELETE FROM workflow_edges")
        
        # Then, delete all nodes
        await conn.execute("DELETE FROM workflow_nodes")
        
        await conn.close()
        return {"message": "All nodes and edges deleted"}
    finally:
        await release_db_connection(conn)

# ✅ 7. Delete a workflow edge
async def delete_workflow_edge():
    """Delete a workflow edge asynchronously."""
    conn = await get_db_connection()

    try:
        # Delete all edges
        await conn.execute("DELETE FROM workflow_edges")
        await conn.close()
        return {"message": "All edges deleted"}
    
    finally:
        await release_db_connection(conn)


# Hàm run_pipeline để lấy thông tin node và edge từ DB và thực thi pipeline (logic trống tạm thời)
async def run_pipeline(background_tasks: BackgroundTasks):
    try:
        # Lấy tất cả các nodes từ database
        nodes = await get_workflows()
        
        # Khởi tạo các nhóm
        group_1 = {"데이터 분할", "특성 엔지니어링", "데이터 검증", "데이터 수집"}
        group_2 = {"모델 학습"}
        group_3 = {"모델 분석", "모델 평가"}
        group_4 = {"모니터링", "모델 배포", "모델 버전 관리"}
        
        # Kiểm tra các group và xác định các flow
        data_flow = 1 if any(node['data']['label'] in group_1 for node in nodes) else 0
        train_flow = 1 if any(node['data']['label'] in group_2 for node in nodes) else 0
        eval_flow = 1 if any(node['data']['label'] in group_3 for node in nodes) else 0
        deploy_flow = 1 if any(node['data']['label'] in group_4 for node in nodes) else 0
        
        # Xử lý dữ liệu pipeline (tạm thời chưa thực thi logic)
        if await check_if_flow_running():  # Kiểm tra nếu pipeline đang chạy
            return {"status": "error", "message": "A flow is already running. Please wait until it completes."}
        else:
            # Nếu không có flow đang chạy, bắt đầu một flow mới
            name = None 
            description = None
            data_type = None
            dataset = None
            ds_description = None
            dvc_tag = None
            file_path = None
            model_name = None
            model = None
            learningRate = None
            batchSize = None
            epochs = None
            
            # Gọi hàm run_selected_flow để thực thi pipeline với các flow
            background_tasks.add_task(run_selected_flow, name, description, 
            data_type, dataset, ds_description, dvc_tag, file_path,
            model_name, model, learningRate, batchSize, epochs, 
            data_flow, train_flow, eval_flow, deploy_flow)  # Chạy pipeline đầy đủ từ data_flow đến deploy_flow
            
            # Kiểm tra trạng thái flow
            for _ in range(5):  # Kiểm tra trong 5 giây
                time.sleep(1)  # Kiểm tra mỗi giây
                if await check_if_flow_running():
                    return {"status": "started", "message": "Run_flow is added and running in the background."}
                else:
                    return {"status": "started", "message": "Please wait, flow is being added, not started yet!"}
        
        # Trả về thông tin của pipeline gồm nodes và edges (tạm thời chưa có logic cho edges)
        pipeline_info = {
            "nodes": nodes,
            "edges": []  # Bạn có thể thêm logic để lấy edges nếu cần thiết
        }

        return {"message": "Pipeline executed successfully", "data": pipeline_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def check_flow_status():
    """Check the current status of the flow run (running or not)."""
    try:
        flow_status = await check_if_flow_running()  # Kiểm tra nếu một flow đang chạy

        if flow_status:
            return {"status": "running", "message": "A flow is currently running."}
        else:
            return {"status": "completed", "message": "No flow is currently running."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking flow status: {str(e)}")