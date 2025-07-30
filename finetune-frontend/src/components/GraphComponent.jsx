import Plot from "react-plotly.js";

const GraphComponent = ({displayInfo}) => {
    const points = displayInfo.points;
    const x = points.map(point=>point[0])
    const y = points.map(point=>point[1])
    const z = points.map(point=>point[2])
    
    const labels = displayInfo.labels;

    return (
            <Plot
                data={[
                    {
                        x,
                        y,
                        z,
                        text: labels,
                        mode: 'markers+text',
                        type: 'scatter3d',
                        textposition: 'top center',
                        marker: {
                            size: 5,
                            color: 'blue',
                        },
                        name: 'Points',
                    },
                ]}
                layout={{
                    title: '3D Scatter Plot with Labels',
                    scene:{
                        xaxis: {
                            title: { text: '', font: { color: 'rgba(0,0,0,0)' } },
                            showticklabels: false,
                            zeroline: false,
                            showspikes: false,
                        },
                        yaxis: {
                            title: { text: '', font: { color: 'rgba(0,0,0,0)' } },
                            showticklabels: false,
                            zeroline: false,
                            showspikes: false,
                        },
                        zaxis: {
                            title: { text: '', font: { color: 'rgba(0,0,0,0)' } },
                            showticklabels: false,
                            zeroline: false,
                            showspikes: false,
                        },
                    },
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 30
                    },
                    hovermode: 'closest',
                }}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />

    )
}


export default GraphComponent