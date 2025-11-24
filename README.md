# D3.js Legal Entity Map

An interactive D3.js force-directed network that visualizes how India’s constitutional actors, courts, tribunals, professional bodies, and citizens connect through appointments, funding, oversight, and operational relationships. This repository powers the **d3lem** experience shown in `index.html`.

---

1. Clone or download the repository.
2. Open `index.html` in any modern desktop browser (Chrome, Edge, Firefox, Safari).
3. Use the on-page controls:
   - **Drag nodes** to isolate clusters—only directly connected nodes move with the one you drag.
   - **Hover** to highlight a node’s inbound/outbound connections plus tooltip labels.
   - **Filter** by entity, relationship type, or entity/relationship group to reduce clutter.
   - **Toggle views** (arrow map ↔ table) with the “Show Table View” button.
   - **Edit/Export**: unlock edits with the password prompt (see `data.js` → `accessControlConfig`) and download the current data to Excel from the table view.

---

## Repository map

| File | Purpose |
| --- | --- |
| `index.html` | Application shell, instructions card, modal containers, and script includes |
| `style.css` | All scoped styles for the visualization, table view, modals, filters, and footer |
| `data.js` | Data source: `groupingData`, `relationshipGroupingData`, `judicialEntityMapData`, and visualization `config`/`accessControlConfig` |
| `helpers.js` | Utility functions shared by the visualization (dedupe nodes, link generation, label helpers) |
| `network-diagram.js` | Core D3 logic (`LegalSystemVisualization` class) covering simulations, forces, link paths, label optimization, grouping, and edit hooks |
| `main.js` | Bootstraps the experience, wires DOM controls to visualization methods, handles filters, view switching, orientation guard, and password gating |
| `embed.js` / `embed.html` | Lightweight embed script and demo markup |

---

## Interaction guide

- **Diagram view** (default): force-directed layout constrained to an ellipse for readability. Nodes interpolate to valid positions before the simulation starts, then continue to settle while remaining draggable.
- **Hover highlight**: outlines the focused node, fades unrelated nodes/links, and displays relationship labels along the relevant arrows.
- **Filter toolkit**:
  - *Entity filter*: isolates a single actor and its direct edges.
  - *Relationship filter*: shows only relationships that match a label (e.g., “appoints”, “funds”).
  - *Group filter*: switch between entity clusters (Judiciary, Legislative & Regulatory, etc.) or relationship groupings (Funding, Oversights, Appointments, Governance, Accountability, Establishment, Operations, Hierarchy, Directives).
- **Table view**: presents the same dataset in tabular form for quick scanning, editing, or export. The table honors active filters.
- **Editing workflow** (optional): click **Edit Table**, enter the access password defined in `data.js`, and use the inline controls to modify relationships. Changes stay in memory until saved/exported.

---

## Color reference (current palette)

### Entity groups (`network-diagram.js → this.groupColors`)

| Group key | Description | Hex |
| --- | --- | --- |
| `:LegislativeAndRegulatory` | Parliament, ministries, commissions | `#2E8B57` (Sea Green) |
| `:Judiciary` | Courts, judges, registries | `#4169E1` (Royal Blue) |
| `:TribunalsAndArbitration` | Tribunals, arbitration ecosystem | `#FF6347` (Tomato) |
| `:PeopleAndOfficeholders` | Staff, legal professionals, citizens | `#9370DB` (Medium Purple) |
| `:NonAdministrativeEntities` | Appointment bodies, oversight boards | `#DAA520` (Goldenrod) |

Each node inherits its ring color from this mapping. Links default to the source entity’s group color unless a relationship group override applies.

### Relationship groups (`network-diagram.js → this.relationshipGroupColors`)

`Funding #4CAF50`, `Oversights #FF9800`, `Appointments #2196F3`, `Governance #9C27B0`, `Accountability #F44336`, `Establishment #00BCD4`, `Operations #FFC107`, `Hierarchy #795548`, `Directives #E91E63`.

When a relationship label appears in `relationshipGroupingData`, its arrow uses the palette above, enabling quick scanning of the dominant action type.

### Direction hints

Arrowheads still communicate flow from source → target, but color is now semantic (group/action) rather than the previous “blue = outgoing / red = incoming” system, so any documentation or UI copy should refer to the palettes above.

---

## Data & configuration

- `groupingData`: per-entity metadata (`node`, `label`, `belongsTo` keys) used for node coloring and legend building.
- `relationshipGroupingData`: maps relationship labels (e.g., “appoints”, “funds”) to the high-level groupings listed earlier.
- `judicialEntityMapData`: the primary edge list. Each object includes `source`, `target`, `label`, `count`, and optional `isProcessFlow` flag for dotted connectors.
- `config`: width/height, node radius, force settings, and overall simulation behavior.
- `colorMap`: retained for backwards compatibility (used when exporting simple data-only bundles) but arrows in the UI now derive their colors from `groupColors` / `relationshipGroupColors`.
- `accessControlConfig`: password + IP whitelist toggle for enabling edit mode on shared deployments.

To add/modify nodes or relationships, update `data.js` and reload the page. No build step is required.

---

## Limitations & future extensions

### Subordinate courts aggregation
“Subordinate Court” appears as a single aggregate node. India’s district and taluka courts span thousands of institutions; rendering each court individually would overwhelm the force layout and degrade readability. A dedicated visualization with drill-down capability and geographic/contextual layers is recommended for that hierarchy.

### Known trade-offs
- Large additions to `judicialEntityMapData` may require tuning `config.chargeStrength`, `linkDistance`, or the ellipse bounds in `network-diagram.js → ticked()` to maintain spacing.
- Edit mode currently operates in-memory; persist changes by exporting to Excel and re-generating `data.js` (or piping the edited JSON into your preferred backend).

---

## Customization tips

1. **Layout**: tweak `config` in `data.js` (width, height, forces) to suit different canvases or host pages.
2. **Color system**: adjust `this.groupColors` / `this.relationshipGroupColors` inside `network-diagram.js` to align with your branding, then update the legend styles in `style.css`.
3. **Embedding**: use `embed.js` with the provided example in `embed.html` to drop the visualization into other sites while honoring read-only mode.
4. **Data regeneration**: run `convert_excel_to_data.py` if you need to regenerate `data.js` from the original Excel workbook. Pandas + openpyxl are auto-installed by the script.

---

## Tech stack

- **D3.js v7** for force simulation, interaction handling, SVG rendering.
- **Vanilla JavaScript** modules for application orchestration and table tooling.
- **SheetJS (xlsx)** for client-side Excel export from the table view.
- No external build tooling; everything runs directly in the browser.

---

## License

MIT License. See `LICENSE` for the full text.