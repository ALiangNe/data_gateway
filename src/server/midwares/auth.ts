/**
 * Common gateway middlewares.
 */
import type { Request, Response, NextFunction } from 'express'
import { IP_WHITELIST, NODE_ENV } from '../../config'
import { verifyJwt } from '../../modules/jwt'
import { errObj } from '../modules/errs'
import { JwtPayload } from 'jsonwebtoken'

/**
 * Unified request logging.
 */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`\n\n---------- ${new Date().toISOString()} ----------`)
    console.log(`${req.method} ${req.originalUrl}  from ${req.ip} body or query: ${JSON.stringify(req.body || req.query)}`)

    next()
}

/**
 * IP whitelist check.
 * - In dev environment, whitelist is skipped.
 * - In non-dev environments, only IPs in IP_WHITELIST are allowed.
 */
export const ipCheck = (req: Request, res: Response, next: NextFunction) => {
    if (NODE_ENV === 'dev') {
        next()
        return
    }

    if (!req.ip) {
        res.status(403).json(errObj[403])
        return
    }

    const ipArray = req.ip.split(':')
    const ip = ipArray[ipArray.length - 1]

    const isAllowed = IP_WHITELIST.some((item) => {
        if (!item.includes('*')) {
            return ip === item
        }

        try {
            // example: 192.168.1.* -> ^192\.168\.1\.[0-9]{1,3}$
            // example: 192.168.*.* -> ^192\.168\.[0-9]{1,3}\.[0-9]{1,3}$
            // example: 192.*.*.* -> ^192\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$
            const regexStr = `^${item.replace(/\./g, '\\.').replace(/\*/g, '[0-9]{1,3}')}$`
            const regex = new RegExp(regexStr)
            return regex.test(ip)
        } catch (e) {
            console.error('IP Regex Error:', e)
            return false
        }
    })

    if (isAllowed) {
        next()
        return
    }

    console.log('Unauthorized access from : ', ip)
    res.status(403).json(errObj[403])
}

/**
 * API token verification (JWT with RS256), uses Authorization Bearer header.
 */
export const tokenCheck = async (req: Request, res: Response, next: NextFunction) => {
    const [type, token] = req.headers.authorization?.split(' ') ?? []
    if (!token || type !== 'Bearer') {
        return res.status(401).json(errObj[401])
    }

    let decoded: JwtPayload | null = null
    try {
        decoded = verifyJwt(token) as JwtPayload
    } catch (e) {
        console.error('Error when verifyJwt(): ', e)
        return res.status(401).json(errObj[401])
    }

    if (!decoded) return res.status(401).json(errObj[401])

    req.user = {
        userId: decoded.userId,
        botId: decoded.botId,
        soulId: decoded.soulId,
        role: decoded.role,
        jti: decoded.jti!,
    }

    next()
}
