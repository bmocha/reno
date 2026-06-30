/*
 Copyright(C) 2026 Kraenion. All rights reserved.

 This document is the property of Kraenion.It is considered confidential and proprietary.It may not be reproduced or
 transmitted in any form, in whole or in part, without the express written permission of Kraenion.
*/

export class ColumnController
{
    // States: 0: original order, 1: descending, 2: ascending
    static symbols = { 0: ' \u25CB', 1: ' \u25BD', 2: ' \u25B3' }; // empty circle, down arrow, up arrow

    constructor(table_id, th, th_l, sort_f)
    {
        /* This controller handles the sorting click state m/c for one column of a table.
           table_id: id of the table this column belongs to
           th: th element of the column controlled by this Object
           th_l: All column header th elements of the table. Other columns will be reset when this column becomes the sort key.
           sort_f(table_id, column_key, mode): Function called to sort the table and set its contents. */
        this.table_id = table_id;
        this.th = th;
        this.th_l = th_l;
        this.sort_f = sort_f;
        this.set_mode(th, 0);
        th.addEventListener('click', this.click_handler);
    }

    set_mode(th, mode)
    {
        /* This method should not use this.th because it is called from the click handler to reset the mode for all columns in
           the table, not just the one that was clicked. The mode is stored on th.dataset to make it accessable to controllers
           of all columns. https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset */
        th.dataset.sort_mode = String(mode);
        th.querySelector('span').textContent = ColumnController.symbols[mode];
    }

    // Arrow function needed in JS to get a bound method for callbacks. Otherwise this will be undefined.
    click_handler = () =>
    {
        const th = this.th;
        const next_mode = (parseInt(th.dataset.sort_mode) + 1) % 3;


        // 1. Reset all column headers to mode 0
        this.th_l.forEach(h => { this.set_mode(h, 0); })

        // 2. Update clicked header's mode
        this.set_mode(th, next_mode);

        const key = th.getAttribute('data-key');
        this.sort_f(this.table_id, key, next_mode);
    }
}


export class TableController
{

    constructor(table_data)
    {
        /* This class enables sortable tables that contain multi-row records. The class itself does not know the original record
           structure. The html generator flattens records into rows and exports the json along with index vectors to sort the
           records using any record field as a key. The index vectors are generated knowing the number of rows spanned by a
           record. So sort on any record field just works regardless of if the field being sorted on is in the first row or
           subsequent rows of a table. No comparison functions are needed. The html generator / server knows how to sort the
           records and the JS only needs to argsort using the index vector. Greatly simplifies the handling of complex data
           structures that are presented as tables. The table data itself is converted to a list of tr by the constructor. All
           further operations just sort the list of tr stored in content_l. There is no need to retain the data. Only the
           index_d is needed when the sort order changes. This is designed for static sites. The data in the page never changes.
        */
        this.table_id = table_data.id; // Saved only for debug messages
        this.index_d = table_data.index_d;
        this.content_l = this.alloc_contents(table_data.id, table_data.class, table_data.nfixed_row,
            table_data.content_l, table_data.end_l);
        this.set_contents(table_data.id, this.content_l);

        /* Add ColumnController objects on all th that have a data-key. The rest are blank cells. */
        const th_l = Array.from(document.querySelectorAll(`#${table_data.id} thead th`)).filter(th => th.getAttribute('data-key'));
        th_l.forEach(th =>
        {
            new ColumnController(table_data.id, th, th_l, this.sort_handler);
        });

    }


    sort_handler = (table_id, key, mode, table_data) =>
    {
        const content_l = this.content_l; // table rows
        var sorted_l = content_l; // If no indirection vector is found, default to original order
        const i_v = this.index_d[key]; // indirection vector

        if(i_v != null)
        {
            if(mode == 1) // descending order
            {
                sorted_l = i_v['dsc'].map(i => content_l[i]);
            }
            else if(mode == 2) // ascending order
            {
                sorted_l = i_v['asc'].map(i => content_l[i]);
            }
        }

        this.set_contents(table_id, sorted_l);
    }


    alloc_contents(table_id, class_name, nfixed_row, row_l, end_l)
    {
        // One time conversion from json list to list of table rows
        // Sorting just changes the order of the initially constructed rows.
        function _td(text)
        {
            // The only attributes of interest that cannot be set from css on a td are
            // rowspan, colspan. If we need to set those on individual cells, pass in
            // a tuple (data, attr_d) and detect it here and set it. Not as clean as
            // the current situation where only data in the json. Alternative might be
            // to have yet another section of json that has attributes only and add some
            // js to set attributes.
            const td = document.createElement("td");
            td.innerText = text;
            return td;
        }


        function _tr(td_l)
        {
            const tr = document.createElement("tr");
            const index = row_index % nfixed_row;
            const kind = (row_index < nfixed_row)?"fix":"var";
            tr.replaceChildren(...td_l);
            //tr.className = `${class_name}-${kind}-tr-${index}`;
            tr.className = `${kind}-${index}`;
            return tr;
        }

        let row_index = 0;
        const end_s = new Set(end_l);
        const content_l = row_l.map((row, i) =>
        {
            var tr = _tr(Object.values(row).map(val => _td(val)));
            row_index = end_s.has(i)?0:(row_index+1);
            return tr;
        });

        return content_l;
    }

    set_contents(table_id, content_l)
    {
        // Replace content rows of the table.
        const tbody = document.querySelector(`#${table_id} tbody`);
        tbody.replaceChildren(...content_l);
        return content_l;
    }

}
