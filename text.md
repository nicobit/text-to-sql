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
