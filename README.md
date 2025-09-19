# Comprehensive Legal System - Interactive Network Diagram

**Version 0.7** - A modular D3.js visualization of the Indian legal system showing relationships between Parliament, Courts, Tribunals, Arbitration Centers, and Legal Professionals.

> **⚠️ Data-Level Clarity Needed**: This version requires further refinement of data relationships and entity categorization for improved accuracy and completeness.

## Architecture

The codebase has been refactored into a clean separation of concerns:

### 📁 File Structure

```
d3lem/
├── index.html          # Main HTML structure
├── style.css           # All styling and CSS
├── data.js             # Data layer - all data and configuration
├── helpers.js          # Helper functions and utilities
├── network-diagram.js  # Logic layer - D3.js visualization logic
├── main.js             # Application layer - orchestration and entry point
└── README.md           # This documentation
```

### 🏗️ Layer Separation

#### **Data Layer (`data.js`)**
- Contains all legal system relationship data (`judicialEntityMapData`)
- Configuration settings (dimensions, forces, etc.)
- Color mapping for arrow markers
- Pure data with no logic

#### **Logic Layer (`network-diagram.js`)**
- Core D3.js visualization functionality
- Force simulation management
- Node and link creation/updates
- Drag and interaction behaviors
- Encapsulated in `LegalSystemVisualization` class

#### **Helper Layer (`helpers.js`)**
- Helper functions for data processing
- Label positioning algorithms
- Collision detection utilities
- Reusable functions across the application

#### **Application Layer (`main.js`)**
- Main entry point and orchestration
- Event handling and user interactions
- View switching logic
- Filtering functionality
- Coordinates between all layers

#### **Presentation Layer (`style.css`)**
- All visual styling
- Responsive design
- Animation definitions
- Color schemes and typography

## 🎯 Key Features (Version 0.7)

### **Group-Based Visualization**
- **Group Button**: Collapse nodes into category-based group circles
- **Hierarchical Navigation**: Explore groups at different levels of detail
- **Node Categorization**: Six main groups (Legislative, Judiciary, Tribunals, People, Legal Framework, Non-Administrative)
- **Concentric Group Display**: Large colored circles with group labels and node counts

### **Self-Loop Arrows**
- **Self-Referential Relationships**: Curved arrows for entities that relate to themselves
- **Concentric Loops**: Multiple self-loops displayed as nested circles
- **Smart Label Positioning**: Labels positioned at the top of self-loop arcs
- **Enhanced Visual Clarity**: Clear representation of internal organizational processes

### **Enhanced Arrow System**
- **Group-Based Coloring**: Arrows colored by source node's group category
- **Consistent Styling**: Unified arrow and arrowhead colors
- **Improved Label Positioning**: Labels follow curved paths and avoid collisions
- **Dynamic Repulsion**: Arrows repel each other when labels would overlap

### **Interactive Features**
- **Drag isolation**: Only related nodes move when dragging
- **Hover effects**: Highlight related entities and relationships
- **Filtering system**: Focus on specific entities
- **Toggle views**: Switch between diagram and table views
- **Background click**: Clear all highlights and labels
- **Collision avoidance**: Advanced label positioning and collision detection

### **Responsive Design**
- **Desktop**: 1400x900px optimal viewing
- **Tablet**: 1000x700px adapted layout
- **Mobile**: 600px height with full width

## 🚀 Usage

1. **Open `index.html`** in a web browser
2. **Explore the diagram** by dragging nodes and hovering over relationships
3. **Filter entities** using the dropdown to focus on specific relationships
4. **Switch to table view** to see data in tabular format
5. **Use the legend** to understand the color coding

## 🔧 Technical Details

### **Dependencies**
- D3.js v7 for visualization
- Modern browser with ES6+ support

### **Performance**
- Optimized force simulation
- Efficient collision detection
- Throttled label positioning updates
- Responsive rendering

### **Browser Support**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📊 Data Structure (Version 0.7)

The legal system data includes comprehensive relationships across:
- **Government entities**: Parliament, Ministry of Law & Justice, State Governments
- **Judicial system**: Supreme Court, High Courts, Subordinate Courts, Judicial Officers
- **Specialized bodies**: Tribunals, Appellate Tribunals, Arbitration Centers
- **Legal professionals**: Judges, Arbitrators, Tribunal Members, Administrative Staff
- **Constitutional authorities**: President of India, Governor of State, Council of Ministers
- **Legal framework**: Laws, Rules, Procedures, Codes (CPC, CrPC)

### **Data Organization**
- **Grouping Data**: Nodes categorized into 6 main groups with proper color coding
- **Hierarchical Relationships**: Clear organizational structure and reporting relationships
- **Self-Referential Links**: Internal organizational processes and rule-making
- **Appointment Authorities**: Formal appointment and selection processes

> **⚠️ Data Clarity Issues**: Some relationships may need refinement for accuracy. Entity categorization and relationship types require further validation with legal experts.

## 🎨 Customization

### **Adding New Relationships**
Edit `data.js` to add new relationship entries to the `judicialEntityMapData` array:
```javascript
{ source: "Source Entity", target: "Target Entity", count: 1, label: "relationship_type" }
```

### **Adding New Nodes**
Add new nodes to the `groupingData` array in `data.js`:
```javascript
{ node: "Node Name", label: ":NodeType", belongsTo: ":GroupCategory" }
```

### **Modifying Group Colors**
Update the `groupColors` in `network-diagram.js`:
```javascript
this.groupColors = {
    ":LegislativeAndRegulatory": "#2E8B57",
    ":JudiciaryGroup": "#4169E1",
    ":TribunalsAndArbitrationGroup": "#FF6347",
    // ... other groups
};
```

### **Adjusting Layout**
Modify `config` in `data.js`:
```javascript
const config = {
    width: 1400,        // Canvas width
    height: 900,        // Canvas height
    nodeRadius: 25,     // Node size
    linkDistance: 180,  // Link length
    // ... other settings
};
```

## 🔄 Version 0.7 Improvements

### **New Features Added**
- **Group Functionality**: Collapsible node groups with hierarchical navigation
- **Self-Loop Arrows**: Support for self-referential relationships with concentric loops
- **Enhanced Data**: Comprehensive judicial hierarchy and organizational relationships
- **Improved Labeling**: Better collision detection and positioning algorithms
- **Group-Based Coloring**: Unified color scheme based on node categories

### **Known Issues & Limitations**
- **Data Accuracy**: Some relationships may need legal expert validation
- **Entity Categorization**: Group assignments may require refinement
- **Relationship Types**: Standardization of relationship labels needed
- **Performance**: Large datasets may impact rendering performance
- **Mobile Experience**: Group functionality may need mobile optimization

### **Future Enhancements Needed**
- **Data Validation**: Legal expert review of all relationships
- **Relationship Standardization**: Consistent naming conventions
- **Performance Optimization**: Better handling of large datasets
- **Accessibility**: Improved screen reader support
- **Documentation**: More detailed relationship explanations

## 🐛 Troubleshooting

### **Arrows Not Showing**
- Check browser console for JavaScript errors
- Ensure all script files are loaded in correct order
- Verify D3.js is loaded before other scripts

### **Performance Issues**
- Reduce `linkDistance` in config for tighter layout
- Decrease number of nodes if adding many relationships
- Check for browser memory usage with large datasets

### **Layout Problems**
- Adjust `chargeStrength` for node repulsion
- Modify `centerStrength` for cluster positioning
- Update `maxDistance` in ticked function for boundary control

## 📝 License

This project is open source and available under the MIT License.