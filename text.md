Yes—Markdown tables are static, but you can add a tiny bit of HTML + JavaScript in MkDocs (Material) to get a client-side date filter.



Here’s a copy-paste setup that works with Material for MkDocs and supports multiple tables per page.





1) Add a small JS file





Create docs/assets/js/table-date-filter.js with this:

<script>

(function () {

  // Parse YYYY-MM-DD safely (no timezone surprises)

  function parseISODate(iso) {

    const [y, m, d] = iso.split("-").map(Number);

    return new Date(y, m - 1, d);

  }



  function bindFilters(root) {

    const filters = root.querySelectorAll(".table-date-filter");



    filters.forEach(filter => {

      // Find the table to control:

      // 1) explicit selector via data-target, or

      // 2) the next <table> sibling

      let table = null;

      const sel = filter.getAttribute("data-target");

      if (sel) table = root.querySelector(sel);

      if (!table) {

        let n = filter.nextElementSibling;

        while (n && n.tagName !== "TABLE") n = n.nextElementSibling;

        table = n;

      }

      if (!table || !table.tBodies.length) return;



      // Which column? zero-based index; default = auto-detect first cell containing <time datetime="">

      const colAttr = filter.getAttribute("data-col");

      const dateColIndex = colAttr !== null ? parseInt(colAttr, 10) : -1;



      const input = filter.querySelector('input[type="date"]');

      const clearBtn = filter.querySelector("[data-clear]");



      const rows = Array.from(table.tBodies[0].rows);



      function getCellDate(tr) {

        let idx = dateColIndex;

        if (idx < 0) {

          idx = Array.from(tr.cells).findIndex(td => td.querySelector("time[datetime]"));

        }

        if (idx < 0 || !tr.cells[idx]) return null;

        const t = tr.cells[idx].querySelector("time[datetime]");

        if (!t) return null;

        const iso = t.getAttribute("datetime"); // expect YYYY-MM-DD

        if (!iso) return null;

        return parseISODate(iso);

      }



      function apply() {

        const max = input && input.value ? parseISODate(input.value) : null;

        rows.forEach(tr => {

          const d = getCellDate(tr);

          const keep = !max || (d && d <= max);

          tr.style.display = keep ? "" : "none";

        });

      }



      if (input) {

        input.addEventListener("change", apply);

      }

      if (clearBtn) {

        clearBtn.addEventListener("click", () => {

          if (input) input.value = "";

          apply();

        });

      }



      // Run once on load

      apply();

    });

  }



  // Re-bind on every page load (Material’s instant navigation) or classic load

  if (window.document$) {

    document$.subscribe(() => bindFilters(document));

  } else {

    document.addEventListener("DOMContentLoaded", () => bindFilters(document));

  }

})();

</script>

Then include it in mkdocs.yml:

extra_javascript:

  - assets/js/table-date-filter.js



2) Add a filter UI above your table





In your Markdown, put a small filter block right before each table you want to control:

<div class="table-date-filter" data-col="2">

  <label>Show rows with date ≤

    <input type="date">

  </label>

  <button type="button" data-clear>Clear</button>

</div>



data-col="2" means the 3rd column (0-based).
If you omit data-col, the script auto-detects the first column that contains a <time datetime="...">.






3) Mark dates in the table with 

<time datetime="YYYY-MM-DD">





Use any display format you like, but keep the machine-readable ISO date in datetime:

| ID | Task           | Due date                       |

|----|----------------|--------------------------------|

| 1  | Kickoff        | <time datetime="2025-01-15">15/01/2025</time> |

| 2  | Review         | <time datetime="2025-02-02">02/02/2025</time> |

| 3  | Handover       | <time datetime="2024-12-20">20/12/2024</time> |

That’s it. The input will hide/show rows where the chosen date is a maximum (i.e., “show rows with date ≤ selected”).





Tips





Want to target a specific table via selector? Give the table an ID and point the filter to it:


<div class="table-date-filter" data-target="#milestones"></div>



<table id="milestones">

  ...

</table>




Works with multiple tables/filters on the same page.
No jQuery needed; fully compatible with Material’s instant navigation.




If you want range filtering (from/to), we can extend this with two <input type="date"> fields in the same block.



1) JS: global date filter for all tables





Create/replace docs/assets/js/table-date-filter.js:

<script>

