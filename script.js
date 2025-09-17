// Indian Judicial System - Nodes and Relationships
const lawsuitData = [
    // Ministry of Law & Justice relationships
    { source: "Ministry of Law & Justice (DoJ)", target: "State Governments", count: 1, color: "blue", label: "provides_funds" },
    { source: "Ministry of Law & Justice (DoJ)", target: "Supreme Court (SC)", count: 1, color: "blue", label: "provides_infrastructure" },
    { source: "Ministry of Law & Justice (DoJ)", target: "President of India", count: 1, color: "blue", label: "processes_notification" },
    { source: "Ministry of Law & Justice (DoJ)", target: "High Courts (HC)", count: 1, color: "green", label: "coordinates_with" },
    { source: "High Courts (HC)", target: "Ministry of Law & Justice (DoJ)", count: 1, color: "green", label: "coordinates_with" },
    { source: "Collegium", target: "Ministry of Law & Justice (DoJ)", count: 1, color: "orange", label: "receives_recommendations" },
    
    // Collegium relationships
    { source: "Collegium", target: "Department of Justice (DoJ)", count: 1, color: "orange", label: "recommends_for_appointment" },
    
    // Department of Justice relationships
    { source: "Department of Justice (DoJ)", target: "President of India", count: 1, color: "orange", label: "forwards_recommendation" },
    { source: "Department of Justice (DoJ)", target: "Intelligence Agencies", count: 1, color: "blue", label: "seeks_security_clearance" },
    
    // President of India relationships
    { source: "President of India", target: "Supreme Court (SC)", count: 1, color: "blue", label: "appoints" },
    { source: "President of India", target: "High Courts (HC)", count: 1, color: "blue", label: "appoints" },
    
    // Supreme Court relationships
    { source: "Supreme Court (SC)", target: "Supreme Court (SC)", count: 1, color: "green", label: "frames_rules" },
    { source: "Supreme Court (SC)", target: "Supreme Court Registry", count: 1, color: "green", label: "controls_administration" },
    
    // High Courts relationships
    { source: "High Courts (HC)", target: "Subordinate Courts", count: 1, color: "green", label: "frames_rules" },
    { source: "High Courts (HC)", target: "Judicial Officers", count: 1, color: "green", label: "manages_postings" },
    { source: "High Courts (HC)", target: "State Governments", count: 1, color: "orange", label: "coordinates_with" },
    { source: "State Governments", target: "High Courts (HC)", count: 1, color: "orange", label: "consults" },
    
    // State Governments relationships
    { source: "State Governments", target: "Subordinate Courts", count: 1, color: "blue", label: "allocates_budget" },
    
    // Judicial Officers relationships
    { source: "Judicial Officers", target: "Courts", count: 1, color: "orange", label: "administers" },
    
    // Parliament/State Legislatures relationships
    { source: "Parliament / State Legislatures", target: "Court Procedures", count: 1, color: "blue", label: "enacts_acts" },
    { source: "Parliament / State Legislatures", target: "Court Procedures", count: 1, color: "blue", label: "amends_acts" },
    { source: "Parliament / State Legislatures", target: "Ministry of Law & Justice (DoJ)", count: 1, color: "blue", label: "sets_budget" },
    { source: "Parliament / State Legislatures", target: "State Governments", count: 1, color: "blue", label: "funds" },
    
    // Court Procedures relationships
    { source: "Court Procedures", target: "Supreme Court (SC)", count: 1, color: "green", label: "govern" },
    { source: "Court Procedures", target: "High Courts (HC)", count: 1, color: "green", label: "govern" },
    { source: "Court Procedures", target: "Subordinate Courts", count: 1, color: "green", label: "govern" }
];

// Configuration
const config = {
    width: 1000,
    height: 700,
    nodeRadius: 25,
    linkDistance: 150,
    chargeStrength: -400,
    centerStrength: 0.3,
    xStrength: 0.2,
    yStrength: 0.2
};

// Global variables
let svg, simulation, nodes, links, nodeElements, linkElements;
let isAnimating = false;

