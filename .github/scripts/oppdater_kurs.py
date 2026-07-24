import urllib.request
import re
from datetime import datetime

ICS_URL = "https://p58-caldav.icloud.com/published/2/MTIzOTM2OTQ1MTIzOTM2Oad9yveyAQ23MMK2E8jnZvWuvfdzgACJSfRpyBqNjvYE7yAB3zM7JTKpnCd4vDWNNzLdLvzxf6uRKI-aYMWq7W0"

MAANEDER = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]


def hent_ics():
    req = urllib.request.Request(ICS_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_events(text):
    events = []
    blocks = text.split("BEGIN:VEVENT")[1:]
    for block in blocks:
        summary_m = re.search(r"SUMMARY:(.*)", block)
        dtstart_m = re.search(r"DTSTART[^:]*:(\d{8})", block)
        if summary_m and dtstart_m:
            d = dtstart_m.group(1)
            dt = datetime(int(d[0:4]), int(d[4:6]), int(d[6:8]))
            summary = summary_m.group(1).strip()
            summary = re.sub(r"^Kurs i regi av ", "", summary, flags=re.IGNORECASE)
            events.append((dt, summary))
    return events


def formater_dato(dt):
    return f"{dt.day}. {MAANEDER[dt.month - 1]} {dt.year}"


def lag_rad(dt, summary):
    trygg_summary = summary.replace("<", "&lt;").replace(">", "&gt;")
    return (
        f'<div class="kurs-rad">'
        f'<span>{formater_dato(dt)}</span>'
        f'<span>{trygg_summary}</span>'
        f'</div>\n'
    )


def skriv_liste(filnavn, hendelser):
    if not hendelser:
        tom = '<div class="kurs-rad"><span>—</span><span>Ingen planlagte kurs akkurat nå.</span></div>\n'
        with open(filnavn, "w", encoding="utf-8") as f:
            f.write(tom)
        return
    html = "".join(lag_rad(dt, s) for dt, s in hendelser)
    with open(filnavn, "w", encoding="utf-8") as f:
        f.write(html)


def main():
    text = hent_ics()
    events = parse_events(text)
    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    kommende = sorted([e for e in events if e[0] >= now], key=lambda e: e[0])

    skriv_liste("_includes/kurs-auto-3.html", kommende[:3])
    skriv_liste("_includes/kurs-auto-alle.html", kommende)


if __name__ == "__main__":
    main()
