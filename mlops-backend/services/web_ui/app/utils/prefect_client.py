from prefect.client.orchestration import get_client
from prefect.client.schemas.filters import FlowFilter, FlowFilterId, FlowRunFilter, FlowRunFilterState

import pandas as pd
from datetime import datetime
import pytz

async def fetch_flow_runs():
    """
    Fetch flow runs with their states from Prefect Server.
    """
    async with get_client() as client:
        # Lọc flow runs với trạng thái RUNNING, COMPLETED, và FAILED
        flow_run_filter = FlowRunFilter(
            state=FlowRunFilterState(type={"any_": ["RUNNING", "COMPLETED"]})
        )
        # Đọc tất cả flow_runs
        flow_runs = await client.read_flow_runs(flow_run_filter=flow_run_filter)
        
        # Lấy danh sách flow_id từ flow_runs
        flow_ids = list({fr.flow_id for fr in flow_runs})
        
        # Tạo FlowFilter để lấy thông tin flows
        flow_filter = FlowFilter(
            id=FlowFilterId(any_=flow_ids)
        )
        
        # Lấy thông tin các Flow tương ứng
        flows = await client.read_flows(flow_filter=flow_filter)
        flow_mapping = {flow.id: flow.name for flow in flows}
        
        # Tạo danh sách các flow_runs kèm thông tin flow_name
        result = []
        for flow_run in flow_runs:
            result.append({
                "flow_id": flow_run.flow_id,
                "flow_name": flow_mapping.get(flow_run.flow_id, "Unknown Flow"),
                "flow_run_name": flow_run.name,
                "state": flow_run.state.type.replace("StateType.", ""),
                "start_time": flow_run.start_time,
                "end_time": flow_run.end_time,
            })
            
        # Sắp xếp danh sách theo `start_time` hoặc `end_time`
        sorted_result = sorted(
            result,
            key=lambda x: x["start_time"] or x["end_time"],  # Sử dụng `start_time`, nếu không có thì dùng `end_time`
            reverse=True,  # Sắp xếp giảm dần (mới nhất ở đầu)
        )
        
        return sorted_result [:10]


def get_flow_runs_dataframe(flow_runs):
    """
    Convert flow runs data to a pandas DataFrame.
    """

    data = []
    seoul_tz = pytz.timezone("Asia/Seoul")
    utc_tz = pytz.utc

    # Lấy danh sách flow RUNNING
    # running_flows=flow_runs
    running_flows = [fr for fr in flow_runs if fr["state"] == "RUNNING"]
    
    # Tìm Start Time của flow RUNNING sớm nhất
    global_start_time = None
    if running_flows:
        global_start_time = min(
            pd.to_datetime(fr["start_time"]).tz_localize(utc_tz).tz_convert(seoul_tz)
            if pd.to_datetime(fr["start_time"]).tzinfo is None
            else pd.to_datetime(fr["start_time"]).tz_convert(seoul_tz)
            for fr in running_flows
        )

    else:
        # If no running flows, find the 5 most recent completed flows
        completed_flows = sorted(
            [fr for fr in flow_runs if fr["state"] == "COMPLETED"],
            key=lambda fr: pd.to_datetime(fr["end_time"]).tz_convert(seoul_tz) if fr["end_time"] else pd.Timestamp.now(tz=utc_tz).tz_convert(seoul_tz) ,
            reverse=True
        )[:5]
        global_start_time = min(
            pd.to_datetime(fr["start_time"]).tz_localize(utc_tz).tz_convert(seoul_tz)
            if pd.to_datetime(fr["start_time"]).tzinfo is None
            else pd.to_datetime(fr["start_time"]).tz_convert(seoul_tz)
            for fr in completed_flows
        )
        flow_runs = completed_flows  # Replace flow_runs with the most recent completed flows


    # Debug Start Time
    # print(f"DEBUG: global_start_time: {global_start_time} ({type(global_start_time)})")

    for flow_run in flow_runs:
        # Xử lý Start Time
        start_time = pd.to_datetime(flow_run["start_time"])
        if start_time.tzinfo is None:
            start_time = start_time.tz_localize(utc_tz).tz_convert(seoul_tz)
        else:
            start_time = start_time.tz_convert(seoul_tz)

        # Xử lý End Time
        end_time = flow_run["end_time"] if flow_run["end_time"] else datetime.now(utc_tz)
        end_time = pd.Timestamp(end_time)
        if end_time.tzinfo is None:
            end_time = end_time.tz_localize(utc_tz).tz_convert(seoul_tz)
        else:
            end_time = end_time.tz_convert(seoul_tz)

        # Lấy tên flow kết hợp flow_name và flow_run_name
        combined_name = f"{flow_run['flow_run_name']} ({flow_run['flow_name']})"

        # Giữ lại các flow có Start hoặc End trong khoảng từ `global_start_time` trở đi
        if (start_time >= global_start_time) or (end_time >= global_start_time):
            data.append({
                "Flow Name": combined_name,
                "State": flow_run["state"],
                "Start Time": start_time,
                "End Time": end_time,
                 "Details": f"State: {flow_run['state']}<br>Start: {start_time}<br>End: {end_time}"
            })

        # Debug từng Flow
        # print(f"DEBUG: Flow {combined_name} -> Start: {start_time}, End: {end_time}")

    # Debug toàn bộ dữ liệu chuẩn bị cho DataFrame
    # print("DEBUG: Filtered Data prepared for DataFrame:", data)
    return pd.DataFrame(data)

