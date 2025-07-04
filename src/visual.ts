import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import DataView = powerbi.DataView;
import Plotly from 'plotly.js-dist-min';

import "plotly.js-dist-min";

export class Visual implements IVisual {
    private target: HTMLElement;
    private gaugeElement: HTMLElement;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.gaugeElement = document.createElement("div");
        this.gaugeElement.setAttribute("id", "gauge");
        this.gaugeElement.setAttribute("style", "width:100%; height:100%;");
        this.target.appendChild(this.gaugeElement);
    }

    public update(options: VisualUpdateOptions): void {
        const dataView: DataView = options.dataViews && options.dataViews[0];
        if (!dataView || !dataView.categorical || !dataView.categorical.values) {
            return;
        }
        const values = dataView.categorical.values;
        const actualValue = values[0]?.values[0] as number ?? 0;
        const targetValue = values[1]?.values[0] as number ?? 1;

        const maxValue = Math.max(actualValue, targetValue) * 1.2;

        const actualLabel = values[0]?.source?.displayName || "Actual";
        const targetLabel = values[1]?.source?.displayName || "Target";

        const gaugeData = [{
            type: "indicator",
            mode: "gauge+number+delta",
            value: actualValue,
            delta: { reference: targetValue },
            title: { text: `${actualLabel} vs ${targetLabel}`, font: { size: 18 } },
            gauge: {
                axis: { range: [0, maxValue], tickwidth: 1, tickcolor: "darkgray" },
                bar: { color: "deepskyblue" },
                steps: [{ range: [0, targetValue], color: "#e0e0e0" }],
                threshold: {
                    line: { color: "blue", width: 4 },
                    value: targetValue
                },
                shape: "semi"
            }
        }];

        const layout = {
            margin: { t: 10, b: 10, l: 10, r: 10 },
            paper_bgcolor: "white",
            font: { color: "black", family: "Arial" }
        };

        Plotly.newPlot(this.gaugeElement, gaugeData, layout);
    }
}
