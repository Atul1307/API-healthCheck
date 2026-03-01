import { performHealthCheck } from "@/lib/healthCheck";
import { readServices, writeServices } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(request, { params }){
    const { id } = await params;
    const services = readServices();
    const service = services.find((s) => s.id === id);

    if(!service){
        return NextResponse.json({ error: 'Service not found' }, {status: 404});
    }
    const updated = await performHealthCheck(service, true);
    const newServices = services.map((s) => (s.id === id ? updated : s));
    writeServices(newServices);

    return NextResponse.json(updated);
}