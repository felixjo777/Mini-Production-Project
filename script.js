var today = new Date("2026-11-16T12:00:00");
var campuses = [
  "UH Manoa",
  "UH Hilo",
  "UH West Oahu",
  "UH Maui College",
  "Hawaii CC",
  "Honolulu CC",
  "Kapiolani CC",
  "Kauai CC",
  "Leeward CC",
  "Windward CC",
];
var oncat = [
  "Administrative/Clerical",
  "Computer",
  "Food Service",
  "Library",
  "Research",
  "Student Activities",
  "Sports/Recreation",
  "Tutoring",
  "Groundskeeping/Janitorial",
  "Marketing",
  "Communication",
  "Sustainability",
];
var offcat = [
  "Hospitality & Tourism",
  "Information Technology & Computer Science",
  "Health Sciences",
  "Marketing & Sales",
  "Education & Training",
  "Business Management & Administration",
  "Transportation, Distribution & Logistics",
];
var islands = ["Oahu", "Hawaii", "Kauai", "Lanai", "Maui", "Molokai", "Other"];
var onprog = ["UH", "FWS"],
  offprog = ["Part-Time", "COOP", "Intern", "Full-Time"];
// Add "on" (true for on-campus programs) to each listing from jobs.js
var jobs = joblist.map(function (j) {
  return {
    id: j.id,
    title: j.title,
    co: j.company,
    prog: j.program,
    pay: j.pay,
    cat: j.category,
    age: j.daysAgo,
    loc: j.location,
    desc: j.description,
    on: j.program === "UH" || j.program === "FWS",
  };
});
var $ = function (i) {
  return document.getElementById(i);
};
var mode = "on",
  shown = 10,
  fmt = function (n) {
    return "$" + n.toFixed(2) + "/hr";
  };
