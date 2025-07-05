document.addEventListener("DOMContentLoaded", function () {

  // Watch for tab changes

  document.querySelectorAll('.md-tabs__link').forEach(tab => {

    tab.addEventListener('click', () => {

      setTimeout(() => {

        if (typeof mermaid !== "undefined") {

          mermaid.init(undefined, document.querySelectorAll('.mermaid'));

        }

      }, 100); // Small delay ensures tab content is visible

    });

  });



  // Also for Admonition Tabs or other structures using `data-tabs`

  document.querySelectorAll('[data-tabs] .tabbed-labels label').forEach(label => {

    label.addEventListener('click', () => {

      setTimeout(() => {

        if (typeof mermaid !== "undefined") {

          mermaid.init(undefined, document.querySelectorAll('.mermaid'));

        }

      }, 100);

    });

  });

});









✅ Bonus: CSS to prevent re-animation flicker (optional)





If Mermaid flickers on re-render, you can use:

.mermaid {

  transition: none !important;

}
