/**
 * Main Application - Entry point and orchestration
 * 
 * This file serves as the main entry point for the Legal System Network Diagram application.
 * It coordinates between the data layer, helper functions, and visualization components.
 */

// Global application state
let visualization = null;
let isInitialized = false;

/**
 * Initialize the application
 * Sets up the visualization with data and configuration
 */
function init() {
    try {
        // Get data from window.data at runtime
        const { judicialEntityMapData, groupingData, relationshipGroupingData, config, colorMap } = window.data || {};
        
        // Validate required data is available
        if (!judicialEntityMapData || !groupingData || !config || !colorMap) {
            throw new Error('Required data not loaded. Make sure data.js is included.');
        }

        // Create visualization instance (relationshipGroupingData is optional)
        visualization = new LegalSystemVisualization({
            judicialEntityMapData,
            groupingData,
            relationshipGroupingData: relationshipGroupingData || [],
            config,
            colorMap
        });

        // Initialize the visualization
        visualization.init();
        
        // Mark as initialized
        isInitialized = true;
        
        console.log('Legal System Network Diagram initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to load the visualization. Please refresh the page.');
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const container = document.querySelector('.visualization-container');
    if (container) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #d32f2f; font-size: 18px; text-align: center;">
                <div>
                    <h3>Error Loading Visualization</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
}

// Setup the data table
function setupTable() {
    const tableBody = d3.select("#table-body");
    
    // Clear existing rows
    tableBody.selectAll("tr").remove();
    
    // Get data from window.data at runtime
    const { judicialEntityMapData } = window.data || {};
    
    // Get filtered data if filter is active
    const dataToShow = window.helpers?.getFilteredTableData(judicialEntityMapData, visualization?.filteredNodeId, visualization?.filteredEntityGroupId, visualization?.filteredRelationshipId, visualization?.filteredRelationshipGroupId, window.data?.relationshipGroupingData, window.data?.groupingData) || judicialEntityMapData;
    
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
    
    // Setup collapsible project note toggle
    const projectNoteToggle = document.getElementById("projectNoteToggle");
    if (projectNoteToggle) {
        projectNoteToggle.addEventListener("click", toggleProjectNote);
    }
}

// Toggle project note visibility
function toggleProjectNote() {
    const toggle = document.getElementById("projectNoteToggle");
    const content = document.getElementById("projectNoteContent");
    const diagramView = document.getElementById("diagram-view");
    
    if (!toggle || !content) return;
    
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    
    if (isExpanded) {
        toggle.setAttribute("aria-expanded", "false");
        content.classList.add("collapsed");
        // Add class to diagram-view to move legend down (if diagram view exists)
        if (diagramView) {
            diagramView.classList.add("project-note-collapsed");
        }
    } else {
        toggle.setAttribute("aria-expanded", "true");
        content.classList.remove("collapsed");
        // Remove class to move legend back up (if diagram view exists)
        if (diagramView) {
            diagramView.classList.remove("project-note-collapsed");
        }
    }
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
    const container = document.querySelector('.container');
    
    // Add class to hide legend and project note
    if (container) {
        container.classList.add('table-view-active');
    }
    
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
    const { judicialEntityMapData } = window.data || {};
    
    // Get unique node names
    const uniqueNodes = [...new Set([
        ...judicialEntityMapData.map(d => d.source),
        ...judicialEntityMapData.map(d => d.target)
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
    const { judicialEntityMapData } = window.data || {};
    
    // Filter nodes
    visualization?.nodeElements
        ?.style("opacity", d => {
            const isConnected = judicialEntityMapData.some(link => 
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

// Orientation detection and lock
function checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const body = document.body;
    
    if (isPortrait) {
        body.classList.add('portrait-mode');
        // Prevent scrolling in portrait mode
        body.style.overflow = 'hidden';
    } else {
        body.classList.remove('portrait-mode');
        body.style.overflow = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check initial orientation
    checkOrientation();
    
    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', function() {
        // Delay check to allow orientation change to complete
        setTimeout(checkOrientation, 100);
    });
    
    // Initialize the application
    init();
    // Setup event listeners
    setupEventListeners();
    
    // Set initial state for collapsed project note (legend position)
    const diagramView = document.getElementById("diagram-view");
    const projectNoteContent = document.getElementById("projectNoteContent");
    if (diagramView && projectNoteContent && projectNoteContent.classList.contains("collapsed")) {
        diagramView.classList.add("project-note-collapsed");
    }
});

/**
 * Global event handlers for HTML interactions
 * These functions are exposed to the global scope for use in HTML event handlers
 */

// Toggle between diagram and table views
window.toggleView = () => {
    if (!isInitialized || !visualization) {
        console.warn('Visualization not initialized yet');
        return;
    }
    visualization.toggleView();
};

// Handle node filter selection from dropdown
window.handleNodeFilter = (event) => {
    if (!isInitialized || !visualization) {
        console.warn('Visualization not initialized yet');
        return;
    }
    visualization.handleNodeFilter(event);
};

// Clear the current node filter
window.clearNodeFilter = () => {
    if (!isInitialized || !visualization) {
        console.warn('Visualization not initialized yet');
        return;
    }
    visualization.clearNodeFilter();
};
