// Main Application - Entry point and orchestration

// Import utilities - will be available after utils.js loads

// Global variables
let visualization = null;

// Initialize the application
function init() {
    // Get data from window.data at runtime
    const { lawsuitData, config, colorMap } = window.data || {};
    
    // Check if required data is available
    if (!lawsuitData || !config || !colorMap) {
        console.error('Required data not loaded. Make sure data-simple.js is included.');
        return;
    }

    // Create visualization instance
    visualization = new LegalSystemVisualization(
        { lawsuitData, config, colorMap }
    );

    // Initialize the visualization
    visualization.init();
}

// Setup the data table
function setupTable() {
    const tableBody = d3.select("#table-body");
    
    // Clear existing rows
    tableBody.selectAll("tr").remove();
    
    // Get data from window.data at runtime
    const { lawsuitData } = window.data || {};
    
    // Get filtered data if filter is active
    const dataToShow = window.utils?.getFilteredTableData(lawsuitData, visualization?.filteredNodeId) || lawsuitData;
    
    // Create rows for each lawsuit
    const rows = tableBody.selectAll("tr")
        .data(dataToShow)
        .enter()
        .append("tr")
        .attr("class", "table-row")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1);
    
    // Add cells for each row
    rows.each(function(d) {
        const row = d3.select(this);
        row.append("td").text(d.source);
        row.append("td").text(d.label);
        row.append("td").text(d.target);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById("toggleViewBtn").addEventListener("click", toggleView);
    document.getElementById("nodeFilter").addEventListener("change", handleNodeFilter);
    document.getElementById("clearFilter").addEventListener("click", clearNodeFilter);
}

// Toggle between diagram and table views
function toggleView() {
    if (visualization?.isAnimating) return;
    
    if (visualization?.currentView === 'diagram') {
        showTableView();
    } else {
        visualization?.showDiagramView();
    }
}

// Show table view
function showTableView() {
    if (visualization?.isAnimating) return;
    visualization.isAnimating = true;
    
    const toggleBtn = document.getElementById("toggleViewBtn");
    toggleBtn.disabled = true;
    toggleBtn.textContent = "Show Diagram View";
    
    const tableView = document.getElementById("table-view");
    const diagramView = document.getElementById("diagram-view");
    
    // Stop simulation
    visualization?.simulation?.stop();
    
    // Fade out diagram
    diagramView.classList.remove("active");
    diagramView.classList.add("fade-out");
    
    visualization?.nodeElements
        ?.transition()
        .duration(500)
        .style("opacity", 0);
    
    visualization?.linkElements
        ?.transition()
        .duration(500)
        .style("opacity", 0);
    
    setTimeout(() => {
        tableView.classList.remove("fade-out");
        tableView.classList.add("active");
        
        setupTable();
        
        setTimeout(() => {
            toggleBtn.disabled = false;
            visualization.isAnimating = false;
            visualization.currentView = 'table';
        }, 1000);
        
    }, 500);
}

// Setup filter dropdown
function setupFilterDropdown() {
    const nodeFilter = document.getElementById("nodeFilter");
    
    // Get data from window.data at runtime
    const { lawsuitData } = window.data || {};
    
    // Get unique node names
    const uniqueNodes = [...new Set([
        ...lawsuitData.map(d => d.source),
        ...lawsuitData.map(d => d.target)
    ])].sort();
    
    // Clear existing options
    nodeFilter.innerHTML = '<option value="">Show All Entities</option>';
    
    // Add options for each node
    uniqueNodes.forEach(nodeName => {
        const option = document.createElement("option");
        option.value = nodeName;
        option.textContent = nodeName;
        nodeFilter.appendChild(option);
    });
}

// Handle node filter change
function handleNodeFilter(event) {
    const selectedNodeId = event.target.value;
    
    if (selectedNodeId) {
        applyNodeFilter(selectedNodeId);
    } else {
        clearNodeFilter();
    }
}

// Apply node filter
function applyNodeFilter(nodeId) {
    visualization.filteredNodeId = nodeId;
    
    // Get data from window.data at runtime
    const { lawsuitData } = window.data || {};
    
    // Filter nodes
    visualization?.nodeElements
        ?.style("opacity", d => {
            const isConnected = lawsuitData.some(link => 
                (link.source === nodeId && link.target === d.id) ||
                (link.target === nodeId && link.source === d.id)
            );
            return isConnected ? 1 : 0.2;
        });
    
    // Filter links
    visualization?.linkElements
        ?.style("opacity", d => {
            const isConnected = (d.source.id === nodeId || d.target.id === nodeId);
            return isConnected ? 1 : 0.2;
        });
    
    // Show relationship labels for filtered node
    if (visualization?.currentView === 'diagram') {
        setTimeout(() => {
            visualization?.showFilteredNodeLabels(nodeId);
        }, 200);
    }
    
    // Update table
    setupTable();
}

// Clear node filter
function clearNodeFilter() {
    visualization.filteredNodeId = null;
    
    // Reset all nodes and links to full opacity
    visualization?.nodeElements?.style("opacity", 1);
    visualization?.linkElements?.style("opacity", 1);
    
    // Hide relationship labels
    visualization?.hideRelationshipLabel();
    
    // Reset dropdown
    document.getElementById("nodeFilter").value = "";
    
    // Update table
    setupTable();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    init();
});

// Make functions available globally for HTML event handlers
window.toggleView = toggleView;
window.handleNodeFilter = handleNodeFilter;
window.clearNodeFilter = clearNodeFilter;
