# Indian Judicial System - Interactive Entity Relationship Diagram

A dynamic D3.js visualization that transforms a data table into an interactive arrow diagram representing the complex relationships within the Indian Judicial System.

## 🏛️ Overview

This visualization demonstrates the intricate web of relationships between various entities in the Indian judicial system, including the Ministry of Law & Justice, Supreme Court, High Courts, State Governments, and other key institutions. The diagram shows how these entities interact through funding, appointments, governance, and coordination.

## ✨ Features

### **Interactive Visualization**
- **Table to Diagram Animation**: Smooth transition from tabular data to interactive network diagram
- **Drag & Drop**: Move nodes around to explore relationships
- **Node Selection**: Click and drag any node to highlight its connections
- **Relationship Labels**: Hover or drag to see relationship descriptions
- **Visual Hierarchy**: Selected elements overlay unselected ones with enhanced styling

### **Advanced Interactions**
- **Smart Highlighting**: Selected nodes and their connections are emphasized
- **Bold Styling**: Connected nodes get thicker borders and glow effects
- **Smooth Animations**: Relationship labels follow arrows during drag operations
- **Boundary Control**: Nodes stay within visible canvas area
- **Centered Layout**: Force simulation keeps the cluster centered and well-distributed

### **Data Representation**
- **25+ Relationships**: Comprehensive coverage of judicial system interactions
- **Color-Coded Arrows**: 
  - 🔵 **Blue**: Administrative/funding relationships
  - 🟢 **Green**: Governance and coordination relationships  
  - 🟠 **Orange**: Consultation and recommendation relationships
- **Directional Flow**: Arrows show the direction of influence and control

## 🎯 Key Entities

### **Core Institutions**
- **Ministry of Law & Justice (DoJ)**: Central administrative body
- **Supreme Court (SC)**: Highest judicial authority
- **High Courts (HC)**: State-level judicial bodies
- **Collegium**: Judicial appointment system
- **Department of Justice (DoJ)**: Administrative support

### **Supporting Entities**
- **State Governments**: Regional administrative bodies
- **Parliament / State Legislatures**: Legislative oversight
- **Judicial Officers**: Court administrators
- **Court Procedures**: Procedural frameworks
- **Intelligence Agencies**: Security clearance providers

## 🚀 Getting Started

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)

### **Installation**
1. Clone or download this repository
2. Navigate to the project directory
3. Start a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

4. Open your browser and navigate to `http://localhost:8000`

### **Usage**
1. **View Table**: Initially displays relationship data in tabular format
2. **Animate**: Click "Animate to Arrow Diagram" to see the transformation
3. **Interact**: 
   - Drag nodes to rearrange the layout
   - Hover over arrows to see relationship labels
   - Click and drag nodes to highlight their connections
4. **Reset**: Click "Reset to Table" to return to the original view

## 🛠️ Technical Details

### **Technologies Used**
- **D3.js v7**: Data visualization and force simulation
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, and responsive design
- **JavaScript ES6+**: Interactive functionality and data management

### **Architecture**
- **Force-Directed Layout**: D3's simulation for natural node positioning
- **SVG Rendering**: Vector graphics for crisp, scalable visualization
- **Event-Driven Interactions**: Mouse and touch event handling
- **State Management**: Selection and highlighting state tracking

### **Performance Optimizations**
- **Throttled Updates**: RequestAnimationFrame for smooth animations
- **Efficient Rendering**: Selective DOM updates during interactions
- **Memory Management**: Proper cleanup of event listeners and elements
- **Responsive Design**: Adapts to different screen sizes

## 📊 Data Structure

The visualization uses a structured data format:

```javascript
{
    source: "Entity A",           // Source entity
    target: "Entity B",           // Target entity  
    count: 1,                     // Relationship strength
    color: "blue",                // Arrow color
    label: "relationship_type"    // Relationship description
}
```

### **Relationship Types**
- **provides_funds**: Financial support relationships
- **appoints**: Appointment and hiring relationships
- **coordinates_with**: Coordination and collaboration
- **governs**: Governance and oversight relationships
- **recommends**: Recommendation and advisory relationships
- **processes**: Administrative processing relationships

## 🎨 Customization

### **Styling**
- Modify `style.css` to change colors, fonts, and layout
- Adjust node sizes, arrow thickness, and spacing
- Customize hover effects and animations

### **Data**
- Edit the `lawsuitData` array in `script.js` to add/modify relationships
- Change entity names and relationship labels
- Adjust color coding and relationship types

### **Layout**
- Modify force simulation parameters in the `config` object
- Adjust node positioning and clustering behavior
- Change canvas size and boundary constraints

## 🔧 Configuration Options

```javascript
const config = {
    width: 1000,              // Canvas width
    height: 700,              // Canvas height
    nodeRadius: 25,           // Node circle radius
    linkDistance: 150,        // Preferred link length
    chargeStrength: -400,     // Node repulsion strength
    centerStrength: 0.3,      // Center attraction strength
    xStrength: 0.2,           // X-axis centering strength
    yStrength: 0.2            // Y-axis centering strength
};
```

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **D3.js Community**: For the powerful visualization library
- **Indian Judicial System**: For the complex relationships that inspired this visualization
- **Observable Community**: For inspiration from the Mobile Patent Suits visualization

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure you're running a local web server
3. Verify your browser supports modern JavaScript features
4. Open an issue on GitHub for bugs or feature requests

---

**Built with ❤️ using D3.js for educational and analytical purposes**