import { useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();
  console.error(error);

  return (
    <div style={{ padding: 20 }}>
      <h2>Route Error 😕</h2>
      <p>Something went wrong while loading the page.</p>
    </div>
  );
}
