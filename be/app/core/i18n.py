MESSAGES = {
    "vi": {
        "ask_dest": "Bạn dự định đi du lịch ở đâu ạ? 🌏",
        "ask_dep": "Bạn dự định **khởi hành từ đâu**? 🛫",  # <--- THÊM DÒNG NÀY
        "ask_people": "Chuyến đi tới **{dest}** (từ **{dep}**) mình đi mấy người ạ? 👥", # <--- SỬA DÒNG NÀY
        "ask_days": "Bạn muốn đi khoảng mấy ngày để mình tìm tour phù hợp? 🗓️",
        "no_tour": "Tiếc quá, hiện không có tour đi **{dest}** (từ {dep}) trong **{days} ngày** phù hợp 😢",
        "found_tour": "✨ Mình tìm thấy **{count} tour** đi **{dest}** khởi hành từ **{dep}** ({days} ngày, {people} người):",
        "cta": "👉 Bạn thích tour nào? Gửi **Mã tour** (ví dụ: `TO01`) để mình hỗ trợ đặt nhé!",
        "book_req": "Tuyệt vời! 👍\nBạn vui lòng cung cấp **Số Điện Thoại** để nhân viên tư vấn liên hệ chốt đơn nhé.",
        "labels": {"code": "Mã tour", "time": "Thời gian", "start": "Khởi hành", "price": "Giá", "type": "Loại"}
    },
    "en": {
        "ask_dest": "Where would you like to go? 🌏",
        "ask_dep": "Where will you **depart from**? 🛫", # <--- THÊM DÒNG NÀY
        "ask_people": "How many people are joining the trip to **{dest}** (from **{dep}**)? 👥",
        "ask_days": "How many days are you planning for? 🗓️",
        "no_tour": "Sorry, no tours found for **{dest}** (from {dep}) within ({days} days) 😢",
        "found_tour": "✨ I found **{count} tours** to **{dest}** from **{dep}** ({days} days, {people} people):",
        "cta": "👉 Which one do you like? Send me the **Tour Code** (e.g., `TO01`) to book!",
        "book_req": "Great! 👍\nPlease provide your **Phone Number** so our staff can contact you.",
        "labels": {"code": "Code", "time": "Duration", "start": "Depart", "price": "Price", "type": "Type"}
    }
}

def get_msg(lang, key, **kwargs):
    lang_dict = MESSAGES.get(lang, MESSAGES["vi"])
    template = lang_dict.get(key, "")
    return template.format(**kwargs)

def format_price(price):
    try:
        return f"{int(price):,}".replace(",", ".") + " VNĐ"
    except:
        return "Liên hệ"

def format_tour_card(t, index, lang="vi"):
    labels = MESSAGES.get(lang, MESSAGES["vi"])["labels"]
    price_str = format_price(t.get('gia'))
    
    return (
        f"### {index}. {t.get('tenTour')}\n"
        f"- 🏷️ **{labels['code']}:** `{t.get('maTour')}`\n"
        f"- ⏳ **{labels['time']}:** {t.get('soNgay')}N{t.get('soDem')}Đ\n"
        f"- 📅 **{labels['start']}:** {t.get('ngayBatDau')} → {t.get('ngayKetThuc')}\n"
        f"- 💰 **{labels['price']}:** {price_str}\n"
    )