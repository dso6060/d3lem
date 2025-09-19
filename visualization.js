// Visualization Logic - Core D3.js visualization functionality

class LegalSystemVisualization {
    constructor(data, config, colorMap) {
        this.lawsuitData = data.lawsuitData;
        this.config = data.config;
        this.colorMap = data.colorMap;
        
        // Global variables
        this.svg = null;
        this.simulation = null;
        this.nodes = null;
        this.links = null;
        this.nodeElements = null;
        this.linkElements = null;
        this.isAnimating = false;
        this.filteredNodeId = null;
        this.currentView = 'diagram';
    }

    // Initialize the visualization
    init() {
        this.setupSVG();
        this.setupTable();
        this.setupEventListeners();
        this.setupFilterDropdown();
        this.showDiagramView();
    }

    // Setup SVG and force simulation
    setupSVG() {
        const container = d3.select("#arrow-diagram");
        container.selectAll(".links, .nodes").remove();
        
        this.svg = container
            .attr("width", this.config.width)
            .attr("height", this.config.height);
        
        this.createArrowMarkers();
        this.createForceSimulation();
        this.prepareDiagramData();
    }

    // Create arrow markers for the two colors
    createArrowMarkers() {
        let defs = this.svg.select("defs");
        if (defs.empty()) {
            defs = this.svg.append("defs");
            
            Object.entries(this.colorMap).forEach(([colorName, colorValue]) => {
                defs.append("marker")
                    .attr("id", `arrowhead-${colorName}`)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 9)
                    .attr("refY", 0)
                    .attr("orient", "auto")
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("xoverflow", "visible")
                    .append("path")
                    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
                    .attr("fill", colorValue);
            });
        }
    }

    // Create force simulation
    createForceSimulation() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(this.config.linkDistance).strength(0.8))
            .force("charge", d3.forceManyBody().strength(this.config.chargeStrength).distanceMax(400))
            .force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2 - 100).strength(this.config.centerStrength * 0.5))
            .force("collision", d3.forceCollide().radius(this.config.nodeRadius + 10))
            .force("x", d3.forceX(this.config.width / 2).strength(this.config.xStrength * 0.3))
            .force("y", d3.forceY(this.config.height / 2 - 100).strength(this.config.yStrength * 0.3))
            .force("radial", d3.forceRadial(350, this.config.width / 2, this.config.height / 2 - 100).strength(0.05));
    }

    // Prepare data for the arrow diagram
    prepareDiagramData() {
        const companies = window.utils.createUniqueNodes(this.lawsuitData);
        const diagramLinks = window.utils.createDiagramLinks(this.lawsuitData, companies);
        
        console.log(`Created ${diagramLinks.length} links from ${this.lawsuitData.length} data entries`);
        
        this.simulation.nodes(companies);
        this.simulation.force("link").links(diagramLinks);
        
        this.createLinkElements(diagramLinks);
        this.createNodeElements(companies);
        this.addInteractivity();
    }

    // Create link elements
    createLinkElements(diagramLinks) {
        this.linkElements = this.svg.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(diagramLinks)
            .enter()
            .append("path")
            .attr("class", d => `link ${d.color}`)
            .attr("marker-end", d => `url(#arrowhead-${d.color})`)
            .style("opacity", 0)
            .attr("stroke-width", 1.5);
    }

    // Create node elements
    createNodeElements(companies) {
        this.nodeElements = this.svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(companies)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("opacity", 0)
            .call(this.createDragBehavior());

        // Add circles to nodes
        this.nodeElements.append("circle")
            .attr("r", this.config.nodeRadius)
            .style("fill", "#333")
            .style("stroke", "#fff")
            .style("stroke-width", 2);

        // Add text labels to nodes
        this.nodeElements.append("text")
            .attr("class", "node-text")
            .attr("dx", 8)
            .attr("dy", 0)
            .text(d => d.name);
    }

    // Create drag behavior
    createDragBehavior() {
        return d3.drag()
            .on("start", (event, d) => this.dragstarted(event, d))
            .on("drag", (event, d) => this.dragged(event, d))
            .on("end", (event, d) => this.dragended(event, d));
    }

    // Drag event handlers
    dragstarted(event, d) {
        event.sourceEvent.preventDefault();
        
        if (this.filteredNodeId) {
            this.clearNodeFilter();
        }
        
        const connectedNodeIds = new Set();
        connectedNodeIds.add(d.id);
        
        this.lawsuitData.forEach(link => {
            if (link.source === d.id || link.target === d.id) {
                connectedNodeIds.add(link.source);
                connectedNodeIds.add(link.target);
            }
        });
        
        d._connectedNodes = connectedNodeIds;
        
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        
        this.simulation.force("charge").strength(-50);
        this.simulation.force("link").strength(0.1);
        
        if (!event.active) this.simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
        
        this.highlightSelectedNode(d);
        
        setTimeout(() => {
            this.showNodeRelationshipLabels(d);
        }, 50);
    }

    dragged(event, d) {
        const connectedNodeIds = d._connectedNodes || new Set([d.id]);
        
        const nodeRadius = this.config.nodeRadius;
        const textMargin = 100;
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2 - 100;
        const maxDistance = Math.min(this.config.width, this.config.height) * 0.4;
        
        let newX = Math.max(nodeRadius + textMargin, Math.min(this.config.width - nodeRadius - textMargin, event.x));
        let newY = Math.max(nodeRadius + textMargin, Math.min(this.config.height - nodeRadius - textMargin, event.y));
        
        const distanceFromCenter = Math.sqrt((newX - centerX) ** 2 + (newY - centerY) ** 2);
        if (distanceFromCenter > maxDistance) {
            const angle = Math.atan2(newY - centerY, newX - centerX);
            newX = centerX + Math.cos(angle) * maxDistance;
            newY = centerY + Math.sin(angle) * maxDistance;
        }
        
        d.fx = newX;
        d.fy = newY;
        
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
        
        // Show tethered labels for this node's relationships during drag
        this.showNodeRelationshipLabels(d);
        
        if (!d._labelUpdateScheduled) {
            d._labelUpdateScheduled = true;
            this.updateRelationshipLabels();
            
            setTimeout(() => {
                this.optimizeNodeLabelPositions();
            }, 50);
            
            setTimeout(() => {
                d._labelUpdateScheduled = false;
            }, 16);
        }
    }

    dragended(event, d) {
        this.simulation.force("charge").strength(this.config.chargeStrength);
        this.simulation.force("link").strength(1);
        
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        
        const connectedNodeIds = d._connectedNodes || new Set([d.id]);
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = null;
                node.fy = null;
            }
        });
        
        delete d._connectedNodes;
        
        this.removeHighlighting();
        
        setTimeout(() => {
            this.hideRelationshipLabel();
        }, 100);
    }

    // Update positions during simulation
    ticked() {
        const nodeRadius = this.config.nodeRadius;
        const textMargin = 100;
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2 - 100;
        const maxDistance = Math.min(this.config.width, this.config.height) * 0.4;
        
        this.simulation.nodes().forEach(d => {
            d.x = Math.max(nodeRadius + textMargin, Math.min(this.config.width - nodeRadius - textMargin, d.x));
            d.y = Math.max(nodeRadius + textMargin, Math.min(this.config.height - nodeRadius - textMargin, d.y));
            
            const distanceFromCenter = Math.sqrt((d.x - centerX) ** 2 + (d.y - centerY) ** 2);
            if (distanceFromCenter > maxDistance) {
                const angle = Math.atan2(d.y - centerY, d.x - centerX);
                d.x = centerX + Math.cos(angle) * maxDistance;
                d.y = centerY + Math.sin(angle) * maxDistance;
            }
        });
        
        this.linkElements
            .attr("d", d => {
                if (!d.source || !d.target || d.source.x === undefined || d.target.x === undefined) {
                    console.warn("Invalid link data:", d);
                    return "M0,0L0,0";
                }
                
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                
                const sweep = dx < 0 ? 0 : 1;
                const path = `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${sweep} ${d.target.x},${d.target.y}`;
                return path;
            });
        
        this.nodeElements
            .attr("transform", d => `translate(${d.x},${d.y})`);
        
        // Update relationship labels if they're visible
        if (this._labelsVisible) {
            this.updateRelationshipLabels();
        }
        
        if (Math.random() < 0.15) {
            setTimeout(() => {
                this.optimizeNodeLabelPositions();
            }, 0);
        }
    }

    // Add interactivity to nodes and links
    addInteractivity() {
        this.nodeElements
            .on("mouseover", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.showRelatedNodesOnHover(d);
                    // Show tethered labels for this node's relationships
                    this.showNodeRelationshipLabels(d);
                }
            })
            .on("mouseout", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.restoreNormalView();
                    // Hide relationship labels when mouse leaves node
                    this.hideRelationshipLabel();
                }
            })
            .on("click", (event, d) => {
                if (this.filteredNodeId) {
                    this.clearNodeFilter();
                }
            });

        this.linkElements
            .on("mouseover", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.showRelatedNodesOnHover(d.source);
                }
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 2.5);
                this.showTooltip(event, `${d.source.name} → ${d.target.name}: ${d.label}`);
            })
            .on("mouseout", (event, d) => {
                const selectedNode = this.svg.attr("data-selected-node");
                if (!selectedNode) {
                    this.restoreNormalView();
                }
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 1.5);
                this.hideTooltip();
            });
    }

    // Show diagram view
    showDiagramView() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const toggleBtn = document.getElementById("toggleViewBtn");
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Show Table View";
        
        const tableView = document.getElementById("table-view");
        const diagramView = document.getElementById("diagram-view");
        
        tableView.classList.remove("active");
        tableView.classList.add("fade-out");
        
        setTimeout(() => {
            diagramView.classList.add("active");
            
            this.nodeElements
                .each(function(d, i) {
                    const angle = (i / this.nodeElements.size()) * 2 * Math.PI;
                    const radius = Math.min(this.config.width, this.config.height) * 0.3;
                    const textMargin = 100;
                    const centerX = this.config.width / 2;
                    const centerY = this.config.height / 2 - 100;
                    
                    d.x = centerX + Math.cos(angle) * radius;
                    d.y = centerY + Math.sin(angle) * radius;
                    
                    d.x = Math.max(30 + textMargin, Math.min(this.config.width - 30 - textMargin, d.x));
                    d.y = Math.max(30 + textMargin, Math.min(this.config.height - 30 - textMargin, d.y));
                }.bind(this))
                .transition()
                .duration(800)
                .delay((d, i) => i * 100)
                .style("opacity", 1)
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
            
            this.linkElements
                .transition()
                .duration(800)
                .delay(400)
                .style("opacity", 1);
            
            this.simulation.on("tick", () => this.ticked());
            this.simulation.alpha(1).restart();
            
            console.log("Simulation started with", this.simulation.nodes().length, "nodes and", this.simulation.force("link").links().length, "links");
            
            setTimeout(() => {
                toggleBtn.disabled = false;
                this.isAnimating = false;
                this.currentView = 'diagram';
                
                if (this.filteredNodeId) {
                    setTimeout(() => {
                        this.showFilteredNodeLabels(this.filteredNodeId);
                    }, 200);
                }
            }, 2000);
            
        }, 800);
    }

    // Setup the data table
    setupTable() {
        const tableBody = d3.select("#table-body");
        
        // Clear existing rows
        tableBody.selectAll("tr").remove();
        
        // Get filtered data if filter is active
        const dataToShow = window.utils.getFilteredTableData(this.lawsuitData, this.filteredNodeId);
        
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
    setupEventListeners() {
        document.getElementById("toggleViewBtn").addEventListener("click", () => this.toggleView());
        document.getElementById("nodeFilter").addEventListener("change", (event) => this.handleNodeFilter(event));
        document.getElementById("clearFilter").addEventListener("click", () => this.clearNodeFilter());
    }

    // Setup filter dropdown
    setupFilterDropdown() {
        const nodeFilter = document.getElementById("nodeFilter");
        
        // Get unique node names
        const uniqueNodes = [...new Set([
            ...this.lawsuitData.map(d => d.source),
            ...this.lawsuitData.map(d => d.target)
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

    // Toggle between diagram and table views
    toggleView() {
        if (this.isAnimating) return;
        
        if (this.currentView === 'diagram') {
            this.showTableView();
        } else {
            this.showDiagramView();
        }
    }

    // Show table view
    showTableView() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const toggleBtn = document.getElementById("toggleViewBtn");
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Show Diagram View";
        
        const tableView = document.getElementById("table-view");
        const diagramView = document.getElementById("diagram-view");
        
        // Stop simulation
        this.simulation?.stop();
        
        // Fade out diagram
        diagramView.classList.remove("active");
        diagramView.classList.add("fade-out");
        
        this.nodeElements
            ?.transition()
            .duration(500)
            .style("opacity", 0);
        
        this.linkElements
            ?.transition()
            .duration(500)
            .style("opacity", 0);
        
        setTimeout(() => {
            tableView.classList.remove("fade-out");
            tableView.classList.add("active");
            
            this.setupTable();
            
            setTimeout(() => {
                toggleBtn.disabled = false;
                this.isAnimating = false;
                this.currentView = 'table';
            }, 1000);
            
        }, 500);
    }

    // Handle node filter change
    handleNodeFilter(event) {
        const selectedNodeId = event.target.value;
        
        if (selectedNodeId) {
            this.applyNodeFilter(selectedNodeId);
        } else {
            this.clearNodeFilter();
        }
    }

    // Apply node filter
    applyNodeFilter(nodeId) {
        this.filteredNodeId = nodeId;
        
        // Filter nodes
        this.nodeElements
            ?.style("opacity", d => {
                const isConnected = this.lawsuitData.some(link => 
                    (link.source === nodeId && link.target === d.id) ||
                    (link.target === nodeId && link.source === d.id)
                );
                return isConnected ? 1 : 0.2;
            });
        
        // Filter links
        this.linkElements
            ?.style("opacity", d => {
                const isConnected = (d.source.id === nodeId || d.target.id === nodeId);
                return isConnected ? 1 : 0.2;
            });
        
        // Show relationship labels for filtered node
        if (this.currentView === 'diagram') {
            setTimeout(() => {
                this.showFilteredNodeLabels(nodeId);
            }, 200);
        }
        
        // Update table
        this.setupTable();
    }

    // Clear node filter
    clearNodeFilter() {
        this.filteredNodeId = null;
        
        // Reset all nodes and links to full opacity
        this.nodeElements?.style("opacity", 1);
        this.linkElements?.style("opacity", 1);
        
        // Hide relationship labels
        this.hideRelationshipLabel();
        
        // Reset dropdown
        document.getElementById("nodeFilter").value = "";
        
        // Update table
        this.setupTable();
    }

    // Highlighting functions for selected node and connections
    highlightSelectedNode(selectedNode) {
        // First, dim all elements
        this.nodeElements
            .style("opacity", 0.3)
            .style("z-index", 1);
        
        this.linkElements
            .style("opacity", 0.2)
            .style("z-index", 1);
        
        // Find connected nodes and links
        const connectedNodeIds = new Set();
        const connectedLinks = this.linkElements.filter(d => {
            if (d.source.id === selectedNode.id || d.target.id === selectedNode.id) {
                connectedNodeIds.add(d.source.id);
                connectedNodeIds.add(d.target.id);
                return true;
            }
            return false;
        });
        
        // Highlight connected nodes with bold styling
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .style("opacity", 1)
            .style("z-index", 10)
            .select("circle")
            .style("stroke-width", 4)
            .style("stroke", "#ff6b35")
            .style("filter", "drop-shadow(0 0 6px rgba(255, 107, 53, 0.6))");
        
        // Bold the selected node even more
        this.nodeElements.filter(d => d.id === selectedNode.id)
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
        this.svg.attr("data-selected-node", selectedNode.id);
    }

    removeHighlighting() {
        // Reset all elements to normal state
        this.nodeElements
            .style("opacity", 1)
            .style("z-index", 1)
            .select("circle")
            .style("stroke-width", 2)
            .style("stroke", "#fff")
            .style("filter", "none");
        
        this.linkElements
            .style("opacity", 1)
            .style("z-index", 1)
            .style("stroke-width", 1.5)
            .style("filter", "none");
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
    }

    // Show relationship labels for a specific node
    showNodeRelationshipLabels(node) {
        // Enable label visibility
        this._labelsVisible = true;
        
        // Remove any existing relationship labels
        this.hideRelationshipLabel();
        
        // Find all links connected to this node
        const connectedLinks = [];
        this.linkElements.each(function(d, i) {
            if (d.source.id === node.id || d.target.id === node.id) {
                connectedLinks.push({ 
                    link: d, 
                    element: this, 
                    index: i,
                    isOutgoing: d.source.id === node.id
                });
            }
        });
        
        console.log(`Showing labels for node: ${node.id}, connected links: ${connectedLinks.length}`);
        
        // Create simple visible labels for testing
        connectedLinks.forEach((linkData, i) => {
            this.createSimpleLabel(linkData.link, linkData.element, i);
        });
    }

    hideRelationshipLabel() {
        // Disable label visibility
        this._labelsVisible = false;
        
        // Remove all relationship labels
        this.svg.selectAll(".relationship-label-group").remove();
    }

    // Create simple visible label for testing
    createSimpleLabel(linkData, linkElement, index) {
        // Only create labels if visibility is enabled
        if (!this._labelsVisible) {
            return;
        }
        
        console.log(`Creating label for: ${linkData.source.name} -> ${linkData.target.name}: ${linkData.label}`);
        
        // Get midpoint of the link
        const sourceX = linkData.source.x;
        const sourceY = linkData.source.y;
        const targetX = linkData.target.x;
        const targetY = linkData.target.y;
        
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        // Create a simple group
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group")
            .style("pointer-events", "none")
            .datum(linkData); // Store link data for updates
        
        // Create background rectangle
        const padding = 8;
        const textWidth = linkData.label.length * 8;
        const textHeight = 16;
        
        const rect = group.append("rect")
            .attr("x", midX - (textWidth/2) - padding)
            .attr("y", midY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 0.95)")
            .style("stroke", "#333")
            .style("stroke-width", 2)
            .style("rx", 4);
        
        // Create text label
        const text = group.append("text")
            .attr("x", midX)
            .attr("y", midY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#000")
            .text(linkData.label);
        
        console.log(`Label created at position: (${midX}, ${midY})`);
    }

    // Label visibility control flag
    _labelsVisible = false;

    // Create tethered label with grouped labelbox
    createTetheredLabel(linkData, linkElement, linkIndex, labelIndex) {
        const path = d3.select(linkElement);
        
        // Check if the path element exists and has a valid length
        if (!path.node() || !path.node().getTotalLength) {
            return;
        }
        
        const pathLength = path.node().getTotalLength();
        if (pathLength === 0) {
            return;
        }
        
        // Calculate position along the arrow path
        const position = 0.3 + (labelIndex * 0.15); // Spread labels along the arrow
        const point = path.node().getPointAtLength(pathLength * position);
        
        // Create a group for the label and labelbox
        const labelId = `tethered-label-${linkData.source.id}-${linkData.target.id}-${labelIndex}`;
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group tethered-label")
            .attr("id", labelId)
            .style("pointer-events", "none")
            .style("opacity", 0)
            .transition()
            .duration(300)
            .style("opacity", 1);
        
        // Create labelbox background
        const padding = 6;
        const textWidth = linkData.label.length * 7;
        const textHeight = 14;
        
        const labelbox = group.append("rect")
            .attr("class", "relationship-labelbox")
            .attr("x", point.x - (textWidth/2) - padding)
            .attr("y", point.y - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 0.95)")
            .style("stroke", linkData.color === "outgoing" ? "#1f77b4" : "#d62728")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        
        // Create label text
        const label = group.append("text")
            .attr("class", "relationship-label-text")
            .attr("x", point.x)
            .attr("y", point.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .text(linkData.label);
        
        // Create connection line from label to arrow
        const connectionLine = group.append("line")
            .attr("class", "label-connection-line")
            .attr("x1", point.x)
            .attr("y1", point.y)
            .attr("x2", point.x)
            .attr("y2", point.y)
            .style("stroke", linkData.color === "outgoing" ? "#1f77b4" : "#d62728")
            .style("stroke-width", 1.5)
            .style("stroke-dasharray", "2,2")
            .style("opacity", 0.6);
        
        // Store reference for updates
        group.datum({
            linkData: linkData,
            linkElement: linkElement,
            pathLength: pathLength,
            position: position
        });
    }

    updateRelationshipLabels() {
        // Only update labels if they are visible
        if (!this._labelsVisible) {
            return;
        }
        
        this.svg.selectAll(".relationship-label-group").each(function() {
            const group = d3.select(this);
            const linkData = group.datum();
            
            if (!linkData || !linkData.source || !linkData.target) return;
            
            // Calculate midpoint of current link positions
            const sourceX = linkData.source.x;
            const sourceY = linkData.source.y;
            const targetX = linkData.target.x;
            const targetY = linkData.target.y;
            
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            // Update labelbox position
            const rect = group.select("rect");
            const text = group.select("text");
            
            if (rect.node()) {
                const padding = 8;
                const textWidth = linkData.label.length * 8;
                const textHeight = 16;
                
                rect
                    .attr("x", midX - (textWidth/2) - padding)
                    .attr("y", midY - (textHeight/2) - padding/2);
            }
            
            if (text.node()) {
                text
                    .attr("x", midX)
                    .attr("y", midY);
            }
            
        });
    }

    optimizeNodeLabelPositions() {
        // Simplified implementation - just return to default positions
        this.nodeElements?.selectAll(".node-text")
            .transition()
            .duration(200)
            .attr("dx", 8)
            .attr("dy", 0);
    }

    showRelatedNodesOnHover(hoveredNode) {
        // Don't apply hover effects if a filter is active
        if (this.filteredNodeId) {
            return;
        }
        
        // Find all connected node IDs
        const connectedNodeIds = new Set();
        connectedNodeIds.add(hoveredNode.id);
        
        // Find all links connected to the hovered node
        this.lawsuitData.forEach(link => {
            if (link.source === hoveredNode.id || link.target === hoveredNode.id) {
                connectedNodeIds.add(link.source);
                connectedNodeIds.add(link.target);
            }
        });
        
        // Fade all nodes except connected ones
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", d => connectedNodeIds.has(d.id) ? 1 : 0.2);
        
        // Fade all links except connected ones
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", d => connectedNodeIds.has(d.source.id) && connectedNodeIds.has(d.target.id) ? 1 : 0.2);
    }

    restoreNormalView() {
        // Don't restore if a filter is active
        if (this.filteredNodeId) {
            return;
        }
        
        // Restore all nodes opacity
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", 1);
        
        // Restore all links opacity
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", 1);
    }

    showTooltip(event, text) {
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

    hideTooltip() {
        d3.selectAll(".tooltip").remove();
    }

    showFilteredNodeLabels(nodeId) {
        // Only show labels if we're in diagram view
        const diagramView = document.getElementById("diagram-view");
        if (!diagramView.classList.contains("active")) {
            return;
        }
        
        // Remove any existing relationship labels
        this.hideRelationshipLabel();
        
        // Find all links connected to this node from the original data
        const connectedLinks = this.lawsuitData.filter(link => 
            link.source === nodeId || link.target === nodeId
        );
        
        // Show labels for each connected link
        connectedLinks.forEach((linkData, i) => {
            // Find the corresponding link element in the visualization
            const linkElement = this.linkElements.filter(d => 
                d.source.id === linkData.source && d.target.id === linkData.target
            ).node();
            
            if (linkElement) {
                // Create a proper data object with the correct structure for the label function
                const labelData = {
                    source: { id: linkData.source, x: linkElement.__data__.source.x, y: linkElement.__data__.source.y },
                    target: { id: linkData.target, x: linkElement.__data__.target.x, y: linkElement.__data__.target.y },
                    label: linkData.label
                };
                this.showRelationshipLabelOnArrow(linkElement, labelData, i);
            }
        });
    }

    showRelationshipLabelOnArrow(linkElement, d, index) {
        // Get the path element to calculate midpoint
        const path = d3.select(linkElement);
        
        // Check if the path element exists and has a valid length
        if (!path.node() || !path.node().getTotalLength) {
            return;
        }
        
        const pathLength = path.node().getTotalLength();
        if (pathLength === 0) {
            // Fallback to simple midpoint calculation
            const labelX = (d.source.x + d.target.x) / 2;
            const labelY = (d.source.y + d.target.y) / 2;
            
            // Create relationship label with collision detection
            this.createLabelWithCollisionDetection(d, labelX, labelY, index);
            return;
        }
        
        const midpoint = path.node().getPointAtLength(pathLength / 2);
        
        // Calculate the angle of the arrow for proper label orientation
        const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
        
        // Try multiple positions to avoid collisions
        const positions = [
            { offset: 15 + (index * 8), angle: angle + Math.PI / 2 },
            { offset: 15 + (index * 8), angle: angle - Math.PI / 2 },
            { offset: 25 + (index * 8), angle: angle + Math.PI / 2 },
            { offset: 25 + (index * 8), angle: angle - Math.PI / 2 }
        ];
        
        let bestPosition = null;
        let minCollisionScore = Infinity;
        
        // Find the best position with least collisions
        for (const pos of positions) {
            let labelX = midpoint.x + Math.cos(pos.angle) * pos.offset;
            let labelY = midpoint.y + Math.sin(pos.angle) * pos.offset;
            
            // Ensure label stays within view bounds
            const labelMargin = 20;
            labelX = Math.max(labelMargin, Math.min(this.config.width - labelMargin, labelX));
            labelY = Math.max(labelMargin, Math.min(this.config.height - labelMargin, labelY));
            
            const collisionScore = window.utils.calculateCollisionScore(labelX, labelY, d.label, this.svg, this.nodeElements);
            if (collisionScore < minCollisionScore) {
                minCollisionScore = collisionScore;
                bestPosition = { x: labelX, y: labelY };
            }
        }
        
        if (bestPosition) {
            this.createLabelWithCollisionDetection(d, bestPosition.x, bestPosition.y, index);
        }
    }

    createLabelWithCollisionDetection(d, labelX, labelY, index) {
        // Create a group to contain both label and background
        const labelId = `label-${d.source.id}-${d.target.id}-${index}`;
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group")
            .attr("id", `group-${labelId}`)
            .style("pointer-events", "none");
        
        // Create background rectangle first (so it appears behind the text)
        const padding = 8;
        const textWidth = d.label.length * 7; // Approximate text width
        const textHeight = 16; // Approximate text height
        
        const background = group.append("rect")
            .attr("class", "relationship-label-bg")
            .attr("id", `bg-${labelId}`)
            .attr("x", labelX - (textWidth/2) - padding)
            .attr("y", labelY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 0.95)")
            .style("stroke", "#333")
            .style("stroke-width", 1.5)
            .style("rx", 3);
        
        // Create the text label
        const label = group.append("text")
            .attr("class", "relationship-label")
            .attr("id", labelId)
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "700")
            .style("fill", "#000")
            .text(d.label);
        
        // Update background with actual text dimensions after text is rendered
        setTimeout(() => {
            const bbox = label.node().getBBox();
            background
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding/2)
                .attr("width", bbox.width + (padding * 2))
                .attr("height", bbox.height + padding);
        }, 0);
    }
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegalSystemVisualization;
}

// Make class available globally for browser usage
window.LegalSystemVisualization = LegalSystemVisualization;
