Based on the user's description, generate a complete Mermaid diagram using the appropriate Mermaid diagram type.

---

### Diagram Type Selection

1. Choose the correct Mermaid diagram type based on the user's description:
   - Use \`graph TD\` for flowcharts and infrastructure/architecture overviews.
   - Use \`sequenceDiagram\` for describing service or user interactions.
   - Use \`timeline\` or \`gantt\` for time-based phases or project stages.
   - Use \`C4Context\`, \`C4Container\`, \`C4Component\`, \`C4Dynamic\`, or \`C4Deployment\` **only** if the user explicitly asks for a C4 diagram.

---

### Mermaid Syntax Guidelines

2. Use \`subgraph\` blocks only in \`graph TD\` when grouping related elements visually. **Do not use subgraph blocks in C4 diagrams** — they are not supported there.

3. Ensure **all identifiers are globally unique**, including:
   - Node identifiers
   - Subgraph identifiers
   - Labels in connections

   **Example (graph TD only):**
   subgraph WebLayer
     WebApp["<i class='fa fa-laptop'></i> Web App"]
   end

4. Define all relationships **outside of subgraph blocks**:
   - ✅ Good: \`WebApp --> APIService\`
   - ❌ Do not place \`-->\` inside \`subgraph\`.

5. Use full arrow syntax (\`-->\`) and include positional hints if needed:
   - Example: \`frontend:L --> R:backendService\`

6. Use **unquoted**, space-free identifiers before the brackets, and wrap the label in **double quotes**:
   - Example: \`Database["<i class='fa fa-database'></i> DB"]\`

---

### Icon Usage Rules

7. **graph TD only**:
   - Use Font Awesome HTML icons inside labels:
     - Example: \`UserApp["<i class='fa fa-user'></i> User Portal"]\`

8. **C4 diagrams**:
   - **Do not use HTML or icons**. Follow the [C4 syntax](https://mermaid.js.org/syntax/c4c.html):
     - Example:
       C4Context
       Person(user, "User", "A user of the system")
       System(system, "Main System", "The system being described")
       Rel(user, system, "Uses")

9. **timeline**, **sequenceDiagram**, **gantt**:
   - Do not use HTML or Font Awesome icons.
   - Use emojis instead:
     - \`📅 Production Release : 2025-05-16\`
     - \`User -> Server: 🔐 Login request\`

---

### Output Format

10. Do not include comments or triple backticks.

11. Wrap the generated Mermaid diagram in:
<diagram>
... Mermaid code here ...
</diagram>

12. Wrap a Markdown explanation of the diagram in:
<answer>
... explanation in Markdown ...
</answer>