import React from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
import "./style.scss";

const buildOptions = (xaxisData, name = "", strokeWidth = 3) => ({
  chart: {
    height: 350,
    type: "line",
    zoom: {
      enabled: false,
    },
  },
  title: {
    text: name,
    align: "center",
    style: {
      color: "currentColor",
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "straight",
    width: strokeWidth,
  },
  xaxis: {
    categories: xaxisData,
    labels: {
      style: {
        colors: "currentColor",
      },
    },
  },
  legend: {
    labels: {
      colors: "currentColor",
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "currentColor",
      },
    },
  },
});

export const LineChart = ({ xAxis, data, name, strokeWidth }) => {
  return (
    <div className="line-chart">
      {xAxis && data && (
        <ReactApexChart
          options={buildOptions(xAxis, name, strokeWidth)}
          series={data}
          type="line"
          height="100%"
        />
      )}
    </div>
  );
};
