const TIMEOUT_MS = 8000;
const SLOW_THRESHOLD = 500;
const DOWN_THRESHOLD = 2000;

function calculateHealthScore(status, latencyMs){
    if(status === 'DOWN')return 0;
    if(status === 'SLOW'){
        const ratio = (latencyMs - SLOW_THRESHOLD) / (DOWN_THRESHOLD - SLOW_THRESHOLD);
        return Math.round(74-ratio*49);
    }
    return Math.round(100 - (latencyMs / SLOW_THRESHOLD) * 25);
}

export async function performHealthCheck(service){
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const start = Date.now();
    let latencyMs = 0;
    let status = 'DOWN';

    try{
        const response = await fetch(service.url, {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                'User-Agent': 'API-Health-Monitor/1.0'
            }
        });
        latencyMs = Date.now() - start;
        clearTimeout(timeoutId);

        const isSuccess = response.status >= 200 && response.status < 300;
        if(isSuccess){
            status = latencyMs < SLOW_THRESHOLD ? 'UP' : latencyMs < DOWN_THRESHOLD ? 'SLOW' : 'DOWN';
        }else{
            status = 'DOWN';
            console.error(`[HealthCheck] Status ${response.status} for "${service.name}"`);
        }
    } catch(err){
        clearTimeout(timeoutId);
        latencyMs = Date.now() - start;
        status = 'DOWN';
        console.error(`[HealthCheck] ERROR "${service.name}" - ${err?.name}: ${err?.message}`);
    }
    const healthScore = calculateHealthScore(status,latencyMs);
    console.error(`[HealthCheck] ERROR "${service.name} -> ${status} | ${latencyMs}ms" | score=${healthScore}`);

    return {
        id: service.id,
        name: service.name,
        url: service.url,
        status,
        latencyMs,
        lastCheckedAt: new Date().toISOString(),
        healthScore
    };
}