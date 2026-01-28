import requests
from app.config import settings

def get_all_tours():
    try:
        res = requests.get(settings.TOUR_API, timeout=10)
        res.raise_for_status()
        data = res.json()
        if isinstance(data, list): return data
        if isinstance(data, dict): return data.get("data", [])
        return []
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        return []

def search_tours(departure: str, destination: str, people: int, days: int):
    tours = get_all_tours()
    results = []

    for t in tours:
        # Lấy dữ liệu từ Mock Data (dùng .get để tránh lỗi nếu thiếu field)
        tour_depart = (t.get("diemXuatPhat") or "").lower()
        tour_dest = (t.get("diemDen") or "").lower()
        tour_name = (t.get("tenTour") or "").lower()
        
        try:
            duration = int(t.get("soNgay"))
        except:
            continue

        # 1. Lọc Điểm Xuất Phát (Nếu user có yêu cầu)
        if departure:
            # Tìm gần đúng (Ví dụ: user nhập "Hà Nội" khớp "TP. Hà Nội")
            if departure.lower() not in tour_depart:
                continue

        # 2. Lọc Điểm Đến (Quan trọng)
        if destination:
            # Tìm trong cả trường diemDen VÀ tenTour để chắc chắn
            if (destination.lower() not in tour_dest) and (destination.lower() not in tour_name):
                continue
        
        # 3. Lọc Số ngày
        if days is not None and duration < days:
            continue

        results.append(t)
    
    return results