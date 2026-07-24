// Henter kommende kurs direkte fra kalenderen, viser som enkel tekstliste.
(function () {
  var ICS_URL = 'https://p58-caldav.icloud.com/published/2/MTIzOTM2OTQ1MTIzOTM2Oad9yveyAQ23MMK2E8jnZvWuvfdzgACJSfRpyBqNjvYE7yAB3zM7JTKpnCd4vDWNNzLdLvzxf6uRKI-aYMWq7W0';
  var PROXY = 'https://api.allorigins.win/raw?url=';
  var MAKS_ANTALL = 3;

  function parseICS(text) {
    var events = [];
    var blocks = text.split('BEGIN:VEVENT').slice(1);
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var summaryMatch = block.match(/SUMMARY:(.*)/);
      var dtstartMatch = block.match(/DTSTART[^:]*:(\d{8})/);
      if (summaryMatch && dtstartMatch) {
        var d = dtstartMatch[1];
        var start = new Date(parseInt(d.slice(0, 4)), parseInt(d.slice(4, 6)) - 1, parseInt(d.slice(6, 8)));
        events.push({ summary: summaryMatch[1].trim(), start: start });
      }
    }
    return events;
  }

  function render(events) {
    var lister = document.querySelectorAll('.kurs-auto-liste');
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    lister.forEach(function (liste) {
      var maks = parseInt(liste.getAttribute('data-maks')) || MAKS_ANTALL;
      var visListe = events.filter(function (e) { return e.start >= now; })
                            .sort(function (a, b) { return a.start - b.start; })
                            .slice(0, maks);
      liste.innerHTML = '';
      if (visListe.length === 0) {
        var tom = document.createElement('li');
        tom.style.cssText = 'padding:.5rem 0;font-size:.9rem;color:var(--ink-mild)';
        tom.textContent = 'Ingen planlagte kurs akkurat nå.';
        liste.appendChild(tom);
        return;
      }
      visListe.forEach(function (e) {
        var li = document.createElement('li');
        li.style.cssText = 'padding:.5rem 0;border-bottom:1px solid var(--linje);font-size:.9rem;color:var(--ink-mild)';
        var datoStr = e.start.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
        li.textContent = datoStr + ' — ' + e.summary.replace(/^Kurs i regi av /i, '');
        liste.appendChild(li);
      });
    });
  }

  fetch(PROXY + encodeURIComponent(ICS_URL))
    .then(function (res) { return res.text(); })
    .then(function (text) { render(parseICS(text)); })
    .catch(function () {
      // Feilsikring: la lenken til kurs.html stå igjen, ikke vis feilmelding
    });
})();
