/*
    Useful refs:
    https://plotly.com/javascript/3d-scatter-plots/
    https://plotly.com/javascript/3d-axes/
    Most markers don't seem to work in 3D and get replaced by a circle.
    Worked: circle, cross, square, x
*/

export var config3d = { displaylogo: false, responsive: true };

export var layout3d = {
    autosize: true,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    },

    /* https://plotly.com/javascript/setting-graph-size/ */
    scene: {
        xaxis: {
            automargin: true,
            title: {
                //text: x_title,
                font: { size: 20 },
            },
        },

        yaxis: {
            automargin: true,
            title: {
                //text: y_title,
                font: { size: 20 },
            },
        },

        zaxis: {
            automargin: true,
            title: {
                //text: z_title,
                font: { size: 20 },
            },
        },
    },
};


export var style3d = {
    "s1": {
        mode: "markers",
        marker: {

            symbol: "circle",
            color: "rgba(250, 100, 100, 0.9)",
            size: 6,

            line: {
                color: "rgba(217, 217, 217, 0.14)",
                width: 0.5,
            },
            opacity: 0.8,
        },
        type: "scatter3d",
    },
    "s2": {
        mode: "markers",
        marker: {

            symbol: "circle",
            color: "rgba(100, 100, 250, 0.7)",
            size: 8,

            line: {
                color: "rgb(204, 204, 204)",
                width: 0.5,
            },
            opacity: 0.8,
        },
        type: "scatter3d",
    }
};


export var style3d_v = [
    {
        mode: "markers",
        marker: {

            symbol: "circle",
            color: "rgba(250, 100, 100, 0.9)",
            size: 6,

            line: {
                color: "rgba(217, 217, 217, 0.14)",
                width: 0.5,
            },
            opacity: 0.8,
        },
        type: "scatter3d",
    },

    {
        mode: "markers",
        marker: {

            symbol: "circle",
            color: "rgba(100, 100, 250, 0.7)",
            size: 8,

            line: {
                color: "rgb(204, 204, 204)",
                width: 0.5,
            },
            opacity: 0.8,
        },
        type: "scatter3d",
    }
];




function extract_trace(trace_v, row_v)
{
    let dtrace_v = new Array(trace_v.length); // Trace style + data

    for(const [i, trace] of trace_v.entries())
    {
        let dtrace = { "name": trace.name }; // Handy for debugging to set this early
        dtrace.x = row_v.map((r) => r[trace.col_v[0]]);
        dtrace.y = row_v.map((r) => r[trace.col_v[1]]);
        dtrace.z = row_v.map((r) => r[trace.col_v[2]]);
        dtrace_v[i] = dtrace;
    }

    return dtrace_v;
}

function set_trace_style(dtrace_v, trace_v, style)
{
    // Set a style for each trace. This includes marker, marker color, size etc.

    for(const [i, trace] of trace_v.entries())
    {
        let tstyle = trace.style;
        if(tstyle === undefined || tstyle === null)
        {
            // Auto assign a style
            // Assumes that style is an Array when using integers as style names
            tstyle = (i % style.length);
        }

        if(typeof tstyle === 'string' || tstyle instanceof String || Number.isInteger(tstyle))
        {
            tstyle = style[tstyle];
        }
        // If tstyle is not any of the special cases above assume that an object was provided

        Object.assign(dtrace_v[i], tstyle);
    }
}

function set_layout_axes(layout, axis_v)
{
    layout = JSON.parse(JSON.stringify(layout)); // Deep copy
    layout.scene.xaxis.title.text = axis_v[0];
    layout.scene.yaxis.title.text = axis_v[1];
    layout.scene.zaxis.title.text = axis_v[2];
    return layout;
}

function create_3d_plot(name, dtrace_v, layout, config)
{
    // To override defaults, do data transforms etc. pass a different function as the plot_f argument of  plot3d
    return Plotly.newPlot(name, dtrace_v, layout, config);
}

export function plot3d(name, plot_desc, style = style3d_v, layout = layout3d, config = config3d, plot_f = create_3d_plot)
{

    function _inner(err, row_v)
    {
        let dtrace_v = extract_trace(plot_desc.trace_v, row_v);
        set_trace_style(dtrace_v, plot_desc.trace_v, style);
        let layout1 = set_layout_axes(layout, plot_desc.axis_v);
        return plot_f(name, dtrace_v, layout1, config);
    };

    return _inner;
}
