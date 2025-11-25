// Visualization Logic - Core D3.js visualization functionality

class LegalSystemVisualization {
    constructor(data, config, colorMap) {
        this.judicialEntityMapData = data.judicialEntityMapData;
        this.groupingData = data.groupingData;
        this.relationshipGroupingData = data.relationshipGroupingData || [];
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
        this.filteredEntityGroupId = null;
        this.filteredRelationshipId = null;
        this.filteredRelationshipGroupId = null;
        this.lastAppliedFilterType = null; // Track which filter was most recently applied
        this.currentView = 'diagram';
        this.hoveredElement = null; // Track currently hovered element
        this.filterOpacityState = new Map(); // Store filter-based opacity for restoration
        this._labelsVisible = false; // Initialize label visibility flag
        this.isGrouped = false; // Track if nodes are currently grouped
        this.groupElements = null; // Store group circle elements
        
        // Edit mode properties
        this.isEditMode = false;
        this.editableData = null; // Working copy of data for editing
        this.accessControl = {
            isAuthorized: false,
            config: null // Will be initialized in init() when window.data is available
        };
        this.editingRowIndex = null; // Track which row is being edited in modal
        
        // Embed/Read-only mode
        this.readOnly = data.readOnly || false; // Disable edit features when true
        
        // Create color scheme for different groups
        this.groupColors = {
            ":LegislativeAndRegulatory": "#2E8B57",      // Sea Green
            ":Judiciary": "#4169E1",                // Royal Blue
            ":TribunalsAndArbitration": "#FF6347",  // Tomato
            ":PeopleAndOfficeholders": "#9370DB",   // Medium Purple
            ":NonAdministrativeEntities": "#DAA520" // Goldenrod
        };
        
        // Create color scheme for relationship groups
        this.relationshipGroupColors = {
            "Funding": "#4CAF50",           // Green
            "Oversights": "#FF9800",        // Orange
            "Appointments": "#2196F3",      // Blue
            "Governance": "#9C27B0",        // Purple
            "Accountability": "#F44336",    // Red
            "Establishment": "#00BCD4",     // Cyan
            "Operations": "#FFC107",        // Amber
            "Hierarchy": "#795548",         // Brown
            "Directives": "#E91E63"         // Pink
        };
        
        // Create mapping from node names to their group colors
        this.nodeGroupMap = this.createNodeGroupMap();
        
        // Create mapping from relationship labels to their group colors
        this.relationshipGroupMap = this.createRelationshipGroupMap();
    }

    // Create mapping from node names to their group colors
    createNodeGroupMap() {
        const nodeGroupMap = {};
        if (this.groupingData) {
            this.groupingData.forEach(item => {
                nodeGroupMap[item.node] = {
                    group: item.belongsTo,
                    color: this.groupColors[item.belongsTo] || "#999999",
                    label: item.label
                };
            });
        }
        return nodeGroupMap;
    }

    // Create mapping from relationship labels to their group colors
    createRelationshipGroupMap() {
        const relationshipGroupMap = {};
        if (this.relationshipGroupingData) {
            this.relationshipGroupingData.forEach(item => {
                relationshipGroupMap[item.relationship] = {
                    group: item.belongsTo,
                    color: this.relationshipGroupColors[item.belongsTo] || "#999999"
                };
            });
        }
        return relationshipGroupMap;
    }

    // Get relationship group color based on relationship label
    getRelationshipGroupColor(relationshipLabel) {
        const relationshipInfo = this.relationshipGroupMap[relationshipLabel];
        if (relationshipInfo && relationshipInfo.color) {
            return relationshipInfo.color;
        }
        return "#999999"; // Default gray if no group found
    }

    // Get node color based on its group
    getNodeColor(nodeName) {
        const nodeInfo = this.nodeGroupMap[nodeName];
        const color = nodeInfo ? nodeInfo.color : "#999999"; // Default gray for unknown nodes
        return color;
    }

    // Get node group information
    getNodeGroup(nodeName) {
        const nodeInfo = this.nodeGroupMap[nodeName];
        return nodeInfo ? nodeInfo.group : "Unknown";
    }

