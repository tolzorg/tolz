import sagDiagram from "../../../assets/sag-calculator/sag-diagram.svg";

export default function SagDiagram() {
  return (
    <img src={sagDiagram} alt="Sag geometry: SAG (sagitta), Diameter/2, radius of curvature (R), and horizontal distance (Z)"
      style={{ width: "100%", height: "auto", display: "block" }} />
  );
}