(function () {

  // Parse YYYY-MM-DD safely (no timezone weirdness)

  function parseISODate(iso) {

    const [y, m, d] = (iso || "").split("-").map(Number);

    if (!y || !m || !d) return null;

    return new Date(y, m - 1, d);

  }



  // Return an array of { table, rows, getCellDate(tr) } for all eligible tables

  function collectTables(root) {

    // OPTION A: target all tables

    // const tables = Array.from(root.querySelectorAll("table"));

    // OPTION B (recommended): only tables you mark as filterable

    const tables = Array.from(root.querySelectorAll("table.table-filterable, table[data-filterable='true']"));



    return tables.map(table => {

      const rows = table.tBodies.length ? Array.from(table.tBodies[0].rows) : [];

      // Auto-detect the first column that contains <time datetime="..."> if needed per-row

      function getCellDate(tr) {

        // Prefer explicit <time datetime="YYYY-MM-DD"> anywhere in the row

        const t = tr.querySelector("time[datetime]");

        if (!t) return null;

        return parseISODate(t.getAttribute("datetime"));

      }

      return { table, rows, getCellDate };

    });

  }



  function bindGlobal(root) {

    const control = root.querySelector(".global-table-date-filter");

    if (!control) return;



    const inputMax = control.querySelector('input[type="date"][name="max"]');

    const inputMin = control.querySelector('input[type="date"][name="min"]'); // optional range

    const clearBtn = control.querySelector("[data-clear]");



    let tableInfos = collectTables(root);



    function apply() {

      const max = inputMax && inputMax.value ? parseISODate(inputMax.value) : null;

      const min = inputMin && inputMin.value ? parseISODate(inputMin.value) : null;



      tableInfos.forEach(({ rows, getCellDate }) => {

        rows.forEach(tr => {

          const d = getCellDate(tr);

          const passMin = !min || (d && d >= min);

          const passMax = !max || (d && d <= max);

          tr.style.display = passMin && passMax ? "" : "none";

        });

      });

    }



    // Re-collect tables (e.g., if you navigate with instant loading)

    function refresh() {

      tableInfos = collectTables(root);

      apply();

    }



    inputMax && inputMax.addEventListener("change", apply);

    inputMin && inputMin.addEventListener("change", apply);

    clearBtn && clearBtn.addEventListener("click", () => {

      if (inputMax) inputMax.value = "";

      if (inputMin) inputMin.value = "";

      apply();

    });



    // Init once

    refresh();



    // If you add tables dynamically, you could observe DOM mutations and call refresh()

  }



  // Works with Material's instant navigation or classic load

  if (window.document$) {

    document$.subscribe(() => bindGlobal(document));

  } else {

    document.addEventListener("DOMContentLoaded", () => bindGlobal(document));

  }

})();

</script>

Include it in mkdocs.yml (if not already):

extra_javascript:

  - assets/js/table-date-filter.js



2) One global filter control in your Markdown





Place this once per page, ideally at the top:

<div class="global-table-date-filter">

  <label style="margin-right:.5rem;">From <input type="date" name="min"></label>

  <label style="margin-right:.5rem;">To <input type="date" name="max"></label>

  <button type="button" data-clear>Clear</button>

</div>



Supports range (From/To). Remove the “From” input if you only want a “≤ date” max filter.






3) Mark which tables are affected





Add a class or data-attribute to each table you want filtered (recommended), e.g.:

<table class="table-filterable">

<thead>

<tr><th>ID</th><th>Task</th><th>Due</th></tr>

</thead>

<tbody>

<tr><td>1</td><td>Kickoff</td><td><time datetime="2025-01-15">15/01/2025</time></td></tr>

<tr><td>2</td><td>Review</td><td><time datetime="2025-02-02">02/02/2025</time></td></tr>

<tr><td>3</td><td>Handover</td><td><time datetime="2024-12-20">20/12/2024</time></td></tr>

</tbody>

</table>

If you truly want every table filtered, switch the collectTables selector in the JS to:

const tables = Array.from(root.querySelectorAll("table"));



Notes / Tips





The script relies on a machine-readable <time datetime="YYYY-MM-DD"> inside each row. You can display any human format you like.
Works with multiple pages thanks to Material’s document$ hook.
If some tables don’t have dates, just don’t mark them as table-filterable.
You can still keep per-table filters from the previous approach; they’ll coexist with this global one (both apply).

=============================


Option A (cleanest): use Markdown Attribute Lists





Enable the extension in mkdocs.yml:


markdown_extensions:

  - attr_list



Write your table in Markdown, then add attributes on the next line:


| ID | Task   | Due date |

|----|--------|----------|

| 1  | Kickoff| <time datetime="2025-01-15">15/01/2025</time> |

| 2  | Review | <time datetime="2025-02-02">02/02/2025</time> |

| 3  | Handover| <time datetime="2024-12-20">20/12/2024</time> |



{ .table-filterable }



That line { .table-filterable } attaches the class to the generated <table>.
Keep your dates human-readable but include <time datetime="YYYY-MM-DD">…</time> in the cell.






Option B: wrap the Markdown table in a div





No extra extension needed—MkDocs allows raw HTML blocks:

<div class="table-filterable">



| ID | Task   | Due date |

|----|--------|----------|

| 1  | Kickoff| <time datetime="2025-01-15">15/01/2025</time> |

| 2  | Review | <time datetime="2025-02-02">02/02/2025</time> |

| 3  | Handover| <time datetime="2024-12-20">20/12/2024</time> |



</div>



Global filter control (once per page)





Put this at the top of the page (unchanged from before):

<div class="global-table-date-filter">

  <label style="margin-right:.5rem;">From <input type="date" name="min"></label>

  <label style="margin-right:.5rem;">To <input type="date" name="max"></label>

  <button type="button" data-clear>Clear</button>

</div>



JS selector (what it targets)





In the script I gave, it targets:

document.querySelectorAll("table.table-filterable, table[data-filterable='true']")

So either Option A or B will work.

If you want the filter to hit every table without marking them, change that line to:

document.querySelectorAll("table")

That’s all—you keep writing tables in Markdown, add <time datetime="YYYY-MM-DD">…</time> inside the date cell, and mark tables via { .table-filterable } (or wrap in a <div>). The global date filter will do the rest.
