import { pollAbandonedCheckouts } from "./poll";

export async function GET() {
  const result = await pollAbandonedCheckouts();
  return Response.json(result);
}
