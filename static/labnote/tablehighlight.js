/*
 Copyright(C) 2026 Kraenion. All rights reserved.

 This document is the property of Kraenion.It is considered confidential and proprietary.It may not be reproduced or transmitted
 in any form, in whole or in part, without the express written permission of Kraenion.
*/

/**
 * HighlightController handles context-aware header highlighting. In a table with multiple header rows, add a unique class with
 * a common prefix to each thead tr, e.g.: row_i for the ith row. Add a row_j class to each tbody tr to designate which header
 * row describes the row. This class will highlight the header th cell corresponding to a tbody td cell so it is clear what data
 * the user is hovering over. Very helpful for complex tables if the header is made sticky. Highlighting is done by adding /
 * removing a highlight css class to the th.
 */

/*
Examples:
table.sort-table th.yellow-highlight {
    background-color: #ffe066;
}
table.sort-table th.green-highlight {
    background-color: #a2f1a2;
}


// Initialize controller instances (Passing CSS class strings into constructor)
const controller1 = new HighlightController('table1', 'fix_', 'yellow-highlight');
const controller2 = new HighlightController('table2', 'var_', 'green-highlight');

 */
export class HighlightController
{
    constructor(table_id, prefix, highlight_class)
    {
        this.table_id = table_id;
        this.prefix = prefix;
        this.highlight_class = highlight_class;

        this.table = document.getElementById(table_id);
        if(!this.table) return;

        // Structured high-performance lookup cache
        // Format: { [class_name]: { [column_index]: th_element } }
        this.header_cache = {};

        // Tracking state for class cleanup during pointer movements
        this.last_highlighted_th = null;

        this._initialize();
    }

    /**
     * Parse header rows once and cache cell references via explicit grid mapping.
     */
    _initialize()
    {
        const thead = this.table.querySelector('thead');
        if(!thead) return;

        const rows = Array.from(thead.rows);

        rows.forEach((row) =>
        {
            // Find the targeted structural identifier class matching the prefix
            const target_class = Array.from(row.classList).find(cls => cls.startsWith(this.prefix));
            if(!target_class) return;

            if(!this.header_cache[target_class])
            {
                this.header_cache[target_class] = {};
            }

            // Map cell matrix columns strictly by their computational index position
            Array.from(row.cells).forEach((cell, col_index) =>
            {
                this.header_cache[target_class][col_index] = cell;
            });
        });

        this._bind_events();
    }

    /**
     * Binds a single event listener to the parent table component.
     * Supports both pointer engines (desktop hover & mobile touch/tap interactions).
     */
    _bind_events()
    {
        // 'pointerover' yields high performance and covers mouse, stylus, and touch down events.
        this.table.addEventListener('pointerover', (event) => this._handle_hover(event));
        this.table.addEventListener('pointerout', (event) => this._clear_highlight(event));
    }

    /**
     * Processes hover/interaction events to pinpoint the matching header.
     */
    _handle_hover(event)
    {
        const cell = event.target.closest('td');
        if(!cell) return;

        const row = cell.parentNode;
        const target_class = Array.from(row.classList).find(cls => cls.startsWith(this.prefix));
        if(!target_class) return;

        const col_index = cell.cellIndex;

        // O(1) dictionary key lookup for optimized performance on large tables
        const target_th = this.header_cache[target_class]?.[col_index];
        if(!target_th) return;

        // Optimize DOM class manipulation operations by checking if target changes
        if(this.last_highlighted_th !== target_th)
        {
            this._reset_last_highlight();
            this.last_highlighted_th = target_th;
            target_th.classList.add(this.highlight_class);
        }
    }

    /**
     * Clears highlights when the cursor departs the table cells.
     */
    _clear_highlight(event)
    {
        const cell = event.target.closest('td');
        if(!cell) return;
        this._reset_last_highlight();
    }

    /**
     * Reverts style modifications by cleanly removing the assigned CSS class.
     */
    _reset_last_highlight()
    {
        if(this.last_highlighted_th)
        {
            this.last_highlighted_th.classList.remove(this.highlight_class);
            this.last_highlighted_th = null;
        }
    }
}