// Initialize the application
function init() {
    setupTable();
    setupSVG();
    setupEventListeners();
}

// Setup the data table
function setupTable() {
    const tableBody = d3.select("#table-body");
    
    // Clear existing rows
    tableBody.selectAll("tr").remove();
    
    // Create rows for each lawsuit
    const rows = tableBody.selectAll("tr")
        .data(lawsuitData)
        .enter()
        .append("tr")
        .attr("class", "table-row")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .style("opacity", 1);
    
    // Add cells for each row
    rows.each(function(d) {
        const row = d3.select(this);
        row.append("td").text(d.source);
        row.append("td").text(d.label);
        row.append("td").text(d.target);
    });
}

// Setup SVG and force simulation
function setupSVG() {
    const container = d3.select("#arrow-diagram");
    // Only remove links and nodes, keep defs for markers
    container.selectAll(".links, .nodes").remove();
    
    svg = container
        .attr("width", config.width)
        .attr("height", config.height);
    
    // Create arrow markers for each color (only if they don't exist)
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
        
        // Orange arrow marker
        defs.append("marker")
            .attr("id", "arrowhead-orange")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 9)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("xoverflow", "visible")
            .append("path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#ff7f0e");
        
        // Green arrow marker
        defs.append("marker")
            .attr("id", "arrowhead-green")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 9)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("xoverflow", "visible")
            .append("path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#2ca02c");
        
        // Blue arrow marker
        defs.append("marker")
            .attr("id", "arrowhead-blue")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 9)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("xoverflow", "visible")
            .append("path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#1f77b4");
        
        console.log("Arrow markers created:", defs.selectAll("marker").size());
    } else {
        console.log("Arrow markers already exist:", defs.selectAll("marker").size());
    }
    
    // Create force simulation with better centering
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(config.linkDistance).strength(0.8))
        .force("charge", d3.forceManyBody().strength(config.chargeStrength).distanceMax(300))
        .force("center", d3.forceCenter(config.width / 2, config.height / 2).strength(config.centerStrength))
        .force("collision", d3.forceCollide().radius(config.nodeRadius + 10))
        .force("x", d3.forceX(config.width / 2).strength(config.xStrength))
        .force("y", d3.forceY(config.height / 2).strength(config.yStrength))
        .force("radial", d3.forceRadial(200, config.width / 2, config.height / 2).strength(0.1));
    
    // Prepare data for the diagram
    prepareDiagramData();
}

// Prepare data for the arrow diagram
function prepareDiagramData() {
    // Get unique companies
    const companies = [...new Set([
        ...lawsuitData.map(d => d.source),
        ...lawsuitData.map(d => d.target)
    ])].map(name => ({ id: name, name: name }));
    
    // Create links with proper structure
    const diagramLinks = lawsuitData.map(d => ({
        source: d.source,
        target: d.target,
        count: d.count,
        color: d.color,
        label: d.label
    }));
    
    // Update simulation with new data
    simulation.nodes(companies);
    simulation.force("link").links(diagramLinks);
    
    // Create link elements
    linkElements = svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(diagramLinks)
        .enter()
        .append("path")
        .attr("class", d => {
            console.log(`Creating link with class: link ${d.color}`);
            return `link ${d.color}`;
        })
        .attr("marker-end", d => {
            console.log(`Setting marker-end for ${d.color}: url(#arrowhead-${d.color})`);
            return `url(#arrowhead-${d.color})`;
        })
        .style("opacity", 0)
        .attr("stroke-width", 1.5);
    
    // Create node elements
    nodeElements = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(companies)
        .enter()
        .append("g")
        .attr("class", "node")
        .style("opacity", 0);
    
    // Add circles to nodes
    nodeElements.append("circle")
        .attr("class", "node-circle")
        .attr("r", 4);
    
    // Add text to nodes (positioned next to the circle)
    nodeElements.append("text")
        .attr("class", "node-text")
        .text(d => d.name)
        .attr("dx", 8)
        .attr("dy", 0);
    
    // Add drag behavior with improved sensitivity
    nodeElements.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        .filter(function(event) {
            // Make dragging easier by reducing resistance
            return true;
        }));
}

