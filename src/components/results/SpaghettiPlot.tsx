import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { SimResult } from "@/workers/montecarlo.types";

export function SpaghettiPlot({ result }: { result: SimResult | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result || !canvasRef.current || !svgRef.current || !wrapRef.current) return;
    const wrap = wrapRef.current;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const margin = { top: 16, right: 24, bottom: 28, left: 56 };
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const x = d3
      .scaleLinear()
      .domain([0, result.years[result.years.length - 1]])
      .range([margin.left, width - margin.right]);

    const allValues = [
      ...result.p5,
      ...result.p95,
      ...result.samplePaths.flat(),
    ];
    const minV = d3.min(allValues) ?? 0;
    const maxV = d3.max(allValues) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([minV, maxV])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Confidence ribbon
    ctx.fillStyle = "rgba(34, 211, 238, 0.12)";
    ctx.beginPath();
    result.years.forEach((yr, i) => {
      const px = x(yr);
      const py = y(result.p95[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    for (let i = result.years.length - 1; i >= 0; i--) {
      ctx.lineTo(x(result.years[i]), y(result.p5[i]));
    }
    ctx.closePath();
    ctx.fill();

    // Spaghetti paths
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.18)";
    result.samplePaths.forEach((path) => {
      ctx.beginPath();
      path.forEach((v, i) => {
        const px = x(i);
        const py = y(v);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    // Median line
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#22d3ee";
    ctx.beginPath();
    result.median.forEach((v, i) => {
      const px = x(i);
      const py = y(v);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Zero line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, y(0));
    ctx.lineTo(width - margin.right, y(0));
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes via SVG overlay
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const xAxis = d3.axisBottom(x).ticks(6).tickFormat((d) => `${d}y`);
    const yAxis = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => {
        const n = Number(d);
        if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
        return `${n}`;
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call((g) => g.selectAll("text").attr("fill", "rgba(255,255,255,0.6)"))
      .call((g) => g.selectAll("line,path").attr("stroke", "rgba(255,255,255,0.15)"));
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .call((g) => g.selectAll("text").attr("fill", "rgba(255,255,255,0.6)"))
      .call((g) => g.selectAll("line,path").attr("stroke", "rgba(255,255,255,0.15)"));
  }, [result]);

  return (
    <div ref={wrapRef} className="relative h-72 w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-elegant)]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <svg ref={svgRef} className="pointer-events-none absolute inset-0" />
      <div className="absolute left-3 top-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Net worth: Buy − Rent+Invest (PLN)
      </div>
    </div>
  );
}
