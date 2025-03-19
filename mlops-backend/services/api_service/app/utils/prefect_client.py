from prefect.client.orchestration import get_client
from prefect.client.schemas.filters import FlowFilter, FlowFilterId, FlowRunFilter, FlowRunFilterState

import pandas as pd
from datetime import datetime
import pytz
from prefect.client.schemas.sorting import FlowRunSort

async def fetch_latest_flow_runs(max_flows: int = 200):
    async with get_client() as client:
        # Tạo bộ lọc để lấy tất cả các flow_runs
        flow_run_filter = FlowRunFilter(\
            state=FlowRunFilterState(type={"any_": ['SCHEDULED', 'RUNNING', 'COMPLETED']})
            # state=FlowRunFilterState(type={"any_": ['SCHEDULED', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'CRASHED', 'PAUSED', 'CANCELLING']})
        )

        # Sắp xếp theo start_time giảm dần (mới nhất trước)
        sort_criteria = FlowRunSort.START_TIME_DESC  # Dùng FlowRunSort để sắp xếp

        # Lấy các flow_runs mới nhất với phân trang
        all_flow_runs = []
        limit = 200  # Giới hạn tối đa là 200
        offset = 0

        while len(all_flow_runs) < max_flows:
            flow_runs = await client.read_flow_runs(
                flow_run_filter=flow_run_filter,
                limit=limit,
                offset=offset,
                sort=sort_criteria
            )
            if not flow_runs:
                break  # Dừng nếu không còn flow_runs nào
            all_flow_runs.extend(flow_runs)
            offset += limit

            # Dừng nếu đã lấy đủ số lượng mong muốn
            if len(all_flow_runs) >= max_flows:
                break

        # Giới hạn kết quả trả về theo max_flows
        all_flow_runs = all_flow_runs[:max_flows]

        # Lấy thông tin các flow tương ứng
        flow_ids = list({fr.flow_id for fr in all_flow_runs})
        flow_filter = FlowFilter(id=FlowFilterId(any_=flow_ids))

        # Lấy thông tin các Flow tương ứng
        flows = await client.read_flows(flow_filter=flow_filter)
        flow_mapping = {flow.id: flow.name for flow in flows}

        # Múi giờ Seoul
        seoul_tz = pytz.timezone("Asia/Seoul")

        # Sắp xếp theo start_time giảm dần (mới nhất trước)
        sorted_result = sorted(
            all_flow_runs,
            key=lambda x: x.start_time if x.start_time is not None else datetime.now(tz=seoul_tz),  # Kiểm tra None trước khi so sánh
            reverse=True  # Sắp xếp giảm dần (mới nhất ở đầu)
        )

        # Lấy thông tin chi tiết của 5 dòng chạy mới nhất
        result = []
        for flow_run in sorted_result[:20]:
            task_runs = await client.read_task_runs(flow_run_filter=FlowRunFilter(id={"any_": [flow_run.id]}))

            # Extract relevant task details
            task_details = [
                {
                    "task_name": task.name,
                    "state": task.state.type.replace("StateType.", ""),
                    "start_time": task.start_time,
                    "end_time": task.end_time,
                }
                for task in task_runs
            ]

            result.append({
                "flow_id": flow_run.flow_id,
                "flow_name": flow_mapping.get(flow_run.flow_id, "Unknown Flow"),  # Dùng flow_mapping đã khai báo
                "flow_run_name": flow_run.name,
                "state": flow_run.state.type.replace("StateType.", ""),
                "start_time": flow_run.start_time,
                "end_time": flow_run.end_time,
                "tasks": task_details,
            })

        print(f"Total flow runs fetched: {len(result)}")
        return result


def get_flow_runs_dataframe(flow_runs):
    """
    Convert flow runs data to a pandas DataFrame, filtering based on start or end times.
    The dataframe will include details about each flow run, including their start/end times and states.
    """

    data = []
    seoul_tz = pytz.timezone("Asia/Seoul")
    utc_tz = pytz.utc

    # Lọc các dòng chạy trong trạng thái "RUNNING"
    running_flows = [fr for fr in flow_runs if fr["state"] == "RUNNING"]
    
    # Tìm thời gian bắt đầu sớm nhất của dòng chạy "RUNNING"
    global_start_time = None
    if running_flows:
        global_start_time = min(
            # Chuyển đổi start_time thành đối tượng datetime và áp dụng múi giờ Seoul
            pd.to_datetime(fr["start_time"]).tz_localize(utc_tz).tz_convert(seoul_tz)
            if pd.to_datetime(fr["start_time"]).tzinfo is None
            else pd.to_datetime(fr["start_time"]).tz_convert(seoul_tz)
            for fr in running_flows
        )
    else:
        # Nếu không có dòng chạy "RUNNING", tìm 5 dòng "COMPLETED" gần nhất
        completed_flows = sorted(
            [fr for fr in flow_runs if fr["state"] == "COMPLETED"],
            key=lambda fr: pd.to_datetime(fr["end_time"]).tz_convert(seoul_tz) if fr["end_time"] else pd.Timestamp.now(tz=utc_tz).tz_convert(seoul_tz),
            reverse=True
        )[:10]

        # Tìm thời gian bắt đầu sớm nhất của các dòng "COMPLETED"
        if completed_flows:
            global_start_time = min(
                pd.to_datetime(fr["start_time"]).tz_localize(utc_tz).tz_convert(seoul_tz)
                if pd.to_datetime(fr["start_time"]).tzinfo is None
                else pd.to_datetime(fr["start_time"]).tz_convert(seoul_tz)
                for fr in completed_flows
            )
        # Cập nhật lại flow_runs với các dòng "COMPLETED"
        flow_runs = completed_flows

    # Nếu không tìm thấy dòng chạy nào "RUNNING" hoặc "COMPLETED", không làm gì thêm
    if global_start_time is None:
        return pd.DataFrame()

    # Lọc và thêm các dòng chạy
    for flow_run in flow_runs:
        

        # Kiểm tra start_time, nếu là None thì dùng thời gian hiện tại với múi giờ Seoul
        start_time = pd.to_datetime(flow_run["start_time"]) if flow_run["start_time"] is not None else pd.Timestamp.now(tz=seoul_tz)
        print(start_time)
        if start_time.tzinfo is None:
            start_time = start_time.tz_localize(utc_tz).tz_convert(seoul_tz)
        else:
            start_time = start_time.tz_convert(seoul_tz)

        end_time = flow_run["end_time"] if flow_run["end_time"] else datetime.now(utc_tz)
        end_time = pd.Timestamp(end_time)
        if end_time.tzinfo is None:
            end_time = end_time.tz_localize(utc_tz).tz_convert(seoul_tz)
        else:
            end_time = end_time.tz_convert(seoul_tz)

        combined_name = f"{flow_run['flow_run_name']} ({flow_run['flow_name']})"

        # Giữ lại dòng chạy có Start hoặc End sau `global_start_time`
        if (start_time >= global_start_time) or (end_time >= global_start_time):
            print(f"DEBUG: Adding flow: {combined_name}, state: {flow_run['state']}, start: {start_time}, end: {end_time}")
            data.append({
                "Flow Name": combined_name,
                "State": flow_run["state"],
                "Start Time": start_time,
                "End Time": end_time,
                "Details": f"State: {flow_run['state']}<br>Start: {start_time}<br>End: {end_time}"
            })

    # Trả về DataFrame
    return pd.DataFrame(data)

