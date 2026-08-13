// RouteExtrasPie.tsx
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { SurfaceTypeLabels, type RouteExtraSummary } from "../../types/directions"

ChartJS.register(ArcElement, Tooltip, Legend)

export const SurfacesPie = ({
  summaries,
}: {
  summaries: RouteExtraSummary[]
}) => {
  const labels = summaries.map((s) => SurfaceTypeLabels[s.value] || `Unknown Surface (${s.value})`)
  const dataValues = summaries.map((s) => s.distance) // could also use s.amount

  const data = {
    labels,
    datasets: [
      {
        label: "Surface Distribution (meters)",
        data: dataValues,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h3>Surface Distribution</h3>
      {summaries.length > 0 ? (
        <Pie data={data} />
      ) : (
        <p>No surface summary available.</p>
      )}
    </div>
  )
}
