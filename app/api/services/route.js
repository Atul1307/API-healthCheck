import { readServices, writeServices } from "@/lib/storage";
import { NextResponse } from "next/server";
import {randomUUID} from 'crypto'
import { performHealthCheck } from "@/lib/healthCheck";

export async function GET(){
    const services = readServices();
    return NextResponse.json(services);
}

export async function POST(request){
    const body = await request.json();
    const name = body?.name?.trim();
    const url = body?.url?.trim();

    if(!name || !url){
        return NextResponse.json({error: 'name and URL are required'}, {status: 400});
    }

    const newService = {
        id: randomUUID(),
        name,
        url,
        status: null,
        latencyMs: null,
        lastCheckedAt: null,
        healthScore: null
    }

    const checkedService = await performHealthCheck(newService);
    const services = readServices();
    services.push(checkedService);
    writeServices(services);

    return NextResponse.json(checkedService, {status: 201})
}