import { readServices, writeServices } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function DELETE(request, {params}) {
    const { id } = await params;
    const services = readServices();
    const filtered = services.filter((s) => s.id !== id);

    if(filtered.length === services.length){
        return NextResponse.json({error: 'Service not found'}, {status: 404});
    }
    writeServices(filtered);
    return NextResponse.json({success: true})
}