function opts(el, list, all) {
  el.innerHTML =
    "<option value=''>" +
    all +
    "</option>" +
    list
      .map(function (x) {
        return "<option>" + x + "</option>";
      })
      .join("");
}
function setMode(m) {
  mode = m;
  $("campusBox").classList.toggle("hide", m !== "on");
  $("islandBox").classList.toggle("hide", m === "on");
  opts($("cat"), m === "on" ? oncat : offcat, "All categories");
  opts($("prog"), m === "on" ? onprog : offprog, "All programs");
  shown = 10;
  render();
}
function dateStr(a) {
  var d = new Date(today);
  d.setDate(d.getDate() - a);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function render() {
  var kws = $("kw").value.toLowerCase().split(/\s+/).filter(Boolean),
    all = document.querySelector("input[name=m]:checked").value === "all";
  var r = jobs.filter(function (j) {
    if (j.on !== (mode === "on")) return false;
    if (mode === "on" && $("campus").value && j.loc !== $("campus").value) return false;
    if (mode === "off" && $("island").value && j.loc !== $("island").value) return false;
    if ($("cat").value && j.cat !== $("cat").value) return false;
    if ($("prog").value && j.prog !== $("prog").value) return false;
    if (j.age > +$("since").value) return false;
    if ($("num").value && String(j.id).indexOf($("num").value.trim()) < 0) return false;
    if (kws.length) {
      var h = (j.title + " " + j.co + " " + j.cat + " " + j.desc).toLowerCase();
      var t = kws.map(function (k) {
        return h.indexOf(k) >= 0;
      });
      if (all ? !t.every(Boolean) : !t.some(Boolean)) return false;
    }
    return true;
  });
  var o = $("ord").value;
  r.sort(function (a, b) {
    return o === "ta"
      ? a.title.localeCompare(b.title)
      : o === "td"
        ? b.title.localeCompare(a.title)
        : o === "prog"
          ? a.prog.localeCompare(b.prog)
          : o === "pl"
            ? a.pay - b.pay
            : o === "ph"
              ? b.pay - a.pay
              : o === "cat"
                ? a.cat.localeCompare(b.cat)
                : a.age - b.age;
  });
  $("count").textContent = r.length + (r.length === 1 ? " job found" : " jobs found");
  $("rows").innerHTML = r.length
    ? r
        .slice(0, shown)
        .map(function (j) {
          return (
            "<tr><td><a tabindex='0' role='button' data-id='" +
            j.id +
            "'>" +
            j.title +
            "</a><span class='sub'>Job #" +
            j.id +
            " · " +
            j.loc +
            "</span></td><td>" +
            j.co +
            "</td><td>" +
            j.prog +
            "</td><td>" +
            fmt(j.pay) +
            "</td><td>" +
            j.cat +
            "</td><td>" +
            dateStr(j.age) +
            "</td></tr>"
          );
        })
        .join("")
    : "<tr><td colspan='6' class='empty'>No jobs match your search. Remove a keyword or choose All categories.</td></tr>";
  $("more").classList.toggle("hide", r.length <= shown);
}
$("rows").addEventListener("click", open);
$("rows").addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    open(e);
  }
});
function open(e) {
  var a = e.target.closest("a");
  if (!a) return;
  var j = jobs.filter(function (x) {
    return x.id == a.dataset.id;
  })[0];
  $("dbody").innerHTML =
    "<h2>" +
    j.title +
    "</h2><p>" +
    j.desc +
    "</p><dl><dt>Company</dt><dd>" +
    j.co +
    "</dd><dt>Location</dt><dd>" +
    j.loc +
    "</dd><dt>Program</dt><dd>" +
    j.prog +
    "</dd><dt>Pay</dt><dd>" +
    fmt(j.pay) +
    "</dd><dt>Category</dt><dd>" +
    j.cat +
    "</dd><dt>Opened</dt><dd>" +
    dateStr(j.age) +
    "</dd><dt>Job number</dt><dd>" +
    j.id +
    "</dd></dl>";
  $("dlg").showModal();
}
$("close").onclick = function () {
  $("dlg").close();
};
$("go").onclick = function () {
  shown = 10;
  render();
};
$("reset").onclick = function () {
  $("f").reset();
  setMode(mode);
};
$("more").onclick = function () {
  shown += 10;
  render();
};
$("ord").onchange = render;
["campus", "island", "cat", "since", "prog"].forEach(function (i) {
  $(i).onchange = function () {
    shown = 10;
    render();
  };
});
$("t-on").onclick = function () {
  setMode("on");
  go();
};
$("t-off").onclick = function () {
  setMode("off");
  go();
};
$("t-fws").onclick = function () {
  setMode("on");
  $("prog").value = "FWS";
  shown = 10;
  render();
  go();
};
$("t-int").onclick = function () {
  setMode("off");
  $("prog").value = "Intern";
  shown = 10;
  render();
  go();
};
function go() {
  $("results").scrollIntoView({ behavior: "smooth" });
}
function side(el, list) {
  el.innerHTML = list
    .map(function (j) {
      return (
        "<li><a tabindex='0' role='button' data-id='" +
        j.id +
        "'>" +
        j.title +
        "</a><span class='sub'>" +
        j.co +
        " · " +
        fmt(j.pay) +
        "</span></li>"
      );
    })
    .join("");
}
side(
  $("newest"),
  jobs.slice()
    .sort(function (a, b) {
      return a.age - b.age;
    })
    .slice(0, 4),
);
side(
  $("top"),
  jobs.slice()
    .sort(function (a, b) {
      return b.pay - a.pay;
    })
    .slice(0, 4),
);
["newest", "top"].forEach(function (i) {
  $(i).addEventListener("click", open);
  $(i).addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(e);
    }
  });
});
$("nav-search").onclick = function () {
  $("f").scrollIntoView({ behavior: "smooth" });
  $("kw").focus();
};
$("nav-join").onclick = function () {
  $("t-int").click();
};
opts($("campus"), campuses, "All campuses");
opts($("island"), islands, "All islands");
setMode("on");
$("c-on").textContent =
  jobs.filter(function (j) {
    return j.on;
  }).length + " listings";
$("c-off").textContent =
  jobs.filter(function (j) {
    return !j.on;
  }).length + " listings";