    // Access Control Methods
    checkAccess(password) {
        const config = this.accessControl.config;
        
        // If password is empty string, skip password check (for dev/testing)
        if (!config.password || config.password === "") {
            return true;
        }
        
        // Check password (case-sensitive)
        if (password === config.password) {
            // Future: Add IP checking here if enableIPCheck is true
            if (config.enableIPCheck && config.ipWhitelist && config.ipWhitelist.length > 0) {
                // Placeholder for IP checking - would need backend or service
                const clientIP = this.getClientIP();
                if (clientIP && !config.ipWhitelist.includes(clientIP)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }

    isAuthorized() {
        return this.accessControl.isAuthorized;
    }

    authorize(password) {
        if (this.checkAccess(password)) {
            this.accessControl.isAuthorized = true;
            return true;
        }
        return false;
    }

    deauthorize() {
        this.accessControl.isAuthorized = false;
    }

    getClientIP() {
        // Placeholder for future IP detection
        // Would require backend service or API call
        return null;
    }

    // Clear all highlights and labels
    clearAllHighlightsAndLabels() {
        // Clear any active filters
        this.filteredNodeId = null;
        
        // Reset dropdown
        const nodeFilter = document.getElementById("nodeFilter");
        if (nodeFilter) {
            nodeFilter.value = "";
        }
        
        // Hide all relationship labels
        this.hideRelationshipLabel();
        
        // Remove any arrow relationship labels
        this.svg.selectAll(".arrow-relationship-label").remove();
        
        // Hide tooltips
        this.hideTooltip();
        
        // Restore normal view (clears all highlighting)
        this.restoreNormalView();
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
        
    }

    // Initialize the visualization
    init() {
        // Initialize access control config now that window.data should be available
        if (!this.accessControl.config) {
            this.accessControl.config = window.data?.accessControlConfig || { password: "", ipWhitelist: [], enableIPCheck: false };
        }
        
        this.setupSVG();
        this.setupTable();
        this.setupEventListeners();
        this.setupFilterDropdown();
        this.setupCombinedGroupFilterDropdown();
        this.setupRelationshipFilterDropdown();
        this.showDiagramView();
    }

    // Setup SVG and force simulation
    setupSVG() {
        const container = d3.select("#arrow-diagram");
        container.selectAll(".links, .nodes").remove();
        
        // Get container dimensions for responsive sizing
        const containerElement = container.node();
        const containerWidth = containerElement ? containerElement.getBoundingClientRect().width || this.config.width : this.config.width;
        const containerHeight = containerElement ? containerElement.getBoundingClientRect().height || this.config.height : this.config.height;
        
        // Store actual dimensions for calculations
        this.actualWidth = containerWidth;
        this.actualHeight = containerHeight;
        
        // Use viewBox for responsive scaling while maintaining aspect ratio
        this.svg = container
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.config.width} ${this.config.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
        
        // Add background click event to clear highlights and labels
        this.svg.on("click", (event) => {
            // Only clear if clicking on the background (not on nodes or links)
            if (event.target === this.svg.node()) {
                this.clearAllHighlightsAndLabels();
            }
        });
        
        // Add resize handler for responsive updates
        this.setupResizeHandler();
        
        this.createArrowMarkers();
        this.createForceSimulation();
        this.prepareDiagramData();
    }
    
    // Setup resize handler for responsive updates
    setupResizeHandler() {
        // Debounce resize events
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const container = d3.select("#arrow-diagram");
                const containerElement = container.node();
                if (containerElement) {
                    const containerWidth = containerElement.getBoundingClientRect().width || this.config.width;
                    const containerHeight = containerElement.getBoundingClientRect().height || this.config.height;
                    
                    this.actualWidth = containerWidth;
                    this.actualHeight = containerHeight;
                    
                    // Update simulation center if needed
                    if (this.simulation) {
                        this.simulation.force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2).strength(this.config.centerStrength * 0.3));
                        this.simulation.force("x", d3.forceX(this.config.width / 2).strength(this.config.xStrength * 0.2));
                        this.simulation.force("y", d3.forceY(this.config.height / 2).strength(this.config.yStrength * 0.15));
                        this.simulation.alpha(0.3).restart();
                    }
                }
            }, 250);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        
        // Store handler for cleanup if needed
        this._resizeHandler = handleResize;
    }

    // Create arrow markers for group colors
    createArrowMarkers() {
        let defs = this.svg.select("defs");
        if (defs.empty()) {
            defs = this.svg.append("defs");
            
            // Create markers for each entity group color
            Object.entries(this.groupColors).forEach(([groupName, colorValue]) => {
                const markerId = `arrowhead-${colorValue.replace('#', '')}`;
                if (!defs.select(`#${markerId}`).node()) {
                    defs.append("marker")
                        .attr("id", markerId)
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
                }
            });
            
            // Create markers for each relationship group color
            if (this.relationshipGroupColors) {
                Object.entries(this.relationshipGroupColors).forEach(([groupName, colorValue]) => {
                    const markerId = `arrowhead-${colorValue.replace('#', '')}`;
                    if (!defs.select(`#${markerId}`).node()) {
                        defs.append("marker")
                            .attr("id", markerId)
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
                    }
                });
            }
            
        }
    }

    // Create force simulation
    createForceSimulation() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(this.config.linkDistance).strength(0.8))
            .force("charge", d3.forceManyBody().strength(this.config.chargeStrength).distanceMax(400))
            .force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2).strength(this.config.centerStrength * 0.3))
            .force("collision", d3.forceCollide().radius(this.config.nodeRadius + 15))
            .force("x", d3.forceX(this.config.width / 2).strength(this.config.xStrength * 0.2))
            .force("y", d3.forceY(this.config.height / 2).strength(this.config.yStrength * 0.15))
            .force("radial", d3.forceRadial(300, this.config.width / 2, this.config.height / 2).strength(0.03))
            .force("arrowRepulsion", this.createArrowRepulsionForce());
    }

    // Create custom force for arrow repulsion when labels are too close
    createArrowRepulsionForce() {
        const force = (alpha) => {
            if (!this._labelsVisible) return;
            
            // Get all visible labels
            const labels = this.svg.selectAll(".relationship-label-group").nodes();
            const labelData = labels.map(label => {
                const rect = d3.select(label).select("rect");
                const bbox = rect.node().getBBox();
                return {
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height / 2,
                    width: bbox.width,
                    height: bbox.height,
                    element: label
                };
            });

            // Check for collisions and apply repulsion
            for (let i = 0; i < labelData.length; i++) {
                for (let j = i + 1; j < labelData.length; j++) {
                    const label1 = labelData[i];
                    const label2 = labelData[j];
                    
                    // Calculate distance between label centers
                    const dx = label1.x - label2.x;
                    const dy = label1.y - label2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Minimum distance to avoid collision (label width + padding)
                    const minDistance = Math.max(label1.width, label2.width) + 20;
                    
                    if (distance < minDistance && distance > 0) {
                        // Calculate repulsion force
                        const force = (minDistance - distance) / minDistance;
                        const angle = Math.atan2(dy, dx);
                        
                        // Apply repulsion to the nodes connected by these labels
                        this.applyLabelRepulsion(label1, label2, force, angle, alpha);
                    }
                }
            }
        };
        
        force.initialize = () => {}; // No initialization needed
        return force;
    }

    // Apply repulsion force to nodes when their labels collide
    applyLabelRepulsion(label1, label2, force, angle, alpha) {
        // Find the links associated with these labels
        const link1 = this.findLinkForLabel(label1.element);
        const link2 = this.findLinkForLabel(label2.element);
        
        if (!link1 || !link2) return;
        
        // Apply repulsion to the source nodes of the links
        const repulsionStrength = force * alpha * 0.1;
        
        // Repel source nodes away from each other
        if (link1.source && link2.source) {
            const dx = Math.cos(angle) * repulsionStrength;
            const dy = Math.sin(angle) * repulsionStrength;
            
            link1.source.vx = (link1.source.vx || 0) + dx;
            link1.source.vy = (link1.source.vy || 0) + dy;
            link2.source.vx = (link2.source.vx || 0) - dx;
            link2.source.vy = (link2.source.vy || 0) - dy;
        }
    }

    // Find the link data associated with a label element
    findLinkForLabel(labelElement) {
        const linkData = d3.select(labelElement).datum();
        if (linkData && linkData.source && linkData.target) {
            return linkData;
        }
        return null;
    }

    // Avoid label collisions by adjusting positions
    avoidLabelCollisions() {
        if (!this._labelsVisible) return;
        
        const labels = this.svg.selectAll(".relationship-label-group").nodes();
        const labelData = labels.map(label => {
            const rect = d3.select(label).select("rect");
            const bbox = rect.node().getBBox();
            return {
                x: bbox.x + bbox.width / 2,
                y: bbox.y + bbox.height / 2,
                width: bbox.width,
                height: bbox.height,
                element: label,
                originalX: bbox.x + bbox.width / 2,
                originalY: bbox.y + bbox.height / 2
            };
        });

        // Apply collision avoidance
        for (let i = 0; i < labelData.length; i++) {
            for (let j = i + 1; j < labelData.length; j++) {
                const label1 = labelData[i];
                const label2 = labelData[j];
                
                const dx = label1.x - label2.x;
                const dy = label1.y - label2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const minDistance = Math.max(label1.width, label2.width) + 20;
                
                if (distance < minDistance && distance > 0) {
                    // Calculate separation vector
                    const separation = (minDistance - distance) / 2;
                    const angle = Math.atan2(dy, dx);
                    
                    const offsetX = Math.cos(angle) * separation;
                    const offsetY = Math.sin(angle) * separation;
                    
                    // Apply offset to labels
                    label1.x += offsetX;
                    label1.y += offsetY;
                    label2.x -= offsetX;
                    label2.y -= offsetY;
                    
                    // Update label positions
                    this.updateLabelPosition(label1.element, label1.x, label1.y);
                    this.updateLabelPosition(label2.element, label2.x, label2.y);
                }
            }
        }
    }

    // Update the position of a specific label
    updateLabelPosition(labelElement, x, y) {
        const group = d3.select(labelElement);
        const rect = group.select("rect");
        const text = group.select("text");
        
        if (rect.node() && text.node()) {
            const padding = 8;
            const textWidth = text.text().length * 8;
            const textHeight = 16;
            
            rect
                .attr("x", x - (textWidth/2) - padding)
                .attr("y", y - (textHeight/2) - padding/2);
            
            text
                .attr("x", x)
                .attr("y", y);
        }
    }

    // Create a self-looping path for nodes that connect to themselves
    createSelfLoopPath(d, loopIndex = 0) {
        const nodeRadius = this.config.nodeRadius;
        const baseLoopRadius = nodeRadius + 20; // Base loop radius
        const loopSpacing = 15; // Spacing between concentric loops
        const loopRadius = baseLoopRadius + (loopIndex * loopSpacing);
        
        // Calculate loop center (above the node)
        const centerX = d.source.x;
        const centerY = d.source.y - loopRadius;
        
        // Create a circular path that loops back to the node
        // Start from the right side of the node, curve up and around, then back to the left side
        const startX = d.source.x + nodeRadius;
        const startY = d.source.y;
        const endX = d.source.x - nodeRadius;
        const endY = d.source.y;
        
        // Create a smooth arc that goes from right side, up and around, to left side
        const path = `M${startX},${startY} A${loopRadius},${loopRadius} 0 1,1 ${endX},${endY}`;
        
        return path;
    }

    // Prepare data for the arrow diagram
    prepareDiagramData() {
        const entities = window.helpers.createUniqueNodes(this.judicialEntityMapData, this.groupingData);
        const diagramLinks = window.helpers.createDiagramLinks(this.judicialEntityMapData, entities);
        
        // Store diagramLinks as class property for use in calculateNodeWeights
        this.diagramLinks = diagramLinks;
        
        
        // Set initial positions for all nodes to prevent distortion on launch
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;
        const horizontalPadding = this.config.nodeRadius + 10;
        const verticalPadding = this.config.nodeRadius + 10;
        const semiMajor = (this.config.width / 2) - horizontalPadding;  // Allow nodes near left/right edges
        const semiMinor = (this.config.height / 2) - verticalPadding;   // Allow nodes near top/bottom edges
        const rotation = Math.PI / 12; // 15 degrees rotation
        
        entities.forEach((d, i) => {
            const numNodes = entities.length;
            const angle = (i / numNodes) * 2 * Math.PI;
            const rotatedAngle = angle + rotation;
            
            // Calculate elliptical position
            d.x = centerX + semiMajor * Math.cos(rotatedAngle);
            d.y = centerY + semiMinor * Math.sin(rotatedAngle);
            
            // Ensure nodes are within bounds
            const margin = this.config.nodeRadius;
            d.x = Math.max(margin, Math.min(this.config.width - margin, d.x));
            d.y = Math.max(margin, Math.min(this.config.height - margin, d.y));
        });
        
        this.simulation.nodes(entities);
        this.simulation.force("link").links(diagramLinks);
        
        this.createLinkElements(diagramLinks);
        this.createNodeElements(entities);
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
            .attr("class", d => `link`)
            .attr("marker-end", d => {
                // Use relationship group color if available, otherwise use source node color
                const relationshipLabel = d.label || d.relationshipLabel;
                const linkColor = relationshipLabel && this.relationshipGroupMap[relationshipLabel] 
                    ? this.getRelationshipGroupColor(relationshipLabel)
                    : this.getNodeColor(d.source.name);
                const markerId = `arrowhead-${linkColor.replace('#', '')}`;
                return `url(#${markerId})`;
            })
            .attr("stroke", d => {
                // Use relationship group color if available, otherwise use source node color
                const relationshipLabel = d.label || d.relationshipLabel;
                return relationshipLabel && this.relationshipGroupMap[relationshipLabel] 
                    ? this.getRelationshipGroupColor(relationshipLabel)
                    : this.getNodeColor(d.source.name);
            })
            .attr("stroke-dasharray", d => {
                // Use dotted lines for process-flow relationships
                return (d.isProcessFlow || d.source?.isProcessFlow || d.target?.isProcessFlow) ? "5,5" : null;
            })
            .attr("fill", "none")
            .style("opacity", 0)
            .attr("stroke-width", 2);
        
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
            .attr("transform", d => `translate(${d.x || this.config.width / 2}, ${d.y || this.config.height / 2})`)
            .call(this.createDragBehavior());

        // Add black center circle for each node (created first, so it's behind)
        this.nodeElements.append("circle")
            .attr("class", "node-center")
            .attr("r", this.config.nodeRadius)
            .style("fill", "#000")
            .style("stroke", "#fff")
            .style("stroke-width", 2);
        
        // Add colored circle around each node (larger, group-colored, created second so it's on top)
        this.nodeElements.append("circle")
            .attr("class", "node-group-circle")
            .attr("r", this.config.nodeRadius + 3)
            .style("fill", "none")
            .style("stroke", d => this.getNodeColor(d.name))
            .style("stroke-width", 3)
            .style("stroke-dasharray", d => {
                // Use dotted circles for process-flow entities
                return (d.isProcessFlowEntity) ? "3,3" : null;
            });

        // Add text labels to nodes with intelligent positioning
        this.nodeElements.append("text")
            .attr("class", "node-text")
            .attr("dx", 8)
            .attr("dy", 0)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
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
        
        this.judicialEntityMapData.forEach(link => {
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
        
        // Allow free dragging - only constrain to SVG bounds
        let newX = event.x;
        let newY = event.y;
        
        // Ensure nodes stay within SVG bounds
        // Use minimal margins to allow nodes to reach the edges of the container
        // Only constrain by node radius to keep the node itself visible
        const margin = nodeRadius;
        if (newX < margin) newX = margin;
        if (newX > this.config.width - margin) newX = this.config.width - margin;
        if (newY < margin) newY = margin;
        if (newY > this.config.height - margin) newY = this.config.height - margin;
        
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
        
        // Update label positions more frequently during drag to maintain visibility
        if (!d._labelUpdateScheduled) {
            d._labelUpdateScheduled = true;
            this.updateRelationshipLabels();
            
            // Apply collision avoidance for labels during drag
            this.avoidLabelCollisions();
            
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
        
        // Keep the node at its dragged position (don't release it back to elliptical constraints)
        // d.fx and d.fy remain set to keep the node fixed at its dragged position
        
        const connectedNodeIds = d._connectedNodes || new Set([d.id]);
        this.simulation.nodes().forEach(node => {
            if (!connectedNodeIds.has(node.id)) {
                node.fx = null;
                node.fy = null;
            }
        });
        
        delete d._connectedNodes;
        
        this.removeHighlighting();
        
        // Keep labels visible after drag ends - they'll be hidden when mouse leaves
    }

    // Calculate node weights based on number of connections
    calculateNodeWeights(nodes) {
        const weights = {};
        
        // Safety check - return empty weights if diagramLinks not available yet
        if (!this.diagramLinks || !Array.isArray(this.diagramLinks)) {
            console.warn("diagramLinks not available yet, returning empty weights");
            return weights;
        }
        
        // Count connections for each node
        this.diagramLinks.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            
            weights[sourceId] = (weights[sourceId] || 0) + 1;
            weights[targetId] = (weights[targetId] || 0) + 1;
        });
        
        // Normalize weights to 0-1 range
        const maxConnections = Math.max(...Object.values(weights));
        const minConnections = Math.min(...Object.values(weights));
        const weightRange = maxConnections - minConnections;
        
        Object.keys(weights).forEach(nodeId => {
            if (weightRange > 0) {
                weights[nodeId] = (weights[nodeId] - minConnections) / weightRange;
            } else {
                weights[nodeId] = 0.5; // All nodes have same weight
            }
        });
        
        return weights;
    }

    // Update positions during simulation
    ticked() {
        const nodeRadius = this.config.nodeRadius;
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;
        
        // Define elliptical boundaries (horizontal major axis, vertical minor axis)
        // Outer ellipse hugs the container minus a small padding so nodes/paths can reach the edges
        const horizontalPadding = nodeRadius + 10;
        const verticalPadding = nodeRadius + 10;
        const outerSemiMajor = (this.config.width / 2) - horizontalPadding;
        const outerSemiMinor = (this.config.height / 2) - verticalPadding;
        const innerSemiMajor = outerSemiMajor * 0.45;  // Keep well-connected nodes near center
        const innerSemiMinor = outerSemiMinor * 0.45;
        
        // Calculate node weights based on connections
        const nodes = this.simulation.nodes();
        const nodeWeights = this.calculateNodeWeights(nodes);
        
        nodes.forEach((d, i) => {
            // Only apply elliptical constraints to nodes that are NOT being dragged
            if (d.fx === undefined && d.fy === undefined) {
                // Get node weight (0 = least connected, 1 = most connected)
                const weight = nodeWeights[d.id] || 0;
                
                // Calculate elliptical distance from center
                const dx = d.x - centerX;
                const dy = d.y - centerY;
                
                // Calculate target ellipse based on weight
                // Higher weight = closer to center (smaller ellipse)
                const targetSemiMajor = innerSemiMajor + (outerSemiMajor - innerSemiMajor) * (1 - weight);
                const targetSemiMinor = innerSemiMinor + (outerSemiMinor - innerSemiMinor) * (1 - weight);
                
                const targetEllipseDist = (dx * dx) / (targetSemiMajor * targetSemiMajor) + (dy * dy) / (targetSemiMinor * targetSemiMinor);
                
                // If node is outside its target ellipse, project it back
                if (targetEllipseDist > 1) {
                    // Calculate parametric angle for even distribution around target ellipse
                    // Use node index to ensure consistent positioning
                    const baseAngle = (2 * Math.PI * i) / nodes.length;
                    // Add slight randomization based on weight to avoid perfect alignment
                    const angleVariation = (weight - 0.5) * 0.3; // ±0.15 radians variation
                    const parametricAngle = baseAngle + angleVariation;
                    
                    // Add slight rotation (15 degrees) for slanted-line effect to improve label readability
                    const rotation = Math.PI / 12; // 15 degrees
                    const rotatedAngle = parametricAngle + rotation;
                    
                    d.x = centerX + targetSemiMajor * Math.cos(rotatedAngle);
                    d.y = centerY + targetSemiMinor * Math.sin(rotatedAngle);
                }
            }
            
            // Ensure all nodes stay within SVG bounds (both dragged and non-dragged)
            // Use minimal margins to allow nodes to reach the edges of the container
            // Only constrain by node radius to keep the node itself visible
            const margin = nodeRadius;
            if (d.x < margin) d.x = margin;
            if (d.x > this.config.width - margin) d.x = this.config.width - margin;
            if (d.y < margin) d.y = margin;
            if (d.y > this.config.height - margin) d.y = this.config.height - margin;
        });
        
        this.linkElements
            .attr("d", d => {
                if (!d.source || !d.target || d.source.x === undefined || d.target.x === undefined) {
                    console.warn("Invalid link data:", d);
                    return "M0,0L0,0";
                }
                
                // Check if this is a self-loop (source and target are the same)
                if (d.source.id === d.target.id) {
                    // Get the loop index for this self-loop
                    const loopIndex = d.loopIndex || 0;
                    return this.createSelfLoopPath(d, loopIndex);
                }
                
                // Regular curved path for different nodes
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                
                const sweep = dx < 0 ? 0 : 1;
                const path = `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${sweep} ${d.target.x},${d.target.y}`;
                return path;
            })
            .attr("stroke-dasharray", d => {
                // Preserve dotted lines for process-flow relationships
                return (d.isProcessFlow) ? "5,5" : null;
            });
        
        this.nodeElements
            .attr("transform", d => `translate(${d.x},${d.y})`);
        
        // Update dotted circles for process-flow entities
        this.nodeElements.selectAll("circle.node-group-circle")
            .style("stroke-dasharray", function(d) {
                // Preserve dotted circles for process-flow entities during updates
                const nodeData = d3.select(this.parentNode).datum();
                return (nodeData && nodeData.isProcessFlowEntity) ? "3,3" : null;
            });
        
        // Update relationship labels if they're visible
        if (this._labelsVisible) {
            this.updateRelationshipLabels();
            // Apply collision avoidance for labels
            this.avoidLabelCollisions();
        }
        
        // Optimize label positions more frequently to prevent overlaps
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.optimizeNodeLabelPositions();
            }, 0);
        }
    }

    // Add interactivity to nodes and links
    addInteractivity() {
        // No need to store filter opacity here - it's already stored in applyFilters()
        // This function is kept for potential future use but not called

        this.nodeElements
            .on("mouseover", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                this.hoveredElement = { type: 'node', data: d };
                
                // Only highlight the hovered node, preserve filter state for others
                this.nodeElements
                    .style("opacity", (node) => {
                        if (node.id === d.id) {
                            return 1; // Full opacity for hovered node
                        }
                        // Return to stored filter opacity for other nodes
                        // If no filter state stored (no filters active), default to 1
                        return this.filterOpacityState.get(node.id) !== undefined 
                            ? this.filterOpacityState.get(node.id) 
                            : 1;
                    });
                
                // Highlight connected links
                this.linkElements
                    .style("opacity", (link) => {
                        if (link.source.id === d.id || link.target.id === d.id) {
                            return 1; // Full opacity for connected links
                        }
                        // Return to stored filter opacity for other links
                        const linkId = `${link.source.id}-${link.target.id}-${link.label}`;
                        return this.filterOpacityState.get(linkId) !== undefined 
                            ? this.filterOpacityState.get(linkId) 
                            : 1;
                    });
                
                // Show tethered labels for this node's relationships on hover
                this.showNodeRelationshipLabels(d);
            })
            .on("mouseout", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                this.hoveredElement = null;
                
                // Restore filter state
                this.restoreFilterState();
                
                // Hide relationship labels when mouse leaves node with a small delay
                setTimeout(() => {
                    this.hideRelationshipLabel();
                }, 100);
            })
            .on("dblclick", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                // Double-click to reset all filters
                this.clearAllFilters();
            })
            .on("click", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                // Single click behavior can remain for other purposes if needed
            });

        this.linkElements
            .on("mouseover", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                this.hoveredElement = { type: 'link', data: d };
                
                // Only highlight the hovered link and its connected nodes, preserve filter state for others
                this.linkElements
                    .style("opacity", (link) => {
                        if (link === d) {
                            return 1; // Full opacity for hovered link
                        }
                        // Return to stored filter opacity for other links
                        const linkId = `${link.source.id}-${link.target.id}-${link.label}`;
                        return this.filterOpacityState.get(linkId) !== undefined 
                            ? this.filterOpacityState.get(linkId) 
                            : 1;
                    });
                
                // Highlight connected nodes
                this.nodeElements
                    .style("opacity", (node) => {
                        if (node.id === d.source.id || node.id === d.target.id) {
                            return 1; // Full opacity for connected nodes
                        }
                        // Return to stored filter opacity for other nodes
                        return this.filterOpacityState.get(node.id) !== undefined 
                            ? this.filterOpacityState.get(node.id) 
                            : 1;
                    });
                
                // Enhance hovered link appearance
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 2.5);
                
                // Show the simple relationship label for this specific arrow
                this.showArrowRelationshipLabel(d, event.currentTarget);
                
                // Also show the complex label in the corner
                this.showTooltip(event, `${d.source.name} → ${d.target.name}: ${d.label}`);
            })
            .on("mouseout", (event, d) => {
                event.stopPropagation(); // Prevent bubbling to background
                this.hoveredElement = null;
                
                // Restore filter state
                this.restoreFilterState();
                
                // Restore link stroke width
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 1.5);
                this.hideTooltip();
                
                // Hide the arrow relationship label
                this.svg.selectAll(".arrow-relationship-label").remove();
            });
        
        // Add double-click handler to SVG background to reset filters
        this.svg
            .on("dblclick", (event) => {
                // Only reset if clicking on background (not on nodes/links)
                if (event.target === this.svg.node() || event.target.tagName === 'svg') {
                    this.clearAllFilters();
                }
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
        const container = document.querySelector('.container');
        
        // Remove class to show legend and project note
        if (container) {
            container.classList.remove('table-view-active');
        }
        
        tableView.classList.remove("active");
        tableView.classList.add("fade-out");
        
        setTimeout(() => {
            diagramView.classList.add("active");
            
            // Reapply filters first to restore filter state before transitions
            // This ensures the correct opacity is set based on active filters
            if (this.filteredNodeId || this.filteredEntityGroupId || this.filteredRelationshipId || this.filteredRelationshipGroupId) {
                this.applyFilters();
            } else {
                // If no filters, set all to full opacity
                this.nodeElements.style("opacity", 1);
                this.linkElements.style("opacity", 1);
            }
            
            this.nodeElements
                .each(function(d, i) {
                    const numNodes = this.nodeElements.size();
                    const centerX = this.config.width / 2;
                    const centerY = this.config.height / 2;
                    
                    // Create elliptical distribution for better label readability
                    // Push nodes close to the SVG boundary while keeping slight padding
                    const horizontalPadding = this.config.nodeRadius + 10;
                    const verticalPadding = this.config.nodeRadius + 10;
                    const semiMajor = (this.config.width / 2) - horizontalPadding;
                    const semiMinor = (this.config.height / 2) - verticalPadding;
                    
                    // Distribute nodes evenly around ellipse
                    const angle = (i / numNodes) * 2 * Math.PI;
                    
                    // Add slight rotation (15 degrees) for slanted-line effect
                    const rotation = Math.PI / 12; // 15 degrees
                    const rotatedAngle = angle + rotation;
                    
                    // Calculate elliptical position
                    d.x = centerX + semiMajor * Math.cos(rotatedAngle);
                    d.y = centerY + semiMinor * Math.sin(rotatedAngle);
                    
                    // Use minimal margin (just nodeRadius) to allow nodes to reach edges
                    const margin = this.config.nodeRadius;
                    d.x = Math.max(margin, Math.min(this.config.width - margin, d.x));
                    d.y = Math.max(margin, Math.min(this.config.height - margin, d.y));
                }.bind(this))
                .transition()
                .duration(800)
                .delay((d, i) => i * 100)
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
            
            this.linkElements
                .transition()
                .duration(800)
                .delay(400);
            
            this.simulation.on("tick", () => this.ticked());
            this.simulation.alpha(1).restart();
            
            
            setTimeout(() => {
                toggleBtn.disabled = false;
                this.isAnimating = false;
                this.currentView = 'diagram';
                
                // Ensure filters are still applied after simulation stabilizes
                if (this.filteredNodeId || this.filteredEntityGroupId || this.filteredRelationshipId || this.filteredRelationshipGroupId) {
                    this.applyFilters();
                }
                
                // Optimize label positions after simulation stabilizes
                setTimeout(() => {
                    this.optimizeNodeLabelPositions();
                }, 500);
                
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
        
        // Get data - use editableData if in edit mode, otherwise use original data
        let dataSource;
        if (this.isEditMode && this.editableData && this.editableData.length > 0) {
            dataSource = this.editableData;
        } else {
            dataSource = this.judicialEntityMapData;
        }
        
        if (!dataSource || !dataSource.length) {
            // Fallback to window.data
            dataSource = window.data?.judicialEntityMapData;
        }
        
        if (!dataSource || !dataSource.length) {
            console.error('No data available for table!');
            // Show error message in table
            const colspan = this.isEditMode ? 4 : 3;
            tableBody.append("tr")
                .append("td")
                .attr("colspan", colspan)
                .text("No data available")
                .style("text-align", "center")
                .style("padding", "20px")
                .style("color", "#999");
            return;
        }
        
        // Get filtered data if filter is active (only in view mode)
        let dataToShow;
        if (this.isEditMode) {
            // In edit mode, show all editable data (no filtering)
            dataToShow = dataSource;
        } else {
            // In view mode, apply filters
            if (window.helpers && window.helpers.getFilteredTableData) {
                dataToShow = window.helpers.getFilteredTableData(dataSource, this.filteredNodeId, this.filteredEntityGroupId, this.filteredRelationshipId, this.filteredRelationshipGroupId, this.relationshipGroupingData || window.data?.relationshipGroupingData, this.groupingData || window.data?.groupingData);
            } else {
                // Fallback filtering
                dataToShow = dataSource.filter(link => {
                    const matchesNode = !this.filteredNodeId || 
                        link.source === this.filteredNodeId || 
                        link.target === this.filteredNodeId;
                    const matchesRelationship = !this.filteredRelationshipId || 
                        link.label === this.filteredRelationshipId;
                    return matchesNode && matchesRelationship;
                });
            }
        }
        
        if (!dataToShow || dataToShow.length === 0) {
            console.warn('No filtered data to display in table');
            const colspan = this.isEditMode ? 4 : 3;
            tableBody.append("tr")
                .append("td")
                .attr("colspan", colspan)
                .text("No data matches the current filter")
                .style("text-align", "center")
                .style("padding", "20px")
                .style("color", "#999");
            return;
        }
        
        // Create rows for each relationship
        const rows = tableBody.selectAll("tr")
            .data(dataToShow, (d, i) => i) // Use index as key for stable binding
            .enter()
            .append("tr")
            .attr("class", "table-row")
            .attr("data-index", (d, i) => i)
            .style("opacity", 0);
        
        // Add cells for each row
        const self = this;
        rows.each(function(d, rowIndex) {
            if (!d) {
                console.warn('Invalid data item:', d);
                return;
            }
            const row = d3.select(this);
            
            if (self.isEditMode) {
                // Edit mode: create editable cells
                // Source cell
                const sourceCell = row.append("td").attr("class", "editable-cell");
                sourceCell.append("input")
                    .attr("type", "text")
                    .attr("class", "cell-input")
                    .attr("value", d.source || '')
                    .on("blur", function() {
                        const newValue = d3.select(this).property("value");
                        self.saveRowChanges(rowIndex, newValue, d.label, d.target);
                    })
                    .on("keydown", function(event) {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            this.blur();
                        }
                    });
                
                // Relationship cell
                const labelCell = row.append("td").attr("class", "editable-cell");
                labelCell.append("input")
                    .attr("type", "text")
                    .attr("class", "cell-input")
                    .attr("value", d.label || '')
                    .on("blur", function() {
                        const newValue = d3.select(this).property("value");
                        self.saveRowChanges(rowIndex, d.source, newValue, d.target);
                    })
                    .on("keydown", function(event) {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            this.blur();
                        }
                    });
                
                // Target cell
                const targetCell = row.append("td").attr("class", "editable-cell");
                targetCell.append("input")
                    .attr("type", "text")
                    .attr("class", "cell-input")
                    .attr("value", d.target || '')
                    .on("blur", function() {
                        const newValue = d3.select(this).property("value");
                        self.saveRowChanges(rowIndex, d.source, d.label, newValue);
                    })
                    .on("keydown", function(event) {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            this.blur();
                        }
                    });
                
                // Actions cell
                const actionsCell = row.append("td").attr("class", "action-buttons");
                const editBtn = actionsCell.append("button")
                    .attr("class", "btn-edit-row")
                    .text("Edit")
                    .on("click", function(event) {
                        event.stopPropagation();
                        self.openEditModal(d, rowIndex);
                    });
                const deleteBtn = actionsCell.append("button")
                    .attr("class", "btn-delete-row")
                    .text("Delete")
                    .on("click", function(event) {
                        event.stopPropagation();
                        if (confirm("Are you sure you want to delete this row?")) {
                            self.deleteRow(rowIndex);
                        }
                    });
                
                // Make row clickable to open modal
                row.style("cursor", "pointer")
                    .on("click", function() {
                        self.openEditModal(d, rowIndex);
                    });
            } else {
                // View mode: create read-only cells
                row.append("td").text(d.source || 'N/A');
                row.append("td").text(d.label || 'N/A');
                row.append("td").text(d.target || 'N/A');
            }
        });
        
        // Fade in rows
        rows.transition()
            .duration(500)
            .style("opacity", 1);
        
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById("toggleViewBtn").addEventListener("click", () => this.toggleView());
        document.getElementById("nodeFilter").addEventListener("change", (event) => this.handleNodeFilter(event));
        document.getElementById("relationshipFilter").addEventListener("change", (event) => this.handleRelationshipFilter(event));
        const groupFilter = document.getElementById("groupFilter");
        if (groupFilter) {
            groupFilter.addEventListener("change", (event) => this.handleGroupFilter(event));
        }
        document.getElementById("clearFilter").addEventListener("click", () => this.clearAllFilters());
        
        // Edit Table button (only if not in read-only mode)
        const editTableBtn = document.getElementById("editTableBtn");
        if (editTableBtn && !this.readOnly) {
            editTableBtn.addEventListener("click", () => this.toggleEditMode());
        } else if (editTableBtn && this.readOnly) {
            // Hide edit button in read-only mode
            editTableBtn.style.display = 'none';
        }
        
        // Add Row button
        const addRowBtn = document.getElementById("addRowBtn");
        if (addRowBtn) {
            addRowBtn.addEventListener("click", () => this.addNewRow());
        }
        
        // Download as Excel button
        const downloadExcelBtn = document.getElementById("downloadExcelBtn");
        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener("click", () => this.downloadTableAsExcel());
        }
        
        // Share/Embed button
        const shareEmbedBtn = document.getElementById("shareEmbedBtn");
        if (shareEmbedBtn) {
            shareEmbedBtn.addEventListener("click", () => this.showShareEmbedModal());
        }
        
        // Share/Embed modal close button
        const shareEmbedClose = document.getElementById("share-embed-close");
        if (shareEmbedClose) {
            shareEmbedClose.addEventListener("click", () => this.hideShareEmbedModal());
        }
        
        // Copy embed code button
        const copyEmbedCodeBtn = document.getElementById("copy-embed-code");
        if (copyEmbedCodeBtn) {
            copyEmbedCodeBtn.addEventListener("click", () => this.copyEmbedCode());
        }
    }
    
    // Share/Embed Modal Methods
    showShareEmbedModal() {
        const modal = document.getElementById("share-embed-modal");
        const embedCodeTextarea = document.getElementById("embed-code");
        
        if (!modal || !embedCodeTextarea) {
            console.error('Share/Embed modal elements not found');
            return;
        }
        
        // Generate embed code
        const currentUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
        const embedCode = `<!-- Legal System Visualization Embed -->
<div id="legal-system-viz" style="width: 100%; height: 700px; border: 1px solid #ddd; border-radius: 4px;"></div>

<!-- Include D3.js -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Include CSS -->
<link rel="stylesheet" href="${currentUrl}/style.css">

<!-- Include required scripts -->
<script src="${currentUrl}/data.js"></script>
<script src="${currentUrl}/helpers.js"></script>
<script src="${currentUrl}/network-diagram.js"></script>
<script src="${currentUrl}/embed.js"></script>

<!-- Initialize visualization -->
<script>
  LegalSystemEmbed.init({
    container: '#legal-system-viz',
    view: 'diagram',
    showFilters: true
  });
</script>`;
        
        embedCodeTextarea.value = embedCode;
        modal.style.display = 'flex';
    }
    
    hideShareEmbedModal() {
        const modal = document.getElementById("share-embed-modal");
        const copySuccess = document.getElementById("copy-success");
        
        if (modal) {
            modal.style.display = 'none';
        }
        if (copySuccess) {
            copySuccess.style.display = 'none';
        }
    }
    
    copyEmbedCode() {
        const embedCodeTextarea = document.getElementById("embed-code");
        const copySuccess = document.getElementById("copy-success");
        
        if (!embedCodeTextarea) {
            return;
        }
        
        // Select and copy text
        embedCodeTextarea.select();
        embedCodeTextarea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            
            // Show success message
            if (copySuccess) {
                copySuccess.style.display = 'inline';
                setTimeout(() => {
                    copySuccess.style.display = 'none';
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
            // Fallback: try modern clipboard API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(embedCodeTextarea.value).then(() => {
                    if (copySuccess) {
                        copySuccess.style.display = 'inline';
                        setTimeout(() => {
                            copySuccess.style.display = 'none';
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('Failed to copy to clipboard:', err);
                });
            }
        }
    }

    // Toggle between grouped and ungrouped view
    toggleGrouping() {
        if (this.isGrouped) {
            this.expandGroups();
        } else {
            this.collapseToGroups();
        }
    }

    // Collapse nodes into group circles
    collapseToGroups() {
        if (this.isGrouped || this.isAnimating) return;
        
        
        this.isAnimating = true;
        this.isGrouped = true;
        
        // Hide individual nodes and links
        this.nodeElements
            .transition()
            .duration(500)
            .style("opacity", 0);
        
        this.linkElements
            .transition()
            .duration(500)
            .style("opacity", 0);
        
        // Hide labels
        this.hideRelationshipLabel();
        
        // Create group circles
        this.createGroupCircles();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Expand groups back to individual nodes
    expandGroups() {
        if (!this.isGrouped || this.isAnimating) return;
        
        this.isAnimating = true;
        this.isGrouped = false;
        
        // Remove group circles
        this.removeGroupCircles();
        
        // Show individual nodes and links
        this.nodeElements
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        this.linkElements
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Create group circles for each category
    createGroupCircles() {
        // Group nodes by their belongsTo category
        const groups = {};
        this.nodeElements.each(function(d) {
            const groupKey = d.belongsTo || "Unknown";
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(d);
        });
        
        // Create group circles
        const groupData = Object.entries(groups).map(([groupKey, nodes]) => ({
            key: groupKey,
            nodes: nodes,
            label: this.getGroupLabel(groupKey),
            color: this.getGroupColor(groupKey),
            x: this.config.width / 2,
            y: this.config.height / 2
        }));
        
        // Position groups in a circle
        groupData.forEach((group, i) => {
            const angle = (i / groupData.length) * 2 * Math.PI;
            const radius = Math.min(this.config.width, this.config.height) * 0.25;
            const centerX = this.config.width / 2;
            const centerY = this.config.height / 2;
            
            group.x = centerX + Math.cos(angle) * radius;
            group.y = centerY + Math.sin(angle) * radius;
        });
        
        // Create group elements
        this.groupElements = this.svg.selectAll(".group-circle")
            .data(groupData)
            .enter()
            .append("g")
            .attr("class", "group-circle")
            .style("opacity", 0);
        
        // Add group circle background
        this.groupElements.append("circle")
            .attr("class", "group-background")
            .attr("r", 60)
            .style("fill", d => d.color)
            .style("stroke", "#fff")
            .style("stroke-width", 3)
            .style("opacity", 0.8);
        
        // Add group circle border
        this.groupElements.append("circle")
            .attr("class", "group-border")
            .attr("r", 65)
            .style("fill", "none")
            .style("stroke", d => d.color)
            .style("stroke-width", 4);
        
        // Add group label
        this.groupElements.append("text")
            .attr("class", "group-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#fff")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
            .text(d => d.label);
        
        // Add node count
        this.groupElements.append("text")
            .attr("class", "group-count")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("dy", 20)
            .style("font-size", "12px")
            .style("font-weight", "normal")
            .style("fill", "#fff")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
            .text(d => `${d.nodes.length} nodes`);
        
        // Position and animate group circles
        this.groupElements
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        // Add click functionality to group circles
        this.groupElements
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                this.expandSpecificGroup(d);
            });
    }

    // Remove group circles
    removeGroupCircles() {
        if (this.groupElements) {
            this.groupElements
                .transition()
                .duration(500)
                .style("opacity", 0)
                .remove();
            this.groupElements = null;
        }
    }

    // Expand a specific group to show its nodes
    expandSpecificGroup(groupData) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Remove all group circles
        this.removeGroupCircles();
        
        // Show only the nodes from this group
        this.nodeElements
            .style("opacity", d => d.belongsTo === groupData.key ? 1 : 0);
        
        this.linkElements
            .style("opacity", d => {
                const sourceGroup = d.source.belongsTo;
                const targetGroup = d.target.belongsTo;
                return (sourceGroup === groupData.key || targetGroup === groupData.key) ? 1 : 0;
            });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Get group label from group key
    getGroupLabel(groupKey) {
        const groupLabels = {
            ":LegislativeAndRegulatory": "Legislative & Regulatory",
            ":Judiciary": "Judiciary",
            ":TribunalsAndArbitration": "Tribunals & Arbitration",
            ":PeopleAndOfficeholders": "People & Officeholders",
            ":LegalFramework": "Legal Framework",
            ":NonAdministrativeEntities": "Non-Administrative"
        };
        return groupLabels[groupKey] || groupKey.replace(":", "");
    }

    // Get group color from group key
    getGroupColor(groupKey) {
        return this.groupColors[groupKey] || "#999999";
    }

    // Setup filter dropdown
    setupFilterDropdown() {
        const nodeFilter = document.getElementById("nodeFilter");
        
        // Get unique node names
        const uniqueNodes = [...new Set([
            ...this.judicialEntityMapData.map(d => d.source),
            ...this.judicialEntityMapData.map(d => d.target)
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

    // Setup combined group filter dropdown (entity groups and relationship groups)
    setupCombinedGroupFilterDropdown() {
        const groupFilter = document.getElementById("groupFilter");
        
        if (!groupFilter) {
            console.warn('Group filter element not found');
            return;
        }
        
        // Clear existing options
        groupFilter.innerHTML = '<option value="">Show All Groups</option>';
        
        // Get entity groups
        const entityGroups = {};
        if (this.groupingData && this.groupingData.length > 0) {
            this.groupingData.forEach(item => {
                if (!entityGroups[item.belongsTo]) {
                    entityGroups[item.belongsTo] = [];
                }
                entityGroups[item.belongsTo].push(item.node);
            });
        }
        
        // Get relationship groups
        const relationshipGroups = {};
        if (this.relationshipGroupingData && this.relationshipGroupingData.length > 0) {
            this.relationshipGroupingData.forEach(item => {
                if (!relationshipGroups[item.belongsTo]) {
                    relationshipGroups[item.belongsTo] = [];
                }
                relationshipGroups[item.belongsTo].push(item.relationship);
            });
        }
        
        // Create Entity Groups optgroup
        const entityOptgroup = document.createElement("optgroup");
        entityOptgroup.label = "Entity Groups";
        
        const entityGroupNames = Object.keys(entityGroups).sort();
        entityGroupNames.forEach(groupName => {
            const option = document.createElement("option");
            option.value = `entity:${groupName}`;
            option.textContent = groupName;
            entityOptgroup.appendChild(option);
        });
        
        if (entityOptgroup.children.length > 0) {
            groupFilter.appendChild(entityOptgroup);
        }
        
        // Create Relationship Groups optgroup
        const relationshipOptgroup = document.createElement("optgroup");
        relationshipOptgroup.label = "Relationship Groups";
        
        const relationshipGroupNames = Object.keys(relationshipGroups).sort();
        relationshipGroupNames.forEach(groupName => {
            const option = document.createElement("option");
            option.value = `relationship:${groupName}`;
            option.textContent = groupName;
            relationshipOptgroup.appendChild(option);
        });
        
        if (relationshipOptgroup.children.length > 0) {
            groupFilter.appendChild(relationshipOptgroup);
        }
    }

    // Setup relationship filter dropdown
    setupRelationshipFilterDropdown() {
        const relationshipFilter = document.getElementById("relationshipFilter");
        
        // Get unique relationship labels
        const uniqueRelationships = [...new Set(
            this.judicialEntityMapData.map(d => d.label)
        )].sort();
        
        // Get relationship groups
        const relationshipGroups = {};
        if (this.relationshipGroupingData && this.relationshipGroupingData.length > 0) {
            this.relationshipGroupingData.forEach(item => {
                if (!relationshipGroups[item.belongsTo]) {
                    relationshipGroups[item.belongsTo] = [];
                }
                relationshipGroups[item.belongsTo].push(item.relationship);
            });
        }
        
        // Clear existing options
        relationshipFilter.innerHTML = '<option value="">Show All Relationships</option>';
        
        // Add relationship groups as optgroups
        const groupNames = Object.keys(relationshipGroups).sort();
        groupNames.forEach(groupName => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = `Group: ${groupName}`;
            
            // Add individual relationships in this group
            relationshipGroups[groupName].sort().forEach(relationship => {
                if (uniqueRelationships.includes(relationship)) {
                    const option = document.createElement("option");
                    option.value = relationship;
                    option.textContent = relationship;
                    optgroup.appendChild(option);
                }
            });
            
            if (optgroup.children.length > 0) {
                relationshipFilter.appendChild(optgroup);
            }
        });
        
        // Add ungrouped relationships (if any)
        const groupedRelationships = new Set();
        Object.values(relationshipGroups).forEach(rels => rels.forEach(r => groupedRelationships.add(r)));
        const ungroupedRelationships = uniqueRelationships.filter(r => !groupedRelationships.has(r));
        
        if (ungroupedRelationships.length > 0) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = "Ungrouped";
            ungroupedRelationships.forEach(relationship => {
                const option = document.createElement("option");
                option.value = relationship;
                option.textContent = relationship;
                optgroup.appendChild(option);
            });
            relationshipFilter.appendChild(optgroup);
        }
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
        if (this.isAnimating) {
            return;
        }
        this.isAnimating = true;
        
        const toggleBtn = document.getElementById("toggleViewBtn");
        if (!toggleBtn) {
            console.error('toggleViewBtn not found!');
            return;
        }
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Show Diagram View";
        
        const tableView = document.getElementById("table-view");
        const diagramView = document.getElementById("diagram-view");
        
        if (!tableView) {
            console.error('table-view element not found!');
            return;
        }
        
        // Stop simulation
        this.simulation?.stop();
        
        // Fade out diagram
        if (diagramView) {
            diagramView.classList.remove("active");
            diagramView.classList.add("fade-out");
        }
        
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
        this.lastAppliedFilterType = 'node';
        
        // Apply filters (handles both node and relationship filters)
        this.applyFilters();
        
        // Update table
        this.setupTable();
    }

    // Handle relationship filter change
    handleRelationshipFilter(event) {
        const selectedRelationshipId = event.target.value;
        
        if (selectedRelationshipId) {
            this.applyRelationshipFilter(selectedRelationshipId);
        } else {
            this.clearRelationshipFilter();
        }
    }

    // Apply relationship filter
    applyRelationshipFilter(relationshipId) {
        // Trim whitespace to ensure exact match
        this.filteredRelationshipId = relationshipId ? relationshipId.trim() : null;
        this.lastAppliedFilterType = 'relationship';
        
        // Apply filtering to nodes and links
        this.applyFilters();
        
        // Update table
        this.setupTable();
    }

    // Clear relationship filter
    clearRelationshipFilter() {
        this.filteredRelationshipId = null;
        // Reset lastAppliedFilterType if this was the most recent filter
        if (this.lastAppliedFilterType === 'relationship') {
            this.lastAppliedFilterType = null;
        }
        
        // Reapply remaining filters
        this.applyFilters();
        
        // Reset dropdown
        document.getElementById("relationshipFilter").value = "";
        
        // Update table
        this.setupTable();
    }

    // Handle combined group filter change
    handleGroupFilter(event) {
        const selectedValue = event.target.value;
        
        if (selectedValue) {
            this.applyGroupFilter(selectedValue);
        } else {
            this.clearGroupFilter();
        }
    }

    // Apply group filter (handles both entity and relationship groups)
    applyGroupFilter(value) {
        if (!value) {
            this.filteredEntityGroupId = null;
            this.filteredRelationshipGroupId = null;
            this.lastAppliedFilterType = null;
            this.applyFilters();
            this.setupTable();
            return;
        }
        
        // Parse the value to determine if it's an entity or relationship group
        if (value.startsWith('entity:')) {
            this.filteredEntityGroupId = value.substring(7); // Remove 'entity:' prefix (7 chars)
            this.filteredRelationshipGroupId = null;
            this.lastAppliedFilterType = 'entityGroup';
        } else if (value.startsWith('relationship:')) {
            this.filteredRelationshipGroupId = value.substring(13); // Remove 'relationship:' prefix (13 chars)
            this.filteredEntityGroupId = null;
            this.lastAppliedFilterType = 'relationshipGroup';
        }
        
        // Apply filtering to nodes and links
        this.applyFilters();
        
        // Update table
        this.setupTable();
    }

    // Clear group filter
    clearGroupFilter() {
        this.filteredEntityGroupId = null;
        this.filteredRelationshipGroupId = null;
        // Reset lastAppliedFilterType if this was the most recent filter
        if (this.lastAppliedFilterType === 'entityGroup' || this.lastAppliedFilterType === 'relationshipGroup') {
            this.lastAppliedFilterType = null;
        }
        
        // Reapply remaining filters
        this.applyFilters();
        
        // Reset dropdown
        const groupFilter = document.getElementById("groupFilter");
        if (groupFilter) {
            groupFilter.value = "";
        }
        
        // Update table
        this.setupTable();
    }

    // Reset previous filters, keeping only the most recently applied filter
    resetPreviousFilters() {
        // Keep the most recently applied filter, reset all others
        if (this.lastAppliedFilterType === 'node') {
            // Keep node filter, reset others
            this.filteredEntityGroupId = null;
            this.filteredRelationshipId = null;
            this.filteredRelationshipGroupId = null;
            
            // Reset dropdowns for other filters
            const groupFilter = document.getElementById("groupFilter");
            if (groupFilter) {
                groupFilter.value = "";
            }
            document.getElementById("relationshipFilter").value = "";
        } else if (this.lastAppliedFilterType === 'relationship') {
            // Keep relationship filter, reset others
            this.filteredNodeId = null;
            this.filteredEntityGroupId = null;
            this.filteredRelationshipGroupId = null;
            
            // Reset dropdowns for other filters
            document.getElementById("nodeFilter").value = "";
            const groupFilter = document.getElementById("groupFilter");
            if (groupFilter) {
                groupFilter.value = "";
            }
        } else if (this.lastAppliedFilterType === 'entityGroup') {
            // Keep entity group filter, reset others
            this.filteredNodeId = null;
            this.filteredRelationshipId = null;
            this.filteredRelationshipGroupId = null;
            
            // Reset dropdowns for other filters
            document.getElementById("nodeFilter").value = "";
            document.getElementById("relationshipFilter").value = "";
        } else if (this.lastAppliedFilterType === 'relationshipGroup') {
            // Keep relationship group filter, reset others
            this.filteredNodeId = null;
            this.filteredEntityGroupId = null;
            this.filteredRelationshipId = null;
            
            // Reset dropdowns for other filters
            document.getElementById("nodeFilter").value = "";
            document.getElementById("relationshipFilter").value = "";
        } else {
            // No recent filter tracked, reset all
            this.clearAllFilters();
            return;
        }
        
        // Reapply the remaining filter
        this.applyFilters();
        
        // Update table
        this.setupTable();
    }

    // Clear all filters (both node and relationship)
    clearAllFilters() {
        this.filteredNodeId = null;
        this.filteredEntityGroupId = null;
        this.filteredRelationshipId = null;
        this.filteredRelationshipGroupId = null;
        this.lastAppliedFilterType = null;
        
        // Clear stored filter opacity state
        this.filterOpacityState.clear();
        
        // Reset all nodes and links to full opacity
        this.nodeElements?.style("opacity", 1);
        this.linkElements?.style("opacity", 1);
        
        // Hide relationship labels
        this.hideRelationshipLabel();
        
        // Reset dropdowns
        document.getElementById("nodeFilter").value = "";
        document.getElementById("relationshipFilter").value = "";
        const groupFilter = document.getElementById("groupFilter");
        if (groupFilter) {
            groupFilter.value = "";
        }
        
        // Update table
        this.setupTable();
    }

    // Apply both node and relationship filters
    applyFilters() {
        // Helper function to normalize and compare relationship labels
        const matchesRelationship = (linkLabel, filterLabel) => {
            if (!filterLabel) return true;
            const normalizedLink = linkLabel ? linkLabel.trim() : '';
            const normalizedFilter = filterLabel.trim();
            return normalizedLink === normalizedFilter;
        };
        
        // Helper function to check if relationship matches relationship group
        const matchesRelationshipGroup = (linkLabel) => {
            if (!this.filteredRelationshipGroupId) return true;
            const relationshipInfo = this.relationshipGroupMap[linkLabel];
            return relationshipInfo && relationshipInfo.group === this.filteredRelationshipGroupId;
        };
        
        // Get entities in filtered entity group
        const entitiesInGroup = new Set();
        if (this.filteredEntityGroupId && this.groupingData) {
            this.groupingData.forEach(item => {
                if (item.belongsTo === this.filteredEntityGroupId) {
                    entitiesInGroup.add(item.node);
                }
            });
        }
        
        // Collect all nodes that should be visible based on relationship filters
        // This includes all endpoints of matching relationships
        const nodesInFilteredRelationships = new Set();
        if (this.filteredRelationshipId || this.filteredRelationshipGroupId) {
            this.judicialEntityMapData.forEach(link => {
                const matchesRel = matchesRelationship(link.label, this.filteredRelationshipId);
                const matchesRelGroup = matchesRelationshipGroup(link.label);
                if (matchesRel && matchesRelGroup) {
                    nodesInFilteredRelationships.add(link.source);
                    nodesInFilteredRelationships.add(link.target);
                }
            });
        }
        
        // Highlight selected node if node filter is active
        if (this.filteredNodeId) {
            const selectedNode = this.nodeElements.data().find(d => d.id === this.filteredNodeId);
            if (selectedNode) {
                this.highlightSelectedNode(selectedNode);
            }
        }
        
        // Helper function to check if a node matches all active filters
        const nodeMatchesFilters = (nodeId) => {
            // Check node filter (if active)
            let matchesNodeFilter = true;
            if (this.filteredNodeId) {
                // The selected node itself always matches the node filter
                if (nodeId === this.filteredNodeId) {
                    matchesNodeFilter = true;
                } else {
                    // Other nodes must be connected to the selected node through a link that matches all other filters
                    matchesNodeFilter = this.judicialEntityMapData.some(link => {
                        const isConnected = (link.source === this.filteredNodeId && link.target === nodeId) ||
                                          (link.target === this.filteredNodeId && link.source === nodeId);
                        if (!isConnected) return false;
                        
                        // Check relationship filters
                        const matchesRel = matchesRelationship(link.label, this.filteredRelationshipId);
                        const matchesRelGroup = matchesRelationshipGroup(link.label);
                        
                        // Check entity group filter
                        const matchesEntityGroup = !this.filteredEntityGroupId || 
                            entitiesInGroup.has(link.source) || entitiesInGroup.has(link.target);
                        
                        return matchesRel && matchesRelGroup && matchesEntityGroup;
                    });
                }
            }
            
            // Check entity group filter (if active)
            let matchesEntityGroupFilter = true;
            if (this.filteredEntityGroupId) {
                matchesEntityGroupFilter = entitiesInGroup.has(nodeId);
            }
            
            // Check relationship filter (if active)
            let matchesRelationshipFilter = true;
            if (this.filteredRelationshipId || this.filteredRelationshipGroupId) {
                // Node must be an endpoint of a matching relationship
                matchesRelationshipFilter = nodesInFilteredRelationships.has(nodeId);
            }
            
            // Node is visible if it matches all active filters
            return matchesNodeFilter && matchesEntityGroupFilter && matchesRelationshipFilter;
        };
        
        // Check if any nodes will be visible before applying filters
        let hasVisibleNodes = false;
        if (this.nodeElements && (this.filteredNodeId || this.filteredEntityGroupId || this.filteredRelationshipId || this.filteredRelationshipGroupId)) {
            this.nodeElements.each(function(d) {
                if (nodeMatchesFilters(d.id)) {
                    hasVisibleNodes = true;
                }
            });
            
            // If no nodes are visible and filters are active, reset previous filters but keep the most recent one
            if (!hasVisibleNodes) {
                console.warn('Filter combination resulted in empty results. Resetting previous filters, keeping most recent filter.');
                this.resetPreviousFilters();
                return; // Exit early since filters are adjusted
            }
        }
        
        // Unified filtering logic: evaluate all active filters together
        // A node is visible if it matches ALL active filter criteria
        // Clear stored opacity state when filters are reapplied
        this.filterOpacityState.clear();
        
        this.nodeElements?.style("opacity", d => {
            const isVisible = nodeMatchesFilters(d.id);
            const opacity = isVisible ? 1 : 0.2;
            // Store opacity for hover restoration
            this.filterOpacityState.set(d.id, opacity);
            return opacity;
        });
        
        // Filter links: a link is visible if it matches ALL active filter criteria
        this.linkElements?.style("opacity", d => {
            // Check node filter (if active)
            let matchesNodeFilter = true;
            if (this.filteredNodeId) {
                matchesNodeFilter = (d.source.id === this.filteredNodeId || d.target.id === this.filteredNodeId);
            }
            
            // Check entity group filter (if active)
            let matchesEntityGroupFilter = true;
            if (this.filteredEntityGroupId) {
                matchesEntityGroupFilter = entitiesInGroup.has(d.source.id) || entitiesInGroup.has(d.target.id);
            }
            
            // Check relationship filters (if active)
            let matchesRelationshipFilter = true;
            if (this.filteredRelationshipId || this.filteredRelationshipGroupId) {
                const matchesRel = matchesRelationship(d.label, this.filteredRelationshipId);
                const matchesRelGroup = matchesRelationshipGroup(d.label);
                matchesRelationshipFilter = matchesRel && matchesRelGroup;
            }
            
            // Link is visible if it matches all active filters
            const isVisible = matchesNodeFilter && matchesEntityGroupFilter && matchesRelationshipFilter;
            const opacity = isVisible ? 1 : 0.2;
            // Store opacity for hover restoration
            const linkId = `${d.source.id}-${d.target.id}-${d.label}`;
            this.filterOpacityState.set(linkId, opacity);
            return opacity;
        });
        
        // Show relationship labels for filtered node
        if (this.filteredNodeId && this.currentView === 'diagram') {
            setTimeout(() => {
                this.showFilteredNodeLabels(this.filteredNodeId);
            }, 200);
        }
    }

    // Clear node filter (kept for backward compatibility, now calls clearAllFilters)
    clearNodeFilter() {
        this.filteredNodeId = null;
        // Reset lastAppliedFilterType if this was the most recent filter
        if (this.lastAppliedFilterType === 'node') {
            this.lastAppliedFilterType = null;
        }
        
        // Reapply remaining filters
        this.applyFilters();
        
        // Reset dropdown
        document.getElementById("nodeFilter").value = "";
        
        // Update table
        this.setupTable();
    }

    // Password Prompt Methods
    showPasswordPrompt() {
        const passwordModal = document.getElementById("password-modal");
        const passwordInput = document.getElementById("password-input");
        const passwordError = document.getElementById("password-error");
        
        if (!passwordModal) return;
        
        // Clear previous error and input
        passwordError.style.display = "none";
        passwordError.textContent = "";
        passwordInput.value = "";
        
        // Show modal
        passwordModal.style.display = "flex";
        passwordInput.focus();
        
        // Handle form submission
        const passwordForm = document.getElementById("password-form");
        if (passwordForm) {
            passwordForm.onsubmit = (e) => {
                e.preventDefault();
                this.handlePasswordSubmit(passwordInput.value);
            };
        }
        
        // Handle cancel button
        const passwordCancel = document.getElementById("password-cancel");
        if (passwordCancel) {
            passwordCancel.onclick = () => {
                this.hidePasswordPrompt();
            };
        }
        
        // Close on overlay click
        passwordModal.onclick = (e) => {
            if (e.target === passwordModal) {
                this.hidePasswordPrompt();
            }
        };
    }

    hidePasswordPrompt() {
        const passwordModal = document.getElementById("password-modal");
        if (passwordModal) {
            passwordModal.style.display = "none";
        }
    }

    handlePasswordSubmit(password) {
        const passwordError = document.getElementById("password-error");
        
        if (this.authorize(password)) {
            // Password correct, hide modal and enable edit mode
            this.hidePasswordPrompt();
            this.enableEditMode();
        } else {
            // Password incorrect, show error
            if (passwordError) {
                passwordError.textContent = "Incorrect password. Please try again.";
                passwordError.style.display = "block";
            }
            // Clear input and refocus
            const passwordInput = document.getElementById("password-input");
            if (passwordInput) {
                passwordInput.value = "";
                passwordInput.focus();
            }
        }
    }

    // Edit Mode Toggle Methods
    toggleEditMode() {
        if (this.isEditMode) {
            this.disableEditMode();
        } else {
            // Check if already authorized (from previous session)
            if (this.isAuthorized()) {
                this.enableEditMode();
            } else {
                // Show password prompt
                this.showPasswordPrompt();
            }
        }
    }

    enableEditMode() {
        // Prevent editing in read-only mode
        if (this.readOnly) {
            console.warn('Edit mode is disabled in read-only/embed mode');
            return;
        }
        
        if (!this.isAuthorized() && this.accessControl.config.password && this.accessControl.config.password !== "") {
            // Not authorized and password is required
            this.showPasswordPrompt();
            return;
        }
        
        this.isEditMode = true;
        
        // Load data from localStorage or use current data
        this.loadDataFromStorage();
        
        // Update button text
        const editBtn = document.getElementById("editTableBtn");
        if (editBtn) {
            editBtn.textContent = "Save Changes";
        }
        
        // Show table controls
        const tableControls = document.getElementById("table-controls");
        if (tableControls) {
            tableControls.style.display = "block";
        }
        
        // Show action column header
        const actionHeader = document.getElementById("action-header");
        if (actionHeader) {
            actionHeader.style.display = "table-cell";
        }
        
        // Re-render table in edit mode
        this.setupTable();
    }

    disableEditMode() {
        // Save changes to localStorage
        this.saveDataToStorage();
        
        // Update visualization with new data
        this.updateVisualization();
        
        // Clear authorization
        this.deauthorize();
        
        this.isEditMode = false;
        this.editableData = null;
        this.editingRowIndex = null;
        
        // Update button text
        const editBtn = document.getElementById("editTableBtn");
        if (editBtn) {
            editBtn.textContent = "Edit Table";
        }
        
        // Hide table controls
        const tableControls = document.getElementById("table-controls");
        if (tableControls) {
            tableControls.style.display = "none";
        }
        
        // Hide action column header
        const actionHeader = document.getElementById("action-header");
        if (actionHeader) {
            actionHeader.style.display = "none";
        }
        
        // Re-render table in view mode
        this.setupTable();
    }

    // Storage Methods
    loadDataFromStorage() {
        try {
            const stored = localStorage.getItem('legalSystemData_edits');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.editableData = parsed;
            } else {
                // No stored data, use current filtered data or all data
                const dataSource = this.judicialEntityMapData;
                this.editableData = JSON.parse(JSON.stringify(dataSource)); // Deep copy
            }
        } catch (error) {
            console.error('Error loading data from storage:', error);
            // Fallback to current data
            const dataSource = this.judicialEntityMapData;
            this.editableData = JSON.parse(JSON.stringify(dataSource)); // Deep copy
        }
    }

    saveDataToStorage() {
        try {
            if (this.editableData && this.editableData.length > 0) {
                localStorage.setItem('legalSystemData_edits', JSON.stringify(this.editableData));
            } else {
                // Clear storage if no data
                localStorage.removeItem('legalSystemData_edits');
            }
        } catch (error) {
            console.error('Error saving data to storage:', error);
        }
    }

    // Visualization Update Method
    updateVisualization() {
        // Merge edited data with original data
        if (this.editableData && this.editableData.length > 0) {
            // Update the main data source
            this.judicialEntityMapData = this.editableData;
            
            // Also update window.data for consistency
            if (window.data) {
                window.data.judicialEntityMapData = this.editableData;
            }
            
            // If we're in diagram view, rebuild the visualization
            if (this.currentView === 'diagram') {
                // Stop current simulation
                if (this.simulation) {
                    this.simulation.stop();
                }
                
                // Clear existing elements
                this.svg.selectAll(".node").remove();
                this.svg.selectAll(".link").remove();
                this.svg.selectAll(".arrow-relationship-label").remove();
                
                // Rebuild visualization with new data
                this.prepareDiagramData();
                
                // Restart simulation
                if (this.simulation) {
                    this.simulation.alpha(1).restart();
                }
            }
        }
    }

    // Row Management Methods
    addNewRow() {
        if (!this.isEditMode || !this.editableData) {
            return;
        }
        
        // Add new empty row at the beginning
        const newRow = {
            source: "",
            target: "",
            label: "",
            count: 1
        };
        
        this.editableData.unshift(newRow);
        this.setupTable();
    }

    deleteRow(index) {
        if (!this.isEditMode || !this.editableData) {
            return;
        }
        
        if (index >= 0 && index < this.editableData.length) {
            this.editableData.splice(index, 1);
            this.setupTable();
        }
    }

    saveRowChanges(rowIndex, source, label, target) {
        if (!this.isEditMode || !this.editableData) {
            return;
        }
        
        if (rowIndex >= 0 && rowIndex < this.editableData.length) {
            // Validate data
            if (window.helpers && window.helpers.validateRowData) {
                const validation = window.helpers.validateRowData(source, label, target);
                if (!validation.valid) {
                    alert(validation.message || "Invalid data");
                    return;
                }
            }
            
            // Update row
            this.editableData[rowIndex].source = source || "";
            this.editableData[rowIndex].label = label || "";
            this.editableData[rowIndex].target = target || "";
            
            // Auto-save to localStorage
            this.saveDataToStorage();
        }
    }

    openEditModal(rowData, rowIndex) {
        if (!this.isEditMode) {
            return;
        }
        
        this.editingRowIndex = rowIndex;
        
        const editModal = document.getElementById("edit-modal");
        const editSource = document.getElementById("edit-source");
        const editRelationship = document.getElementById("edit-relationship");
        const editTarget = document.getElementById("edit-target");
        const editError = document.getElementById("edit-error");
        
        if (!editModal || !editSource || !editRelationship || !editTarget) {
            return;
        }
        
        // Clear error
        if (editError) {
            editError.style.display = "none";
            editError.textContent = "";
        }
        
        // Populate form with row data
        editSource.value = rowData.source || "";
        editRelationship.value = rowData.label || "";
        editTarget.value = rowData.target || "";
        
        // Populate datalists with existing values
        this.populateEditModalDatalists();
        
        // Show modal
        editModal.style.display = "flex";
        editSource.focus();
        
        // Handle form submission
        const editForm = document.getElementById("edit-form");
        if (editForm) {
            editForm.onsubmit = (e) => {
                e.preventDefault();
                this.saveModalChanges();
            };
        }
        
        // Handle cancel button
        const editCancel = document.getElementById("edit-cancel");
        if (editCancel) {
            editCancel.onclick = () => {
                this.hideEditModal();
            };
        }
        
        // Close on overlay click
        editModal.onclick = (e) => {
            if (e.target === editModal) {
                this.hideEditModal();
            }
        };
    }

    hideEditModal() {
        const editModal = document.getElementById("edit-modal");
        if (editModal) {
            editModal.style.display = "none";
        }
        this.editingRowIndex = null;
    }

    saveModalChanges() {
        if (this.editingRowIndex === null || !this.editableData) {
            return;
        }
        
        const editSource = document.getElementById("edit-source");
        const editRelationship = document.getElementById("edit-relationship");
        const editTarget = document.getElementById("edit-target");
        const editError = document.getElementById("edit-error");
        
        if (!editSource || !editRelationship || !editTarget) {
            return;
        }
        
        const source = editSource.value.trim();
        const label = editRelationship.value.trim();
        const target = editTarget.value.trim();
        
        // Validate
        if (window.helpers && window.helpers.validateRowData) {
            const validation = window.helpers.validateRowData(source, label, target);
            if (!validation.valid) {
                if (editError) {
                    editError.textContent = validation.message || "Invalid data";
                    editError.style.display = "block";
                }
                return;
            }
        } else {
            // Basic validation
            if (!source || !label || !target) {
                if (editError) {
                    editError.textContent = "All fields are required";
                    editError.style.display = "block";
                }
                return;
            }
        }
        
        // Save changes
        this.saveRowChanges(this.editingRowIndex, source, label, target);
        
        // Hide modal and refresh table
        this.hideEditModal();
        this.setupTable();
    }

    populateEditModalDatalists() {
        if (!this.editableData) {
            return;
        }
        
        // Get unique entities
        const entities = new Set();
        const relationships = new Set();
        
        this.editableData.forEach(d => {
            if (d.source) entities.add(d.source);
            if (d.target) entities.add(d.target);
            if (d.label) relationships.add(d.label);
        });
        
        // Also include original data entities
        if (this.judicialEntityMapData) {
            this.judicialEntityMapData.forEach(d => {
                if (d.source) entities.add(d.source);
                if (d.target) entities.add(d.target);
                if (d.label) relationships.add(d.label);
            });
        }
        
        // Populate source and target datalists
        const sourceOptions = d3.select("#source-options");
        const targetOptions = d3.select("#target-options");
        const relationshipOptions = d3.select("#relationship-options");
        
        sourceOptions.selectAll("option").remove();
        targetOptions.selectAll("option").remove();
        relationshipOptions.selectAll("option").remove();
        
        Array.from(entities).sort().forEach(entity => {
            sourceOptions.append("option").attr("value", entity);
            targetOptions.append("option").attr("value", entity);
        });
        
        Array.from(relationships).sort().forEach(rel => {
            relationshipOptions.append("option").attr("value", rel);
        });
    }

    // Export Methods
    getTableDataForExport() {
        // Get data - use editableData if in edit mode, otherwise use original data
        let dataSource;
        if (this.isEditMode && this.editableData && this.editableData.length > 0) {
            dataSource = this.editableData;
        } else {
            dataSource = this.judicialEntityMapData;
        }
        
        if (!dataSource || !dataSource.length) {
            // Fallback to window.data
            dataSource = window.data?.judicialEntityMapData;
        }
        
        if (!dataSource || !dataSource.length) {
            return [];
        }
        
        // Get filtered data if filter is active (only in view mode)
        let dataToShow;
        if (this.isEditMode) {
            // In edit mode, show all editable data (no filtering)
            dataToShow = dataSource;
        } else {
            // In view mode, apply filters
            if (window.helpers && window.helpers.getFilteredTableData) {
                dataToShow = window.helpers.getFilteredTableData(dataSource, this.filteredNodeId, this.filteredEntityGroupId, this.filteredRelationshipId, this.filteredRelationshipGroupId, this.relationshipGroupingData || window.data?.relationshipGroupingData, this.groupingData || window.data?.groupingData);
            } else {
                // Fallback filtering
                dataToShow = dataSource.filter(link => {
                    const matchesNode = !this.filteredNodeId || 
                        link.source === this.filteredNodeId || 
                        link.target === this.filteredNodeId;
                    const matchesRelationship = !this.filteredRelationshipId || 
                        link.label === this.filteredRelationshipId;
                    return matchesNode && matchesRelationship;
                });
            }
        }
        
        // Convert to export format: {Entity, Relationship, Target}
        return dataToShow.map(item => ({
            Entity: item.source || '',
            Relationship: item.label || '',
            Target: item.target || ''
        }));
    }

    downloadTableAsExcel() {
        // Check if SheetJS is available
        if (typeof XLSX !== 'undefined') {
            this.downloadTableAsExcelWithSheets();
        } else {
            // Fallback to CSV if SheetJS is not available
            this.downloadTableAsCSV();
        }
    }

    downloadTableAsExcelWithSheets() {
        // Get relationships data
        const relationshipsData = this.getTableDataForExport();
        
        // Get grouping data
        let groupingData = this.groupingData;
        if (!groupingData || groupingData.length === 0) {
            groupingData = window.data?.groupingData || [];
        }
        
        // Get relationship grouping data
        let relationshipGroupingData = this.relationshipGroupingData;
        if (!relationshipGroupingData || relationshipGroupingData.length === 0) {
            relationshipGroupingData = window.data?.relationshipGroupingData || [];
        }
        
        if (!relationshipsData || relationshipsData.length === 0) {
            alert('No data available to export');
            return;
        }
        
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert relationships data to worksheet
        const relationshipsWS = XLSX.utils.json_to_sheet(relationshipsData);
        XLSX.utils.book_append_sheet(wb, relationshipsWS, 'Relationships');
        
        // Convert grouping data to worksheet format
        if (groupingData && groupingData.length > 0) {
            const groupingDataFormatted = groupingData.map(item => ({
                Entity: item.node || '',
                Label: item.label || '',
                Group: item.belongsTo || ''
            }));
            const groupingWS = XLSX.utils.json_to_sheet(groupingDataFormatted);
            XLSX.utils.book_append_sheet(wb, groupingWS, 'Entity Groupings');
        }
        
        // Convert relationship grouping data to worksheet format
        if (relationshipGroupingData && relationshipGroupingData.length > 0) {
            const relationshipGroupingDataFormatted = relationshipGroupingData.map(item => ({
                Relationship: item.relationship || '',
                Group: item.belongsTo || ''
            }));
            const relationshipGroupingWS = XLSX.utils.json_to_sheet(relationshipGroupingDataFormatted);
            XLSX.utils.book_append_sheet(wb, relationshipGroupingWS, 'Relationship Groupings');
        }
        
        // Generate filename with timestamp
        const filename = window.helpers && window.helpers.formatDateForFilename ? 
            window.helpers.formatDateForFilename('legal-system-data', 'xlsx') : 
            `legal-system-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, filename);
    }

    downloadTableAsCSV() {
        const data = this.getTableDataForExport();
        
        if (!data || data.length === 0) {
            alert('No data available to export');
            return;
        }
        
        // Use helper function if available, otherwise do it inline
        if (window.helpers && window.helpers.convertToCSV) {
            const filename = window.helpers.formatDateForFilename ? 
                window.helpers.formatDateForFilename('legal-system-data', 'csv') : 
                `legal-system-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            window.helpers.convertToCSV(data, filename);
        } else {
            // Fallback CSV conversion
            const headers = ['Entity', 'Relationship', 'Target'];
            const csvRows = [headers.join(',')];
            
            data.forEach(row => {
                const values = [
                    this.escapeCSV(row.Entity),
                    this.escapeCSV(row.Relationship),
                    this.escapeCSV(row.Target)
                ];
                csvRows.push(values.join(','));
            });
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const filename = `legal-system-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    escapeCSV(value) {
        if (window.helpers && window.helpers.escapeCSVValue) {
            return window.helpers.escapeCSVValue(value);
        }
        // Fallback
        if (value === null || value === undefined) {
            return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
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
        
        // Highlight connected nodes with bold styling and enhanced labels
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .style("opacity", 1)
            .style("z-index", 10)
            .select(".node-group-circle")
            .style("stroke-width", 5)
            .style("filter", "drop-shadow(0 0 6px rgba(255, 107, 53, 0.6))");
        
        // Enhance connected node labels with larger font and background
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .select(".node-text")
            .style("font-size", "14px")
            .style("font-weight", "700")
            .style("fill", "#1f4e79")  // Darker blue instead of orange
            .style("stroke", "#fff")
            .style("stroke-width", "2px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
        
        // Bold the selected node even more with enhanced label
        this.nodeElements.filter(d => d.id === selectedNode.id)
            .style("opacity", 1)
            .style("z-index", 20)
            .select(".node-group-circle")
            .style("stroke-width", 6)
            .style("filter", "drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))");
        
        // Enhance selected node label with largest font and strong background
        this.nodeElements.filter(d => d.id === selectedNode.id)
            .select(".node-text")
            .style("font-size", "16px")
            .style("font-weight", "900")
            .style("fill", "#0d3a5f")  // Even darker blue instead of red
            .style("stroke", "#fff")
            .style("stroke-width", "3px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.5))");
        
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
            .style("z-index", 1);
        
        // Reset node group circles to normal styling
        this.nodeElements.select(".node-group-circle")
            .style("stroke-width", 3)
            .style("filter", "none");
        
        // Reset node center circles to normal styling
        this.nodeElements.select(".node-center")
            .style("stroke-width", 2)
            .style("stroke", "#fff")
            .style("filter", "none");
        
        // Reset all node text labels to normal styling
        this.nodeElements.select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
            .style("stroke", "none")
            .style("stroke-width", "0px")
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
        
        // Remove any existing relationship labels first
        this.hideRelationshipLabel();
        
        // Enable label visibility AFTER removing existing labels
        this._labelsVisible = true;
        
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
        
        
        // Group links by their source-target pair to handle multiple labels on same arrow
        const linkGroups = {};
        connectedLinks.forEach(linkData => {
            const linkKey = `${linkData.link.source.id}-${linkData.link.target.id}`;
            if (!linkGroups[linkKey]) {
                linkGroups[linkKey] = [];
            }
            linkGroups[linkKey].push(linkData);
        });
        
        // Create labels with proper stacking for each group
        let globalIndex = 0;
        Object.values(linkGroups).forEach(linkGroup => {
            linkGroup.forEach((linkData, localIndex) => {
                this.createSimpleLabel(linkData.link, linkData.element, globalIndex);
                globalIndex++;
            });
        });
    }

    hideRelationshipLabel() {
        // Disable label visibility
        this._labelsVisible = false;
        
        // Remove all relationship labels
        this.svg.selectAll(".relationship-label-group").remove();
    }

    // Show relationship label for a specific arrow on hover
    showArrowRelationshipLabel(linkData, linkElement) {
        // Remove any existing arrow relationship labels
        this.svg.selectAll(".arrow-relationship-label").remove();
        
        // Get position along the curved path instead of straight line midpoint
        const pathElement = d3.select(linkElement);
        const pathLength = pathElement.node().getTotalLength();
        
        // For self-loops, position the label at the top of the loop
        let midPoint;
        if (linkData.source.id === linkData.target.id) {
            // For self-loops, get the point at the top of the arc (around 25% of the path)
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
        } else {
            // For regular links, use the midpoint
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
        }
        
        const midX = midPoint.x;
        const midY = midPoint.y;
        
        // Create a simple group for the arrow label
        const group = this.svg.append("g")
            .attr("class", "arrow-relationship-label")
            .style("pointer-events", "none")
            .style("opacity", 1)
            .style("z-index", 100);
        
        // Create background rectangle
        const padding = 8;
        const textWidth = linkData.label.length * 8;
        const textHeight = 16;
        
        const rect = group.append("rect")
            .attr("x", midX - (textWidth/2) - padding)
            .attr("y", midY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 1.0)")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
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
    }

    // Create simple visible label for testing
    createSimpleLabel(linkData, linkElement, index) {
        // Only create labels if visibility is enabled
        if (!this._labelsVisible) {
            return;
        }
        
        // Get position along the curved path instead of straight line midpoint
        const pathElement = d3.select(linkElement);
        const pathLength = pathElement.node().getTotalLength();
        
        // For self-loops, position the label at the top of the loop
        let midPoint;
        if (linkData.source.id === linkData.target.id) {
            // For self-loops, get the point at the top of the arc (around 25% of the path)
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
        } else {
            // For regular links, use the midpoint
            midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
        }
        
        // Calculate vertical offset for stacking multiple labels
        const labelSpacing = 25; // Vertical spacing between labels
        const verticalOffset = index * labelSpacing;
        
        // Calculate the final position with vertical stacking
        const finalX = midPoint.x;
        const finalY = midPoint.y + verticalOffset;
        
        // Create a simple group
        const group = this.svg.append("g")
            .attr("class", "relationship-label-group")
            .style("pointer-events", "none")
            .style("opacity", 1)
            .style("z-index", 100)
            .datum(linkData); // Store link data for updates
        
        // Create background rectangle
        const padding = 8;
        const textWidth = linkData.label.length * 8;
        const textHeight = 16;
        
        const rect = group.append("rect")
            .attr("x", finalX - (textWidth/2) - padding)
            .attr("y", finalY - (textHeight/2) - padding/2)
            .attr("width", textWidth + (padding * 2))
            .attr("height", textHeight + padding)
            .style("fill", "rgba(255, 255, 255, 1.0)")
            .style("stroke", "#000")
            .style("stroke-width", 2)
            .style("rx", 4)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))");
        
        // Create text label
        const text = group.append("text")
            .attr("x", finalX)
            .attr("y", finalY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#000")
            .text(linkData.label);
        
    }

    // Label visibility control flag - initialized in constructor

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
        
        // Group labels by their source-target pair to handle stacking
        const labelGroups = {};
        
        this.svg.selectAll(".relationship-label-group").each(function(d, i) {
            const group = d3.select(this);
            const linkData = group.datum();
            
            if (!linkData || !linkData.source || !linkData.target) return;
            
            const linkKey = `${linkData.source.id}-${linkData.target.id}`;
            if (!labelGroups[linkKey]) {
                labelGroups[linkKey] = [];
            }
            labelGroups[linkKey].push({ group, linkData, index: i });
        });
        
        // Update each group of labels with proper stacking
        Object.values(labelGroups).forEach(labelGroup => {
            labelGroup.forEach(({ group, linkData, index }) => {
                // Find the corresponding link element to get the curved path
                const linkElement = this.linkElements.filter(d => 
                    d.source.id === linkData.source.id && d.target.id === linkData.target.id
                ).node();
                
                let finalX, finalY;
                
                if (linkElement) {
                    // Get position along the curved path
                    const pathElement = d3.select(linkElement);
                    const pathLength = pathElement.node().getTotalLength();
                    
                    // For self-loops, position the label at the top of the loop
                    let midPoint;
                    if (linkData.source.id === linkData.target.id) {
                        // For self-loops, get the point at the top of the arc (around 25% of the path)
                        midPoint = pathElement.node().getPointAtLength(pathLength * 0.25);
                    } else {
                        // For regular links, use the midpoint
                        midPoint = pathElement.node().getPointAtLength(pathLength * 0.5);
                    }
                    
                    // Calculate vertical offset for stacking multiple labels
                    const labelSpacing = 25; // Vertical spacing between labels
                    const verticalOffset = index * labelSpacing;
                    
                    // Calculate the final position with vertical stacking
                    finalX = midPoint.x;
                    finalY = midPoint.y + verticalOffset;
                } else {
                    // Fallback to straight line midpoint if link element not found
                    const sourceX = linkData.source.x;
                    const sourceY = linkData.source.y;
                    const targetX = linkData.target.x;
                    const targetY = linkData.target.y;
                    
                    const midX = (sourceX + targetX) / 2;
                    const midY = (sourceY + targetY) / 2;
                    
                    const labelSpacing = 25;
                    const verticalOffset = index * labelSpacing;
                    
                    finalX = midX;
                    finalY = midY + verticalOffset;
                }
                
                // Update labelbox position
                const rect = group.select("rect");
                const text = group.select("text");
                
                if (rect.node()) {
                    const padding = 8;
                    const textWidth = linkData.label.length * 8;
                    const textHeight = 16;
                    
                    rect
                        .attr("x", finalX - (textWidth/2) - padding)
                        .attr("y", finalY - (textHeight/2) - padding/2);
                }
                
                if (text.node()) {
                    text
                        .attr("x", finalX)
                        .attr("y", finalY);
                }
            });
        });
    }

    optimizeNodeLabelPositions() {
        // Intelligent label positioning to avoid overlaps
        const nodes = this.nodeElements.nodes();
        const nodeData = nodes.map(node => ({
            element: node,
            data: d3.select(node).datum(),
            text: d3.select(node).select('.node-text')
        }));

        // Calculate optimal positions for each label
        nodeData.forEach((node, i) => {
            // Calculate radial position for better elliptical distribution
            const centerX = this.config.width / 2;
            const centerY = this.config.height / 2;
            const angle = Math.atan2(node.data.y - centerY, node.data.x - centerX);
            
            // Calculate elliptical scaling factors
            const ellipseScaleX = 1.0; // Horizontal scaling (major axis)
            const ellipseScaleY = 0.6; // Vertical scaling (minor axis)
            
            const positions = [
                { dx: 18, dy: 0 },   // Right (horizontal - more space)
                { dx: -18, dy: 0 },  // Left (horizontal - more space)
                { dx: 0, dy: -15 },  // Above (vertical - less space)
                { dx: 0, dy: 15 },   // Below (vertical - less space)
                { dx: 15, dy: -10 }, // Top-right
                { dx: -15, dy: -10 }, // Top-left
                { dx: 15, dy: 10 },  // Bottom-right
                { dx: -15, dy: 10 }, // Bottom-left
                // Elliptical-aware positions
                { dx: Math.cos(angle) * 18 * ellipseScaleX, dy: Math.sin(angle) * 15 * ellipseScaleY },     // Radial outward (elliptical)
                { dx: Math.cos(angle) * -18 * ellipseScaleX, dy: Math.sin(angle) * -15 * ellipseScaleY },   // Radial inward (elliptical)
                { dx: Math.cos(angle + Math.PI/2) * 15 * ellipseScaleX, dy: Math.sin(angle + Math.PI/2) * 15 * ellipseScaleY }, // Perpendicular
                { dx: Math.cos(angle - Math.PI/2) * 15 * ellipseScaleX, dy: Math.sin(angle - Math.PI/2) * 15 * ellipseScaleY }  // Perpendicular opposite
            ];

            let bestPosition = positions[0];
            let minOverlap = Infinity;

            // Test each position and find the one with least overlap
            positions.forEach(pos => {
                const testX = node.data.x + pos.dx;
                const testY = node.data.y + pos.dy;
                
                // Check if label position would be within SVG bounds
                const labelMargin = 20; // Margin from edges
                if (testX < labelMargin || testX > this.config.width - labelMargin ||
                    testY < labelMargin || testY > this.config.height - labelMargin) {
                    return; // Skip this position if it would go outside bounds
                }
                
                let overlap = 0;
                nodeData.forEach((otherNode, j) => {
                    if (i === j) return;
                    
                    const otherX = otherNode.data.x + (otherNode.text.attr('dx') || 8);
                    const otherY = otherNode.data.y + (otherNode.text.attr('dy') || 0);
                    
                    const distance = Math.sqrt((testX - otherX) ** 2 + (testY - otherY) ** 2);
                    const textWidth = Math.max(node.data.name.length * 6, 40); // Approximate text width
                    
                    if (distance < textWidth) {
                        overlap += (textWidth - distance);
                    }
                });
                
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    bestPosition = pos;
                }
            });

            // Apply the best position
            node.text
                .transition()
                .duration(200)
                .attr("dx", bestPosition.dx)
                .attr("dy", bestPosition.dy);
        });
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
        this.judicialEntityMapData.forEach(link => {
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
        
        // Highlight connected node labels with enhanced styling
        this.nodeElements.filter(d => connectedNodeIds.has(d.id))
            .select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", d => d.id === hoveredNode.id ? "16px" : "14px")
            .style("font-weight", d => d.id === hoveredNode.id ? "900" : "700")
            .style("fill", d => d.id === hoveredNode.id ? "#0d3a5f" : "#1f4e79")
            .style("stroke", "#fff")
            .style("stroke-width", "2px")
            .style("paint-order", "stroke fill")
            .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.3))");
        
        // Fade all links except connected ones
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", d => connectedNodeIds.has(d.source.id) && connectedNodeIds.has(d.target.id) ? 1 : 0.2);
    }

    // Restore filter state after hover ends
    restoreFilterState() {
        // Only restore if we have stored filter state (filters are active)
        if (this.filterOpacityState.size === 0) {
            // No filters active, restore to full opacity
            this.nodeElements.style("opacity", 1);
            this.linkElements.style("opacity", 1);
            return;
        }
        
        // Restore nodes to their filter-based opacity
        this.nodeElements
            .style("opacity", (d) => {
                return this.filterOpacityState.get(d.id) !== undefined 
                    ? this.filterOpacityState.get(d.id) 
                    : 1;
            });
        
        // Restore links to their filter-based opacity
        this.linkElements
            .style("opacity", (d) => {
                const linkId = `${d.source.id}-${d.target.id}-${d.label}`;
                return this.filterOpacityState.get(linkId) !== undefined 
                    ? this.filterOpacityState.get(linkId) 
                    : 1;
            });
        
        // DO NOT clear stored opacity state - keep it for future hovers
    }

    restoreNormalView() {
        // Don't restore if a filter is active - use restoreFilterState instead
        if (this.filteredNodeId || this.filteredEntityGroupId || this.filteredRelationshipId || this.filteredRelationshipGroupId) {
            this.restoreFilterState();
            return;
        }
        
        // Restore all nodes opacity and styling (only when no filters active)
        this.nodeElements
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("z-index", 1);
        
        // Restore node group circles to normal styling
        this.nodeElements.select(".node-group-circle")
            .transition()
            .duration(200)
            .style("stroke-width", 3)
            .style("filter", "none");
        
        // Restore node center circles to normal styling
        this.nodeElements.select(".node-center")
            .transition()
            .duration(200)
            .style("stroke-width", 2)
            .style("stroke", "#fff")
            .style("filter", "none");
        
        // Restore all node text labels to normal styling
        this.nodeElements.select(".node-text")
            .transition()
            .duration(200)
            .style("font-size", "11px")
            .style("font-weight", "400")
            .style("fill", "#000")
            .style("stroke", "none")
            .style("stroke-width", "0px")
            .style("filter", "none");
        
        // Restore all links opacity and styling
        this.linkElements
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("z-index", 1)
            .style("stroke-width", 1.5)
            .style("filter", "none");
        
        // Clear selection state
        this.svg.attr("data-selected-node", null);
    }

    showTooltip(event, text) {
        // Remove any existing relationship info
        this.hideTooltip();
        
        // Create relationship info in top-right corner
        const relationshipInfo = d3.select("#diagram-view").append("div")
            .attr("class", "relationship-info")
            .style("position", "absolute")
            .style("top", "20px")
            .style("right", "20px")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "6px")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("max-width", "300px")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
            .text(text);
    }

    hideTooltip() {
        d3.selectAll(".tooltip").remove();
        d3.selectAll(".relationship-info").remove();
    }

    showFilteredNodeLabels(nodeId) {
        // Only show labels if we're in diagram view
        const diagramView = document.getElementById("diagram-view");
        if (!diagramView.classList.contains("active")) {
            return;
        }
        
        // Find the selected node data
        const selectedNode = this.nodeElements.data().find(d => d.id === nodeId);
        if (!selectedNode) return;
        
        // Use the same method as drag/hover for consistency
        this.showNodeRelationshipLabels(selectedNode);
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
            
            const collisionScore = window.helpers.calculateCollisionScore(labelX, labelY, d.label, this.svg, this.nodeElements);
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
