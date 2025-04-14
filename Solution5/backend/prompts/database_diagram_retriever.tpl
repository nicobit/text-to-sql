Based on the user's provided database schema and question (see sections below), generate a complete Mermaid diagram that represents the database schema.

Schema:
{schema}

Question:
{question}

Requirements for the Mermaid diagram:
- Start the output with "graph TD;" on the first line.
- Create nodes for each table that display:
  - The table name.
  - A list of keys for the table, with primary keys annotated as "(PK)" and foreign keys annotated as "(FK)". For example, a node could look like:
        TableName[TableName<br/>(PK) id<br/>(FK) user_id]
- Draw directed arrows between nodes to represent relationships, where an arrow goes from the table containing the foreign key to the table that is referenced by that foreign key. Use the full arrow syntax with "-->" (e.g., TableA --> TableB).
- Use descriptive and unquoted identifiers for nodes and subgraphs. Ensure that parent elements (e.g., subgraphs) and child elements (e.g., tables) have distinct identifiers.
- Do not include any comment lines (e.g., lines starting with `//`) in the output.
- Use unquoted identifiers for nodes or subgraphs, with the display label provided inside square brackets, and ensure that the text within the square brackets is enclosed in double quotes. For example:
      NodeName["My Node Text"]
- Remove any triple backticks (```mermaid and ```) from the output.
- Wrap the final Mermaid diagram code within `<mermaid>` tags.
- Additionally, provide an explanation of the diagram in markdown format that describes each table and relationship. Wrap the explanation within `<answer>` tags.

Please generate the complete Mermaid diagram code as required and include it inside `<diagram>` tags and the explanation of the diagram, using markdown format, inside `<answer>` tags.
