# Comprehensive Legal System - Interactive Network Diagram

A modular D3.js visualization of the Indian legal system showing relationships between Parliament, Courts, Tribunals, Arbitration Centers, and Legal Professionals.

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
- Contains all legal system relationship data
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

## 🎯 Key Features

### **Two-Color Arrow System**
- **Blue arrows**: Outgoing relationships (entity acts on target)
- **Red arrows**: Incoming relationships (entity receives action)
- Clear directional flow for easy understanding

### **Interactive Features**
- **Drag isolation**: Only related nodes move when dragging
- **Hover effects**: Highlight related entities and relationships
- **Filtering system**: Focus on specific entities
- **Toggle views**: Switch between diagram and table views
- **Collision avoidance**: No overlapping labels

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

## 📊 Data Structure

The legal system data includes 132 relationships across:
- **Government entities**: Parliament, Ministry of Law & Justice
- **Judicial system**: Supreme Court, High Courts, Subordinate Courts
- **Specialized bodies**: Tribunals, Arbitration Centers
- **Legal professionals**: Advocates, Bar Councils
- **Citizens and stakeholders**: Litigants, NGOs, Parties

## 🎨 Customization

### **Adding New Relationships**
Edit `data.js` to add new relationship entries:
```javascript
{ source: "Source Entity", target: "Target Entity", count: 1, color: "outgoing", label: "relationship_type" }
```

### **Modifying Colors**
Update the `colorMap` in `data.js`:
```javascript
const colorMap = {
    "outgoing": "#your_blue_color",
    "incoming": "#your_red_color"
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