// Animate from table to arrow diagram
function animateToDiagram() {
    if (isAnimating) return;
    isAnimating = true;
    
    const animateBtn = document.getElementById("animateBtn");
    const resetBtn = document.getElementById("resetBtn");
    animateBtn.disabled = true;
    
    // Fade out table
    const tableView = document.getElementById("table-view");
    const diagramView = document.getElementById("diagram-view");
    
    tableView.classList.remove("active");
    tableView.classList.add("fade-out");
    
    setTimeout(() => {
        diagramView.classList.add("active");
        
        // Animate nodes appearing with better initial positioning
        nodeElements
            .each(function(d, i) {
                // Spread nodes in a circle initially
                const angle = (i / nodeElements.size()) * 2 * Math.PI;
                const radius = Math.min(config.width, config.height) * 0.3;
                d.x = config.width / 2 + Math.cos(angle) * radius;
                d.y = config.height / 2 + Math.sin(angle) * radius;
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .style("opacity", 1)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
        
        // Animate links appearing
        linkElements
            .transition()
            .duration(800)
            .delay(400)
            .style("opacity", 1)
            .on("end", function() {
                console.log("Links animated, checking attributes:");
                linkElements.each(function(d) {
                    const element = d3.select(this);
                    console.log(`Link class: ${element.attr("class")}, stroke: ${element.style("stroke")}, marker-end: ${element.attr("marker-end")}`);
                });
            });
        
        // Start simulation
        simulation.on("tick", ticked);
        simulation.alpha(1).restart();
        
        // Re-enable button after animation
        setTimeout(() => {
            animateBtn.disabled = false;
            isAnimating = false;
        }, 2000);
        
    }, 800);
}

// Reset to table view
function resetToTable() {
    if (isAnimating) return;
    isAnimating = true;
    
    const animateBtn = document.getElementById("animateBtn");
    const resetBtn = document.getElementById("resetBtn");
    resetBtn.disabled = true;
    
    const tableView = document.getElementById("table-view");
    const diagramView = document.getElementById("diagram-view");
    
    // Stop simulation
    simulation.stop();
    
    // Fade out diagram
    diagramView.classList.remove("active");
    diagramView.classList.add("fade-out");
    
    // Fade out nodes and links
    nodeElements
        .transition()
        .duration(500)
        .style("opacity", 0);
    
    linkElements
        .transition()
        .duration(500)
        .style("opacity", 0);
    
    setTimeout(() => {
        tableView.classList.remove("fade-out");
        tableView.classList.add("active");
        
        // Re-populate table with animation
        setupTable();
        
        // Re-enable button
        setTimeout(() => {
            resetBtn.disabled = false;
            isAnimating = false;
        }, 1000);
        
    }, 500);
}

// Update positions during simulation
function ticked() {
    // Keep nodes within bounds with larger margin and better centering
    const nodeRadius = 30;
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const maxDistance = Math.min(config.width, config.height) * 0.4; // Keep nodes within 40% of canvas
    
    simulation.nodes().forEach(d => {
        // Keep within bounds
        d.x = Math.max(nodeRadius, Math.min(config.width - nodeRadius, d.x));
        d.y = Math.max(nodeRadius, Math.min(config.height - nodeRadius, d.y));
        
        // Pull nodes back towards center if they're too far
        const distanceFromCenter = Math.sqrt((d.x - centerX) ** 2 + (d.y - centerY) ** 2);
        if (distanceFromCenter > maxDistance) {
            const angle = Math.atan2(d.y - centerY, d.x - centerX);
            d.x = centerX + Math.cos(angle) * maxDistance;
            d.y = centerY + Math.sin(angle) * maxDistance;
        }
    });
    
    linkElements
        .attr("d", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            
            // Create curved path
            const sweep = dx < 0 ? 0 : 1;
            const path = `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${sweep} ${d.target.x},${d.target.y}`;
            return path;
        });
    
    nodeElements
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

// Drag functions
function dragstarted(event, d) {
    // Prevent default behavior to avoid glitches
    event.sourceEvent.preventDefault();
    
    // Reduce force strength during drag to make it easier
    simulation.force("charge").strength(-50);
    simulation.force("link").strength(0.1);
    
    if (!event.active) simulation.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;
    
    // Highlight selected node and its connections
    highlightSelectedNode(d);
    
    // Show all relationship labels for this node during drag
    setTimeout(() => {
        showNodeRelationshipLabels(d);
    }, 50); // Small delay to ensure smooth start
}

function dragged(event, d) {
    // Keep nodes within the visible area with larger margin
    const nodeRadius = 30;
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const maxDistance = Math.min(config.width, config.height) * 0.4;
    
    let newX = Math.max(nodeRadius, Math.min(config.width - nodeRadius, event.x));
    let newY = Math.max(nodeRadius, Math.min(config.height - nodeRadius, event.y));
    
    // Keep within circular boundary from center
    const distanceFromCenter = Math.sqrt((newX - centerX) ** 2 + (newY - centerY) ** 2);
    if (distanceFromCenter > maxDistance) {
        const angle = Math.atan2(newY - centerY, newX - centerX);
        newX = centerX + Math.cos(angle) * maxDistance;
        newY = centerY + Math.sin(angle) * maxDistance;
    }
    
    d.fx = newX;
    d.fy = newY;
    
    // Update relationship labels position during drag with throttling
    if (!d._labelUpdateScheduled) {
        d._labelUpdateScheduled = true;
        requestAnimationFrame(() => {
            updateRelationshipLabels();
            d._labelUpdateScheduled = false;
        });
    }
}

function dragended(event, d) {
    // Restore original force strength
    simulation.force("charge").strength(config.chargeStrength);
    simulation.force("link").strength(1);
    
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    
    // Remove highlighting after drag
    removeHighlighting();
    
    // Hide relationship labels after drag with a small delay
    setTimeout(() => {
        hideRelationshipLabel();
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById("animateBtn").addEventListener("click", animateToDiagram);
    document.getElementById("resetBtn").addEventListener("click", resetToTable);
}

// Add some interactive features
function addInteractivity() {
    // Add hover effects for links
    linkElements
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-width", 2.5);
            
            // Show relationship label on the link
            showRelationshipLabel(this, d);
            
            // Show tooltip
            showTooltip(event, `${d.source.name} → ${d.target.name}: ${d.label}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-width", 1.5);
            
            // Hide relationship label
            hideRelationshipLabel();
            hideTooltip();
        });
    
    // Add hover effects for nodes (only when not dragging)
    nodeElements
        .on("mouseover", function(event, d) {
            // Only apply hover effects if no node is currently selected/dragged
            const selectedNode = svg.attr("data-selected-node");
            if (!selectedNode) {
                d3.select(this).select("circle")
                    .transition()
                    .duration(200)
                    .attr("r", 4);
                
                // Highlight connected links
                linkElements
                    .style("opacity", link => 
                        link.source.id === d.id || link.target.id === d.id ? 1 : 0.3
                    );
            }
        })
        .on("mouseout", function(event, d) {
            // Only apply hover effects if no node is currently selected/dragged
            const selectedNode = svg.attr("data-selected-node");
            if (!selectedNode) {
                d3.select(this).select("circle")
                    .transition()
                    .duration(200)
                    .attr("r", 3);
                
                // Reset link opacity
                linkElements
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            }
        });
}

// Tooltip functions
function showTooltip(event, text) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .text(text);
    
    tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
}

function hideTooltip() {
    d3.selectAll(".tooltip").remove();
}

// Relationship label functions
function showRelationshipLabel(linkElement, d) {
    // Get the path element to calculate midpoint
    const path = d3.select(linkElement);
    const pathLength = path.node().getTotalLength();
    const midpoint = path.node().getPointAtLength(pathLength / 2);
    
    // Create relationship label
    const label = svg.append("text")
        .attr("class", "relationship-label")
        .attr("x", midpoint.x)
        .attr("y", midpoint.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("fill", "#333")
        .style("pointer-events", "none")
        .text(d.label);
    
    // Add background rectangle for better readability
    const bbox = label.node().getBBox();
    const background = svg.insert("rect", "text.relationship-label")
        .attr("class", "relationship-label-bg")
        .attr("x", bbox.x - 2)
        .attr("y", bbox.y - 1)
        .attr("width", bbox.width + 4)
        .attr("height", bbox.height + 2)
        .style("fill", "white")
        .style("stroke", "#ddd")
        .style("stroke-width", 1)
        .style("rx", 3)
        .style("pointer-events", "none");
}

// Show relationship label with offset to avoid clustering
function showRelationshipLabelWithOffset(linkElement, d, index) {
    // Get the path element to calculate midpoint
    const path = d3.select(linkElement);
    const pathLength = path.node().getTotalLength();
    const midpoint = path.node().getPointAtLength(pathLength / 2);
    
    // Calculate offset to avoid clustering
    const offsetDistance = 15 + (index * 8); // Stagger labels
    const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
    const perpendicularAngle = angle + Math.PI / 2;
    
    // Calculate offset position
    const offsetX = midpoint.x + Math.cos(perpendicularAngle) * offsetDistance;
    const offsetY = midpoint.y + Math.sin(perpendicularAngle) * offsetDistance;
    
    // Create relationship label with unique ID
    const labelId = `label-${d.source.id}-${d.target.id}-${index}`;
    const label = svg.append("text")
        .attr("class", "relationship-label")
        .attr("id", labelId)
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", "11px")
        .style("font-weight", "700")
        .style("fill", "#000")
        .style("pointer-events", "none")
        .style("text-shadow", "2px 2px 4px rgba(255,255,255,0.9)")
        .style("z-index", 30)
        .text(d.label);
    
    // Add background rectangle for better readability
    const bbox = label.node().getBBox();
    const background = svg.insert("rect", "text.relationship-label")
        .attr("class", "relationship-label-bg")
        .attr("id", `bg-${labelId}`)
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 3)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 6)
        .style("fill", "rgba(255, 255, 255, 0.95)")
        .style("stroke", "#ff6b35")
        .style("stroke-width", 2)
        .style("rx", 5)
        .style("pointer-events", "none")
        .style("z-index", 25);
}

function hideRelationshipLabel() {
    svg.selectAll(".relationship-label").remove();
    svg.selectAll(".relationship-label-bg").remove();
}

// Highlighting functions for selected node and connections
function highlightSelectedNode(selectedNode) {
    // First, dim all elements
    nodeElements
        .style("opacity", 0.3)
        .style("z-index", 1);
    
    linkElements
        .style("opacity", 0.2)
        .style("z-index", 1);
    
    // Find connected nodes and links
    const connectedNodeIds = new Set();
    const connectedLinks = linkElements.filter(d => {
        if (d.source.id === selectedNode.id || d.target.id === selectedNode.id) {
            connectedNodeIds.add(d.source.id);
            connectedNodeIds.add(d.target.id);
            return true;
        }
        return false;
    });
    
    // Highlight connected nodes with bold styling
    nodeElements.filter(d => connectedNodeIds.has(d.id))
        .style("opacity", 1)
        .style("z-index", 10)
        .select("circle")
        .style("stroke-width", 4)
        .style("stroke", "#ff6b35")
        .style("filter", "drop-shadow(0 0 6px rgba(255, 107, 53, 0.6))");
    
    // Bold the selected node even more
    nodeElements.filter(d => d.id === selectedNode.id)
        .style("opacity", 1)
        .style("z-index", 20)
        .select("circle")
        .style("stroke-width", 5)
        .style("stroke", "#ff0000")
        .style("filter", "drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))");
    
    // Highlight connected links
    connectedLinks
        .style("opacity", 1)
        .style("z-index", 10)
        .style("stroke-width", 3)
        .style("filter", "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))");
    
    // Store selection state
    svg.attr("data-selected-node", selectedNode.id);
}

function removeHighlighting() {
    // Reset all elements to normal state
    nodeElements
        .style("opacity", 1)
        .style("z-index", 1)
        .select("circle")
        .style("stroke-width", 2)
        .style("stroke", "#fff")
        .style("filter", "none");
    
    linkElements
        .style("opacity", 1)
        .style("z-index", 1)
        .style("stroke-width", 1.5)
        .style("filter", "none");
    
    // Clear selection state
    svg.attr("data-selected-node", null);
}

// Show relationship labels for a specific node
function showNodeRelationshipLabels(node) {
    // Remove any existing relationship labels
    hideRelationshipLabel();
    
    // Find all links connected to this node
    const connectedLinks = linkElements.filter(d => 
        d.source.id === node.id || d.target.id === node.id
    );
    
    console.log(`Showing labels for node: ${node.id}, connected links: ${connectedLinks.size()}`);
    
    // Show labels for each connected link with offset positioning
    connectedLinks.each(function(d, i) {
        const linkElement = this;
        console.log(`Showing label for link: ${d.source.id} -> ${d.target.id}: ${d.label}`);
        showRelationshipLabelWithOffset(linkElement, d, i);
    });
}

// Update relationship labels position during drag
function updateRelationshipLabels() {
    svg.selectAll(".relationship-label").each(function() {
        const label = d3.select(this);
        const labelId = label.attr("id");
        
        if (labelId) {
            // Extract link information from label ID
            const parts = labelId.split('-');
            if (parts.length >= 4) {
                const sourceId = parts[1];
                const targetId = parts[2];
                const index = parseInt(parts[3]);
                
                // Find the corresponding link element
                const linkElement = linkElements.filter(d => 
                    d.source.id === sourceId && d.target.id === targetId
                ).node();
                
                if (linkElement) {
                    const path = d3.select(linkElement);
                    const pathLength = path.node().getTotalLength();
                    const midpoint = path.node().getPointAtLength(pathLength / 2);
                    
                    // Get current link data for angle calculation
                    const linkData = linkElements.data().find(d => 
                        d.source.id === sourceId && d.target.id === targetId
                    );
                    
                    if (linkData) {
                        // Calculate offset position
                        const offsetDistance = 15 + (index * 8);
                        const angle = Math.atan2(linkData.target.y - linkData.source.y, linkData.target.x - linkData.source.x);
                        const perpendicularAngle = angle + Math.PI / 2;
                        
                        const offsetX = midpoint.x + Math.cos(perpendicularAngle) * offsetDistance;
                        const offsetY = midpoint.y + Math.sin(perpendicularAngle) * offsetDistance;
                        
                        // Update label position smoothly
                        label
                            .transition()
                            .duration(0)
                            .attr("x", offsetX)
                            .attr("y", offsetY);
                        
                        // Update background position
                        const bbox = label.node().getBBox();
                        const bgId = `bg-${labelId}`;
                        svg.select(`#${bgId}`)
                            .transition()
                            .duration(0)
                            .attr("x", bbox.x - 4)
                            .attr("y", bbox.y - 3)
                            .attr("width", bbox.width + 8)
                            .attr("height", bbox.height + 6);
                    }
                }
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    init();
    
    // Add interactivity after a short delay to ensure elements are rendered
    setTimeout(() => {
        addInteractivity();
    }, 100);
});

// Handle window resize
window.addEventListener("resize", function() {
    if (svg) {
        const container = d3.select("#arrow-diagram").node();
        const rect = container.getBoundingClientRect();
        
        config.width = rect.width;
        config.height = rect.height;
        
        svg.attr("width", config.width).attr("height", config.height);
        simulation.force("center", d3.forceCenter(config.width / 2, config.height / 2));
        simulation.alpha(0.3).restart();
    }
});
