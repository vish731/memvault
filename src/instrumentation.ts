export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    // Some networks (mobile hotspots especially) advertise broken/unreachable
    // IPv6 routes. Node then wastes ~10s per request timing out on IPv6
    // addresses before falling back to IPv4. Forcing ipv4first avoids that.
    dns.setDefaultResultOrder("ipv4first");
  }
}
