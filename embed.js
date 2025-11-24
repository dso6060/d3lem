/**
 * Legal System Visualization Embed Script
 * Allows embedding the visualization in other web pages via script tag
 * 
 * Usage:
 * <div id="my-viz-container"></div>
 * <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
 * <script src="data.js"></script>
 * <script src="helpers.js"></script>
 * <script src="network-diagram.js"></script>
 * <script src="embed.js"></script>
 * <script>
 *   LegalSystemEmbed.init({
 *     container: '#my-viz-container',
 *     view: 'diagram',
 *     showFilters: true
 *   });
 * </script>
 * 
 * Note: SheetJS is required for Excel export with multiple sheets. 
 * If not included, the export will fall back to CSV format.
 */

(function() {
    'use strict';

    // LegalSystemEmbed namespace
    window.LegalSystemEmbed = {
        /**
         * Initialize the visualization in a container
         * @param {Object} options - Configuration options
         * @param {string|HTMLElement} options.container - CSS selector or DOM element (required)
         * @param {Object} options.data - Optional inline data object
         * @param {string} options.dataUrl - Optional URL to load data from
         * @param {string} options.view - Initial view ('diagram' or 'table', default: 'diagram')
         * @param {boolean} options.showFilters - Show filter controls (default: true)
         * @param {boolean} options.readOnly - Read-only mode (default: true for embeds)
         */
        init: function(options) {
            if (!options || !options.container) {
                console.error('LegalSystemEmbed.init: container option is required');
                return;
            }

            // Get container element
            let container;
            if (typeof options.container === 'string') {
                container = document.querySelector(options.container);
            } else if (options.container instanceof HTMLElement) {
                container = options.container;
            } else {
                console.error('LegalSystemEmbed.init: Invalid container option');
                return;
            }

            if (!container) {
                console.error('LegalSystemEmbed.init: Container element not found');
                return;
            }

            // Default options
            const config = {
                container: container,
                data: options.data || null,
                dataUrl: options.dataUrl || null,
                view: options.view || 'diagram',
                showFilters: options.showFilters !== false,
                readOnly: options.readOnly !== false // Default to true for embeds
            };

            // Check if dependencies are loaded
            if (typeof LegalSystemVisualization === 'undefined') {
                console.error('LegalSystemEmbed.init: LegalSystemVisualization class not found. Make sure network-diagram.js is loaded.');
                return;
            }

            if (!window.data) {
                console.error('LegalSystemEmbed.init: window.data not found. Make sure data.js is loaded.');
                return;
            }

            // Load data if dataUrl is provided
            if (config.dataUrl) {
                this.loadDataFromUrl(config.dataUrl, function(data) {
                    initializeVisualization(data, config);
                });
            } else if (config.data) {
                // Use provided inline data
                initializeVisualization(config.data, config);
            } else {
                // Use default data from window.data
                initializeVisualization(null, config);
            }
        },

        /**
         * Load data from URL
         * @param {string} url - URL to load data from
         * @param {Function} callback - Callback function with loaded data
         */
        loadDataFromUrl: function(url, callback) {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load data from URL');
                    }
                    return response.json();
                })
                .then(data => {
                    callback(data);
                })
                .catch(error => {
                    console.error('Error loading data from URL:', error);
                    // Fallback to default data
                    callback(null);
                });
        }
    };

    /**
     * Initialize the visualization
     * @param {Object} customData - Custom data object or null to use default
     * @param {Object} config - Configuration options
     */
    function initializeVisualization(customData, config) {
        const container = config.container;

        // Prepare data
        let visualizationData;
        if (customData) {
            visualizationData = {
                judicialEntityMapData: customData.judicialEntityMapData || window.data.judicialEntityMapData,
                groupingData: customData.groupingData || window.data.groupingData,
                config: customData.config || window.data.config,
                colorMap: customData.colorMap || window.data.colorMap,
                readOnly: config.readOnly
            };
        } else {
            visualizationData = {
                judicialEntityMapData: window.data.judicialEntityMapData,
                groupingData: window.data.groupingData,
                config: window.data.config,
                colorMap: window.data.colorMap,
                readOnly: config.readOnly
            };
        }

        // Update config to use container dimensions if available
        if (container.offsetWidth && container.offsetWidth > 0) {
            visualizationData.config = {
                ...visualizationData.config,
                width: container.offsetWidth
            };
        }
        if (container.offsetHeight && container.offsetHeight > 0) {
            visualizationData.config = {
                ...visualizationData.config,
                height: container.offsetHeight
            };
        }

        // Create container structure matching index.html structure
        container.innerHTML = `
            <div class="container">
                <h1>Comprehensive Legal System - Interactive Network Diagram</h1>
                <p class="description">Explore the complex relationships between Parliament, Courts, Tribunals, Arbitration Centers, and Legal Professionals in the Indian legal ecosystem.</p>
                
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color outgoing"></div>
                        <span>Outgoing Relationships (Blue)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color incoming"></div>
                        <span>Incoming Relationships (Red)</span>
                    </div>
                </div>
                
                <div class="controls">
                    <button id="toggleViewBtn">Show Table View</button>
                    ${config.showFilters ? `
                    <div class="filter-controls">
                        <label for="nodeFilter">Filter by Entity:</label>
                        <select id="nodeFilter">
                            <option value="">Show All Entities</option>
                        </select>
                        <label for="relationshipFilter">Filter by Relationship:</label>
                        <select id="relationshipFilter">
                            <option value="">Show All Relationships</option>
                        </select>
                        <button id="clearFilter">Clear Filter</button>
                    </div>
                    ` : ''}
                </div>
                
                <div class="visualization-container">
                    <div id="diagram-view" class="view active">
                        <svg id="arrow-diagram"></svg>
                    </div>
                    
                    <div id="table-view" class="view">
                        <div id="table-download-controls" style="margin-bottom: 10px;">
                            <button id="downloadExcelBtn">Download as Excel</button>
                        </div>
                        <table id="data-table">
                            <thead>
                                <tr>
                                    <th>Entity</th>
                                    <th>Relationship</th>
                                    <th>Target</th>
                                </tr>
                            </thead>
                            <tbody id="table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Create visualization instance with readOnly flag
        const visualization = new LegalSystemVisualization(visualizationData);

        // Initialize the visualization
        visualization.init();

        // Set initial view
        if (config.view === 'table') {
            setTimeout(() => {
                if (visualization.currentView === 'diagram') {
                    visualization.toggleView();
                }
            }, 100);
        }

        // Store visualization instance for potential API access
        container._legalSystemViz = visualization;
    }

})();

