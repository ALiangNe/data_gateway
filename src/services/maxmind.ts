import { join } from 'node:path'
import maxmind from 'maxmind'
import type { CityResponse, Reader } from 'maxmind'

let client: Reader<CityResponse> | null = null

/**
 * Initialise MaxMind GeoIP client singleton.
 */
export const initMaxmindClient = async () => {
    if (client) {
        return
    }

    client = await maxmind.open<CityResponse>(
        join(__dirname, 'GeoLite2-City.mmdb'),
    )
}

/**
 * Resolve country / region / city for an IP address.
 */
export const getLocationByIp = (ip: string) => {
    if (!client) {
        throw new Error('Maxmind not initialized')
    }

    if (!maxmind.validate(ip)) {
        return {
            country: undefined,
            region: undefined,
            city: undefined,
        }
    }

    const geo = client.get(ip)

    return {
        country: geo?.country?.names?.en,
        region: geo?.subdivisions?.[0]?.names?.en,
        city: geo?.city?.names?.en,
    }
}

/**
 * Disconnect the MaxMind GeoIP client.
 */
export const disconnectMaxmindClient = () => {
    if (!client) {
        return
    }
    client = null
}
