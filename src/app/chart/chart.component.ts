import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import {
  lightningChart,
  ChartXY,
  Point,
  LUT,
  ColorHSV,
  PalettedFill,
  emptyLine,
  AxisScrollStrategies,
  AxisTickStrategies,
  Themes,
} from "@arction/lcjs";
import {DATA} from "./chart.consts"
import {of} from "rxjs"

const HISTORY_SAMPLES = 5000;

@Component({
  selector: "app-chart",
  template: '<div [id]="this.chartId"></div>',
  styles: ["div { height: 100% }"],
})
export class ChartComponent implements OnChanges, OnDestroy, AfterViewInit {
  chart: any;
  chartId: number;

  @Input() points: Point[];

  constructor() {}

  ngOnChanges() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  }

  ngAfterViewInit() {
    // Create chartXY
    // this.chart = lightningChart().ChartXY({container: `${this.chartId}`});
    this.chart = lightningChart()
      .Dashboard({
        numberOfColumns: 2,
        numberOfRows: 2,
        container: `${this.chartId}`,
        // theme: Themes.darkGold
      })
      .setRowHeight(0, 1)
      .setRowHeight(1, 2);

    let labelLoading = this.chart
      .addUIElement()
      .setText("Loading example data ...");
    of(DATA)
      .subscribe((data) => {
        labelLoading.dispose();
        labelLoading = undefined;

        // Define value -> color lookup table.
        const lut = new LUT({
          steps: [
            {
              value: 0,
              color: ColorHSV(0, 1, 0),
              label: `-100`,
            },
            {
              value: 255 * (1 / 6),
              color: ColorHSV(270, 0.84, 0.2),
              label: `-88`,
            },
            {
              value: 255 * (2 / 6),
              color: ColorHSV(289, 0.86, 0.35),
              label: `-77`,
            },
            {
              value: 255 * (3 / 6),
              color: ColorHSV(324, 0.97, 0.56),
              label: `-65`,
            },
            {
              value: 255 * (4 / 6),
              color: ColorHSV(1, 1, 1),
              label: `-53`,
            },
            {
              value: 255 * (5 / 6),
              color: ColorHSV(44, 0.64, 1),
              label: `-42`,
            },
            {
              value: 255,
              color: ColorHSV(62, 0.32, 1),
              label: `-30`,
            },
          ],
          units: "dB",
          interpolate: true,
        });

        const rowStep = 40;
        const samplesPerFrame = 2;
        const columnStep = 1000 / 60 / samplesPerFrame;
        const intensityValueToDb = (value) =>
          -100 + (value / 255) * (-30 - -100);

        let channelList: { [key: string]: any } = [
          {
            name: "Channel 1",
            data: data.ch1,
            columnIndex: 0,
          },
          {
            name: "Channel 2",
            data: data.ch2,
            columnIndex: 1,
          },
        ];

        channelList = channelList.map((channel) => {
          const rows = channel.data[0].length;
          const chart2D = this.chart
            .createChartXY({
              columnIndex: channel.columnIndex,
              rowIndex: 0,
            })
            .setTitle(`${channel.name} | 2D audio spectrogram`);
          chart2D
            .getDefaultAxisX()
            .setTickStrategy(AxisTickStrategies.Time)
            .setScrollStrategy(AxisScrollStrategies.progressive)
            .setInterval(-HISTORY_SAMPLES * columnStep, 0);
          chart2D.getDefaultAxisY().setTitle("Frequency (Hz)");

          const chart3D = this.chart
            .createChart3D({
              columnIndex: channel.columnIndex,
              rowIndex: 1,
            })
            .setTitle(`${channel.name} | 3D audio spectrogram`);

          chart3D
            .getDefaultAxisX()
            .setTickStrategy(AxisTickStrategies.Time)
            .setScrollStrategy(AxisScrollStrategies.progressive)
            .setInterval(-HISTORY_SAMPLES * columnStep, 0);
          chart3D
            .getDefaultAxisY()
            .setTitle("Intensity (Db)")
            .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
              ticks.setFormattingFunction((y) =>
                intensityValueToDb(y).toFixed(0)
              )
            );
          chart3D.getDefaultAxisZ().setTitle("Frequency (Hz)");

          const heatmapSeries2D = chart2D
            .addHeatmapScrollingGridSeries({
              scrollDimension: "columns",
              resolution: rows,
              step: { x: columnStep, y: rowStep },
            })
            .setFillStyle(new PalettedFill({ lut }))
            .setWireframeStyle(emptyLine)
            .setDataCleaning({ maxDataPointCount: 10000 });

          const surfaceSeries3D = chart3D
            .addSurfaceScrollingGridSeries({
              scrollDimension: "columns",
              columns: HISTORY_SAMPLES,
              rows,
              step: { x: columnStep, z: rowStep },
            })
            .setFillStyle(new PalettedFill({ lut, lookUpProperty: "y" }))
            .setWireframeStyle(emptyLine);

          return {
            ...channel,
            chart2D,
            chart3D,
            heatmapSeries2D,
            surfaceSeries3D,
          };
        });

        // Setup infinite streaming from static data set.
        let iSample = 0;
        const streamMoreData = () => {
          const channelNewSamples = channelList.map((_) => []);
          const newSamplesCount = samplesPerFrame;
          for (
            let iNewSample = 0;
            iNewSample < newSamplesCount;
            iNewSample += 1
          ) {
            channelList.forEach((channel, i) => {
              const sample =
                channel.data[(iSample + iNewSample) % channel.data.length];
              channelNewSamples[i].push(sample);
            });
          }
          channelList.forEach((channel, i) => {
            channel.heatmapSeries2D.addIntensityValues(channelNewSamples[i]);
            channel.surfaceSeries3D.addValues({
              yValues: channelNewSamples[i],
            });
          });
          iSample += newSamplesCount;
          requestAnimationFrame(streamMoreData);
        };
        streamMoreData();
      });

    // // Set chart title
    // this.chart.setTitle('Getting Started');
    // // Add line series to the chart
    // const lineSeries = this.chart.addLineSeries();
    // // Set stroke style of the line
    // lineSeries.setStrokeStyle((style) => style.setThickness(5));
    // // Add data point to the line series
    // lineSeries.add(this.points);
  }

  ngOnDestroy() {
    // "dispose" should be called when the component is unmounted to free all the resources used by the chart
    this.chart.dispose();
  }
}
