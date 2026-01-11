/**
 * Auto-fill Rows Helper
 *
 * A reusable utility for dynamically generating rows to fill remaining vertical space.
 * Useful for templates that need to maximize page usage across different device sizes.
 *
 * @example
 * // HTML: Create a template row with an ID
 * <div class="todo-item" id="task-template">...</div>
 *
 * // JavaScript: Call the helper
 * autoFillRows({
 *     containerId: 'tasks-container',
 *     templateId: 'task-template',
 *     rowHeight: 70
 * });
 */

/**
 * Dynamically generate rows to fill remaining space in a container
 *
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container element
 * @param {string} options.templateId - ID of the template row element
 * @param {number} options.rowHeight - Height of each row in pixels
 * @param {number} [options.minRows=1] - Minimum number of rows (including template)
 * @param {number} [options.maxRows=Infinity] - Maximum number of rows (including template)
 * @param {boolean} [options.debug=false] - Enable debug logging
 * @param {function} [options.onComplete] - Callback after rows are generated
 * @returns {number} Total number of rows generated
 */
function autoFillRows(options) {
    const {
        containerId,
        templateId,
        rowHeight,
        minRows = 1,
        maxRows = Infinity,
        debug = false,
        onComplete = null
    } = options;

    // Validate required parameters
    if (!containerId || !templateId || !rowHeight) {
        console.error('autoFillRows: Missing required parameters (containerId, templateId, rowHeight)');
        return 0;
    }

    const container = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
    const template = document.getElementById(templateId);

    if (!container) {
        console.error(`autoFillRows: Container not found: ${containerId}`);
        return 0;
    }

    if (!template) {
        console.error(`autoFillRows: Template not found: ${templateId}`);
        return 0;
    }

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
        const containerHeight = container.clientHeight;

        // Calculate height of existing content
        let existingHeight = 0;
        const children = Array.from(container.children);
        children.forEach(child => {
            existingHeight += child.offsetHeight;
        });

        // Calculate available height
        const availableHeight = containerHeight - existingHeight + rowHeight; // +rowHeight because template is already included

        // Calculate needed rows
        let neededRows = Math.floor(availableHeight / rowHeight);

        // Apply constraints
        neededRows = Math.max(minRows, neededRows);
        neededRows = Math.min(maxRows, neededRows);

        // Debug logging
        if (debug) {
            console.log('=== Auto-fill Rows Debug Info ===');
            console.log('Container height:', containerHeight);
            console.log('Existing content height:', existingHeight);
            console.log('Available height:', availableHeight);
            console.log('Row height:', rowHeight);
            console.log('Calculated rows:', Math.floor(availableHeight / rowHeight));
            console.log('Final rows (after constraints):', neededRows);
            console.log('Min/Max rows:', minRows, '/', maxRows);
        }

        // Generate additional rows (neededRows - 1, since template is the first row)
        const rowsToGenerate = Math.max(0, neededRows - 1);
        for (let i = 0; i < rowsToGenerate; i++) {
            const clone = template.cloneNode(true);
            clone.removeAttribute('id');  // Remove ID to avoid duplicates
            container.appendChild(clone);
        }

        // Set rendering complete flag for Puppeteer
        document.body.setAttribute('data-render-complete', 'true');

        if (debug) {
            console.log('Generated additional rows:', rowsToGenerate);
            console.log('Total rows:', neededRows);
            console.log('=================================');
        }

        // Call completion callback if provided
        if (onComplete && typeof onComplete === 'function') {
            onComplete(neededRows);
        }
    });

    return 1; // Return 1 to indicate initiation (actual count available in callback)
}

/**
 * Convenience function for common use case: auto-fill a specific container
 * Automatically sets up DOMContentLoaded listener
 *
 * @param {Object} options - Same as autoFillRows options
 */
function setupAutoFillRows(options) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoFillRows(options));
    } else {
        autoFillRows(options);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { autoFillRows, setupAutoFillRows };
}
