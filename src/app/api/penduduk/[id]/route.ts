export { GET, PUT, DELETE } from "../../residents/[id]/route";
import { PUT as putHandler } from "../../residents/[id]/route";
export const PATCH = putHandler;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
